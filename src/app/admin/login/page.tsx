"use client";

import { useState } from "react";
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
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { OWCSeal, BirdOfParadise } from "@/components/owc-emblem";
import { ORG } from "@/lib/site-data";

export default function AdminLoginPage() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast.success("Authentication successful");
      router.push("/admin");
    }, 1100);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Branding panel */}
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
            A secure environment for authorised OWC staff to manage news, pages,
            reports, forms and claims content for the {ORG.country}.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-white/80">
            {[
              "Role-based access control",
              "Content approval workflow",
              "Full audit trail of all changes",
              "Encrypted, standards-aligned platform",
            ].map((t) => (
              <li key={t} className="flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 text-gold" /> {t}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-white/50">
          Authorised access only. Activity on this system is monitored and logged
          in accordance with PNG Government ICT policy.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-secondary/40 p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile brand */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-flag-diag ring-1 ring-gold/40">
              <BirdOfParadise className="h-9 w-9" />
            </div>
            <div>
              <div className="font-serif text-base font-bold text-primary">OWC Admin Console</div>
              <div className="text-xs text-muted-foreground">Office of Workers Compensation</div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-8 shadow-xl">
            <div className="mb-6">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/8 px-3 py-1 text-xs font-semibold text-primary">
                <Lock className="h-3.5 w-3.5" /> Staff sign in
              </span>
              <h2 className="mt-4 font-serif text-2xl font-bold text-primary">
                Sign in to your account
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Use your official OWC staff credentials.
              </p>
            </div>

            <form onSubmit={submit} className="space-y-5">
              <div>
                <Label htmlFor="user">Staff username or email</Label>
                <div className="relative mt-2">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="user" required defaultValue="l.aila@owc.gov.pg" className="pl-9" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="pw">Password</Label>
                  <button type="button" className="text-xs font-medium text-gold hover:underline">
                    Forgot password?
                  </button>
                </div>
                <div className="relative mt-2">
                  <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="pw"
                    type={show ? "text" : "password"}
                    required
                    defaultValue="demopassword"
                    className="px-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={show ? "Hide password" : "Show password"}
                  >
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Checkbox defaultChecked /> Keep me signed in on this device
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
                Two-factor authentication is enforced for all administrator accounts.
              </div>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            This is a demonstration console. Credentials are pre-filled — just click
            <span className="font-semibold text-foreground"> Secure sign in</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
