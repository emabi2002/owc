/**
 * Centralised environment-variable access for the OWC platform.
 *
 * Rules:
 *  - `NEXT_PUBLIC_*` variables are safe in the browser and are inlined at build
 *    time by Next.js. They are referenced *literally* below so the compiler can
 *    replace them.
 *  - Server-only secrets (service-role key, CPPS API key, Drupal token) are read
 *    from `process.env` and MUST only be consumed inside server modules.
 *
 * The platform is designed to degrade gracefully: when an integration is not
 * configured the data/service layer falls back to the existing source or local
 * seed data so the site remains buildable while integrations are introduced.
 */

export type CaptchaProvider =
  | "fallback"
  | "turnstile"
  | "recaptcha"
  | "hcaptcha";

export type ContentSource = "auto" | "drupal" | "supabase";

/** Browser-safe configuration (inlined at build time). */
export const publicEnv = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://owc.gov.pg",
  captchaProvider: (process.env.NEXT_PUBLIC_CAPTCHA_PROVIDER ??
    "fallback") as CaptchaProvider,
  captchaSiteKey: process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY ?? "",
} as const;

/** Server-only configuration. */
export const serverEnv = {
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  cppsApiBaseUrl: process.env.CPPS_API_BASE_URL ?? "",
  cppsApiKey: process.env.CPPS_API_KEY ?? "",
  cppsGraphqlEndpoint: process.env.CPPS_GRAPHQL_ENDPOINT ?? "",
  captchaSecretKey: process.env.CAPTCHA_SECRET_KEY ?? "",
  bootstrapAdminEmails: process.env.OWC_BOOTSTRAP_ADMIN_EMAILS ?? "",
  drupalBaseUrl: process.env.DRUPAL_BASE_URL ?? "",
  drupalApiToken: process.env.DRUPAL_API_TOKEN ?? "",
  contentSource: (process.env.OWC_CONTENT_SOURCE ?? "auto") as ContentSource,
  malwareScanUrl: process.env.OWC_MALWARE_SCAN_URL ?? "",
  malwareScanApiKey: process.env.OWC_MALWARE_SCAN_API_KEY ?? "",
  requireMalwareScan: process.env.OWC_REQUIRE_MALWARE_SCAN === "true",
  notificationApiUrl: process.env.OWC_NOTIFICATION_API_URL ?? "",
  notificationApiKey: process.env.OWC_NOTIFICATION_API_KEY ?? "",
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

/** True when Drupal has an API base URL configured. */
export const isDrupalConfigured = Boolean(serverEnv.drupalBaseUrl);

/** True when a real CAPTCHA provider is configured (vs. the math fallback). */
export const isCaptchaConfigured = Boolean(
  publicEnv.captchaProvider !== "fallback" && publicEnv.captchaSiteKey,
);
