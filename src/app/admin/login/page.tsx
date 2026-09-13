"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  Loader2,
  ArrowLeft,
  KeyRound,
  Fingerprint,
  AlertCircle,
  Presentation,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { OWCSeal, BirdOfParadise, NationalEmblem } from "@/components/owc-emblem";
import { ORG } from "@/lib/site-data";

type DemoPersona = {
  personaId: string;
  fullName: string;
  email: string;
  role: string | null;
};

export default function AdminLoginPage() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mfa, setMfa] = useState<{ factorId?: string } | null>(null);
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("admin@owc.gov.pg");
  const [demoPersonas, setDemoPersonas] = useState<DemoPersona[]>([]);

  const demonstration = demoPersonas.length > 0;

  useEffect(() => {
    let active = true;
    fetch("/api/admin/demo-personas", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return null;
        return response.json() as Promise<{ personas?: DemoPersona[] }>;
      })
      .then((payload) => {
        if (!active || !payload?.personas?.length) return;
        setDemoPersonas(payload.personas);
        setEmail(payload.personas[0]?.email ?? "admin@owc.gov.pg");
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const redirectTarget = () => {
    if (typeof window === "undefined") return "/admin";
    const r = new URLSearchParams(window.location.search).get("redirect");
    return r && r.startsWith("/admin") ? r : "/admin";
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: String(fd.get("user") ?? ""),
          password: String(fd.get("pw") ?? ""),
          remember: fd.get("remember") === "on",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Sign-in failed.");
        return;
      }
      if (data.mfaRequired) {
        setMfa({ factorId: data.factorId });
        toast.info("Enter your two-factor authentication code.");
        return;
      }
      toast.success("Authentication successful");
      router.push(redirectTarget());
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const verifyMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/mfa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ factorId: mfa?.factorId, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Verification failed.");
        return;
      }
      toast.success("Verified");
      router.push(redirectTarget());
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-flag-diag p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-grid-faint opacity-30" aria-hidden />
        <BirdOfParadise
          className="pointer-events-none absolute -bottom-24 -right-20 h-[28rem] w-[28rem] opacity-[0.07]"
          plumeColor="white"
          birdColor="white"
        />
        <Link href="/" className="relative inline-flex items-center gap-2 text-sm text-white/70 hover:text-gold">
          <ArrowLeft className="h-4 w-4" /> Back to public website
        </Link>

        <div className="relative">
          <OWCSeal className="h-24 w-24" withText={false} />
          <h1 className="mt-6 max-w-md font-serif text-3xl font-bold leading-tight">
            OWC Content Management &amp; Administration Console
          </h1>
          <p className="mt-3 max-w-md text-white/70">
            A secure environment for authorised OWC staff to manage claims,
            content and operational services for the {ORG.country}.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-white/80">
            {[
              "Role-based separation of duties",
              "Two-factor authentication",
              "Claims and content workflow controls",
              "Full audit trail of staff activity",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 text-gold" /> {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-white/50">
          Authorised access only. Activity on this system is monitored and logged.
        </p>
      </div>

      <div className="flex items-center justify-center bg-secondary/40 p-6 sm:p-12">
        <div className="w-full max-w-lg">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <NationalEmblem className="h-12 w-12" />
            <div>
              <div className="font-serif text-base font-bold text-primary">OWC Admin Console</div>
              <div className="text-xs text-muted-foreground">Office of Workers Compensation</div>
            </div>
          </div>

          {demonstration && (
            <div className="mb-4 rounded-xl border border-gold/40 bg-gold/10 p-4">
              <div className="flex items-center gap-2 font-semibold text-primary">
                <Presentation className="h-4 w-4 text-gold" />
                OWC Demonstration Environment
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Select a staff persona to demonstrate role-based access. Credentials
                and MFA values are managed securely by the presentation team.
              </p>
              {!mfa && (
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {demoPersonas.map((persona) => (
                    <button
                      key={persona.personaId}
                      type="button"
                      onClick={() => {
                        setEmail(persona.email);
                        setError(null);
                      }}
                      className={`rounded-lg border p-2 text-left text-xs transition hover:border-gold ${
                        email === persona.email ? "border-gold bg-background" : "border-border bg-card"
                      }`}
                    >
                      <span className="block font-semibold text-foreground">{persona.role}</span>
                      <span className="block text-muted-foreground">{persona.fullName}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="rounded-2xl border border-border bg-card p-8 shadow-xl">
            <div className="mb-6">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/8 px-3 py-1 text-xs font-semibold text-primary">
                <Lock className="h-3.5 w-3.5" /> Staff sign in
              </span>
              <h2 className="mt-4 font-serif text-2xl font-bold text-primary">
                {mfa ? "Two-factor verification" : "Sign in to your account"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {mfa
                  ? "Enter the 6-digit verification code."
                  : demonstration
                    ? "Use the configured demonstration credential for the selected persona."
                    : "Use your official OWC staff credentials."}
              </p>
            </div>

            {error && (
              <div className="mb-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {!mfa ? (
              <form onSubmit={submit} className="space-y-5">
                <div>
                  <Label htmlFor="user">Staff username or email</Label>
                  <div className="relative mt-2">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="user"
                      name="user"
                      type="email"
                      required
                      autoComplete="username"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="pw">Password</Label>
                  <div className="relative mt-2">
                    <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="pw"
                      name="pw"
                      type={show ? "text" : "password"}
                      required
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      className="px-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShow((current) => !current)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={show ? "Hide password" : "Show password"}
                    >
                      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Checkbox name="remember" defaultChecked /> Keep me signed in on this device
                </label>

                <Button type="submit" size="lg" className="w-full" disabled={loading}>
                  {loading ? (
                    <><Loader2 className="animate-spin" /> Verifying…</>
                  ) : (
                    <><Lock /> Secure sign in</>
                  )}
                </Button>

                <div className="flex items-center gap-2 rounded-lg bg-secondary/70 p-3 text-xs text-muted-foreground">
                  <Fingerprint className="h-4 w-4 shrink-0 text-gold" />
                  Two-factor authentication is required for demonstration staff personas.
                </div>
              </form>
            ) : (
              <form onSubmit={verifyMfa} className="space-y-5">
                <div>
                  <Label htmlFor="code">Authentication code</Label>
                  <Input
                    id="code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={code}
                    onChange={(event) => setCode(event.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                    placeholder="123456"
                    className="mt-2 text-center font-mono text-lg tracking-[0.4em]"
                  />
                </div>
                <Button type="submit" size="lg" className="w-full" disabled={loading || code.length !== 6}>
                  {loading ? (
                    <><Loader2 className="animate-spin" /> Verifying…</>
                  ) : (
                    <><ShieldCheck /> Verify &amp; continue</>
                  )}
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    setMfa(null);
                    setCode("");
                    setError(null);
                  }}
                  className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
                >
                  Back to sign in
                </button>
              </form>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            {demonstration
              ? "Synthetic demonstration identities use the same OWC authorization boundary that can later map to the Department's live identity provider."
              : "Authentication is provided by the configured live identity service and restricted to authorised OWC staff."}
          </p>
        </div>
      </div>
    </div>
  );
}
