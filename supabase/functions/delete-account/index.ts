import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

    // Get the user from the token
    const {
      data: { user },
      error: userError
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    let reason = 'User requested deletion via app';
    try {
      const body = await req.json();
      if (body.reason) {
        reason = body.reason;
      }
    } catch(e) {
      // no body or invalid json
    }

    // 1. Insert into account_deletion_requests
    const { error: insertError } = await supabaseClient
      .from('account_deletion_requests')
      .insert({
        user_id: user.id,
        email: user.email,
        phone: user.user_metadata?.phone || null,
        reason: reason,
        status: 'Pending'
      })

    if (insertError) {
      // If unique constraint violation or already exists, we can ignore or return success anyway
      console.error('Insert error:', insertError)
      throw insertError
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Account deletion request submitted successfully.' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
