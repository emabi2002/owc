import type { PublicAssistantChannel, PublicAssistantLocale } from "@/lib/ai/public-assistant.types";
import type { EnquiryCategory, EnquiryPriority } from "./routing";

export type EnquiryNotificationStatus = "pending" | "sent" | "queued" | "failed" | "suppressed";

export type ConfirmedEnquiryInput = {
  confirmed: boolean;
  idempotencyKey?: string;
  name: string;
  email: string | null;
  phone: string | null;
  category: EnquiryCategory;
  subject: string | null;
  message: string;
  sourceChannel: PublicAssistantChannel;
  language: PublicAssistantLocale;
  linkedClaimReference: string | null;
  aiSummary: string;
  routeDestination: string;
  priority: EnquiryPriority;
  notificationStatus: EnquiryNotificationStatus;
};

export type PersistedEnquiryRecord = ConfirmedEnquiryInput & {
  id?: string;
  reference: string;
  confirmedAt: string;
  status: "new";
  productionConnected: boolean;
  synthetic: boolean;
};
