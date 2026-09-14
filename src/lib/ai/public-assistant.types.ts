export const PUBLIC_ASSISTANT_CHANNELS = ["web", "android", "ios", "tablet"] as const;
export type PublicAssistantChannel = (typeof PUBLIC_ASSISTANT_CHANNELS)[number];

export const PUBLIC_ASSISTANT_LOCALES = ["en", "tpi"] as const;
export type PublicAssistantLocale = (typeof PUBLIC_ASSISTANT_LOCALES)[number];

export type PublicConversationTurn = {
  role: "user" | "assistant";
  text: string;
};

export type PublicAssistantRequest = {
  message: string;
  channel: PublicAssistantChannel;
  locale?: PublicAssistantLocale;
  conversation?: PublicConversationTurn[];
};

export type PublicKnowledgeItem = {
  id: string;
  sourceType: "faq" | "form" | "guidance";
  sourceId: string;
  title: string;
  content: string;
  category: string;
  visibility: "public";
};

export type PublicKnowledgeMatch = {
  uncertain: boolean;
  items: PublicKnowledgeItem[];
};

export type PublicAssistantResponse = {
  answer: string;
  locale: PublicAssistantLocale;
  uncertain: boolean;
  verificationRequired: boolean;
  referralSuggested: boolean;
  safetyRefusal: boolean;
  knowledgeSourceIds: string[];
  aiSource: "deterministic" | "reference" | "live" | "unavailable";
  productionConnected: boolean;
};
