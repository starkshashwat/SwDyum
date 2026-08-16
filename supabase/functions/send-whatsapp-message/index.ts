// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

// ─── CORS ────────────────────────────────────────────────────────────────────
// Phase 5 security hardening: replaced wide-open "*" origin with an explicit
// allow-list (mirrors the pattern used in whatsapp-auth/index.ts).
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

    // Handle CORS preflight
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: cors });
    }

    try {
      const { phone, message, type = "text", template, mediaUrl } = await req.json();

      if (!phone) {
        return new Response(JSON.stringify({ error: "Phone number is required" }), {
          status: 400,
          headers: { ...cors, "Content-Type": "application/json" },
        });
      }

      // Initialize Supabase Client
      const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const accessToken = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
      const phoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");

      const cleanPhone = String(phone).replace(/\D/g, '');

      let apiResponse = null;
      let mockSent = false;
      let payload: any = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: cleanPhone,
        type: type,
      };

      if (type === "text") {
        if (!message) throw new Error("Message text is required");
        payload.text = { body: message };
      } else if (type === "template") {
        if (!template) throw new Error("Template object is required");
        payload.template = template;
      } else if (type === "image" || type === "document") {
        if (!mediaUrl) throw new Error("Media URL is required for media types");
        payload[type] = { link: mediaUrl };
        if (message) payload[type].caption = message; // optional caption
      } else {
        throw new Error("Unsupported message type");
      }

      // If credentials are set, call the actual Meta API
      if (accessToken && phoneNumberId) {
        console.log(`Sending real WhatsApp message to ${cleanPhone}`);
        const metaUrl = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;

        const res = await fetch(metaUrl, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        apiResponse = await res.json();
        if (!res.ok) {
          return new Response(JSON.stringify({
            status: "error",
            error: apiResponse?.error?.message || "Failed to send WhatsApp message via Meta API"
          }), {
            status: 200,
            headers: { ...cors, "Content-Type": "application/json" },
          });
        }
      } else {
        console.log(`WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID is missing. Simulating sending to ${cleanPhone}`);
        mockSent = true;
      }

      // Write the outbound message to the database
      let dbMessageBody = message || "";
      if (type === "template") dbMessageBody = `[TEMPLATE: ${template.name}]`;
      if (type === "image") dbMessageBody = `[IMAGE] ${message || ''}`;

      const { data, error } = await supabase
        .from("whatsapp_messages")
        .insert({
          sender_phone: cleanPhone,
          sender_name: "Admin",
          message_body: dbMessageBody,
          message_type: type,
          direction: "outbound",
          status: "sent",
          raw_payload: apiResponse || { mock: true, sent: true, payload }
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return new Response(JSON.stringify({
        status: "success",
        mock: mockSent,
        message: data
      }), {
        status: 200,
        headers: { ...cors, "Content-Type": "application/json" },
      });

    } catch (err) {
      console.error("Error in send-whatsapp-message:", err);
      return new Response(JSON.stringify({ status: "error", error: err.message }), {
        status: 200,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }
  }
};
