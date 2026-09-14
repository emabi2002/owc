"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Bot, Loader2, Send, ShieldCheck } from "lucide-react";

const EXAMPLES = [
  "Show claims by province",
  "Which employers have the most claims?",
  "Show claims outstanding for more than 90 days",
  "What is our average processing turnaround?",
  "Show compensation and payment totals",
];

type ReportGroup = {
  key: string;
  label: string;
  count: number;
  amountPgk?: number;
  averageTurnaroundDays?: number;
};

type AnalystResponse = {
  ok: boolean;
  analysisId: string;
  narrative?: string;
  error?: string;
  environment?: string;
  aiSource?: "reference" | "live";
  productionConnected?: boolean;
  report?: {
    report: string;
    title: string;
    recordCount: number;
    totals: {
      totalClaims: number;
      approvedClaims: number;
      declinedClaims: number;
      pendingClaims: number;
      closedClaims: number;
      averageTurnaroundDays: number;
      maximumTurnaroundDays: number;
      illustrativePaymentAmountPgk: number;
    };
    groups: ReportGroup[];
    syntheticData: boolean;
    disclosure: string;
  } | null;
};

type HistoryItem = {
  question: string;
  analysisId: string;
  narrative?: string;
};

export function ManagementAiPanel() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalystResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  async function submitQuestion(value: string) {
    const trimmed = value.trim();
    if (trimmed.length < 3 || loading) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/management/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed }),
      });
      const body = (await response.json()) as AnalystResponse;
      setResult(body);

      if (body.analysisId) {
        setHistory((current) =>
          [{ question: trimmed, analysisId: body.analysisId, narrative: body.narrative }, ...current].slice(0, 5),
        );
      }

      if (!response.ok || !body.ok) {
        setError(body.error ?? "The management AI analyst is currently unavailable.");
      }
    } catch {
      setError("The management AI analyst could not be reached. Standard Reports remain available.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitQuestion(question);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-card p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-primary/10 p-2 text-primary"><Bot className="h-5 w-5" /></div>
          <div>
            <p className="text-sm font-semibold text-gold">Management AI Analyst</p>
            <h2 className="mt-1 font-serif text-2xl font-bold text-primary">Ask a management question</h2>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
              Ask questions about OWC claims trends, aging, workload, turnaround and payment-status reporting. The analyst is Read-only: it cannot approve, update, reassign, delete or otherwise alter operational records.
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="mt-5 space-y-3">
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            maxLength={1000}
            rows={4}
            placeholder="Example: Show claims outstanding for more than 90 days"
            className="w-full rounded-xl border bg-background p-4 text-sm text-foreground outline-none ring-offset-background focus:ring-2 focus:ring-primary"
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">{question.length}/1000 characters</span>
            <button
              type="submit"
              disabled={loading || question.trim().length < 3}
              className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {loading ? "Analysing…" : "Analyse"}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border bg-card p-5">
        <h3 className="text-sm font-semibold text-primary">Example questions</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {EXAMPLES.map((example) => (
            <button
              type="button"
              key={example}
              onClick={() => {
                setQuestion(example);
                void submitQuestion(example);
              }}
              className="rounded-full border px-3 py-2 text-left text-xs font-medium text-foreground hover:bg-secondary"
            >
              {example}
            </button>
          ))}
        </div>
      </section>

      {error && (
        <section className="rounded-2xl border border-gold/40 bg-gold/10 p-5">
          <h3 className="font-semibold text-primary">AI analysis unavailable</h3>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <Link href="/management/reports" className="mt-3 inline-block text-sm font-semibold text-primary hover:underline">
            Continue with Standard Reports
          </Link>
        </section>
      )}

      {result?.report && (
        <section className="space-y-4 rounded-2xl border bg-card p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                <ShieldCheck className="h-4 w-4" /> Authoritative reporting result
              </div>
              <h3 className="mt-1 font-serif text-2xl font-bold text-primary">{result.report.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Analysis ID: <span className="font-mono">{result.analysisId}</span>
                {result.environment ? ` · ${result.environment}` : ""}
                {result.aiSource ? ` · AI source: ${result.aiSource}` : ""}
              </p>
            </div>
            <Link href="/management/reports" className="text-sm font-semibold text-primary hover:underline">Open source data</Link>
          </div>

          {result.narrative && <p className="rounded-xl bg-secondary/50 p-4 text-sm leading-6 text-foreground">{result.narrative}</p>}
          {result.report.syntheticData && <p className="rounded-lg border border-gold/40 bg-gold/10 p-3 text-xs text-muted-foreground">{result.report.disclosure}</p>}

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Kpi label="Record count" value={result.report.recordCount.toLocaleString()} />
            <Kpi label="Approved" value={result.report.totals.approvedClaims.toLocaleString()} />
            <Kpi label="Pending" value={result.report.totals.pendingClaims.toLocaleString()} />
            <Kpi label="Average turnaround" value={`${result.report.totals.averageTurnaroundDays} days`} />
          </div>

          {result.report.groups.length > 0 && (
            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full text-sm">
                <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr><th className="px-4 py-3">Group</th><th className="px-4 py-3 text-right">Claims</th><th className="px-4 py-3 text-right">Amount PGK</th></tr>
                </thead>
                <tbody>
                  {result.report.groups.slice(0, 25).map((group) => (
                    <tr key={group.key} className="border-t">
                      <td className="px-4 py-3 font-medium">{group.label}</td>
                      <td className="px-4 py-3 text-right">{group.count}</td>
                      <td className="px-4 py-3 text-right">{typeof group.amountPgk === "number" ? group.amountPgk.toLocaleString("en-PG") : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {history.length > 1 && (
        <section className="rounded-2xl border bg-card p-5">
          <h3 className="text-sm font-semibold text-primary">Recent questions in this session</h3>
          <div className="mt-3 space-y-2">
            {history.map((item) => (
              <button key={`${item.analysisId}-${item.question}`} type="button" onClick={() => setQuestion(item.question)} className="block w-full rounded-lg border p-3 text-left hover:bg-secondary">
                <div className="text-sm font-medium">{item.question}</div>
                <div className="mt-1 font-mono text-[11px] text-muted-foreground">{item.analysisId}</div>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-background p-4">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-2 text-xl font-bold text-primary">{value}</div>
    </div>
  );
}
