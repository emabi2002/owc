"use client";

import { useState } from "react";
import { CheckCircle2, Circle, PlayCircle, RotateCcw, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DemoScenarioResult } from "@/lib/integrations/sandbox/demo-scenario";

const INITIAL_IDENTIFIERS = {
  nid: "NID-00010001",
  registrationNo: "IPA-2020-1001",
  tin: "TIN-90010001",
  employeeNo: "EMP-0001001",
  certificateNo: "MED-2026-00451",
  policyNo: "WC-POL-2026-01872",
  accountReference: "BANK-ACC-7842",
};

export function DemoRunner() {
  const [result, setResult] = useState<DemoScenarioResult | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [identifiers, setIdentifiers] = useState(INITIAL_IDENTIFIERS);

  const setIdentifier = (key: keyof typeof INITIAL_IDENTIFIERS, value: string) => {
    setIdentifiers((current) => ({ ...current, [key]: value }));
  };

  const run = async () => {
    setRunning(true);
    setError(null);
    try {
      const response = await fetch("/api/integrations/claim/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(identifiers),
      });
      const body = (await response.json().catch(() => ({}))) as
        | DemoScenarioResult
        | { error?: string };
      if (!response.ok) {
        throw new Error(
          "error" in body && body.error
            ? body.error
            : "One or more integration services are unavailable.",
        );
      }
      setResult(body as DemoScenarioResult);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Claim processing could not be completed.",
      );
    } finally {
      setRunning(false);
    }
  };

  const reset = () => {
    setIdentifiers(INITIAL_IDENTIFIERS);
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-5">
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Worker Compensation Claim Processing</CardTitle>
              <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                Orchestrates identity, employer registration, tax compliance,
                employment, medical, insurance, banking and notification services
                through the OWC integration layer.
              </p>
            </div>
            <Badge variant="success">READY</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="space-y-1.5 text-sm">
              <span className="font-medium">National ID</span>
              <input
                className="w-full rounded-md border bg-background px-3 py-2 font-mono text-xs outline-none focus:ring-2 focus:ring-ring"
                value={identifiers.nid}
                onChange={(event) => setIdentifier("nid", event.target.value)}
                disabled={running}
              />
            </label>
            <label className="space-y-1.5 text-sm">
              <span className="font-medium">Employer registration</span>
              <input
                className="w-full rounded-md border bg-background px-3 py-2 font-mono text-xs outline-none focus:ring-2 focus:ring-ring"
                value={identifiers.registrationNo}
                onChange={(event) =>
                  setIdentifier("registrationNo", event.target.value)
                }
                disabled={running}
              />
            </label>
            <label className="space-y-1.5 text-sm">
              <span className="font-medium">IRC TIN</span>
              <input
                className="w-full rounded-md border bg-background px-3 py-2 font-mono text-xs outline-none focus:ring-2 focus:ring-ring"
                value={identifiers.tin}
                onChange={(event) => setIdentifier("tin", event.target.value)}
                disabled={running}
              />
            </label>
            <label className="space-y-1.5 text-sm">
              <span className="font-medium">Employee number</span>
              <input
                className="w-full rounded-md border bg-background px-3 py-2 font-mono text-xs outline-none focus:ring-2 focus:ring-ring"
                value={identifiers.employeeNo}
                onChange={(event) =>
                  setIdentifier("employeeNo", event.target.value)
                }
                disabled={running}
              />
            </label>
            <label className="space-y-1.5 text-sm">
              <span className="font-medium">Medical certificate</span>
              <input
                className="w-full rounded-md border bg-background px-3 py-2 font-mono text-xs outline-none focus:ring-2 focus:ring-ring"
                value={identifiers.certificateNo}
                onChange={(event) =>
                  setIdentifier("certificateNo", event.target.value)
                }
                disabled={running}
              />
            </label>
            <label className="space-y-1.5 text-sm">
              <span className="font-medium">Insurance policy</span>
              <input
                className="w-full rounded-md border bg-background px-3 py-2 font-mono text-xs outline-none focus:ring-2 focus:ring-ring"
                value={identifiers.policyNo}
                onChange={(event) =>
                  setIdentifier("policyNo", event.target.value)
                }
                disabled={running}
              />
            </label>
            <label className="space-y-1.5 text-sm md:col-span-2">
              <span className="font-medium">Bank account reference</span>
              <input
                className="w-full rounded-md border bg-background px-3 py-2 font-mono text-xs outline-none focus:ring-2 focus:ring-ring"
                value={identifiers.accountReference}
                onChange={(event) =>
                  setIdentifier("accountReference", event.target.value)
                }
                disabled={running}
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={run} disabled={running}>
              <PlayCircle className="h-4 w-4" />
              {running ? "Processing integrations…" : "Process claim workflow"}
            </Button>
            <Button variant="outline" onClick={reset} disabled={running}>
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {!result ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            <Circle className="mx-auto mb-3 h-8 w-8" />
            Enter or confirm the verification references and process the claim to
            execute the cross-agency transaction chain.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Claim Reference</CardTitle>
              </CardHeader>
              <CardContent className="font-mono text-sm">
                {result.claimReference}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Processing Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge
                  variant={
                    result.status === "completed" ? "success" : "destructive"
                  }
                >
                  {result.status.toUpperCase()}
                </Badge>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Payment Reference</CardTitle>
              </CardHeader>
              <CardContent className="font-mono text-sm">
                {result.paymentTransactionReference ?? "Not processed"}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Integration Execution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {result.steps.map((step, index) => (
                  <div
                    key={step.key}
                    className="flex gap-3 rounded-lg border p-3"
                  >
                    <div className="pt-0.5">
                      {step.status === "passed" ? (
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-muted-foreground">
                          STEP {index + 1}
                        </span>
                        <strong>{step.label}</strong>
                        <Badge
                          variant={
                            step.status === "passed" ? "success" : "destructive"
                          }
                        >
                          {step.status.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {step.summary}
                      </p>
                      <p className="mt-1 truncate font-mono text-[11px] text-muted-foreground">
                        Trace: {step.correlationId}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
