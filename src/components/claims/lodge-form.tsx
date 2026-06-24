"use client";

import { useRef, useState } from "react";
import {
  Upload,
  File as FileIcon,
  X,
  Lock,
  CheckCircle2,
  Loader2,
  Copy,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Captcha } from "@/components/captcha";

const FieldLabel = ({
  htmlFor,
  children,
  required,
}: {
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
}) => (
  <Label htmlFor={htmlFor}>
    {children} {required && <span className="text-destructive">*</span>}
  </Label>
);

export function LodgeForm() {
  const [files, setFiles] = useState<{ name: string; size: number }[]>([]);
  const [captchaOk, setCaptchaOk] = useState(false);
  const [agree, setAgree] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const next = Array.from(list).map((f) => ({ name: f.name, size: f.size }));
    setFiles((prev) => [...prev, ...next].slice(0, 8));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaOk) {
      toast.error("Please complete the security check.");
      return;
    }
    if (!agree) {
      toast.error("Please confirm the declaration to proceed.");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      const num = Math.floor(100000 + Math.random() * 899999);
      setReference(`OWC-2026-${num}`);
      setSubmitting(false);
      toast.success("Claim submitted securely.");
    }, 1300);
  };

  if (reference) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-success/30 bg-success/5 p-8 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success text-white">
          <CheckCircle2 className="h-8 w-8" />
        </span>
        <h3 className="mt-5 font-serif text-2xl font-bold text-primary">
          Your claim has been lodged
        </h3>
        <p className="mt-2 text-muted-foreground">
          Thank you. Your claim has been submitted securely and is now registered
          with the Office of Workers Compensation.
        </p>
        <div className="mx-auto mt-6 flex max-w-sm items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
          <div className="text-left">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Your reference number
            </div>
            <div className="font-mono text-lg font-bold text-primary">
              {reference}
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(reference);
              toast.success("Reference copied");
            }}
            className="grid h-10 w-10 place-items-center rounded-md border border-border text-muted-foreground hover:bg-secondary"
            aria-label="Copy reference"
          >
            <Copy className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Keep this number safe — you can use it to track your claim at any time.
        </p>
        <Button asChild variant="default" className="mt-6">
          <a href="#track">
            Track this claim <ArrowRight />
          </a>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:p-8">
      {/* Worker */}
      <fieldset className="space-y-5">
        <legend className="flex items-center gap-2 font-serif text-lg font-bold text-primary">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-sm text-white">1</span>
          Worker details
        </legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <FieldLabel htmlFor="fn" required>Full name</FieldLabel>
            <Input id="fn" required placeholder="Given and family name" className="mt-2" />
          </div>
          <div>
            <FieldLabel htmlFor="dob">Date of birth</FieldLabel>
            <Input id="dob" type="date" className="mt-2" />
          </div>
          <div>
            <FieldLabel htmlFor="ph" required>Phone</FieldLabel>
            <Input id="ph" required placeholder="+675 …" className="mt-2" />
          </div>
          <div>
            <FieldLabel htmlFor="em">Email</FieldLabel>
            <Input id="em" type="email" placeholder="you@example.com" className="mt-2" />
          </div>
        </div>
      </fieldset>

      <hr className="my-7 border-border" />

      {/* Employer */}
      <fieldset className="space-y-5">
        <legend className="flex items-center gap-2 font-serif text-lg font-bold text-primary">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-sm text-white">2</span>
          Employment details
        </legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <FieldLabel htmlFor="emp" required>Employer name</FieldLabel>
            <Input id="emp" required placeholder="Company / organisation" className="mt-2" />
          </div>
          <div>
            <FieldLabel htmlFor="occ">Occupation</FieldLabel>
            <Input id="occ" placeholder="Your role" className="mt-2" />
          </div>
          <div>
            <FieldLabel htmlFor="prov">Province</FieldLabel>
            <Select>
              <SelectTrigger id="prov" className="mt-2">
                <SelectValue placeholder="Select province" />
              </SelectTrigger>
              <SelectContent>
                {["National Capital District", "Morobe", "Western Highlands", "East New Britain", "Madang", "Eastern Highlands", "Other"].map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <FieldLabel htmlFor="wages">Weekly wage (Kina)</FieldLabel>
            <Input id="wages" inputMode="numeric" placeholder="e.g. 650" className="mt-2" />
          </div>
        </div>
      </fieldset>

      <hr className="my-7 border-border" />

      {/* Injury */}
      <fieldset className="space-y-5">
        <legend className="flex items-center gap-2 font-serif text-lg font-bold text-primary">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-sm text-white">3</span>
          Injury details
        </legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <FieldLabel htmlFor="idate" required>Date of injury</FieldLabel>
            <Input id="idate" type="date" required className="mt-2" />
          </div>
          <div>
            <FieldLabel htmlFor="itype">Type of injury</FieldLabel>
            <Select>
              <SelectTrigger id="itype" className="mt-2">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {["Fracture / broken bone", "Cut or laceration", "Burn", "Manual handling / back injury", "Crush injury", "Occupational illness", "Other"].map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <FieldLabel htmlFor="desc" required>Describe what happened</FieldLabel>
          <Textarea id="desc" required rows={4} placeholder="Briefly describe the accident, how it occurred and the injury sustained." className="mt-2" />
        </div>
      </fieldset>

      <hr className="my-7 border-border" />

      {/* Documents */}
      <fieldset className="space-y-4">
        <legend className="flex items-center gap-2 font-serif text-lg font-bold text-primary">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-sm text-white">4</span>
          Supporting documents
        </legend>
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            addFiles(e.dataTransfer.files);
          }}
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-secondary/40 px-6 py-9 text-center transition-colors hover:border-gold hover:bg-secondary"
        >
          <span className="grid h-12 w-12 place-items-center rounded-full bg-primary/8 text-primary">
            <Upload className="h-5 w-5" />
          </span>
          <p className="text-sm font-medium text-foreground">
            Drop files here or click to upload
          </p>
          <p className="text-xs text-muted-foreground">
            Medical report, ID, payslip, photos · PDF/JPG/PNG · up to 8 files
          </p>
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => addFiles(e.target.files)}
          />
        </div>
        {files.length > 0 && (
          <ul className="space-y-2">
            {files.map((f, i) => (
              <li key={i} className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2">
                <FileIcon className="h-4 w-4 shrink-0 text-gold" />
                <span className="flex-1 truncate text-sm text-foreground">{f.name}</span>
                <span className="text-xs text-muted-foreground">{(f.size / 1024).toFixed(0)} KB</span>
                <button
                  type="button"
                  onClick={() => setFiles((p) => p.filter((_, idx) => idx !== i))}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label={`Remove ${f.name}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Lock className="h-3.5 w-3.5 text-success" />
          All uploads are encrypted in transit and at rest.
        </p>
      </fieldset>

      <hr className="my-7 border-border" />

      <Captcha onValidChange={setCaptchaOk} />

      <label className="mt-5 flex items-start gap-3 rounded-lg bg-secondary/50 p-4">
        <Checkbox
          checked={agree}
          onCheckedChange={(v) => setAgree(Boolean(v))}
          className="mt-0.5"
        />
        <span className="text-sm text-muted-foreground">
          I declare that the information provided is true and correct to the best
          of my knowledge, and I consent to the OWC processing this claim under
          the Workers Compensation Act 1978.
        </span>
      </label>

      <Button type="submit" size="lg" className="mt-6 w-full" disabled={submitting}>
        {submitting ? (
          <>
            <Loader2 className="animate-spin" /> Submitting securely…
          </>
        ) : (
          <>
            <Lock /> Submit claim securely
          </>
        )}
      </Button>
    </form>
  );
}
