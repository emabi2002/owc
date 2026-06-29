/**
 * Input validation & sanitisation (OWASP A03: Injection).
 *
 * All public form input is validated with Zod and plain-text fields are
 * sanitised to neutralise control characters and naive HTML/script injection
 * before storage or forwarding to CPPS.
 */
import { z } from "zod";

/** Neutralise control chars and angle brackets in free-text fields. */
export function sanitizeText(input: string): string {
  return input
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/[<>]/g, "")
    .replace(/\s{3,}/g, "  ")
    .trim();
}

const emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const email = z.string().trim().min(3).max(160).regex(emailRe, "Invalid email");
const optionalText = (max: number) => z.string().trim().max(max).optional();

export const enquirySchema = z.object({
  name: z.string().trim().min(2).max(120).transform(sanitizeText),
  email,
  phone: optionalText(40),
  category: z.string().trim().min(2).max(80),
  subject: optionalText(160),
  message: z.string().trim().min(5).max(4000).transform(sanitizeText),
  captchaToken: z.string().max(4000).optional(),
});
export type EnquiryInput = z.infer<typeof enquirySchema>;

export const claimTrackSchema = z.object({
  reference: z.string().trim().min(4).max(40),
  surname: optionalText(80),
});
export type ClaimTrackInput = z.infer<typeof claimTrackSchema>;

export const claimLodgeSchema = z.object({
  workerName: z.string().trim().min(2).max(120).transform(sanitizeText),
  workerPhone: optionalText(40),
  workerEmail: z.union([email, z.literal("")]).optional(),
  employerName: z.string().trim().min(2).max(160).transform(sanitizeText),
  province: optionalText(80),
  occupation: optionalText(120),
  weeklyWage: optionalText(20),
  injuryDate: z.string().trim().min(4).max(20),
  injuryType: optionalText(120),
  description: z.string().trim().min(5).max(4000).transform(sanitizeText),
  documentCount: z.number().int().min(0).max(20).optional(),
  declaration: z.boolean().optional(),
  captchaToken: z.string().max(4000).optional(),
});
export type ClaimLodgeInput = z.infer<typeof claimLodgeSchema>;

export const employerVerifySchema = z.object({
  query: z.string().trim().min(2).max(160).transform(sanitizeText),
});

export const injuryReportSchema = z.object({
  employerName: z.string().trim().min(2).max(160).transform(sanitizeText),
  employerContact: optionalText(120),
  workerName: z.string().trim().min(2).max(120).transform(sanitizeText),
  injuryDate: z.string().trim().min(4).max(20),
  injuryType: optionalText(120),
  description: z.string().trim().min(5).max(4000).transform(sanitizeText),
  captchaToken: z.string().max(4000).optional(),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(8).max(200),
  remember: z.boolean().optional(),
});

export const searchSchema = z.object({
  q: optionalText(200),
  type: optionalText(40),
  from: optionalText(20),
  to: optionalText(20),
});

/** Convenience: parse and return a flat error map for forms. */
export function parseOrErrors<T>(
  schema: z.ZodType<T>,
  data: unknown,
): { ok: true; data: T } | { ok: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);
  if (result.success) return { ok: true, data: result.data };
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = issue.path.join(".") || "_";
    if (!errors[key]) errors[key] = issue.message;
  }
  return { ok: false, errors };
}
