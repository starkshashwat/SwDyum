import { createClient } from '@supabase/supabase-js';

// V10: Read Supabase URL and anon key from environment variables.
// Create a .env.local file with:
//   VITE_SUPABASE_URL=https://<project>.supabase.co
//   VITE_SUPABASE_ANON_KEY=<anon-key>
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dligrptvajjsbzlcpjsk.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseAnonKey) {
    console.warn(
        '[supabase] VITE_SUPABASE_ANON_KEY is not set. Admin features will not work. ' +
        'Add it to your .env.local file.'
    );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey || 'missing-anon-key');
