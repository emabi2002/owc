"use client";

import { useState } from "react";
import { CheckCircle2, Circle, PlayCircle, RotateCcw, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DemoScenarioResult } from "@/lib/integrations/sandbox/demo-scenario";

export function DemoRunner() {
  const [result, setResult] = useState<DemoScenarioResult | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setRunning(true);
    setError(null);
    try {
      const response = await fetch("/api/sandbox/demo/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("The controlled integration sandbox is disabled or unavailable.");
      setResult((await response.json()) as DemoScenarioResult);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Demo execution failed.");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-5">
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Scenario: Worker Compensation Claim</CardTitle>
              <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                Demonstrates real API orchestration against synthetic NID, employer registry, IRC, employer HR, medical, insurance, banking and notification services.
              </p>
            </div>
            <Badge variant="warning">SANDBOX DATA ONLY</Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button onClick={run} disabled={running}>
            <PlayCircle className="h-4 w-4" />
            {running ? "Running integrations…" : "Run end-to-end demonstration"}
          </Button>
          {result && (
            <Button variant="outline" onClick={() => setResult(null)} disabled={running}>
              <RotateCcw className="h-4 w-4" /> Reset screen
            </Button>
          )}
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
            Run the scenario to demonstrate the complete cross-agency transaction chain.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Claim Reference</CardTitle></CardHeader>
              <CardContent className="font-mono text-sm">{result.claimReference}</CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Scenario Status</CardTitle></CardHeader>
              <CardContent><Badge variant={result.status === "completed" ? "success" : "destructive"}>{result.status.toUpperCase()}</Badge></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Payment Reference</CardTitle></CardHeader>
              <CardContent className="font-mono text-sm">{result.paymentTransactionReference ?? "Not processed"}</CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle>Integration Execution</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {result.steps.map((step, index) => (
                  <div key={step.key} className="flex gap-3 rounded-lg border p-3">
                    <div className="pt-0.5">
                      {step.status === "passed" ? (
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-muted-foreground">STEP {index + 1}</span>
                        <strong>{step.label}</strong>
                        <Badge variant={step.status === "passed" ? "success" : "destructive"}>{step.status.toUpperCase()}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{step.summary}</p>
                      <p className="mt-1 truncate font-mono text-[11px] text-muted-foreground">Trace: {step.correlationId}</p>
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
