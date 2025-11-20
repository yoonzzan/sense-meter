import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config';

if (!SUPABASE_URL) {
  throw new Error("Missing env.SUPABASE_URL");
}

if (!SUPABASE_ANON_KEY) {
  throw new Error("Missing env.SUPABASE_ANON_KEY");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
