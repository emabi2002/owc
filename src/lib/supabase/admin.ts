import { createClient } from "@supabase/supabase-js";
import { isSupabaseAdminConfigured, publicEnv, serverEnv } from "@/lib/env";
import type { Database } from "./types";

/**
 * Privileged service-role client. Bypasses Row Level Security and must ONLY be
 * used in trusted server contexts (Route Handlers, Server Actions, cron jobs)
 * for operations such as writing audit logs or provisioning user profiles.
 *
 * Returns `null` when the service-role key is not configured. The key is never
 * exposed to the browser bundle.
 */
export function createAdminSupabaseClient() {
  if (!isSupabaseAdminConfigured) return null;

  return createClient<Database>(
    publicEnv.supabaseUrl,
    serverEnv.supabaseSecretKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
