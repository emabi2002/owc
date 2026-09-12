"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ExternalLink, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type Props = {
  claimReference: string;
  evidenceId: string;
  status: "Verified" | "Pending Review" | "Rejected";
  canManage: boolean;
  hasStoredObject: boolean;
};

export function EvidenceActions({
  claimReference,
  evidenceId,
  status,
  canManage,
  hasStoredObject,
}: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState<"view" | "verify" | "reject" | null>(null);

  const endpoint = `/api/admin/claims/${encodeURIComponent(claimReference)}/evidence/${encodeURIComponent(evidenceId)}`;

  const openEvidence = async () => {
    setBusy("view");
    try {
      const response = await fetch(endpoint, { cache: "no-store" });
      const payload = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !payload.url) {
        throw new Error(payload.error ?? "Unable to open evidence");
      }
      window.open(payload.url, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to open evidence");
    } finally {
      setBusy(null);
    }
  };

  const review = async (nextStatus: "Verified" | "Rejected") => {
    setBusy(nextStatus === "Verified" ? "verify" : "reject");
    try {
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to update evidence review");
      }
      toast.success(nextStatus === "Verified" ? "Evidence verified" : "Evidence rejected");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update evidence review");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={openEvidence}
        disabled={!hasStoredObject || busy !== null}
      >
        <ExternalLink className="h-4 w-4" />
        {busy === "view" ? "Opening…" : "View"}
      </Button>

      {canManage && status === "Pending Review" && (
        <>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => review("Verified")}
            disabled={busy !== null}
          >
            <CheckCircle2 className="h-4 w-4" />
            {busy === "verify" ? "Verifying…" : "Verify"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => review("Rejected")}
            disabled={busy !== null}
          >
            <XCircle className="h-4 w-4" />
            {busy === "reject" ? "Rejecting…" : "Reject"}
          </Button>
        </>
      )}
    </div>
  );
}
