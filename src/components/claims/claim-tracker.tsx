"use client";

import { useState } from "react";
import {
  Search,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { SAMPLE_CLAIM } from "@/lib/site-data";
import { cn } from "@/lib/utils";

type Result = "idle" | "loading" | "found" | "notfound";

export function ClaimTracker() {
  const [ref, setRef] = useState("");
  const [surname, setSurname] = useState("");
  const [state, setState] = useState<Result>("idle");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ref.trim()) return;
    setState("loading");
    setTimeout(() => {
      const match =
        ref.trim().toUpperCase() === SAMPLE_CLAIM.reference.toUpperCase();
      setState(match ? "found" : "notfound");
    }, 900);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      {/* Form */}
      <form
        onSubmit={submit}
        className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:col-span-5"
      >
        <h3 className="font-serif text-xl font-bold text-primary">
          Check your claim status
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your claim reference number to view real-time progress.
        </p>

        <div className="mt-5 space-y-4">
          <div>
            <Label htmlFor="ref">
              Claim reference <span className="text-destructive">*</span>
            </Label>
            <Input
              id="ref"
              value={ref}
              onChange={(e) => setRef(e.target.value)}
              placeholder="e.g. OWC-2026-004821"
              className="mt-2 font-mono"
            />
          </div>
          <div>
            <Label htmlFor="surname">Worker surname</Label>
            <Input
              id="surname"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              placeholder="As recorded on the claim"
              className="mt-2"
            />
          </div>
          <Button type="submit" className="w-full" disabled={state === "loading"}>
            {state === "loading" ? (
              <>
                <Loader2 className="animate-spin" /> Searching…
              </>
            ) : (
              <>
                <Search /> Track claim
              </>
            )}
          </Button>
          <p className="rounded-md bg-secondary/70 px-3 py-2 text-xs text-muted-foreground">
            <strong className="text-foreground">Demo tip:</strong> try reference{" "}
            <code className="font-mono text-primary">{SAMPLE_CLAIM.reference}</code>
          </p>
        </div>
      </form>

      {/* Result */}
      <div className="lg:col-span-7">
        {state === "idle" && (
          <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-secondary/30 p-8 text-center">
            <Search className="h-10 w-10 text-muted-foreground/50" />
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Your claim status and timeline will appear here once you search.
            </p>
          </div>
        )}

        {state === "loading" && (
          <div className="flex h-full min-h-[300px] items-center justify-center rounded-2xl border border-border bg-card">
            <Loader2 className="h-8 w-8 animate-spin text-gold" />
          </div>
        )}

        {state === "notfound" && (
          <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <h4 className="mt-3 font-serif text-lg font-bold text-foreground">
              No claim found
            </h4>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              We couldn't find a claim matching that reference. Please check the
              number and try again, or contact our office for assistance.
            </p>
          </div>
        )}

        {state === "found" && (
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-primary p-5 text-white">
              <div>
                <div className="font-mono text-sm text-white/70">
                  {SAMPLE_CLAIM.reference}
                </div>
                <div className="font-serif text-lg font-bold">
                  {SAMPLE_CLAIM.type}
                </div>
              </div>
              <Badge variant="warning" className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> {SAMPLE_CLAIM.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-4">
              {[
                { l: "Worker", v: SAMPLE_CLAIM.worker },
                { l: "Employer", v: SAMPLE_CLAIM.employer },
                { l: "Injury date", v: SAMPLE_CLAIM.injuryDate },
                { l: "Lodged", v: SAMPLE_CLAIM.lodged },
              ].map((d) => (
                <div key={d.l} className="bg-card p-4">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    {d.l}
                  </div>
                  <div className="mt-0.5 text-sm font-semibold text-foreground">
                    {d.v}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6">
              <h4 className="mb-5 font-serif text-base font-bold text-primary">
                Claim progress
              </h4>
              <ol className="relative space-y-6 before:absolute before:left-[11px] before:top-2 before:h-[calc(100%-1rem)] before:w-0.5 before:bg-border">
                {SAMPLE_CLAIM.steps.map((s, i) => {
                  const active =
                    !s.done && SAMPLE_CLAIM.steps.findIndex((x) => !x.done) === i;
                  return (
                    <li key={s.label} className="relative flex items-start gap-4 pl-0">
                      <span
                        className={cn(
                          "relative z-10 grid h-6 w-6 shrink-0 place-items-center rounded-full ring-4 ring-card",
                          s.done
                            ? "bg-success text-white"
                            : active
                              ? "bg-gold text-gold-foreground"
                              : "bg-secondary text-muted-foreground"
                        )}
                      >
                        {s.done ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : active ? (
                          <Clock className="h-3.5 w-3.5" />
                        ) : (
                          <Circle className="h-3 w-3" />
                        )}
                      </span>
                      <div className="pt-0.5">
                        <div
                          className={cn(
                            "text-sm font-semibold",
                            s.done || active ? "text-foreground" : "text-muted-foreground"
                          )}
                        >
                          {s.label}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {s.done ? `Completed ${s.date}` : active ? "In progress" : "Pending"}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
