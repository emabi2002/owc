"use client";

import {
  Lock,
  Database,
  HardDriveDownload,
  ShieldCheck,
  KeyRound,
  Clock,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { AdminPageHeader } from "@/components/admin/admin-shell";

function SettingRow({
  title,
  description,
  defaultChecked = true,
  locked = false,
}: {
  title: string;
  description: string;
  defaultChecked?: boolean;
  locked?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-4">
      <div>
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          {title}
          {locked && <Badge variant="secondary" className="text-[10px]">Enforced</Badge>}
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch defaultChecked={defaultChecked} disabled={locked} />
    </div>
  );
}

export default function SettingsPage() {
  return (
    <>
      <AdminPageHeader
        title="Settings & security"
        description="Configure security, data protection and backup settings for the OWC platform."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Security */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-gold" />
            <h2 className="font-serif text-lg font-bold text-primary">Authentication & access</h2>
          </div>
          <div className="mt-3 divide-y divide-border">
            <SettingRow title="Two-factor authentication" description="Require 2FA for all administrator accounts." locked />
            <SettingRow title="Single sign-on (SSO)" description="Allow sign-in via the government identity provider." />
            <SettingRow title="Session timeout" description="Automatically sign out after 15 minutes of inactivity." />
            <SettingRow title="IP allow-listing" description="Restrict console access to approved network ranges." defaultChecked={false} />
          </div>
        </div>

        {/* Encryption */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-gold" />
            <h2 className="font-serif text-lg font-bold text-primary">Data & encryption</h2>
          </div>
          <ul className="mt-4 space-y-3">
            {[
              { t: "Encryption in transit (TLS 1.3)", s: "Active" },
              { t: "Encryption at rest (AES-256)", s: "Active" },
              { t: "Claim document encryption", s: "Active" },
              { t: "CAPTCHA on public forms", s: "Active" },
            ].map((i) => (
              <li key={i.t} className="flex items-center justify-between rounded-lg bg-secondary/50 px-4 py-3">
                <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-success" /> {i.t}
                </span>
                <Badge variant="success">{i.s}</Badge>
              </li>
            ))}
          </ul>
        </div>

        {/* Backup & recovery */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <HardDriveDownload className="h-5 w-5 text-gold" />
            <h2 className="font-serif text-lg font-bold text-primary">Backup & recovery</h2>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border p-4">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Last backup</div>
              <div className="mt-1 flex items-center gap-1.5 font-serif text-lg font-bold text-primary">
                <Clock className="h-4 w-4 text-gold" /> 02:00 today
              </div>
            </div>
            <div className="rounded-lg border border-border p-4">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Frequency</div>
              <div className="mt-1 font-serif text-lg font-bold text-primary">Daily</div>
            </div>
          </div>
          <div className="mt-3 divide-y divide-border">
            <SettingRow title="Automated daily backups" description="Encrypted off-site backups at 02:00 each day." />
            <SettingRow title="Point-in-time recovery" description="Restore data to any point within the last 30 days." />
          </div>
          <div className="mt-2 flex gap-2">
            <Button variant="outline" size="sm" onClick={() => toast.success("Manual backup started")}>
              <RefreshCw className="h-4 w-4" /> Run backup now
            </Button>
            <Button variant="ghost" size="sm" className="text-primary" onClick={() => toast.info("Recovery console opened")}>
              Restore…
            </Button>
          </div>
        </div>

        {/* Compliance */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-gold" />
            <h2 className="font-serif text-lg font-bold text-primary">Compliance</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            This platform is configured to align with national standards and
            policy.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {["PNG Govt ICT Policy", "DICT Standards", "NICTA Regulations", "National Cybersecurity Policy"].map((c) => (
              <div key={c} className="flex items-center gap-2 rounded-lg border border-border bg-secondary/40 p-3 text-sm font-medium text-foreground">
                <KeyRound className="h-4 w-4 shrink-0 text-gold" /> {c}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
