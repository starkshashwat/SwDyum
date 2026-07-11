// Edge Function for WhatsApp Auth
// Security-hardened version (fixes V1, V2, V4, V5):
//  - Cryptographically secure OTP generation (crypto.getRandomValues)
//  - OTPs stored as SHA-256 hashes, never plaintext
//  - Brute-force lockout after MAX_ATTEMPTS failed verifications
//  - Signed session token (HMAC-SHA256 + expiry) instead of a forgeable string
//  - update_profile requires a valid user JWT and enforces id === jwt.sub
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

// ─── Configuration ───────────────────────────────────────────────────────────
const OTP_TTL_MINUTES = 10;
const OTP_COOLDOWN_SECONDS = 60;
const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;
const SESSION_TTL_MINUTES = 60 * 24 * 7; // 7 days

// ─── CORS ────────────────────────────────────────────────────────────────────
// Restrict to known origins (V18). Falls back to localhost for dev.
const ALLOWED_ORIGINS = [
  "https://swadyum.store",
  "https://www.swadyum.store",
  "http://localhost:5173",
  "http://localhost:4173",
  "http://localhost:3000",
];

function corsHeaders(origin: string | null) {
  const allow = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Vary": "Origin",
  };
}

// ─── Crypto helpers ──────────────────────────────────────────────────────────
async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmacSha256Hex(secret: string, input: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(input));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function base64UrlEncode(obj: object): string {
  return btoa(JSON.stringify(obj))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function generateSecureOtp(): string {
  // 6-digit OTP using a cryptographically secure RNG (V5).
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  return (100000 + (bytes[0] % 900000)).toString();
}

// ─── Session token (V1) ──────────────────────────────────────────────────────
// Issues a signed token: base64url(header).base64url(payload).hmac
// The payload contains the profile id and an expiry. The secret is the
// JWT secret of the Supabase project (SUPABASE_JWT_SECRET), which only the
// edge function can read from env.
async function issueSessionToken(profileId: string): Promise<string> {
  const secret = Deno.env.get("SUPABASE_JWT_SECRET") || Deno.env.get("SESSION_SECRET") || "";
  if (!secret) {
    throw new Error("Session signing secret is not configured");
  }
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: profileId,
    iat: now,
    exp: now + SESSION_TTL_MINUTES * 60,
    iss: "swadyum-whatsapp-auth",
  };
  const headerB64 = base64UrlEncode(header);
  const payloadB64 = base64UrlEncode(payload);
  const signingInput = `${headerB64}.${payloadB64}`;
  const signature = await hmacSha256Hex(secret, signingInput);
  return `${signingInput}.${signature}`;
}

