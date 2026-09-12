"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  allowedClaimTransitions,
  type ClaimWorkflowStatus,
} from "@/lib/claims/workflow";

export function ClaimStatusActions({
  claimReference,
  status,
  canManage,
}: {
  claimReference: string;
  status: ClaimWorkflowStatus;
  canManage: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<ClaimWorkflowStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const transitions = allowedClaimTransitions(status);

  if (!canManage || transitions.length === 0) return null;

  const move = async (target: ClaimWorkflowStatus) => {
    setPending(target);
    setError(null);
    try {
      const response = await fetch(
        `/api/admin/claims/${encodeURIComponent(claimReference)}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: target }),
        },
      );
      const body = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!response.ok) throw new Error(body.error || "Unable to update claim status");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to update claim status");
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {transitions.map((target) => (
          <Button
            key={target}
            type="button"
            variant={target === "Declined" ? "destructive" : "outline"}
            size="sm"
            disabled={pending !== null}
            onClick={() => move(target)}
          >
            {pending === target ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
            {target}
          </Button>
        ))}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
