import { serve } from "https://deno.land/std@0.192.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Admin permissions check
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) throw new Error('Unauthorized')

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'Admin' && profile?.role !== 'Editor') {
      throw new Error('Forbidden: Admin access required')
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, order_id, payload, status, note } = await req.json()

    if (!order_id) throw new Error('Missing order_id')

    if (action === 'update_order') {
      // Direct update for arbitrary fields (like edit address)
      const { data, error } = await supabaseAdmin
        .from('orders')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', order_id)
        .select()
        .single()
      
      if (error) throw error

      return new Response(JSON.stringify({ data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    if (action === 'update_status') {
      // 1. Fetch original order
      const { data: originalOrder, error: fetchError } = await supabaseAdmin
        .from('orders')
        .select('*')
        .eq('id', order_id)
        .single()
        
      if (fetchError) throw fetchError

      // 2. Append tracking history
      const history = originalOrder.tracking_history || []
      if (note || status) {
         history.push({
             status: status || originalOrder.status,
             note: note || `Status updated to ${status}`,
             date: new Date().toISOString()
         })
      }

      // 3. Update order
      const { data, error } = await supabaseAdmin
        .from('orders')
        .update({ 
            status: status || originalOrder.status, 
            tracking_history: history,
            updated_at: new Date().toISOString() 
        })
        .eq('id', order_id)
        .select('*, order_items(*)')
        .single()

      if (error) throw error

      // 4. Trigger Automations if status changed
      if (status && originalOrder.status !== status && data.customer_id) {
          let eventType = null;
          if (status === 'Shipped') eventType = 'order_shipped';
          else if (status === 'Out for Delivery' || status === 'Out For Delivery') eventType = 'out_for_delivery';
          else if (status === 'Delivered') eventType = 'order_delivered';
          else if (status === 'Cancelled') eventType = 'order_cancelled';
          else if (status === 'Refund Initiated') eventType = 'refund_initiated';
          else if (status === 'Refunded') eventType = 'refund_completed';

          if (eventType) {
              const eventId = `${data.id}_${eventType}`
              await supabaseAdmin.from('automation_events').insert({
                  id: eventId,
                  event_type: eventType,
                  customer_id: data.customer_id,
                  payload: data,
                  status: 'pending'
              }).catch(err => console.error('Failed to trigger automation:', err))
          }
      }

      return new Response(JSON.stringify({ data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    throw new Error('Unknown action')

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
