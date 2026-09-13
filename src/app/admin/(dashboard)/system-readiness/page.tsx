import Link from "next/link";
import { ArrowLeft, CheckCircle2, CircleAlert, ServerCog } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requirePermission } from "@/lib/auth/session";
import { getProductionPreflight } from "@/lib/operations/production-preflight";
import { getOperationalReadiness } from "@/lib/operations/readiness";

export default async function SystemReadinessPage() {
  await requirePermission("audit.view");
  const checks = getOperationalReadiness();
  const configured = checks.filter((item) => item.status === "ready").length;
  const preflight = getProductionPreflight();
  const productionReady = preflight.filter((item) => item.status === "ready").length;
  const externallyPending = preflight.filter(
    (item) => item.status === "external-verification-required",
  ).length;

  return (
    <>
      <AdminPageHeader
        title="System Readiness"
        description="Operational configuration and production go-live gates for the OWC enterprise platform. Configuration does not by itself prove external service acceptance."
      >
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/integrations">
            <ArrowLeft className="h-4 w-4" /> Integration Control Centre
          </Link>
        </Button>
      </AdminPageHeader>

      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Configured base services</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold text-primary">
            {configured}/{checks.length}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Configuration state</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={configured === checks.length ? "success" : "warning"}>
              {configured === checks.length ? "BASE SERVICES CONFIGURED" : "CONFIGURATION IN PROGRESS"}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Architecture</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 font-medium">
            <ServerCog className="h-5 w-5 text-primary" /> Service-oriented integration
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {checks.map((item) => (
          <Card key={item.key}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="text-base">{item.label}</CardTitle>
                <Badge variant={item.status === "ready" ? "success" : "warning"}>
                  {item.status === "ready" ? "CONFIGURED" : "CONFIGURATION REQUIRED"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex gap-3 text-sm text-muted-foreground">
              {item.status === "ready" ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
              ) : (
                <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-warning-foreground" />
              )}
              <p>{item.detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="my-7 border-t pt-7">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Production go-live preflight</h2>
            <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
              These checks apply a stricter production policy. External verification means an endpoint may be configured, but OWC/agency UAT and formal acceptance are still required.
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant={productionReady === preflight.length ? "success" : "warning"}>
              {productionReady}/{preflight.length} READY
            </Badge>
            {externallyPending > 0 ? (
              <Badge variant="warning">{externallyPending} EXTERNAL VERIFICATION</Badge>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {preflight.map((item) => {
            const ready = item.status === "ready";
            const statusLabel =
              item.status === "ready"
                ? "READY"
                : item.status === "external-verification-required"
                  ? "EXTERNAL VERIFICATION REQUIRED"
                  : "CONFIGURATION REQUIRED";

            return (
              <Card key={item.key}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-base">{item.label}</CardTitle>
                    <Badge variant={ready ? "success" : "warning"}>{statusLabel}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex gap-3 text-sm text-muted-foreground">
                  {ready ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                  ) : (
                    <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-warning-foreground" />
                  )}
                  <p>{item.detail}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
}
