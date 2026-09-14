import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requirePermission } from "@/lib/auth/session";
import {
  buildOfficerWorkbench,
  isOfficerWorkbenchPersona,
  type OfficerWorkbenchPersona,
} from "@/lib/demonstration/officer-workbench";

const PERSONA_BY_ROLE = {
  claims_officer: "claims-officer",
  assessment_officer: "assessment-officer",
  finance_officer: "finance-officer",
} as const;

const LABELS: Record<OfficerWorkbenchPersona, string> = {
  "claims-officer": "Claims Officer",
  "assessment-officer": "Assessment Officer",
  "finance-officer": "Finance Officer",
};

export default async function DemonstrationOfficerPage({
  searchParams,
}: {
  searchParams: Promise<{ persona?: string }>;
}) {
  const user = await requirePermission("claims.view");
  const requested = (await searchParams).persona;
  const rolePersona = PERSONA_BY_ROLE[user.role as keyof typeof PERSONA_BY_ROLE];
  const persona: OfficerWorkbenchPersona =
    user.role === "administrator" && requested && isOfficerWorkbenchPersona(requested)
      ? requested
      : rolePersona ?? "claims-officer";
  const workbench = buildOfficerWorkbench(persona);

  return (
    <>
      <AdminPageHeader
        title={`${LABELS[persona]} Demonstration Workbench`}
        description="Read-only presentation queue derived from the deterministic synthetic claim pack."
      >
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/demonstration">Back to demonstration</Link>
        </Button>
      </AdminPageHeader>

      <div className="mb-5 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
        DEMONSTRATION — SYNTHETIC DATA — NO REAL PAYMENTS · productionAcceptance=false · moneyMovement=false
      </div>

      {user.role === "administrator" && (
        <div className="mb-5 flex flex-wrap gap-2">
          {(Object.keys(LABELS) as OfficerWorkbenchPersona[]).map((candidate) => (
            <Button key={candidate} variant={candidate === persona ? "default" : "outline"} size="sm" asChild>
              <Link href={`/admin/demonstration/officer?persona=${candidate}`}>{LABELS[candidate]}</Link>
            </Button>
          ))}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border p-5">
          <div>
            <h2 className="font-serif text-lg font-bold text-primary">Presentation queue</h2>
            <p className="text-sm text-muted-foreground">{workbench.claims.length} synthetic claims</p>
          </div>
          <Badge variant="navy">Read only</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3 font-semibold">Reference</th>
                <th className="px-5 py-3 font-semibold">Worker</th>
                <th className="hidden px-5 py-3 font-semibold md:table-cell">Employer</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {workbench.claims.map((claim) => (
                <tr key={claim.reference} className="hover:bg-secondary/40">
                  <td className="px-5 py-3 font-mono text-xs font-semibold text-primary">{claim.reference}</td>
                  <td className="px-5 py-3 font-medium">{claim.workerName}</td>
                  <td className="hidden px-5 py-3 text-muted-foreground md:table-cell">{claim.employerName}</td>
                  <td className="px-5 py-3"><Badge variant="secondary">{claim.status.replaceAll("_", " ")}</Badge></td>
                  <td className="px-5 py-3 text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/demonstration/officer/${encodeURIComponent(claim.reference)}`}>
                        Inspect <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
