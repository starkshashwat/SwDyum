// Edge Function for WhatsApp Auth
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export default {
  async fetch(req: Request) {
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    try {
      const body = await req.json();
      const { action, phone, otp, optIn, id, name, email } = body;

      if (!phone) {
        return new Response(JSON.stringify({ error: "Phone number is required" }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      if (action === 'send') {
        // --- Rate Limiting (60-second cooldown) ---
        const { data: existingOtp } = await supabase
          .from("whatsapp_otps")
          .select("created_at")
          .eq("phone", phone)
          .single();

        if (existingOtp && existingOtp.created_at) {
          const secondsSinceLastOtp = (new Date().getTime() - new Date(existingOtp.created_at).getTime()) / 1000;
          if (secondsSinceLastOtp < 60) {
            const waitTime = Math.ceil(60 - secondsSinceLastOtp);
            return new Response(JSON.stringify({ error: `Please wait ${waitTime} seconds before requesting a new OTP.` }), {
              status: 200,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        }
        // ------------------------------------------

        // Generate a 6 digit OTP
        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        // Store OTP
        const { error: dbError } = await supabase
          .from("whatsapp_otps")
          .upsert({
            phone: phone,
            otp: generatedOtp,
            created_at: new Date().toISOString(),
            expires_at: expiresAt.toISOString()
          });

        if (dbError) throw dbError;

        const message = `Your Swadyum login OTP is: ${generatedOtp}. Valid for 10 minutes.`;

        // Send WhatsApp Message
        const accessToken = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
        const phoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");

        if (accessToken && phoneNumberId) {
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
              type: "template",
              template: {
                name: "login_authenticttion",
                language: {
                  code: "en_US"
                },
                components: [
                  {
                    type: "body",
                    parameters: [
                      {
                        type: "text",
                        text: generatedOtp
                      }
                    ]
                  },
                  {
                    type: "button",
                    sub_type: "url",
                    index: "0",
                    parameters: [
                      {
                        type: "text",
                        text: generatedOtp
                      }
                    ]
                  }
                ]
              },
            }),
          });
          const apiResponse = await res.json();
          if (!res.ok) {
            throw new Error(apiResponse?.error?.message || "Failed to send OTP via Meta API");
          }
        } else {
          console.log(`Mocking OTP send to ${phone}: ${generatedOtp}`);
        }

        return new Response(JSON.stringify({ status: "success", message: "OTP sent successfully" }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

      } else if (action === 'verify') {
        if (!otp) {
          return new Response(JSON.stringify({ error: "OTP is required for verification" }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Verify OTP
        const { data: record, error: fetchError } = await supabase
          .from("whatsapp_otps")
          .select("*")
          .eq("phone", phone)
          .single();

        if (fetchError || !record) {
          return new Response(JSON.stringify({ error: "Invalid or expired OTP" }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        if (record.otp !== otp || new Date(record.expires_at) < new Date()) {
          return new Response(JSON.stringify({ error: "Invalid or expired OTP" }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // OTP is valid, clear it
        await supabase.from("whatsapp_otps").delete().eq("phone", phone);

        // Fetch or create user in profiles
        let { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("phone", phone)
          .maybeSingle();

        if (!profile) {
          // Create the user in auth.users using the admin API to satisfy foreign key constraints
          // Insert directly into profiles table
          const newUserId = crypto.randomUUID();

          const { data: newProfile, error: insertError } = await supabase
            .from("profiles")
            .upsert({
              id: newUserId,
              phone: phone,
              name: "",
              whatsapp_opt_in: optIn !== undefined ? optIn : true
            })
            .select()
            .single();

          if (insertError) throw insertError;
          profile = newProfile;
        } else {
          // Update opt_in preference
          if (optIn !== undefined) {
            const { data: updatedProfile, error: updateError } = await supabase
              .from("profiles")
              .update({ whatsapp_opt_in: optIn })
              .eq("id", profile.id)
              .select()
              .single();

            if (updateError) throw updateError;
            profile = updatedProfile;
          }
        }

        // Return a mock session token and the profile
        // Since we are bypassing standard Supabase Auth due to custom integration
        // The client will use this profile data.
        return new Response(JSON.stringify({
          status: "success",
          profile: profile,
          token: "wa_custom_token_" + profile.id
        }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

      } else {
        if (action === 'update_profile') {
          
          if (!id) {
            return new Response(JSON.stringify({ error: "User ID is required" }), {
              status: 200,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }

          const { data, error } = await supabase
            .from("profiles")
            .upsert({ id, name, email, phone })
            .select()
            .single();

          if (error) {
            return new Response(JSON.stringify({ error: error.message }), {
              status: 200,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }

          return new Response(JSON.stringify({ data }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ error: "Invalid action" }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

    } catch (err) {
      console.error("Error in whatsapp-auth:", err);
      return new Response(JSON.stringify({ error: err.message }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }
};
