import {
  isCppsConfigured,
  isDrupalConfigured,
  isSupabaseAdminConfigured,
  serverEnv,
} from "@/lib/env";
import {
  PRODUCTION_SERVICES,
  buildProductionConnectorReadiness,
  getProductionConnectorConfig,
} from "@/lib/integrations/production/registry";

export type ReadinessKey =
  | "supabase"
  | "drupal"
  | "cpps"
  | "evidenceRepository"
  | "malwareScanner"
  | "notificationGateway"
  | "externalIntegrations";

export type ReadinessCheck = {
  key: ReadinessKey;
  label: string;
  status: "ready" | "configuration-required";
  detail: string;
};

export function buildReadinessChecks(input: {
  supabase: boolean;
  drupal: boolean;
  cpps: boolean;
  evidenceRepository: boolean;
  malwareScanner: boolean;
  notificationGateway: boolean;
  externalIntegrations: { configured: number; total: number };
}): ReadinessCheck[] {
  const externalIntegrationsReady =
    input.externalIntegrations.total > 0 &&
    input.externalIntegrations.configured === input.externalIntegrations.total;

  const definitions: Array<{
    key: ReadinessKey;
    label: string;
    configured: boolean;
    readyDetail: string;
    pendingDetail: string;
  }> = [
    {
      key: "supabase",
      label: "Application database & secure storage",
      configured: input.supabase,
      readyDetail: "Database, privileged server access and private storage configuration are available.",
      pendingDetail: "Production Supabase URL, anon key and service-role key are required.",
    },
    {
      key: "drupal",
      label: "Drupal enterprise CMS",
      configured: input.drupal,
      readyDetail: "Drupal JSON:API content source is configured.",
      pendingDetail: "Drupal base URL and authorized API access are required for production content.",
    },
    {
      key: "cpps",
      label: "CPPS claims system",
      configured: input.cpps,
      readyDetail: "CPPS service endpoint is configured for claims interoperability.",
      pendingDetail: "Authorized CPPS UAT/production endpoint and credentials are required.",
    },
    {
      key: "evidenceRepository",
      label: "Secure claim evidence repository",
      configured: input.evidenceRepository,
      readyDetail: "Privileged storage access, claim-scoped upload signing and required scan controls are configured.",
      pendingDetail: "Production evidence storage, a signing secret of at least 32 characters, and any mandatory malware-scanner endpoint are required.",
    },
    {
      key: "malwareScanner",
      label: "Evidence security scanner",
      configured: input.malwareScanner,
      readyDetail: "Uploaded claim evidence can be submitted to the configured malware scanner.",
      pendingDetail: "A production malware-scanning service endpoint is required before fail-closed evidence uploads are enabled.",
    },
    {
      key: "notificationGateway",
      label: "Email / SMS notification gateway",
      configured: input.notificationGateway,
      readyDetail: "Claim lifecycle notifications can be delivered through the configured gateway.",
      pendingDetail: "Authorized email/SMS gateway endpoint and credentials are required for external delivery.",
    },
    {
      key: "externalIntegrations",
      label: "External agency Integration Hub",
      configured: externalIntegrationsReady,
      readyDetail: `${input.externalIntegrations.configured} of ${input.externalIntegrations.total} registered agency connector endpoints are configured; live connectivity and agency contracts still require verification.`,
      pendingDetail: `${input.externalIntegrations.configured} of ${input.externalIntegrations.total} registered agency connector endpoints are configured. Remaining endpoints must be configured and independently verified before production use.`,
    },
  ];

  return definitions.map((item) => ({
    key: item.key,
    label: item.label,
    status: item.configured ? "ready" : "configuration-required",
    detail: item.configured ? item.readyDetail : item.pendingDetail,
  }));
}

export function getOperationalReadiness(): ReadinessCheck[] {
  const scannerConfigured = Boolean(serverEnv.malwareScanUrl);
  const signingSecretConfigured = serverEnv.evidenceUploadSigningSecret.trim().length >= 32;
  const evidenceRepositoryReady = Boolean(
    isSupabaseAdminConfigured &&
      signingSecretConfigured &&
      (!serverEnv.requireMalwareScan || scannerConfigured),
  );
  const connectorReadiness = buildProductionConnectorReadiness(
    PRODUCTION_SERVICES.map(getProductionConnectorConfig),
  );
  const configuredConnectors = connectorReadiness.filter(
    (item) => item.status === "configured",
  ).length;

  return buildReadinessChecks({
    supabase: isSupabaseAdminConfigured,
    drupal: isDrupalConfigured,
    cpps: isCppsConfigured,
    evidenceRepository: evidenceRepositoryReady,
    malwareScanner: scannerConfigured,
    notificationGateway: Boolean(serverEnv.notificationApiUrl),
    externalIntegrations: {
      configured: configuredConnectors,
      total: connectorReadiness.length,
    },
  });
}
