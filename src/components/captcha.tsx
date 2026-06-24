"use client";

import { useEffect, useId, useState } from "react";
import { RefreshCw, ShieldCheck } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function Captcha({
  onValidChange,
  className,
}: {
  onValidChange?: (valid: boolean) => void;
  className?: string;
}) {
  const id = useId();
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);
  const [answer, setAnswer] = useState("");

  const regen = () => {
    setA(Math.floor(Math.random() * 8) + 1);
    setB(Math.floor(Math.random() * 8) + 1);
    setAnswer("");
  };

  // initialise on client only (avoids hydration mismatch)
  useEffect(() => {
    regen();
  }, []);

  const valid = answer !== "" && Number(answer) === a + b;

  useEffect(() => {
    onValidChange?.(valid);
  }, [valid, onValidChange]);

  return (
    <div className={className}>
      <Label htmlFor={id} className="flex items-center gap-1.5">
        <ShieldCheck className="h-3.5 w-3.5 text-gold" />
        Security check <span className="text-destructive">*</span>
      </Label>
      <div className="mt-2 flex items-center gap-3">
        <div className="flex select-none items-center gap-1.5 rounded-md border border-border bg-secondary px-3 py-2 font-serif text-base font-bold tracking-wide text-primary">
          <span>{a}</span>
          <span className="text-gold">+</span>
          <span>{b}</span>
          <span className="text-muted-foreground">=</span>
        </div>
        <Input
          id={id}
          inputMode="numeric"
          value={answer}
          onChange={(e) => setAnswer(e.target.value.replace(/[^0-9]/g, ""))}
          placeholder="Answer"
          aria-invalid={answer !== "" && !valid}
          className={cn(
            "w-28",
            valid && "border-success ring-1 ring-success/40",
            answer !== "" && !valid && "border-destructive"
          )}
        />
        <button
          type="button"
          onClick={regen}
          className="grid h-10 w-10 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="Refresh security check"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
        {valid && (
          <span className="hidden items-center gap-1 text-sm font-medium text-success sm:flex">
            <ShieldCheck className="h-4 w-4" /> Verified
          </span>
        )}
      </div>
    </div>
  );
}
