import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const ALLOWED_ORIGINS = [
  "https://swadyum.store",
  "https://www.swadyum.store",
  "http://localhost:5173",
  "http://localhost:4173",
  "http://localhost:3000",
];

function corsHeaders(origin: string | null) {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}

export default {
  async fetch(req: Request) {
    const cors = corsHeaders(req.headers.get("Origin"));

    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: cors });
    }

    try {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) {
        return new Response(JSON.stringify({ error: "Missing authorization header" }), {
          status: 401,
          headers: { ...cors, "Content-Type": "application/json" }
        });
      }

      const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error: userError } = await supabase.auth.getUser(token);
      
      if (userError || !user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...cors, "Content-Type": "application/json" }
        });
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();
        
      const roleStr = String(profile?.role || '').toLowerCase();
      const isAdminUser = roleStr.includes('admin') || roleStr.includes('manager');
      
      if (!profile || !isAdminUser) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { ...cors, "Content-Type": "application/json" }
        });
      }

      const accessToken = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
      const wabaId = Deno.env.get("WHATSAPP_BUSINESS_ACCOUNT_ID");

      if (!accessToken || !wabaId) {
        return new Response(JSON.stringify({ 
          status: "error", 
          error: "WhatsApp credentials not configured on server (missing token or waba id).",
          code: "MISSING_CREDENTIALS"
        }), {
          status: 200,
          headers: { ...cors, "Content-Type": "application/json" }
        });
      }

      const url = `https://graph.facebook.com/v19.0/${wabaId}/message_templates`;
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      });
      
      const data = await res.json();
      if (!res.ok) {
        return new Response(JSON.stringify({ 
          status: "error", 
          error: data?.error?.message || "Failed to fetch templates from Meta API",
          code: "META_API_ERROR"
        }), {
          status: 200,
          headers: { ...cors, "Content-Type": "application/json" }
        });
      }

      return new Response(JSON.stringify({ status: "success", data: data.data }), {
        status: 200,
        headers: { ...cors, "Content-Type": "application/json" }
      });

    } catch (err) {
      console.error("Error in whatsapp-templates:", err);
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }
  }
};