// ─── Main ────────────────────────────────────────────────────────────────────
export default {
  async fetch(req: Request) {
    const origin = req.headers.get("Origin");
    const cors = corsHeaders(origin);

    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: cors });
    }

    try {
      const body = await req.json();
      const { action, phone, otp, optIn, id, name, email } = body;

      const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // ─── action: send ──────────────────────────────────────────────────────
      if (action === "send") {
        if (!phone) {
          return new Response(JSON.stringify({ error: "Phone number is required" }), {
            status: 400,
            headers: { ...cors, "Content-Type": "application/json" },
          });
        }

        // Rate limiting: 60-second cooldown per phone (V4 part 1).
        const { data: existingOtp } = await supabase
          .from("whatsapp_otps")
          .select("created_at, locked_until, attempts")
          .eq("phone", phone)
          .single();

        if (existingOtp) {
          if (existingOtp.locked_until && new Date(existingOtp.locked_until) > new Date()) {
            const wait = Math.ceil(
              (new Date(existingOtp.locked_until).getTime() - Date.now()) / 1000
            );
            return new Response(
              JSON.stringify({ error: `Too many attempts. Please try again in ${wait} seconds.` }),
              { status: 429, headers: { ...cors, "Content-Type": "application/json" } }
            );
          }
          if (existingOtp.created_at) {
            const secondsSinceLastOtp =
              (Date.now() - new Date(existingOtp.created_at).getTime()) / 1000;
            if (secondsSinceLastOtp < OTP_COOLDOWN_SECONDS) {
              const waitTime = Math.ceil(OTP_COOLDOWN_SECONDS - secondsSinceLastOtp);
              return new Response(
                JSON.stringify({ error: `Please wait ${waitTime} seconds before requesting a new OTP.` }),
                { status: 429, headers: { ...cors, "Content-Type": "application/json" } }
              );
            }
          }
        }

        // Generate a secure OTP and store its hash (V3, V5).
        const generatedOtp = generateSecureOtp();
        const otpHash = await sha256Hex(generatedOtp);
        const now = new Date();
        const expiresAt = new Date(now.getTime() + OTP_TTL_MINUTES * 60 * 1000);

        const { error: dbError } = await supabase.from("whatsapp_otps").upsert({
          phone: phone,
          otp_hash: otpHash,
          attempts: 0,
          locked_until: null,
          created_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
        });

        if (dbError) throw dbError;

        // Send via WhatsApp Meta API (or mock in dev).
        const accessToken = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
        const phoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");

        if (accessToken && phoneNumberId) {
          const metaUrl = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
          const res = await fetch(metaUrl, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              recipient_type: "individual",
              to: phone,
              type: "template",
              template: {
                name: "login_authenticttion",
                language: { code: "en_US" },
                components: [
                  { type: "body", parameters: [{ type: "text", text: generatedOtp }] },
                  {
                    type: "button",
                    sub_type: "url",
                    index: "0",
                    parameters: [{ type: "text", text: generatedOtp }],
                  },
                ],
              },
            }),
          });
          if (!res.ok) {
            // Surface the real WhatsApp/Meta reason (e.g. missing/mis-named
            // template, expired token) instead of a generic 500, so the failure
            // is actually diagnosable from the client. Remove the stored OTP so
            // the cooldown does not block an immediate retry.
            let metaMessage = "Failed to send OTP via WhatsApp.";
            try {
              const apiResponse = await res.json();
              metaMessage = apiResponse?.error?.message || metaMessage;
            } catch (_) {
              /* non-JSON body */
            }
            console.error("WhatsApp send failed:", metaMessage);
            await supabase.from("whatsapp_otps").delete().eq("phone", phone);
            return new Response(
              JSON.stringify({ error: `Could not send OTP via WhatsApp: ${metaMessage}` }),
              { status: 502, headers: { ...cors, "Content-Type": "application/json" } }
            );
          }
        } else {
          console.log(`[dev] Mocking OTP send to ${phone}`);
        }

        return new Response(JSON.stringify({ status: "success", message: "OTP sent successfully" }), {
          status: 200,
          headers: { ...cors, "Content-Type": "application/json" },
        });

        // ─── action: verify ──────────────────────────────────────────────────
      } else if (action === "verify") {
        if (!phone) {
          return new Response(JSON.stringify({ error: "Phone number is required" }), {
            status: 400,
            headers: { ...cors, "Content-Type": "application/json" },
          });
        }
        if (!otp) {
          return new Response(JSON.stringify({ error: "OTP is required for verification" }), {
            status: 400,
            headers: { ...cors, "Content-Type": "application/json" },
          });
        }

        const { data: record, error: fetchError } = await supabase
          .from("whatsapp_otps")
          .select("*")
          .eq("phone", phone)
          .single();

        if (fetchError || !record) {
          return new Response(JSON.stringify({ error: "Invalid or expired OTP" }), {
            status: 400,
            headers: { ...cors, "Content-Type": "application/json" },
          });
        }

        // Lockout check (V4 part 2).
        if (record.locked_until && new Date(record.locked_until) > new Date()) {
          const wait = Math.ceil(
            (new Date(record.locked_until).getTime() - Date.now()) / 1000
          );
          return new Response(
            JSON.stringify({ error: `Too many failed attempts. Try again in ${wait} seconds.` }),
            { status: 429, headers: { ...cors, "Content-Type": "application/json" } }
          );
        }

        // Expiry check.
        if (new Date(record.expires_at) < new Date()) {
          await supabase.from("whatsapp_otps").delete().eq("phone", phone);
          return new Response(JSON.stringify({ error: "Invalid or expired OTP" }), {
            status: 400,
            headers: { ...cors, "Content-Type": "application/json" },
          });
        }

        // Constant-time-ish hash comparison (V3).
        const providedHash = await sha256Hex(otp);
        if (providedHash !== record.otp_hash) {
          const newAttempts = (record.attempts || 0) + 1;
          if (newAttempts >= MAX_ATTEMPTS) {
            const lockUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
            await supabase
              .from("whatsapp_otps")
              .update({ attempts: newAttempts, locked_until: lockUntil.toISOString() })
              .eq("phone", phone);
            return new Response(
              JSON.stringify({ error: `Too many failed attempts. Locked for ${LOCKOUT_MINUTES} minutes.` }),
              { status: 429, headers: { ...cors, "Content-Type": "application/json" } }
            );
          }
          await supabase
            .from("whatsapp_otps")
            .update({ attempts: newAttempts })
            .eq("phone", phone);
          return new Response(
            JSON.stringify({ error: `Invalid OTP. ${MAX_ATTEMPTS - newAttempts} attempt(s) remaining.` }),
            { status: 400, headers: { ...cors, "Content-Type": "application/json" } }
          );
        }

        // OTP valid — clear it.
        await supabase.from("whatsapp_otps").delete().eq("phone", phone);

        // Fetch or create profile.
        let { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("phone", phone)
          .maybeSingle();

        if (!profile) {
          const newUserId = crypto.randomUUID();
          const { data: newProfile, error: insertError } = await supabase
            .from("profiles")
            .upsert({
              id: newUserId,
              phone: phone,
              name: "",
              whatsapp_opt_in: optIn !== undefined ? optIn : true,
            })
            .select()
            .single();

          if (insertError) throw insertError;
          profile = newProfile;
        } else if (optIn !== undefined) {
          const { data: updatedProfile, error: updateError } = await supabase
            .from("profiles")
            .update({ whatsapp_opt_in: optIn })
            .eq("id", profile.id)
            .select()
            .single();
          if (updateError) throw updateError;
          profile = updatedProfile;
        }

        // Issue a signed session token (V1).
        const token = await issueSessionToken(profile.id);

        return new Response(
          JSON.stringify({ status: "success", profile: profile, token }),
          { status: 200, headers: { ...cors, "Content-Type": "application/json" } }
        );

        // ─── action: update_profile (V2 — now requires auth) ─────────────────
      } else if (action === "update_profile") {
        // Require a valid Supabase user JWT. The anon key alone is NOT enough.
        const authHeader = req.headers.get("Authorization") || "";
        const token = authHeader.replace("Bearer ", "");
        if (!token) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { ...cors, "Content-Type": "application/json" },
          });
        }

        // Verify the JWT against Supabase auth using the anon key + the token.
        const userClient = createClient(
          supabaseUrl,
          Deno.env.get("SUPABASE_ANON_KEY") || "",
          { global: { headers: { Authorization: `Bearer ${token}` } } }
        );
        const {
          data: { user },
          error: userError,
        } = await userClient.auth.getUser();

        if (userError || !user) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { ...cors, "Content-Type": "application/json" },
          });
        }

        // Enforce that the caller can only update their own profile (V2).
        if (!id || id !== user.id) {
          return new Response(
            JSON.stringify({ error: "You can only update your own profile." }),
            { status: 403, headers: { ...cors, "Content-Type": "application/json" } }
          );
        }

        const { data, error } = await supabase
          .from("profiles")
          .upsert({ id, name, email, phone })
          .select()
          .single();

        if (error) {
          return new Response(JSON.stringify({ error: "Profile update failed." }), {
            status: 500,
            headers: { ...cors, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ data }), {
          status: 200,
          headers: { ...cors, "Content-Type": "application/json" },
        });

        // ─── unknown action ──────────────────────────────────────────────────
      } else {
        return new Response(JSON.stringify({ error: "Invalid action" }), {
          status: 400,
          headers: { ...cors, "Content-Type": "application/json" },
        });
      }
    } catch (err) {
      console.error("Error in whatsapp-auth:", err);
      // V17: do not leak internal error details to the client.
      return new Response(JSON.stringify({ error: "An unexpected error occurred." }), {
        status: 500,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }
  },
};
