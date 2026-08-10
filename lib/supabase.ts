import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Public anon client — used for client-side reads & public inserts (subject to RLS).
 * Safe to use in client components and public API routes.
 */
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

/**
 * Server-side admin client — uses Service Role Key (bypasses RLS).
 * ONLY use in API routes and server-side code. NEVER expose to client.
 * Falls back to anon client if SERVICE_ROLE_KEY is not configured.
 */
export const supabaseAdmin =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })
    : supabase; // Graceful fallback to anon client if service key not set
