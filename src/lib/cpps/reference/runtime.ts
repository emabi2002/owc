import { createReferenceCppsService } from "./service";

/**
 * Process-local reference CPPS used only in explicitly enabled demo/UAT mode.
 * It is deliberately not durable storage and must never be treated as the real
 * OWC CPPS database.
 */
export const referenceCppsService = createReferenceCppsService();
