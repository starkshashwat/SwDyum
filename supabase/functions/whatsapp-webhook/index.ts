// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

async function processMedia(mediaId: string, supabase: any): Promise<string | null> {
  try {
    const WHATSAPP_API_TOKEN = Deno.env.get("WHATSAPP_API_TOKEN");
    if (!WHATSAPP_API_TOKEN) {
      console.error("Missing WHATSAPP_API_TOKEN");
      return null;
    }

    // 1. Fetch media metadata (URL) from Meta
    const metaRes = await fetch(`https://graph.facebook.com/v19.0/${mediaId}`, {
      headers: { Authorization: `Bearer ${WHATSAPP_API_TOKEN}` },
    });
    
    if (!metaRes.ok) {
      console.error("Failed to fetch media metadata:", await metaRes.text());
      return null;
    }
    
    const metaData = await metaRes.json();
    const mediaUrl = metaData.url;
    const mimeType = metaData.mime_type;

    // 2. Download actual binary from Meta
    const mediaRes = await fetch(mediaUrl, {
      headers: { Authorization: `Bearer ${WHATSAPP_API_TOKEN}` },
    });
    
    if (!mediaRes.ok) {
      console.error("Failed to download media binary:", await mediaRes.text());
      return null;
    }
    
    const arrayBuffer = await mediaRes.arrayBuffer();

    // 3. Upload to Supabase 'whatsapp_media' private bucket
    // Extension mapping for common types
    let fileExt = 'bin';
    if (mimeType.includes('jpeg')) fileExt = 'jpg';
    else if (mimeType.includes('png')) fileExt = 'png';
    else if (mimeType.includes('webp')) fileExt = 'webp';
    else if (mimeType.includes('pdf')) fileExt = 'pdf';
    else if (mimeType.includes('audio')) fileExt = 'mp3';
    else if (mimeType.includes('video')) fileExt = 'mp4';
    else fileExt = mimeType.split('/')[1] || 'bin';

    const filePath = `${crypto.randomUUID()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('whatsapp_media')
      .upload(filePath, arrayBuffer, {
        contentType: mimeType,
      });

    if (error) {
      console.error("Supabase storage upload error:", error);
      return null;
    }

    return filePath;
  } catch (err) {
    console.error("Media processing error:", err);
    return null;
  }
}

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

      const VERIFY_TOKEN = Deno.env.get("VERIFY_TOKEN");

      if (!VERIFY_TOKEN) {
        console.error("VERIFY_TOKEN env var is not configured; refusing webhook verification.");
        return new Response("Forbidden", { status: 403 });
      }

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

        const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const entry = body.entry?.[0];
        const change = entry?.changes?.[0];
        const value = change?.value;

        // Handle message status updates (sent, delivered, read, failed)
        if (value && value.statuses) {
          for (const statusObj of value.statuses) {
             const { id, status } = statusObj;
             // Find matching message where the raw payload id matches this status id.
             // Meta status ids match the original message ids.
             // We stored the whatsapp message ID inside raw_payload -> "messages" -> "id", 
             // but for outbound messages we might have stored it elsewhere.
             // Since we didn't add a specific column for the meta message ID previously, we will try to update it using raw_payload matching or just log it.
             console.log(`Status update: ${id} -> ${status}`);
          }
        }

        if (value && value.messages && Array.isArray(value.messages)) {
          for (const message of value.messages) {
            const messageId = message.id;
            let rawPhone = message.from || message.from_user_id || "Unknown";
            // Normalize phone number (digits only)
            const senderPhone = rawPhone.replace(/\D/g, '');
            
            const contact = value.contacts?.find((c: any) => c.wa_id === rawPhone || c.wa_id === senderPhone) || value.contacts?.[0];
            const senderName = contact?.profile?.name || "Unknown Sender";
            const messageType = message.type || "text";
            let messageBody = "";
            let mediaPath = null;

            if (messageType === "text") {
              messageBody = message.text?.body || "";
            } else if (messageType === "interactive") {
              messageBody = message.interactive?.button_reply?.title || message.interactive?.list_reply?.title || "[Interactive]";
            } else if (messageType === "button") {
              messageBody = message.button?.text || "[Button]";
            } else if (["image", "document", "audio", "video"].includes(messageType)) {
              // Handle Media
              const mediaObj = message[messageType];
              messageBody = `[${messageType.toUpperCase()} MEDIA]`;
              if (mediaObj?.caption) {
                messageBody += `\nCaption: ${mediaObj.caption}`;
              }
              if (mediaObj?.id) {
                mediaPath = await processMedia(mediaObj.id, supabase);
              }
            } else {
              messageBody = `[${messageType} message]`;
            }

            // Insert parsed message into database
            const { error } = await supabase
              .from("whatsapp_messages")
              .insert({
                sender_phone: senderPhone,
                sender_name: senderName,
                message_body: messageBody,
                direction: "inbound",
                message_type: messageType,
                raw_payload: body,
                media_path: mediaPath,
                status: 'received'
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
