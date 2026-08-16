import { serve } from "https://deno.land/std@0.192.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const VELOCITY_BASE_URL = Deno.env.get('VELOCITY_BASE_URL') || 'https://shazam.velocity.in'

async function getVelocityAuthToken(supabaseAdmin: any) {
  const { data: creds } = await supabaseAdmin.from('shipping_credentials').select('*').eq('active', true).single()
  if (!creds) throw new Error('Velocity credentials not configured')
  
  const response = await fetch(`${VELOCITY_BASE_URL}/custom/api/v1/auth-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: creds.username, password: creds.password })
  })
  
  if (!response.ok) throw new Error(`Auth failed: ${response.status}`)
  const res = await response.json()
  return res.token
}

async function fetchVelocity(endpoint: string, options: any, supabaseAdmin: any) {
    const token = await getVelocityAuthToken(supabaseAdmin)
    const response = await fetch(`${VELOCITY_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token,
            ...options.headers
        }
    })
    
    if (!response.ok) {
        const txt = await response.text()
        throw new Error(`Velocity error ${response.status}: ${txt}`)
    }
    
    return await response.json()
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

    const payload = await req.json()
    const { action } = payload

    if (action === 'sync_shipment') {
        const { shipment_id } = payload
        const { data: shipment } = await supabaseAdmin.from('shipments').select('*').eq('id', shipment_id).single()
        if (!shipment) throw new Error('Shipment not found')

        const trackingRes = await fetchVelocity('/custom/api/v1/order-tracking', {
            method: 'POST',
            body: JSON.stringify({ awbs: [shipment.awb_code] })
        }, supabaseAdmin)

        if (trackingRes.meta?.success && trackingRes.data?.length > 0) {
            const trackData = trackingRes.data[0]
            const events = trackData.scans || []
            const newStatus = trackData.status || shipment.velocity_status

            // Overwrite all events or just new ones? We'll just do a simple status update for now
            await supabaseAdmin.from('shipments').update({
                velocity_status: newStatus,
                customer_visible_status: newStatus, // simplistic mapping
                last_synced_at: new Date().toISOString()
            }).eq('id', shipment_id)

            // Insert new events logic could go here
        }

        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    
    if (action === 'cancel_shipment') {
        const { shipment_id } = payload
        const { data: shipment } = await supabaseAdmin.from('shipments').select('*').eq('id', shipment_id).single()
        
        await fetchVelocity('/custom/api/v1/cancel-order', {
            method: 'POST',
            body: JSON.stringify({ awbs: [shipment.awb_code] })
        }, supabaseAdmin)
        
        await supabaseAdmin.from('shipments').update({
            internal_status: 'cancelled',
            velocity_status: 'Cancelled',
            customer_visible_status: 'Cancelled'
        }).eq('id', shipment_id)

        // Add history to order
        const { data: order } = await supabaseAdmin.from('orders').select('tracking_history').eq('id', shipment.order_id).single()
        if (order) {
            const history = order.tracking_history || []
            history.push({
                status: 'Processing',
                timestamp: new Date().toISOString(),
                note: `Shipment cancelled. AWB: ${shipment.awb_code}`
            })
            await supabaseAdmin.from('orders').update({ tracking_history: history }).eq('id', shipment.order_id)
        }

        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    if (action === 'create_shipment' || action === 'create_reverse_shipment') {
        // Because building the full Velocity JSON payload is complex (requires order details, items, warehouses, dimensions),
        // we delegate the heavy lifting to the Edge function but it requires mapping logic.
        // For the sake of this migration, we'll implement a basic structure that the user can expand upon.
        
        throw new Error('Create shipment logic requires the full velocity payload mapping which is currently migrating to edge.')
    }

    throw new Error(`Unknown action: ${action}`)

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
