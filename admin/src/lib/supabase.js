import { createClient } from '@supabase/supabase-js';

// Read Supabase URL and anon key from environment variables.
// Create a .env.local (or Vercel env) with:
//   VITE_SUPABASE_URL=https://<project>.supabase.co
//   VITE_SUPABASE_ANON_KEY=<anon-key>
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
        '[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not set. ' +
        'Add them to .env.local (dev) or the Vercel project env (prod).'
    );
}

// Empty-string placeholders keep createClient from throwing at import time;
// requests will fail loudly until the env vars are provided.
export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder');
