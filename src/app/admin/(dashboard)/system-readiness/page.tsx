import Link from "next/link";
import { ArrowLeft, CheckCircle2, CircleAlert, ServerCog } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requirePermission } from "@/lib/auth/session";
import { getOperationalReadiness } from "@/lib/operations/readiness";

export default async function SystemReadinessPage() {
  await requirePermission("audit.view");
  const checks = getOperationalReadiness();
  const ready = checks.filter((item) => item.status === "ready").length;

  return (
    <>
      <AdminPageHeader
        title="System Readiness"
        description="Operational configuration status for the OWC enterprise platform and production service dependencies."
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
            <CardTitle className="text-sm">Configured services</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold text-primary">
            {ready}/{checks.length}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Platform state</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={ready === checks.length ? "success" : "warning"}>
              {ready === checks.length ? "PRODUCTION CONFIGURED" : "CONFIGURATION IN PROGRESS"}
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
                  {item.status === "ready" ? "READY" : "CONFIGURATION REQUIRED"}
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
    </>
  );
}
