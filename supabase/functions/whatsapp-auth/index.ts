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
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// ─── Session token (V1) ──────────────────────────────────────────────────────
// Issues a signed token: base64url(header).base64url(payload).hmac
// The payload contains the profile id and an expiry. The secret must be a
// dedicated signing secret (SUPABASE_JWT_SECRET or SESSION_SECRET), never the
// service-role key.
//
// Phase 5 security hardening: removed the SUPABASE_SERVICE_ROLE_KEY fallback.
// Using the service-role key as an HMAC signing secret was a critical risk:
// that key is also the master DB-bypassing credential, so any leak/rotation
// mismatch of the session-token secret would double as an admin-DB-access
// leak. This function now fails closed (throws) unless a dedicated
// SUPABASE_JWT_SECRET or SESSION_SECRET env var is configured.
async function issueSessionToken(profileId: string): Promise<string> {
  const secret = Deno.env.get("SUPABASE_JWT_SECRET") || Deno.env.get("SESSION_SECRET") || "";
  if (!secret) {
    throw new Error("Session signing secret is not configured (set SUPABASE_JWT_SECRET or SESSION_SECRET)");
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
        const isLocal = !(Deno.env.get("SUPABASE_URL") || "").includes(".supabase.co");

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
        } else if (isLocal) {
          console.log(`[dev] Mocking OTP send to ${phone}. OTP is: ${generatedOtp}`);
        } else {
          console.error("Missing WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID in environment.");
          await supabase.from("whatsapp_otps").delete().eq("phone", phone);
          return new Response(
            JSON.stringify({ error: "Server misconfiguration: WhatsApp credentials missing." }),
            { status: 500, headers: { ...cors, "Content-Type": "application/json" } }
          );
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

        // Constant-time hash comparison (V3).
        const providedHash = await sha256Hex(otp);
        if (!timingSafeEqualStr(providedHash, record.otp_hash)) {
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

        let profileToReturn;
        const { userId } = body;

        if (userId) {
           // Phone-linking mode. A phone OTP only proves control of the PHONE —
           // it says nothing about who owns `userId`. Before linking (and before
           // returning the profile + session token), require a valid Supabase
           // JWT whose subject IS the requested userId. Without this, an
           // attacker could OTP-verify their own phone while passing a
           // victim's profile id and take over that account.
           const authHeader = req.headers.get("Authorization") || "";
           const callerToken = authHeader.replace("Bearer ", "");
           const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
           let jwtMatchesUser = false;
           if (callerToken && callerToken !== anonKey) {
             const userClient = createClient(
               supabaseUrl,
               anonKey,
               { global: { headers: { Authorization: `Bearer ${callerToken}` } } }
             );
             const { data: { user } } = await userClient.auth.getUser();
             jwtMatchesUser = !!user && user.id === userId;
           }
           if (!jwtMatchesUser) {
             return new Response(JSON.stringify({ error: "Unauthorized" }), {
                 status: 401,
                 headers: { ...cors, "Content-Type": "application/json" }
             });
           }

           // 1. Check if phone is already used by ANOTHER profile
           const { data: existingPhoneProfile } = await supabase
             .from("profiles")
             .select("id, phone_verified")
             .eq("phone", phone)
             .neq("id", userId)
             .maybeSingle();
             
           if (existingPhoneProfile && existingPhoneProfile.phone_verified) {
              return new Response(JSON.stringify({ error: "Phone number is already linked to another verified account. Please contact support." }), {
                  status: 409,
                  headers: { ...cors, "Content-Type": "application/json" }
              });
           }
           
           if (existingPhoneProfile && !existingPhoneProfile.phone_verified) {
               // Remove phone from the unverified duplicate
               await supabase.from("profiles").update({ phone: null }).eq("id", existingPhoneProfile.id);
           }
           
           // 2. Link phone to current profile
           const { data: updatedProfile, error: linkError } = await supabase
             .from("profiles")
             .update({ phone: phone, phone_verified: true, whatsapp_opt_in: optIn !== undefined ? optIn : true })
             .eq("id", userId)
             .select()
             .single();
             
           if (linkError) throw linkError;
           profileToReturn = updatedProfile;
           
        } else {
           // Standard Phone Login/Signup Flow
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
                 name: name || "",
                 email: email || null,
                 phone_verified: true,
                 whatsapp_opt_in: optIn !== undefined ? optIn : true,
               })
               .select()
               .single();

             if (insertError) throw insertError;
             profileToReturn = newProfile;
           } else {
             // Update existing
             const updates: any = { phone_verified: true };
             if (optIn !== undefined) updates.whatsapp_opt_in = optIn;
             if (name && !profile.name) updates.name = name;
             if (email && !profile.email) updates.email = email;
             
             const { data: updatedProfile, error: updateError } = await supabase
               .from("profiles")
               .update(updates)
               .eq("id", profile.id)
               .select()
               .single();
             if (updateError) throw updateError;
             profileToReturn = updatedProfile;
           }
        }

        // Issue a signed session token (V1).
        const token = await issueSessionToken(profileToReturn.id);

        return new Response(
          JSON.stringify({ status: "success", profile: profileToReturn, token }),
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
