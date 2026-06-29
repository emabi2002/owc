"use client";

import { useEffect, useId, useRef, useState } from "react";
import { RefreshCw, ShieldCheck } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { publicEnv } from "@/lib/env";
import { cn } from "@/lib/utils";

type ProviderMeta = { script: string; className: string };

const PROVIDERS: Record<string, ProviderMeta> = {
  turnstile: {
    script: "https://challenges.cloudflare.com/turnstile/v0/api.js",
    className: "cf-turnstile",
  },
  recaptcha: {
    script: "https://www.google.com/recaptcha/api.js",
    className: "g-recaptcha",
  },
  hcaptcha: {
    script: "https://js.hcaptcha.com/1/api.js",
    className: "h-captcha",
  },
};

declare global {
  interface Window {
    [key: string]: unknown;
  }
}

export function Captcha({
  onValidChange,
  onToken,
  className,
}: {
  onValidChange?: (valid: boolean) => void;
  onToken?: (token: string | null) => void;
  className?: string;
}) {
  const provider = publicEnv.captchaProvider;
  const siteKey = publicEnv.captchaSiteKey;
  const useProvider = provider !== "fallback" && Boolean(siteKey);

  if (useProvider) {
    return (
      <ProviderCaptcha
        provider={provider}
        siteKey={siteKey}
        onValidChange={onValidChange}
        onToken={onToken}
        className={className}
      />
    );
  }

  return (
    <FallbackCaptcha
      onValidChange={onValidChange}
      onToken={onToken}
      className={className}
    />
  );
}

/* -------------------------- Real provider widget ------------------------- */
function ProviderCaptcha({
  provider,
  siteKey,
  onValidChange,
  onToken,
  className,
}: {
  provider: string;
  siteKey: string;
  onValidChange?: (valid: boolean) => void;
  onToken?: (token: string | null) => void;
  className?: string;
}) {
  const meta = PROVIDERS[provider];
  const rawId = useId();
  const cbName = `owcCaptchaCb_${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!meta) return;
    window[cbName] = (token: string) => {
      onToken?.(token);
      onValidChange?.(true);
    };

    const id = `captcha-script-${provider}`;
    if (!document.getElementById(id)) {
      const s = document.createElement("script");
      s.id = id;
      s.src = meta.script;
      s.async = true;
      s.defer = true;
      document.head.appendChild(s);
    }
    return () => {
      delete window[cbName];
    };
  }, [cbName, meta, provider, onToken, onValidChange]);

  if (!meta) return null;

  return (
    <div className={className}>
      <Label className="mb-2 flex items-center gap-1.5">
        <ShieldCheck className="h-3.5 w-3.5 text-gold" />
        Security check <span className="text-destructive">*</span>
      </Label>
      <div
        ref={containerRef}
        className={meta.className}
        data-sitekey={siteKey}
        data-callback={cbName}
        data-theme="light"
      />
    </div>
  );
}

/* --------------------- Built-in arithmetic fallback ---------------------- */
function FallbackCaptcha({
  onValidChange,
  onToken,
  className,
}: {
  onValidChange?: (valid: boolean) => void;
  onToken?: (token: string | null) => void;
  className?: string;
}) {
  const id = useId();
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);
  const [answer, setAnswer] = useState("");

  const regen = () => {
    setA(Math.floor(Math.random() * 8) + 1);
    setB(Math.floor(Math.random() * 8) + 1);
    setAnswer("");
  };

  useEffect(() => {
    regen();
  }, []);

  const valid = answer !== "" && Number(answer) === a + b;

  useEffect(() => {
    onValidChange?.(valid);
    onToken?.(valid ? "fallback" : null);
  }, [valid, onValidChange, onToken]);

  return (
    <div className={className}>
      <Label htmlFor={id} className="flex items-center gap-1.5">
        <ShieldCheck className="h-3.5 w-3.5 text-gold" />
        Security check <span className="text-destructive">*</span>
      </Label>
      <div className="mt-2 flex items-center gap-3">
        <div className="flex select-none items-center gap-1.5 rounded-md border border-border bg-secondary px-3 py-2 font-serif text-base font-bold tracking-wide text-primary">
          <span>{a}</span>
          <span className="text-gold">+</span>
          <span>{b}</span>
          <span className="text-muted-foreground">=</span>
        </div>
        <Input
          id={id}
          inputMode="numeric"
          value={answer}
          onChange={(e) => setAnswer(e.target.value.replace(/[^0-9]/g, ""))}
          placeholder="Answer"
          aria-invalid={answer !== "" && !valid}
          aria-label={`What is ${a} plus ${b}?`}
          className={cn(
            "w-28",
            valid && "border-success ring-1 ring-success/40",
            answer !== "" && !valid && "border-destructive",
          )}
        />
        <button
          type="button"
          onClick={regen}
          className="grid h-10 w-10 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="Refresh security check"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
        {valid && (
          <span className="hidden items-center gap-1 text-sm font-medium text-success sm:flex">
            <ShieldCheck className="h-4 w-4" /> Verified
          </span>
        )}
      </div>
    </div>
  );
}
