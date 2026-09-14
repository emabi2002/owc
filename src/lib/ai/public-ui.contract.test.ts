import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const read = (path: string) => readFileSync(join(process.cwd(), path), "utf8");

describe("OWC public AI assistant UI contract", () => {
  test("mounts the assistant globally from ClientBody", () => {
    const body = read("src/app/ClientBody.tsx");
    expect(body).toContain("PublicAssistant");
    expect(body).toContain("<PublicAssistant");
  });

  test("provides bilingual chat and explicit confirmed referral workflow", () => {
    const ui = read("src/components/ai/public-assistant.tsx");
    expect(ui).toContain("Ask OWC Assistant");
    expect(ui).toContain("English");
    expect(ui).toContain("Tok Pisin");
    expect(ui).toContain("/api/public/assistant");
    expect(ui).toContain("/api/public/assistant/referrals");
    expect(ui).toContain("Confirm & Send");
    expect(ui).toContain("confirmed: true");
  });

  test("preserves unsent drafts and offers optional browser voice input with text fallback", () => {
    const ui = read("src/components/ai/public-assistant.tsx");
    expect(ui).toContain("sessionStorage");
    expect(ui).toContain("SpeechRecognition");
    expect(ui).toContain("webkitSpeechRecognition");
    expect(ui).toContain("Voice input");
    expect(ui).toContain("textarea");
  });

  test("labels synthetic demonstration referrals and handles AI/network unavailability safely", () => {
    const ui = read("src/components/ai/public-assistant.tsx");
    expect(ui).toContain('notification.source === "reference"');
    expect(ui).toContain("Demonstration only");
    expect(ui).toContain("temporarily unavailable");
    expect(ui).toContain("Nothing was sent");
  });

  test("is responsive and keyboard-accessible", () => {
    const ui = read("src/components/ai/public-assistant.tsx");
    expect(ui).toContain("aria-label");
    expect(ui).toContain("role=\"dialog\"");
    expect(ui).toContain("max-w-md");
    expect(ui).toContain("w-[calc(100vw-2rem)]");
  });
});
