import { z } from "zod";

const nonEmptyCode = z.string().trim().min(1).max(100);

export const nidSchema = z.object({ nid: nonEmptyCode });
export const employerSchema = z.object({ registrationNo: nonEmptyCode });
export const ircSchema = z.object({ tin: nonEmptyCode });
export const employmentSchema = z.object({ employeeNo: nonEmptyCode });
export const medicalSchema = z.object({ certificateNo: nonEmptyCode });
export const insuranceSchema = z.object({ policyNo: nonEmptyCode });
export const bankAccountSchema = z.object({ accountReference: nonEmptyCode });
export const claimProcessSchema = z.object({
  nid: nonEmptyCode,
  registrationNo: nonEmptyCode,
  tin: nonEmptyCode,
  employeeNo: nonEmptyCode,
  certificateNo: nonEmptyCode,
  policyNo: nonEmptyCode,
  accountReference: nonEmptyCode,
});
export const bankPaymentSchema = z.object({
  idempotencyKey: nonEmptyCode,
  claimReference: nonEmptyCode,
  accountReference: nonEmptyCode,
  amountPgk: z.number().positive().max(10_000_000),
});
export const notificationSchema = z.object({
  channel: z.enum(["email", "sms", "in_app"]),
  recipient: z.string().trim().min(1).max(200),
  event: nonEmptyCode,
  message: z.string().trim().min(1).max(500),
});

export function parseSandboxBody<T>(schema: z.ZodType<T>, value: unknown) {
  const result = schema.safeParse(value);
  return result.success
    ? { ok: true as const, data: result.data }
    : { ok: false as const, issues: result.error.issues };
}
