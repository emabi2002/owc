"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, KeyRound, Loader2, Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type DemoPersona = {
  personaId: string;
  fullName: string;
  email: string;
  role: string | null;
};

export default function ManagementLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("management.demo@owc.gov.pg");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mfa, setMfa] = useState<{ factorId?: string } | null>(null);
  const [code, setCode] = useState("");
  const [demoManager, setDemoManager] = useState<DemoPersona | null>(null);

  useEffect(() => {
    fetch("/api/admin/demo-personas", { cache: "no-store" })
      .then(async (response) => (response.ok ? response.json() : null))
      .then((payload: { personas?: DemoPersona[] } | null) => {
        const manager = payload?.personas?.find(
          (persona) => persona.role === "Management / Executive",
        );
        if (manager) {
          setDemoManager(manager);
          setEmail(manager.email);
        }
      })
      .catch(() => undefined);
  }, []);

  const redirectTarget = () => {
    if (typeof window === "undefined") return "/management";
    const target = new URLSearchParams(window.location.search).get("redirect");
    return target && target.startsWith("/management") ? target : "/management";
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: String(form.get("user") ?? ""),
          password: String(form.get("password") ?? ""),
          remember: true,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error ?? "Sign-in failed.");
        return;
      }
      if (payload.mfaRequired) {
        setMfa({ factorId: payload.factorId });
        return;
      }
      router.push(redirectTarget());
      router.refresh();
    } catch {
      setError("Unable to contact the authentication service.");
    } finally {
      setLoading(false);
    }
  };

  const verifyMfa = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/admin/mfa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ factorId: mfa?.factorId, code }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error ?? "Verification failed.");
        return;
      }
      toast.success("Management identity verified");
      router.push(redirectTarget());
      router.refresh();
    } catch {
      setError("Unable to verify the authentication code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-secondary/40 p-6">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-xl">
        <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Public website
        </Link>
        <div className="mb-6">
          <div className="flex items-center gap-2 text-primary">
            <ShieldCheck className="h-5 w-5 text-gold" />
            <span className="text-sm font-semibold">Management / Executive</span>
          </div>
          <h1 className="mt-3 font-serif text-2xl font-bold text-primary">OWC Management Portal</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Secure management reporting and read-only analytical access for authorised executives.
          </p>
        </div>

        {demoManager && !mfa && (
          <div className="mb-5 rounded-lg border border-gold/40 bg-gold/10 p-3 text-xs text-muted-foreground">
            Demonstration persona: <strong className="text-foreground">{demoManager.fullName}</strong>. Presentation credentials remain server-managed.
          </div>
        )}

        {error && <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</div>}

        {!mfa ? (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="management-user">Official OWC email</Label>
              <Input id="management-user" name="user" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2" required />
            </div>
            <div>
              <Label htmlFor="management-password">Password</Label>
              <div className="relative mt-2">
                <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="management-password" name="password" type="password" className="pl-9" required />
              </div>
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? <><Loader2 className="animate-spin" /> Signing in…</> : <><Lock /> Secure sign in</>}
            </Button>
          </form>
        ) : (
          <form onSubmit={verifyMfa} className="space-y-4">
            <div>
              <Label htmlFor="management-code">6-digit verification code</Label>
              <Input id="management-code" inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(event) => setCode(event.target.value.replace(/[^0-9]/g, "").slice(0, 6))} className="mt-2 text-center font-mono text-lg tracking-[0.4em]" required />
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={loading || code.length !== 6}>
              {loading ? <><Loader2 className="animate-spin" /> Verifying…</> : <><ShieldCheck /> Verify &amp; continue</>}
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}
