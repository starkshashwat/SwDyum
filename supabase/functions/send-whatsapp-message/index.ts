// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export default {
  async fetch(req: Request) {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    try {
      const { phone, message } = await req.json();

      if (!phone || !message) {
        return new Response(JSON.stringify({ error: "Phone and message are required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Initialize Supabase Client
      const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const accessToken = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
      const phoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");

      let apiResponse = null;
      let mockSent = false;

      // If credentials are set, call the actual Meta API
      if (accessToken && phoneNumberId) {
        console.log(`Sending real WhatsApp message to ${phone}`);
        const metaUrl = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
        
        const res = await fetch(metaUrl, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: phone,
            type: "text",
            text: { body: message },
          }),
        });

        apiResponse = await res.json();
        if (!res.ok) {
          throw new Error(apiResponse?.error?.message || "Failed to send WhatsApp message via Meta API");
        }
      } else {
        console.log(`WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID is missing. Simulating sending to ${phone}`);
        mockSent = true;
      }

      // Write the outbound message to the database
      const { data, error } = await supabase
        .from("whatsapp_messages")
        .insert({
          whatsapp_message_id: apiResponse?.messages?.[0]?.id || `mock-msg-${Date.now()}`,
          sender_phone: phone,
          sender_name: "Admin",
          message_body: message,
          message_type: "text",
          direction: "outbound",
          raw_payload: apiResponse || { mock: true, sent: true }
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
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } catch (err) {
      console.error("Error in send-whatsapp-message:", err);
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }
};
