import {
  isCppsConfigured,
  isDrupalConfigured,
  isSupabaseAdminConfigured,
  serverEnv,
} from "@/lib/env";

export type ReadinessKey =
  | "supabase"
  | "drupal"
  | "cpps"
  | "malwareScanner"
  | "notificationGateway";

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
  malwareScanner: boolean;
  notificationGateway: boolean;
}): ReadinessCheck[] {
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
  ];

  return definitions.map((item) => ({
    key: item.key,
    label: item.label,
    status: item.configured ? "ready" : "configuration-required",
    detail: item.configured ? item.readyDetail : item.pendingDetail,
  }));
}

export function getOperationalReadiness(): ReadinessCheck[] {
  return buildReadinessChecks({
    supabase: isSupabaseAdminConfigured,
    drupal: isDrupalConfigured,
    cpps: isCppsConfigured,
    malwareScanner: Boolean(serverEnv.malwareScanUrl),
    notificationGateway: Boolean(serverEnv.notificationApiUrl),
  });
}
