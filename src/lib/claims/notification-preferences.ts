import { z } from "zod";

const optionalEmail = z.union([z.literal(""), z.string().email()]);
const optionalMobile = z.union([
  z.literal(""),
  z.string().regex(/^\+?[0-9][0-9\s-]{6,18}$/),
]);

export const claimNotificationPreferenceSchema = z
  .object({
    email: optionalEmail.default(""),
    mobile: optionalMobile.default(""),
    preferredChannel: z.enum(["email", "sms"]),
    enabled: z.boolean(),
  })
  .superRefine((value, ctx) => {
    if (!value.enabled) return;
    if (value.preferredChannel === "email" && !value.email) {
      ctx.addIssue({
        code: "custom",
        path: ["email"],
        message: "Email is required when email is the preferred channel",
      });
    }
    if (value.preferredChannel === "sms" && !value.mobile) {
      ctx.addIssue({
        code: "custom",
        path: ["mobile"],
        message: "Mobile number is required when SMS is the preferred channel",
      });
    }
  });

export type ClaimNotificationPreferenceInput = z.infer<
  typeof claimNotificationPreferenceSchema
>;
