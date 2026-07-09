import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// V18: Restrict CORS to known origins instead of '*'.
const ALLOWED_ORIGINS = [
  'https://swadyum.store',
  'https://www.swadyum.store',
  'http://localhost:5173',
  'http://localhost:4173',
  'http://localhost:3000',
];

function corsHeaders(req: Request) {
  const origin = req.headers.get('Origin');
  const allow = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Vary': 'Origin',
  };
}

serve(async (req) => {
  const cors = corsHeaders(req);
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors })
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
        headers: { ...cors, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    let reason = 'User requested deletion via app';
    try {
      const body = await req.json();
      if (body.reason) {
        reason = body.reason;
      }
    } catch (e) {
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
        headers: { ...cors, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    // V17: do not leak internal error details to the client.
    return new Response(JSON.stringify({ error: 'Failed to submit deletion request.' }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
