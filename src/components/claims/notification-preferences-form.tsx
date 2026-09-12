"use client";

import { useState } from "react";
import { BellRing, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ClaimNotificationPreferenceInput } from "@/lib/claims/notification-preferences";

export function NotificationPreferencesForm({
  claimReference,
  initialValue,
  canManage,
}: {
  claimReference: string;
  initialValue: ClaimNotificationPreferenceInput;
  canManage: boolean;
}) {
  const [email, setEmail] = useState(initialValue.email);
  const [mobile, setMobile] = useState(initialValue.mobile);
  const [preferredChannel, setPreferredChannel] = useState<"email" | "sms">(
    initialValue.preferredChannel,
  );
  const [enabled, setEnabled] = useState(initialValue.enabled);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const response = await fetch(
        `/api/admin/claims/${encodeURIComponent(claimReference)}/notification-preferences`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            mobile,
            preferredChannel,
            enabled,
          }),
        },
      );
      const body = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!response.ok) {
        throw new Error(body.error || "Unable to save communication settings");
      }
      setMessage("Communication settings saved");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to save communication settings",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <BellRing className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">Claimant communication settings</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="font-medium">Email</span>
            <input
              className="w-full rounded-md border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={!canManage || saving}
              placeholder="claimant@example.com"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium">Mobile</span>
            <input
              className="w-full rounded-md border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
              value={mobile}
              onChange={(event) => setMobile(event.target.value)}
              disabled={!canManage || saving}
              placeholder="+675..."
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-5 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="preferred-channel"
              checked={preferredChannel === "sms"}
              onChange={() => setPreferredChannel("sms")}
              disabled={!canManage || saving}
            />
            SMS preferred
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="preferred-channel"
              checked={preferredChannel === "email"}
              onChange={() => setPreferredChannel("email")}
              disabled={!canManage || saving}
            />
            Email preferred
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(event) => setEnabled(event.target.checked)}
              disabled={!canManage || saving}
            />
            Automatic updates enabled
          </label>
        </div>

        {canManage && (
          <Button type="button" size="sm" onClick={save} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save communication settings
          </Button>
        )}
        {message && <p className="text-xs text-success">{message}</p>}
        {error && <p className="text-xs text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
