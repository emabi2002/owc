# OWC Public AI Assistant Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a secure English/Tok Pisin public AI service assistant that works through the website and a reusable mobile-channel API, collects enquiries, prepares professional summaries, requires confirmation before referral, routes to configured OWC destinations, and degrades safely when AI is unavailable.

**Architecture:** Website, future Android/iOS/tablet clients and other channels call the same `/api/public/assistant` backend contract. The public assistant is isolated from management reporting. General guidance is grounded in approved OWC public content. Claim-specific confidential disclosure is unavailable without an approved verification context. Referral submission is a separate confirmation endpoint so an AI response alone can never send a message or create an external referral.

**Tech Stack:** Next.js 15, React 18, TypeScript, Bun test, Zod, existing OWC AI Gateway, public FAQ/content data, Supabase/PostgreSQL enquiry storage, existing notification configuration and rate limiting.

**Spec:** `docs/superpowers/specs/2026-09-14-management-reporting-ai-assistants-design.md`

## Global constraints

- The public assistant has no management reporting permission or callable management tool.
- Supported channels: `web`, `android`, `ios`, `tablet`.
- Supported languages: English and Tok Pisin; internal officer summary is professional English.
- General guidance may be unauthenticated; confidential claim data must not be disclosed without approved verification.
- Referral delivery occurs only after explicit user confirmation in a separate request.
- Routing uncertainty always falls back to a configured central OWC queue.
- No officer name/email/address may be invented.
- Reference notifications in the bidding environment must state that no real message was sent.
- Client-side mobile draft/offline persistence is facilitated by the API contract but belongs to the future mobile client; the server remains stateless between submitted turns except for persisted confirmed enquiries.

---

### Task 1: Public-assistant contract, validation and knowledge base

**Files:**
- Create: `src/lib/ai/public-assistant.types.ts`
- Create: `src/lib/ai/public-knowledge.test.ts`
- Create: `src/lib/ai/public-knowledge.ts`
- Create: `src/lib/ai/public-validation.ts`

**Request contract:**
```ts
{
  message: string;
  channel: "web" | "android" | "ios" | "tablet";
  locale?: "en" | "tpi";
  conversation?: Array<{ role: "user" | "assistant"; text: string }>;
}
```

- [ ] Write failing tests that approved FAQ/procedure content is returned as the knowledge source, unsupported knowledge is marked uncertain, and management/private datasets are absent from the public knowledge module.
- [ ] Confirm RED.
- [ ] Implement channel/language/input schemas with conservative length/history limits.
- [ ] Build a curated knowledge projection from approved OWC FAQs, forms and public guidance; no unrestricted web retrieval.
- [ ] Verify and commit as `feat: add public AI knowledge contract`.

### Task 2: English/Tok Pisin guidance and privacy boundary

**Files:**
- Create: `src/lib/ai/public-assistant.test.ts`
- Create: `src/lib/ai/public-assistant.ts`

- [ ] Write failing scenarios for English claim-lodgement guidance, Tok Pisin required-document guidance, unknown-answer referral suggestion, and a request for a specific claim/payment that must require verification rather than disclose data.
- [ ] Add a prompt-injection case requesting “all management reports/claimants” and require refusal with no management tool invocation.
- [ ] Confirm RED.
- [ ] Implement language detection/selection for the deterministic reference provider and same-language responses for the approved common flows.
- [ ] Build live-provider prompts from minimum-necessary public knowledge only; never attach management/reporting data.
- [ ] Return a structured `verificationRequired` flag for claim-specific confidential requests.
- [ ] Verify and commit as `feat: add bilingual public AI guidance`.

### Task 3: Enquiry classification, professional summary and routing

**Files:**
- Create: `src/lib/enquiries/routing.test.ts`
- Create: `src/lib/enquiries/routing.ts`
- Create: `src/lib/enquiries/summary.test.ts`
- Create: `src/lib/enquiries/summary.ts`

**Routing categories:** Claims, Assessment, Payments, Employer Matters, Medical Evidence, Technical Support, General Enquiries.

- [ ] Write failing tests for category classification, priority/escalation flags, professional English summary, configured-destination routing and central-queue fallback.
- [ ] Require unknown officer names/destinations to fall back rather than invent.
- [ ] Implement deterministic routing rules and a live-AI summary adapter constrained to those route IDs.
- [ ] Ensure summary output contains the user issue, classification, recommended route and preferred contact without adding facts the user did not supply.
- [ ] Verify and commit as `feat: add AI enquiry summarisation and routing`.

