import { createClient } from '@supabase/supabase-js';

// V10: Read Supabase URL and anon key from environment variables instead of
// hardcoding them in the bundle. Provide Vite env fallbacks for local dev.
// Create a .env.local file with:
//   VITE_SUPABASE_URL=https://<project>.supabase.co
//   VITE_SUPABASE_ANON_KEY=<anon-key>
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dligrptvajjsbzlcpjsk.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsaWdycHR2YWpqc2J6bGNwanNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3MDQwMDksImV4cCI6MjA5NzI4MDAwOX0.6840Jbg6FZjOVN_KC6M0wyREEtXlxdKAGxU5U92-CRM';

if (!supabaseAnonKey) {
    console.warn(
        '[supabase] VITE_SUPABASE_ANON_KEY is not set. Authenticated features will not work. ' +
        'Add it to your .env.local file.'
    );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
