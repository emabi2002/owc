"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Kept local (not imported from the server search module) to avoid bundling
// server-only code into the client.
const TYPES = [
  "All",
  "Page",
  "News",
  "Publication",
  "Legislation",
  "Tender",
  "FAQ",
  "Form",
  "Report",
];

export function SearchControls({
  defaultQuery = "",
  defaultType = "All",
  defaultFrom = "",
  defaultTo = "",
}: {
  defaultQuery?: string;
  defaultType?: string;
  defaultFrom?: string;
  defaultTo?: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState(defaultQuery);
  const [type, setType] = useState(defaultType);
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);

  const run = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (type && type !== "All") params.set("type", type);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <form
      onSubmit={run}
      className="rounded-2xl border border-border bg-card p-5 shadow-sm"
    >
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Label htmlFor="q">Search</Label>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="q"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search the OWC website…"
              className="pl-9"
            />
          </div>
        </div>
        <div className="lg:col-span-3">
          <Label htmlFor="type">Content type</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger id="type" className="mt-2">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              {TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="lg:col-span-2">
          <Label htmlFor="from">From year</Label>
          <Input
            id="from"
            inputMode="numeric"
            value={from}
            onChange={(e) => setFrom(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))}
            placeholder="2020"
            className="mt-2"
          />
        </div>
        <div className="lg:col-span-2">
          <Label htmlFor="to">To year</Label>
          <Input
            id="to"
            inputMode="numeric"
            value={to}
            onChange={(e) => setTo(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))}
            placeholder="2026"
            className="mt-2"
          />
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <Button type="submit">
          <Search className="h-4 w-4" /> Search
        </Button>
      </div>
    </form>
  );
}