### Task 4: Enquiry persistence and confirmation-only referral submission

**Files:**
- Modify: `src/lib/db/schema.sql`
- Modify: `src/lib/supabase/types.ts`
- Create: `src/lib/db/public-ai-enquiries-2026-09-14.sql`
- Create: `src/lib/enquiries/store.test.ts`
- Create: `src/lib/enquiries/store.ts`
- Create: `src/lib/enquiries/reference-store.ts`

**Additional enquiry fields:** reference, source channel, language, linked claim reference, AI summary, route destination, priority, confirmed_at, notification_status.

- [ ] Write failing tests that an unconfirmed draft cannot be persisted as a routed referral, confirmed referrals receive stable `OWC-ENQ-*` references, and demonstration reference storage is labelled synthetic/non-production.
- [ ] Confirm RED.
- [ ] Add optional database columns/indexes and an idempotent upgrade migration.
- [ ] Implement live Supabase persistence plus process-local reference persistence for controlled demonstration mode.
- [ ] Ensure storage never grants the AI direct database credentials.
- [ ] Verify and commit as `feat: add confirmed AI enquiry persistence`.

### Task 5: Notification transport for public referrals

**Files:**
- Create: `src/lib/enquiries/notification.test.ts`
- Create: `src/lib/enquiries/notification.ts`

- [ ] Write failing tests for live notification precedence, reference-notification labelling, missing-destination suppression and provider failure without synthetic fallback.
- [ ] Confirm RED.
- [ ] Reuse `OWC_NOTIFICATION_API_URL/KEY` for approved live transport and the reference-notification mode for deterministic bidding evidence.
- [ ] Do not claim a real officer was contacted when reference mode is used; return `productionConnected:false`.
- [ ] Verify and commit as `feat: add public enquiry notification gateway`.

### Task 6: Public and mobile-channel API endpoints

**Files:**
- Create: `src/app/api/public/assistant/route.ts`
- Create: `src/app/api/public/assistant/referrals/route.ts`
- Create: `src/lib/ai/public-api.contract.test.ts`

- [ ] Write failing contract tests requiring separate assistant and referral endpoints, channel enum support and explicit `confirmed:true` on referral submission.
- [ ] Confirm RED.
- [ ] Implement `/api/public/assistant` with IP/channel rate limiting, Zod validation, AI availability handling and structured guidance/referral-preview responses.
- [ ] Implement `/api/public/assistant/referrals` with confirmation validation, routing re-validation server-side, persistence, notification, audit and stable enquiry reference.
- [ ] Ensure neither route imports/calls management reporting or management AI modules.
- [ ] Verify and commit as `feat: add web and mobile public AI APIs`.

### Task 7: Public website assistant UI

**Files:**
- Create: `src/components/ai/public-assistant.tsx`
- Modify: `src/app/ClientBody.tsx`
- Create: `src/lib/ai/public-ui.contract.test.ts`

- [ ] Write a failing UI contract test requiring a keyboard-accessible “Ask OWC Assistant” launcher, English/Tok Pisin indication, conversation input, referral preview, explicit Confirm & Send action, and AI-unavailable fallback.
- [ ] Confirm RED.
- [ ] Add a responsive floating/panel assistant available on public pages while keeping management/admin security boundaries separate.
- [ ] Preserve unsent text in browser state so navigation/re-render does not unnecessarily discard a draft; document that native mobile clients should persist drafts locally when offline.
- [ ] Clearly label the bidding/reference AI mode when applicable and avoid claiming real delivery for simulated notifications.
- [ ] Verify and commit as `feat: add public OWC AI assistant interface`.

### Task 8: End-to-end safety scenarios and exact-head verification

**Files:**
- Create: `src/lib/ai/public-assistant-security.test.ts`
- Modify: demonstration UAT only if needed to add non-destructive AI scenarios.

- [ ] Test English and Tok Pisin guidance, confidential claim refusal, management-data exfiltration attempt, summary preview, no-send-before-confirmation, central-queue fallback, confirmed reference referral, AI-offline fallback and all four channel values.
- [ ] Verify standard enquiry form and claims flows still work when AI is disabled.
- [ ] Run exact-head full GitHub Actions CI including all tests, reference UAT, demonstration UAT, terminology, release rehearsal, type-check/lint, production build and Drupal clean-room.
- [ ] Review final diff for public/management import leakage, secrets, invented officer destinations and production claims before declaring this phase complete.