"use client";

import { useState } from "react";
import { Send, CheckCircle2, Loader2 } from "lucide-react";
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
import { Captcha } from "@/components/captcha";
import { ENQUIRY_CATEGORIES } from "@/lib/site-data";

export function ContactForm() {
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [category, setCategory] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState<string | null>(null);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!category) {
      toast.error("Please select an enquiry category.");
      return;
    }
    if (!captchaToken) {
      toast.error("Please complete the security check.");
      return;
    }

    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      category,
      subject: String(fd.get("subject") ?? ""),
      message: String(fd.get("message") ?? ""),
      captchaToken,
    };

    setSubmitting(true);
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setReference(data.reference ?? "ENQ");
      toast.success("Your enquiry has been sent.");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (reference) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-success/30 bg-success/5 p-10 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-success text-white">
          <CheckCircle2 className="h-8 w-8" />
        </span>
        <h3 className="mt-5 font-serif text-2xl font-bold text-primary">
          Thank you for your enquiry
        </h3>
        <p className="mt-2 max-w-md text-muted-foreground">
          We have received your message and a member of our team will respond
          within 2–3 business days. For urgent matters, please call our office.
        </p>
        <p className="mt-4 rounded-lg border border-border bg-card px-4 py-2 text-sm">
          Reference: <span className="font-mono font-bold text-primary">{reference}</span>
        </p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => {
            setReference(null);
            setCaptchaToken(null);
            setCategory("");
          }}
        >
          Send another enquiry
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:p-8">
      <h3 className="font-serif text-xl font-bold text-primary">Send us an enquiry</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Complete the form and our team will respond as soon as possible.
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Full name <span className="text-destructive">*</span></Label>
          <Input id="name" name="name" required placeholder="Your name" className="mt-2" autoComplete="name" />
        </div>
        <div>
          <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
          <Input id="email" name="email" type="email" required placeholder="you@example.com" className="mt-2" autoComplete="email" />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" placeholder="+675 …" className="mt-2" autoComplete="tel" />
        </div>
        <div>
          <Label htmlFor="category">Enquiry category <span className="text-destructive">*</span></Label>
          <Select required value={category} onValueChange={setCategory}>
            <SelectTrigger id="category" className="mt-2">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {ENQUIRY_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-5">
        <Label htmlFor="subject">Subject</Label>
        <Input id="subject" name="subject" placeholder="Brief summary of your enquiry" className="mt-2" />
      </div>

      <div className="mt-5">
        <Label htmlFor="message">Message <span className="text-destructive">*</span></Label>
        <Textarea id="message" name="message" required rows={5} placeholder="How can we help you?" className="mt-2" />
      </div>

      <div className="mt-6">
        <Captcha onToken={setCaptchaToken} />
      </div>

      <Button type="submit" size="lg" className="mt-6 w-full" disabled={submitting}>
        {submitting ? (
          <><Loader2 className="animate-spin" /> Sending…</>
        ) : (
          <><Send /> Send enquiry</>
        )}
      </Button>
    </form>
  );
}
