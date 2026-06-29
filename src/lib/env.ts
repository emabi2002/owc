/**
 * Centralised environment-variable access for the OWC platform.
 *
 * Rules:
 *  - `NEXT_PUBLIC_*` variables are safe in the browser and are inlined at build
 *    time by Next.js. They are referenced *literally* below so the compiler can
 *    replace them.
 *  - Server-only secrets (service-role key, CPPS API key) are read from
 *    `process.env` and are automatically stripped from the client bundle by
 *    Next.js. They MUST only be consumed inside server modules.
 *
 * The platform is designed to degrade gracefully: when an integration is not
 * configured the data/service layer falls back to local seed data so the site
 * remains buildable and demonstrable without live credentials.
 */

export type CaptchaProvider =
  | "fallback"
  | "turnstile"
  | "recaptcha"
  | "hcaptcha";

/** Browser-safe configuration (inlined at build time). */
export const publicEnv = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://owc.gov.pg",
  captchaProvider: (process.env.NEXT_PUBLIC_CAPTCHA_PROVIDER ??
    "fallback") as CaptchaProvider,
  captchaSiteKey: process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY ?? "",
} as const;

/**
 * Server-only configuration. These values are `""` in the browser bundle
 * because Next.js does not expose non-public env vars to the client.
 */
export const serverEnv = {
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  cppsApiBaseUrl: process.env.CPPS_API_BASE_URL ?? "",
  cppsApiKey: process.env.CPPS_API_KEY ?? "",
  cppsGraphqlEndpoint: process.env.CPPS_GRAPHQL_ENDPOINT ?? "",
  captchaSecretKey: process.env.CAPTCHA_SECRET_KEY ?? "",
  /** Comma-separated list of admin emails granted Administrator on first login. */
  bootstrapAdminEmails: process.env.OWC_BOOTSTRAP_ADMIN_EMAILS ?? "",
} as const;

/** True when Supabase (Auth + Postgres) credentials are present. */
export const isSupabaseConfigured = Boolean(
  publicEnv.supabaseUrl && publicEnv.supabaseAnonKey,
);

/** True when the service-role key is available (server-side privileged ops). */
export const isSupabaseAdminConfigured = Boolean(
  isSupabaseConfigured && serverEnv.supabaseServiceRoleKey,
);

/** True when the CPPS claims back-end is reachable. */
export const isCppsConfigured = Boolean(serverEnv.cppsApiBaseUrl);

/** True when a real CAPTCHA provider is configured (vs. the math fallback). */
export const isCaptchaConfigured = Boolean(
  publicEnv.captchaProvider !== "fallback" && publicEnv.captchaSiteKey,
);
