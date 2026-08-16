import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dligrptvajjsbzlcpjsk.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsaWdycHR2YWpqc2J6bGNwanNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3MDQwMDksImV4cCI6MjA5NzI4MDAwOX0.6840Jbg6FZjOVN_KC6M0wyREEtXlxdKAGxU5U92-CRM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

