import { createClient } from '@supabase/supabase-js';

// Fallback to the user-provided credentials if environment variables are not set.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://irhqcroczvdkytvvsico.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_iecSD9eU8wwGFllUWzmZng_yYam5hag';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
