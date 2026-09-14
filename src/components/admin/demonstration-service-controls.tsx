"use client";

import { useCallback, useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  SandboxServiceName,
  SandboxServiceStatus,
} from "@/lib/integrations/sandbox/types";

type ServiceRecord = {
  service: SandboxServiceName;
  status: SandboxServiceStatus;
};

type ServiceResponse = {
  environment: "DEMONSTRATION";
  synthetic: true;
  productionConnected: false;
  services: ServiceRecord[];
};

export function DemonstrationServiceControls() {
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const response = await fetch("/api/admin/demonstration/services", { cache: "no-store" });
    if (!response.ok) throw new Error("Demonstration controls unavailable");
    const payload = (await response.json()) as ServiceResponse;
    setServices(payload.services);
  }, []);

  useEffect(() => {
    refresh()
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  }, [refresh]);

  const setStatus = async (service: SandboxServiceName, status: SandboxServiceStatus) => {
    const key = `${service}:${status}`;
    setBusy(key);
    try {
      const response = await fetch("/api/admin/demonstration/services", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ service, status }),
      });
      if (!response.ok) throw new Error("Control request failed");
      await refresh();
      toast.success(`${service} demonstration status: ${status}`);
    } catch {
      toast.error("Unable to change demonstration service status");
    } finally {
      setBusy(null);
    }
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading guarded demonstration controls…</p>;
  }

  if (services.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Guarded outage controls are unavailable. They require demonstration identity and the explicit demo-reset enablement flag.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {services.map(({ service, status }) => (
        <div key={service} className="flex flex-col gap-3 rounded-lg border border-border p-3 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-semibold">{service}</span>
              <Badge variant={status === "online" ? "success" : status === "degraded" ? "warning" : "destructive"}>
                {status}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Sandbox state only · productionConnected=false</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={busy !== null || status === "offline"}
              onClick={() => setStatus(service, "offline")}
            >
              Simulate outage
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={busy !== null || status === "degraded"}
              onClick={() => setStatus(service, "degraded")}
            >
              Degrade
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={busy !== null || status === "online"}
              onClick={() => setStatus(service, "online")}
            >
              <RotateCcw className="h-3.5 w-3.5" /> Recover
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
