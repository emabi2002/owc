"use client";

import { createBrowserClient } from "@supabase/ssr";
import { isSupabaseConfigured, publicEnv } from "@/lib/env";
import type { Database } from "./types";

type BrowserClient = ReturnType<typeof createBrowserClient<Database>>;

let browserClient: BrowserClient | null = null;

/**
 * Returns a singleton browser Supabase client, or `null` when Supabase is not
 * configured (local seed/demo mode). Callers must handle the null case.
 */
export function getSupabaseBrowserClient(): BrowserClient | null {
  if (!isSupabaseConfigured) return null;
  if (!browserClient) {
    browserClient = createBrowserClient<Database>(
      publicEnv.supabaseUrl,
      publicEnv.supabaseAnonKey,
    );
  }
  return browserClient;
}
