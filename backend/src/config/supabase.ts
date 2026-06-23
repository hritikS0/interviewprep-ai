import { createClient } from "@supabase/supabase-js";
import { env } from "./env";

// Client for public operations (sign up, sign in, session refresh)
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

// Admin client for restricted operations (revocation, admin sign out)
export const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
