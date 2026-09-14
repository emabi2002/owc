import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requirePermission } from "@/lib/auth/session";
import { findDemonstrationClaim } from "@/lib/demonstration/officer-workbench";

export default async function DemonstrationOfficerClaimPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  await requirePermission("claims.view");
  const { reference } = await params;
  const claim = findDemonstrationClaim(decodeURIComponent(reference));
  if (!claim) notFound();

  return (
    <>
      <AdminPageHeader
        title={claim.reference}
        description="Synthetic presentation claim — read-only officer inspection."
      >
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/demonstration/officer">Back to workbench</Link>
        </Button>
      </AdminPageHeader>

      <div className="mb-5 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
        DEMONSTRATION — SYNTHETIC DATA — NO REAL PAYMENTS · productionAcceptance=false · moneyMovement=false
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-serif text-lg font-bold text-primary">Claim presentation</h2>
            <Badge variant="navy">{claim.status.replaceAll("_", " ")}</Badge>
          </div>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Worker" value={claim.workerName} />
            <Field label="Employer" value={claim.employerName} />
            <Field label="Province" value={claim.province} />
            <Field label="Industry" value={claim.industry} />
            <Field label="Occupation" value={claim.occupation} />
            <Field label="Injury type" value={claim.injuryType} />
            <Field label="Decision" value={claim.decision} />
            <Field label="Notification" value={claim.notificationStatus} />
          </dl>
        </section>

        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="font-serif text-lg font-bold text-primary">Presentation boundaries</h2>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="synthetic" value="true" />
            <Field label="productionAcceptance" value="false" />
            <Field label="simulation" value="true" />
            <Field label="moneyMovement" value="false" />
            <Field label="Turnaround days" value={String(claim.turnaroundDays)} />
            <Field
              label="Illustrative amount"
              value={claim.simulatedPaymentAmountPgk === null ? "Not applicable" : `K${claim.simulatedPaymentAmountPgk.toLocaleString("en-US")}`}
            />
          </dl>
          <p className="mt-5 text-sm text-muted-foreground">
            No action on this screen can approve a live claim, contact a production agency, or initiate financial settlement.
          </p>
        </section>
      </div>
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}
