import { z } from "zod";

export const publicConversationTurnSchema = z.object({
  role: z.enum(["user", "assistant"]),
  text: z.string().trim().min(1).max(2000),
}).strict();

export const publicAssistantRequestSchema = z.object({
  message: z.string().trim().min(2).max(4000),
  channel: z.enum(["web", "android", "ios", "tablet"]),
  locale: z.enum(["en", "tpi"]).optional(),
  conversation: z.array(publicConversationTurnSchema).max(12).optional(),
}).strict();

export const publicReferralContactSchema = z.object({
  name: z.string().trim().min(2).max(160),
  email: z.string().email().max(254).optional(),
  phone: z.string().trim().min(7).max(30).optional(),
}).refine((value) => Boolean(value.email || value.phone), {
  message: "An email address or phone number is required for referral follow-up.",
});
