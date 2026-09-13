import {
  publicEnv,
  serverEnv,
  type CaptchaProvider,
  type ContentSource,
} from "@/lib/env";

export type ProductionPreflightStatus =
  | "ready"
  | "configuration-required"
  | "external-verification-required";

export type ProductionPreflightKey =
  | "siteUrl"
  | "supabase"
  | "drupalAuthority"
  | "evidenceSecurity"
  | "malwareScan"
  | "notifications"
  | "captcha"
  | "cpps";

export type ProductionPreflightCheck = {
  key: ProductionPreflightKey;
  label: string;
  status: ProductionPreflightStatus;
  detail: string;
};

export type ProductionPreflightInput = {
  siteUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRoleKey: string;
  contentSource: ContentSource;
  drupalBaseUrl: string;
  evidenceUploadSigningSecret: string;
  requireMalwareScan: boolean;
  malwareScanUrl: string;
  notificationApiUrl: string;
  captchaProvider: CaptchaProvider;
  captchaSiteKey: string;
  captchaSecretKey: string;
  cppsApiBaseUrl: string;
};

function isHttpsUrl(value: string) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Build a production go-live configuration report without returning credential
 * values. This is a configuration/acceptance aid, not a live connectivity
 * probe. In particular, a configured CPPS URL still requires external UAT and
 * system-owner approval before it can be considered production verified.
 */
export function buildProductionPreflight(
  input: ProductionPreflightInput,
): ProductionPreflightCheck[] {
  const siteUrlReady = isHttpsUrl(input.siteUrl);
  const supabaseReady = Boolean(
    isHttpsUrl(input.supabaseUrl) &&
      input.supabaseAnonKey.trim() &&
      input.supabaseServiceRoleKey.trim(),
  );
  const drupalReady = Boolean(
    input.contentSource === "drupal" && isHttpsUrl(input.drupalBaseUrl),
  );
  const evidenceReady = Boolean(
    supabaseReady && input.evidenceUploadSigningSecret.trim().length >= 32,
  );
  const malwareReady = Boolean(
    input.requireMalwareScan && isHttpsUrl(input.malwareScanUrl),
  );
  const notificationsReady = isHttpsUrl(input.notificationApiUrl);
  const captchaReady = Boolean(
    input.captchaProvider !== "fallback" &&
      input.captchaSiteKey.trim() &&
      input.captchaSecretKey.trim(),
  );
  const cppsConfigured = isHttpsUrl(input.cppsApiBaseUrl);

  return [
    {
      key: "siteUrl",
      label: "Public HTTPS site URL",
      status: siteUrlReady ? "ready" : "configuration-required",
      detail: siteUrlReady
        ? "Public site URL is configured with HTTPS."
        : "Configure the production public site URL with HTTPS before go-live.",
    },
    {
      key: "supabase",
      label: "OWC application database and privileged server access",
      status: supabaseReady ? "ready" : "configuration-required",
      detail: supabaseReady
        ? "Supabase URL and required public/server credential slots are configured."
        : "Dedicated OWC Supabase URL, anon key and server-only service-role credential are required.",
    },
    {
      key: "drupalAuthority",
      label: "Authoritative Drupal public CMS",
      status: drupalReady ? "ready" : "configuration-required",
      detail: drupalReady
        ? "Drupal is selected as the authoritative public-content source over HTTPS."
        : "Production requires an HTTPS Drupal endpoint and Drupal-authoritative content-source policy.",
    },
    {
      key: "evidenceSecurity",
      label: "Secure claim evidence signing and storage",
      status: evidenceReady ? "ready" : "configuration-required",
      detail: evidenceReady
        ? "Privileged storage access and a sufficiently strong evidence-signing secret are configured."
        : "Privileged OWC storage access and an evidence-upload signing secret of at least 32 characters are required.",
    },
    {
      key: "malwareScan",
      label: "Fail-closed malware scanning",
      status: malwareReady ? "ready" : "configuration-required",
      detail: malwareReady
        ? "Fail-closed malware scanning is enabled with an HTTPS scanner endpoint."
        : "Production evidence ingestion requires fail-closed scanning policy and an approved HTTPS scanner endpoint.",
    },
    {
      key: "notifications",
      label: "Claim lifecycle notification gateway",
      status: notificationsReady ? "ready" : "configuration-required",
      detail: notificationsReady
        ? "An HTTPS notification gateway endpoint is configured."
        : "Configure the approved email/SMS notification gateway before production lifecycle notifications are enabled.",
    },
    {
      key: "captcha",
      label: "Production CAPTCHA / bot protection",
      status: captchaReady ? "ready" : "configuration-required",
      detail: captchaReady
        ? "A non-fallback CAPTCHA provider and credential slots are configured."
        : "Replace the development fallback challenge with an approved production CAPTCHA provider and credentials.",
    },
    {
      key: "cpps",
      label: "CPPS production integration",
      status: cppsConfigured
        ? "external-verification-required"
        : "configuration-required",
      detail: cppsConfigured
        ? "A CPPS endpoint is configured, but authoritative interface verification, credentials, UAT and owner acceptance remain external gates."
        : "Authoritative CPPS discovery, endpoint configuration and UAT are required before full production claims integration.",
    },
  ];
}

/**
 * Derive the secret-safe preflight report from the running server environment.
 * The returned objects intentionally contain status and guidance only, never
 * credential values.
 */
export function getProductionPreflight(): ProductionPreflightCheck[] {
  return buildProductionPreflight({
    siteUrl: publicEnv.siteUrl,
    supabaseUrl: publicEnv.supabaseUrl,
    supabaseAnonKey: publicEnv.supabaseAnonKey,
    supabaseServiceRoleKey: serverEnv.supabaseServiceRoleKey,
    contentSource: serverEnv.contentSource,
    drupalBaseUrl: serverEnv.drupalBaseUrl,
    evidenceUploadSigningSecret: serverEnv.evidenceUploadSigningSecret,
    requireMalwareScan: serverEnv.requireMalwareScan,
    malwareScanUrl: serverEnv.malwareScanUrl,
    notificationApiUrl: serverEnv.notificationApiUrl,
    captchaProvider: publicEnv.captchaProvider,
    captchaSiteKey: publicEnv.captchaSiteKey,
    captchaSecretKey: serverEnv.captchaSecretKey,
    cppsApiBaseUrl: serverEnv.cppsApiBaseUrl,
  });
}
