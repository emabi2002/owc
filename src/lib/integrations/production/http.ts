import type {
  ProductionConnectorConfig,
  ProductionIntegrationResult,
} from "./types";

export type ProductionConnectorRequest = {
  path: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: HeadersInit;
  timeoutMs?: number;
  /** Injectable for deterministic tests; production callers should omit this. */
  fetchImpl?: typeof fetch;
};

const DEFAULT_TIMEOUT_MS = 10_000;

function baseResult<T>(
  config: ProductionConnectorConfig,
  operation: string,
  correlationId: string,
  startedAt: number,
): Omit<ProductionIntegrationResult<T>, "status"> {
  return {
    service: config.service,
    operation,
    correlationId,
    timestamp: new Date().toISOString(),
    durationMs: Math.max(0, Date.now() - startedAt),
  };
}

function isLocalHostname(hostname: string) {
  return ["localhost", "127.0.0.1", "::1", "[::1]"].includes(hostname);
}

function validateBaseUrl(baseUrl: string): URL | null {
  try {
    const parsed = new URL(baseUrl);
    if (parsed.protocol === "https:") return parsed;
    if (parsed.protocol === "http:" && isLocalHostname(parsed.hostname)) return parsed;
    return null;
  } catch {
    return null;
  }
}

function buildTargetUrl(base: URL, path: string): URL | null {
  const candidate = path.trim();
  if (/^(?:https?:)?\/\//i.test(candidate) || candidate.includes("\\")) return null;

  const normalizedBase = base.toString().endsWith("/")
    ? base.toString()
    : `${base.toString()}/`;
  const target = new URL(candidate.replace(/^\/+/, ""), normalizedBase);

  return target.origin === base.origin ? target : null;
}

export async function callProductionConnector<T = unknown>(
  config: ProductionConnectorConfig,
  operation: string,
  request: ProductionConnectorRequest,
): Promise<ProductionIntegrationResult<T>> {
  const startedAt = Date.now();
  const correlationId = crypto.randomUUID();

  if (!config.baseUrl.trim()) {
    return {
      ...baseResult<T>(config, operation, correlationId, startedAt),
      status: "configuration-required",
      error: "External service endpoint is not configured.",
    };
  }

  const baseUrl = validateBaseUrl(config.baseUrl.trim());
  if (!baseUrl) {
    return {
      ...baseResult<T>(config, operation, correlationId, startedAt),
      status: "invalid-configuration",
      error: "External service endpoint must use HTTPS outside localhost.",
    };
  }

  const targetUrl = buildTargetUrl(baseUrl, request.path);
  if (!targetUrl) {
    return {
      ...baseResult<T>(config, operation, correlationId, startedAt),
      status: "invalid-configuration",
      error: "External service request path is invalid.",
    };
  }

  const headers = new Headers(request.headers);
  headers.set("accept", "application/json");
  headers.set("x-correlation-id", correlationId);
  if (config.apiKey) headers.set("authorization", `Bearer ${config.apiKey}`);

  let body: string | undefined;
  if (request.body !== undefined) {
    headers.set("content-type", "application/json");
    body = JSON.stringify(request.body);
  }

  const controller = new AbortController();
  const timeoutMs = Math.max(1, request.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const fetchImpl = request.fetchImpl ?? fetch;
    const response = await fetchImpl(targetUrl, {
      method: request.method ?? (body === undefined ? "GET" : "POST"),
      headers,
      body,
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        ...baseResult<T>(config, operation, correlationId, startedAt),
        status: "upstream-error",
        httpStatus: response.status,
        error: `External service returned HTTP ${response.status}.`,
      };
    }

    if (response.status === 204) {
      return {
        ...baseResult<T>(config, operation, correlationId, startedAt),
        status: "success",
        httpStatus: response.status,
      };
    }

    const contentType = response.headers.get("content-type") ?? "";
    const data = contentType.includes("application/json")
      ? ((await response.json()) as T)
      : ((await response.text()) as T);

    return {
      ...baseResult<T>(config, operation, correlationId, startedAt),
      status: "success",
      httpStatus: response.status,
      data,
    };
  } catch (error) {
    const timedOut =
      controller.signal.aborted ||
      (error instanceof DOMException && error.name === "AbortError");

    return {
      ...baseResult<T>(config, operation, correlationId, startedAt),
      status: "unavailable",
      error: timedOut
        ? "External service request timed out."
        : "External service is unavailable.",
    };
  } finally {
    clearTimeout(timeout);
  }
}
