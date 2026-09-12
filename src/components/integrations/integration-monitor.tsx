"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, RefreshCw, ServerCog, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  buildMonitorRows,
  type SandboxHealthRow,
} from "@/lib/integrations/sandbox/monitor";
import type { IntegrationEvent } from "@/lib/integrations/sandbox/events";

type HealthResponse = {
  source: "sandbox";
  services: SandboxHealthRow[];
};

type EventsResponse = {
  source: "sandbox";
  events: IntegrationEvent[];
};

export function IntegrationMonitor() {
  const [health, setHealth] = useState<SandboxHealthRow[]>([]);
  const [events, setEvents] = useState<IntegrationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [healthResponse, eventsResponse] = await Promise.all([
        fetch("/api/sandbox/health", { cache: "no-store" }),
        fetch("/api/sandbox/events", { cache: "no-store" }),
      ]);
      if (!healthResponse.ok || !eventsResponse.ok) {
        throw new Error("Sandbox integration services are disabled or unavailable.");
      }
      const healthJson = (await healthResponse.json()) as HealthResponse;
      const eventsJson = (await eventsResponse.json()) as EventsResponse;
      setHealth(healthJson.services);
      setEvents(eventsJson.events);
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load integration telemetry.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = window.setInterval(refresh, 3000);
    return () => window.clearInterval(id);
  }, [refresh]);

  const rows = useMemo(() => buildMonitorRows(health, events), [health, events]);

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 h-5 w-5 text-destructive" />
          <div className="flex-1">
            <p className="font-semibold">Integration sandbox unavailable</p>
            <p className="mt-1 text-sm text-muted-foreground">{error}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Enable only in the controlled demo/UAT environment with OWC_ENABLE_SANDBOX=true.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={refresh}>
            <RefreshCw className="h-4 w-4" /> Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Activity className="h-4 w-4 text-success" />
          {loading ? "Loading telemetry…" : `${rows.length} sandbox services monitored`}
        </div>
        <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {rows.map((row) => (
          <Card key={row.service}>
            <CardHeader className="space-y-2 pb-3">
              <div className="flex items-start justify-between gap-2">
                <ServerCog className="h-5 w-5 text-primary" />
                <Badge variant="warning">SANDBOX</Badge>
              </div>
              <CardTitle className="text-base">{row.label}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Health</span>
                <Badge variant={row.health === "online" ? "success" : "destructive"}>
                  {row.health.toUpperCase()}
                </Badge>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Last operation</div>
                <div className="truncate font-medium">{row.lastOperation ?? "No activity yet"}</div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-muted-foreground">Latency</div>
                  <div>{row.durationMs === null ? "—" : `${row.durationMs} ms`}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Result</div>
                  <div>{row.operationStatus?.toUpperCase() ?? "—"}</div>
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Correlation ID</div>
                <div className="truncate font-mono text-[11px]">{row.correlationId ?? "—"}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Integration Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground">Run the demonstration scenario to populate transaction traces.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="py-2 pr-4">Time</th>
                    <th className="py-2 pr-4">Service</th>
                    <th className="py-2 pr-4">Operation</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Latency</th>
                    <th className="py-2">Correlation ID</th>
                  </tr>
                </thead>
                <tbody>
                  {events.slice(0, 20).map((event) => (
                    <tr key={`${event.correlationId}-${event.timestamp}`} className="border-b last:border-0">
                      <td className="py-2 pr-4 text-xs">{new Date(event.timestamp).toLocaleTimeString()}</td>
                      <td className="py-2 pr-4">{event.service.toUpperCase()}</td>
                      <td className="py-2 pr-4 font-mono text-xs">{event.operation}</td>
                      <td className="py-2 pr-4">{event.status.toUpperCase()}</td>
                      <td className="py-2 pr-4">{event.durationMs} ms</td>
                      <td className="py-2 font-mono text-[11px]">{event.correlationId}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
