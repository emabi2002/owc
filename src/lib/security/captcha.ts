/**
 * Server-side CAPTCHA verification (OWASP A04 — automated abuse).
 *
 * Supports Cloudflare Turnstile, Google reCAPTCHA and hCaptcha. When the
 * provider is `fallback`, verification is delegated to the built-in arithmetic
 * challenge enforced client-side (combined with rate limiting), so this returns
 * `true` and the request still passes through the limiter.
 */
import { publicEnv, serverEnv } from "@/lib/env";

const VERIFY_URL: Record<string, string> = {
  turnstile: "https://challenges.cloudflare.com/turnstile/v0/siteverify",
  recaptcha: "https://www.google.com/recaptcha/api/siteverify",
  hcaptcha: "https://hcaptcha.com/siteverify",
};

export async function verifyCaptcha(
  token: string | undefined,
  ip?: string,
): Promise<boolean> {
  const provider = publicEnv.captchaProvider;

  // Fallback mode: no server secret; trust client gate + rate limiting.
  if (provider === "fallback" || !serverEnv.captchaSecretKey) return true;

  if (!token) return false;
  const url = VERIFY_URL[provider];
  if (!url) return false;

  try {
    const body = new URLSearchParams({
      secret: serverEnv.captchaSecretKey,
      response: token,
    });
    if (ip) body.set("remoteip", ip);

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      cache: "no-store",
    });
    const data = (await res.json()) as { success?: boolean };
    return Boolean(data.success);
  } catch {
    return false;
  }
}
