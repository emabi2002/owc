"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const CATEGORIES = [
  "Identity",
  "Medical",
  "Employment",
  "Employer",
  "Incident",
  "Banking",
  "Correspondence",
  "Other",
] as const;

export function EvidenceUploadForm({ claimReference }: { claimReference: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("Medical");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file || !title.trim()) {
      toast.error("Enter a document title and select a file");
      return;
    }

    setBusy(true);
    try {
      const body = new FormData();
      body.set("title", title.trim());
      body.set("category", category);
      body.set("file", file);

      const response = await fetch(
        `/api/admin/claims/${encodeURIComponent(claimReference)}/evidence`,
        { method: "POST", body },
      );
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to upload evidence");
      }

      toast.success("Evidence uploaded for review");
      setTitle("");
      setFile(null);
      const input = event.currentTarget.elements.namedItem("evidence-file") as HTMLInputElement | null;
      if (input) input.value = "";
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to upload evidence");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-3 rounded-lg border bg-secondary/20 p-4 md:grid-cols-12">
      <div className="md:col-span-4">
        <label htmlFor="evidence-title" className="mb-1 block text-xs font-semibold text-muted-foreground">
          Document title
        </label>
        <Input
          id="evidence-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="e.g. Medical practitioner's report"
          maxLength={160}
          disabled={busy}
        />
      </div>
      <div className="md:col-span-3">
        <label htmlFor="evidence-category" className="mb-1 block text-xs font-semibold text-muted-foreground">
          Category
        </label>
        <select
          id="evidence-category"
          value={category}
          onChange={(event) => setCategory(event.target.value as (typeof CATEGORIES)[number])}
          disabled={busy}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          {CATEGORIES.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </div>
      <div className="md:col-span-3">
        <label htmlFor="evidence-file" className="mb-1 block text-xs font-semibold text-muted-foreground">
          Evidence file
        </label>
        <Input
          id="evidence-file"
          name="evidence-file"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          disabled={busy}
        />
      </div>
      <div className="flex items-end md:col-span-2">
        <Button type="submit" className="w-full" disabled={busy || !file || !title.trim()}>
          <Upload className="h-4 w-4" />
          {busy ? "Uploading…" : "Upload"}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground md:col-span-12">
        Accepted: PDF, JPG, PNG and WebP. Files are stored in the private claim evidence repository and registered with an integrity hash.
      </p>
    </form>
  );
}
