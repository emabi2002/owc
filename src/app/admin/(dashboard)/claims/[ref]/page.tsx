import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Circle,
  FileCheck2,
  FileText,
  HardHat,
  ShieldCheck,
} from "lucide-react";
import { AdminPageHeader, StatusBadge } from "@/components/admin/admin-shell";
import { EvidenceActions } from "@/components/claims/evidence-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requirePermission } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/roles";
import { getClaimDetail } from "@/lib/claims/detail";
import { formatEvidenceSize } from "@/lib/claims/evidence";

export default async function AdminClaimDetailPage({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  const user = await requirePermission("claims.view");
  const { ref } = await params;
  const claim = await getClaimDetail(decodeURIComponent(ref));
  if (!claim) notFound();

  const completedSteps = claim.steps.filter((step) => step.done).length;
  const canManageEvidence = hasPermission(user.role, "claims.manage");

  return (
    <>
      <AdminPageHeader
        title={`Claim ${claim.ref}`}
        description="Claim assessment, verification, evidence and processing record."
      >
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/claims">
            <ArrowLeft className="h-4 w-4" /> Claims register
          </Link>
        </Button>
      </AdminPageHeader>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <HardHat className="h-4 w-4 text-primary" /> Worker
            </CardTitle>
          </CardHeader>
          <CardContent className="font-semibold">{claim.worker}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <BriefcaseBusiness className="h-4 w-4 text-primary" /> Employer
            </CardTitle>
          </CardHeader>
          <CardContent className="font-semibold">{claim.employer}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <CalendarDays className="h-4 w-4 text-primary" /> Lodged
            </CardTitle>
          </CardHeader>
          <CardContent className="font-semibold">{claim.lodged}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <ShieldCheck className="h-4 w-4 text-primary" /> Claim status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StatusBadge status={claim.status} />
          </CardContent>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-5">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Claim information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-muted-foreground">Reference</div>
                <div className="font-mono font-semibold">{claim.ref}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Injury type</div>
                <div className="font-medium">{claim.type}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Injury date</div>
                <div className="font-medium">{claim.injuryDate}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Evidence items</div>
                <div className="font-medium">{claim.evidence.length}</div>
              </div>
            </div>
            <div className="rounded-lg border bg-secondary/40 p-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Processing progress
              </div>
              <div className="mt-1 text-2xl font-bold text-primary">
                {completedSteps}/{claim.steps.length}
              </div>
              <div className="text-xs text-muted-foreground">workflow stages complete</div>
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>Processing workflow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {claim.steps.map((step, index) => (
                <div key={`${step.label}-${index}`} className="flex gap-3 rounded-lg border p-3">
                  {step.done ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                  ) : (
                    <Circle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <strong>{step.label}</strong>
                      <Badge variant={step.done ? "success" : "secondary"}>
                        {step.done ? "COMPLETE" : "PENDING"}
                      </Badge>
                    </div>
                    {step.date && (
                      <div className="mt-1 text-xs text-muted-foreground">{step.date}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card id="evidence" className="mt-5">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Claim evidence</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Controlled evidence register for identity, medical, employment and incident records.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileCheck2 className="h-4 w-4 text-success" />
              {claim.evidence.filter((item) => item.status === "Verified").length} verified
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {claim.evidence.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              <FileText className="mx-auto mb-2 h-7 w-7" />
              No evidence has been registered for this claim.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead className="border-b text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="py-2 pr-4">Category</th>
                    <th className="py-2 pr-4">Document</th>
                    <th className="py-2 pr-4">Uploaded by</th>
                    <th className="py-2 pr-4">Size</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Integrity</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {claim.evidence.map((item) => (
                    <tr key={item.id} className="border-b last:border-0">
                      <td className="py-3 pr-4"><Badge variant="secondary">{item.category}</Badge></td>
                      <td className="py-3 pr-4">
                        <div className="font-medium">{item.title}</div>
                        <div className="text-xs text-muted-foreground">{item.fileName}</div>
                      </td>
                      <td className="py-3 pr-4">{item.uploadedBy}</td>
                      <td className="py-3 pr-4">{formatEvidenceSize(item.sizeBytes)}</td>
                      <td className="py-3 pr-4">
                        <Badge variant={item.status === "Verified" ? "success" : item.status === "Rejected" ? "destructive" : "warning"}>
                          {item.status}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4 font-mono text-[11px] text-muted-foreground">
                        {item.sha256 ? `${item.sha256.slice(0, 12)}…` : "Pending"}
                      </td>
                      <td className="py-3">
                        <EvidenceActions
                          claimReference={claim.ref}
                          evidenceId={item.id}
                          status={item.status}
                          canManage={canManageEvidence}
                          hasStoredObject={Boolean(item.storagePath)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
