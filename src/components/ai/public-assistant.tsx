"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, Mic, Send, Square, Volume2, X } from "lucide-react";

type Locale = "en" | "tpi";
type Turn = { role: "user" | "assistant"; text: string };

type ReferralPreview = {
  category: string;
  priority: string;
  escalation: boolean;
  routeId: string;
  routeLabel: string;
  fallbackUsed: boolean;
  requiresConfirmation: boolean;
};

type AssistantResponse = {
  ok: boolean;
  answer: string;
  locale: Locale;
  uncertain: boolean;
  verificationRequired: boolean;
  referralSuggested: boolean;
  safetyRefusal: boolean;
  aiSource: string;
  productionConnected: boolean;
  demonstration: boolean;
  referralPreview: ReferralPreview | null;
};

type ReferralResponse = {
  ok: boolean;
  reference: string;
  confirmedAt: string;
  summary: string;
  route: {
    category: string;
    priority: string;
    escalation: boolean;
    id: string;
    label: string;
    fallbackUsed: boolean;
  };
  notification: {
    status: string;
    source: string;
    productionConnected: boolean;
    deliveryNotice: string | null;
  };
  demonstration: boolean;
};

type SpeechRecognitionResultLike = {
  0: { transcript: string };
};

type SpeechRecognitionEventLike = {
  results: ArrayLike<SpeechRecognitionResultLike>;
};

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;
type SpeechWindow = Window & {
  SpeechRecognition?: SpeechRecognitionCtor;
  webkitSpeechRecognition?: SpeechRecognitionCtor;
};

const DRAFT_KEY = "owc-public-ai-draft";

const TEXT = {
  en: {
    greeting:
      "Hello. I can explain OWC processes, forms and general claim guidance. I cannot reveal private claim information unless you use an approved verification process.",
    placeholder: "Ask about claims, documents, payments or employer obligations…",
    unavailable:
      "The OWC AI assistant is temporarily unavailable. Nothing was sent. Please use the normal Contact OWC service.",
  },
  tpi: {
    greeting:
      "Halo. Mi ken helpim yu long save long wok bilong OWC, ol fom na general claim guidance. Mi no inap givim private claim information sapos i no gat approved verification.",
    placeholder: "Askim long claim, documents, payment o wok bilong employer…",
    unavailable:
      "OWC AI assistant i no stap gut nau. Nothing was sent. Plis yusim normal Contact OWC service.",
  },
} satisfies Record<Locale, { greeting: string; placeholder: string; unavailable: string }>;

function newIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `owc-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function safeJson<T>(response: Response): Promise<T | null> {
  return response.json().catch(() => null) as Promise<T | null>;
}

export default function PublicAssistant() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [locale, setLocale] = useState<Locale>("en");
  const [draft, setDraft] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [referral, setReferral] = useState<{
    message: string;
    preview: ReferralPreview;
    idempotencyKey: string;
  } | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredContact, setPreferredContact] = useState<"email" | "phone" | "either">("either");
  const [sendingReferral, setSendingReferral] = useState(false);
  const [referralResult, setReferralResult] = useState<ReferralResponse | null>(null);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(DRAFT_KEY);
    if (stored) setDraft(stored.slice(0, 4000));

    const speechWindow = window as SpeechWindow;
    const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    setVoiceSupported(Boolean(Recognition));
  }, []);

  useEffect(() => {
    if (draft) sessionStorage.setItem(DRAFT_KEY, draft);
    else sessionStorage.removeItem(DRAFT_KEY);
  }, [draft]);

  const proposedOfficerSummary = useMemo(() => {
    if (!referral) return "";
    const lines = [
      `Enquiry category: ${referral.preview.category}`,
      `Priority: ${referral.preview.priority}`,
      `Recommended route: ${referral.preview.routeLabel}`,
      `Enquirer: ${name || "—"}`,
      `Preferred contact: ${preferredContact}`,
    ];
    if (email.trim()) lines.push(`Contact email: ${email.trim()}`);
    if (phone.trim()) lines.push(`Contact phone: ${phone.trim()}`);
    lines.push(`Issue summary: ${referral.message}`);
    return lines.join("\n");
  }, [email, name, phone, preferredContact, referral]);

  const canConfirm = Boolean(referral && name.trim().length >= 2 && (email.trim() || phone.trim()));

  if (pathname.startsWith("/admin") || pathname.startsWith("/management")) {
    return null;
  }

  async function sendQuestion() {
    const message = draft.trim();
    if (message.length < 2 || pending) return;

    setPending(true);
    setError(null);
    setReferral(null);
    setReferralResult(null);

    const prior = turns.slice(-10);
    setTurns((current) => [...current, { role: "user", text: message }]);
    setDraft("");

    try {
      const response = await fetch("/api/public/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          channel: "web",
          locale,
          conversation: prior,
        }),
      });
      const body = await safeJson<AssistantResponse & { error?: string }>(response);
      if (!response.ok || !body?.answer) {
        throw new Error(body?.error || "Assistant unavailable");
      }

      setLocale(body.locale);
      setTurns((current) => [...current, { role: "assistant", text: body.answer }]);
      if (body.referralSuggested && body.referralPreview && !body.safetyRefusal) {
        setReferral({
          message,
          preview: body.referralPreview,
          idempotencyKey: newIdempotencyKey(),
        });
      }
    } catch {
      setError(TEXT[locale].unavailable);
      setTurns((current) => [...current, { role: "assistant", text: TEXT[locale].unavailable }]);
    } finally {
      setPending(false);
    }
  }

  async function confirmReferral() {
    if (!referral || !canConfirm || sendingReferral) return;
    setSendingReferral(true);
    setError(null);

    try {
      const response = await fetch("/api/public/assistant/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confirmed: true,
          message: referral.message,
          channel: "web",
          locale,
          contact: {
            name: name.trim(),
            ...(email.trim() ? { email: email.trim() } : {}),
            ...(phone.trim() ? { phone: phone.trim() } : {}),
          },
          preferredContact,
          idempotencyKey: referral.idempotencyKey,
        }),
      });
      const body = await safeJson<ReferralResponse & { error?: string }>(response);
      if (!response.ok || !body?.ok) {
        throw new Error(body?.error || "Referral unavailable");
      }
      setReferralResult(body);
      setReferral(null);
    } catch {
      setError("OWC referral is temporarily unavailable. Nothing was sent. Please use the normal Contact OWC service.");
    } finally {
      setSendingReferral(false);
    }
  }

  function startVoiceInput() {
    if (!voiceSupported || listening) return;
    const speechWindow = window as SpeechWindow;
    const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!Recognition) return;

    const recognition = new Recognition();
    recognition.lang = locale === "tpi" ? "tpi-PG" : "en-PG";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim();
      if (transcript) setDraft((current) => `${current}${current ? " " : ""}${transcript}`.slice(0, 4000));
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  }

  function stopVoiceInput() {
    recognitionRef.current?.stop();
    setListening(false);
  }

  function readLastAnswer() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const lastAnswer = [...turns].reverse().find((turn) => turn.role === "assistant")?.text;
    if (!lastAnswer) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(lastAnswer);
    utterance.lang = locale === "tpi" ? "en-PG" : "en-PG";
    window.speechSynthesis.speak(utterance);
  }

  return (
    <>
      {open ? (
        <section
          role="dialog"
          aria-label="OWC public AI assistant"
          className="fixed bottom-4 right-4 z-50 flex max-h-[82vh] w-[calc(100vw-2rem)] max-w-md flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        >
          <header className="flex items-center justify-between bg-slate-900 px-4 py-3 text-white">
            <div>
              <p className="font-semibold">Ask OWC Assistant</p>
              <p className="text-xs text-slate-200">General guidance • English + Tok Pisin</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close OWC Assistant"
              className="rounded-lg p-2 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white"
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          <div className="border-b border-slate-200 px-4 py-3">
            <div className="flex gap-2" aria-label="Assistant language">
              <button
                type="button"
                onClick={() => setLocale("en")}
                className={`rounded-full px-3 py-1 text-sm ${locale === "en" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLocale("tpi")}
                className={`rounded-full px-3 py-1 text-sm ${locale === "tpi" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}
              >
                Tok Pisin
              </button>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-4 py-4 text-sm">
            {turns.length === 0 ? (
              <div className="rounded-xl bg-white p-3 text-slate-700 shadow-sm">{TEXT[locale].greeting}</div>
            ) : null}

            {turns.map((turn, index) => (
              <div
                key={`${turn.role}-${index}`}
                className={`max-w-[90%] whitespace-pre-wrap rounded-xl px-3 py-2 ${
                  turn.role === "user"
                    ? "ml-auto bg-slate-900 text-white"
                    : "mr-auto border border-slate-200 bg-white text-slate-800"
                }`}
              >
                {turn.text}
              </div>
            ))}

            {turns.some((turn) => turn.role === "assistant") ? (
              <button
                type="button"
                onClick={readLastAnswer}
                aria-label="Read last answer aloud"
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600"
              >
                <Volume2 className="h-3.5 w-3.5" /> Read aloud
              </button>
            ) : null}

            {referral ? (
              <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-slate-800">
                <p className="font-semibold">Review before sending</p>
                <p className="mt-1 text-xs text-slate-600">
                  Nothing is sent until you press Confirm &amp; Send. OWC will format these confirmed facts into a professional internal summary.
                </p>
                <div className="mt-3 grid gap-2">
                  <label className="text-xs font-medium">
                    Your name
                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      maxLength={160}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="text-xs font-medium">
                    Email
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="text-xs font-medium">
                    Phone
                    <input
                      type="tel"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="text-xs font-medium">
                    Preferred contact
                    <select
                      value={preferredContact}
                      onChange={(event) => setPreferredContact(event.target.value as "email" | "phone" | "either")}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                    >
                      <option value="either">Either</option>
                      <option value="email">Email</option>
                      <option value="phone">Phone</option>
                    </select>
                  </label>
                </div>
                <pre className="mt-3 max-h-40 overflow-auto whitespace-pre-wrap rounded-lg bg-white p-2 text-xs text-slate-700">
                  {proposedOfficerSummary}
                </pre>
                <button
                  type="button"
                  disabled={!canConfirm || sendingReferral}
                  onClick={confirmReferral}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  {sendingReferral ? "Sending…" : "Confirm & Send"}
                </button>
              </div>
            ) : null}

            {referralResult ? (
              <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-slate-800">
                <p className="font-semibold">Enquiry recorded</p>
                <p className="mt-1">Reference: {referralResult.reference}</p>
                <p className="mt-1 text-xs">Routed to: {referralResult.route.label}</p>
                {referralResult.notification.source === "reference" ? (
                  <p className="mt-2 rounded-lg bg-amber-100 p-2 text-xs font-medium text-amber-900">
                    Demonstration only — synthetic routing; no real message was sent and no officer was contacted.
                  </p>
                ) : referralResult.notification.status === "sent" && referralResult.notification.productionConnected ? (
                  <p className="mt-2 text-xs text-emerald-800">The configured OWC notification gateway accepted the referral.</p>
                ) : (
                  <p className="mt-2 text-xs text-slate-600">
                    {referralResult.notification.deliveryNotice ?? "The enquiry is recorded for OWC follow-up."}
                  </p>
                )}
              </div>
            ) : null}

            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-800">
                {error} <a className="underline" href="/contact">Contact OWC</a>
              </div>
            ) : null}
          </div>

          <footer className="border-t border-slate-200 bg-white p-3">
            <p className="mb-2 text-[11px] text-slate-500">
              Do not paste banking details or medical evidence into chat. Use the secure evidence workflow for documents.
            </p>
            <div className="flex items-end gap-2">
              <textarea
                aria-label="Message to OWC Assistant"
                value={draft}
                onChange={(event) => setDraft(event.target.value.slice(0, 4000))}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void sendQuestion();
                  }
                }}
                placeholder={TEXT[locale].placeholder}
                rows={2}
                className="min-h-12 flex-1 resize-none rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-slate-600 focus:outline-none"
              />
              <button
                type="button"
                onClick={listening ? stopVoiceInput : startVoiceInput}
                disabled={!voiceSupported}
                aria-label="Voice input"
                title={voiceSupported ? "Voice input" : "Voice input is not supported by this browser; type your message instead."}
                className="rounded-xl border border-slate-300 p-3 text-slate-700 disabled:opacity-40"
              >
                {listening ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={() => void sendQuestion()}
                disabled={pending || draft.trim().length < 2}
                aria-label="Send message"
                className="rounded-xl bg-slate-900 p-3 text-white disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </footer>
        </section>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ask OWC Assistant"
        className="fixed bottom-4 right-4 z-40 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-3 font-semibold text-white shadow-xl hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="hidden sm:inline">Ask OWC Assistant</span>
      </button>
    </>
  );
}
