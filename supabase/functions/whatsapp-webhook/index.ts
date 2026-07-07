// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

export default {
  async fetch(req: Request) {
    const url = new URL(req.url);
    const method = req.method;

    console.log(`Received request: ${method} ${url.pathname}`);

    // 1. Handle GET requests (Webhook Verification from Meta)
    if (method === "GET") {
      const mode = url.searchParams.get("hub.mode");
      const token = url.searchParams.get("hub.verify_token");
      const challenge = url.searchParams.get("hub.challenge");

      // Get the secret verify token from environment variables or fallback
      const VERIFY_TOKEN = Deno.env.get("VERIFY_TOKEN") || "swadyum_whatsapp_verify_2026";

      if (mode === "subscribe" && token === VERIFY_TOKEN) {
        console.log("WEBHOOK_VERIFIED successfully.");
        return new Response(challenge, {
          status: 200,
          headers: { "Content-Type": "text/plain" },
        });
      } else {
        console.error("Verification failed: Token mismatch or invalid mode.");
        return new Response("Forbidden", { status: 403 });
      }
    }

    // 2. Handle POST requests (Actual WhatsApp Webhook Events)
    if (method === "POST") {
      try {
        const body = await req.json();
        console.log("Received WhatsApp Webhook event:", JSON.stringify(body, null, 2));

        // Initialize Supabase Client using environment variables
        const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const entry = body.entry?.[0];
        const change = entry?.changes?.[0];
        const value = change?.value;
        
        if (value && value.messages) {
          const contact = value.contacts?.[0];
          const message = value.messages?.[0];
          
          if (message) {
            const messageId = message.id;
            const senderPhone = message.from || message.from_user_id || "Unknown";
            const senderName = contact?.profile?.name || "Unknown Sender";
            const messageType = message.type || "text";
            let messageBody = "";
            
            if (messageType === "text") {
              messageBody = message.text?.body || "";
            } else if (messageType === "interactive") {
              messageBody = message.interactive?.button_reply?.title || message.interactive?.list_reply?.title || "[Interactive]";
            } else if (messageType === "button") {
              messageBody = message.button?.text || "[Button]";
            } else {
              messageBody = `[${messageType} message]`;
            }

            // Insert parsed message into database
            const { error } = await supabase
              .from("whatsapp_messages")
              .insert({
                whatsapp_message_id: messageId,
                sender_phone: senderPhone,
                sender_name: senderName,
                message_body: messageBody,
                message_type: messageType,
                direction: "inbound",
                raw_payload: body
              });

            if (error) {
              console.error("Database Insert Error:", error);
            } else {
              console.log(`Saved inbound message from ${senderName} (${senderPhone}) to database.`);
            }
          }
        }

        return new Response(JSON.stringify({ status: "success" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      } catch (err) {
        console.error("Error processing POST request:", err);
        return new Response(JSON.stringify({ error: err.message }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // 3. Handle unsupported methods
    return new Response("Method Not Allowed", { status: 405 });
  }
};
