import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { isSupabaseConfigured, publicEnv } from "@/lib/env";
import type { Database } from "./types";

/**
 * Creates a request-scoped server Supabase client wired to Next.js cookies.
 * Returns `null` when Supabase is not configured so callers can fall back to
 * local seed data. Use inside Server Components, Route Handlers and Server
 * Actions.
 */
export async function createServerSupabaseClient() {
  if (!isSupabaseConfigured) return null;

  const cookieStore = await cookies();

  return createServerClient<Database>(
    publicEnv.supabaseUrl,
    publicEnv.supabasePublishableKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // `setAll` was called from a Server Component — safe to ignore when
            // middleware is responsible for refreshing the session cookie.
          }
        },
      },
    },
  );
}
