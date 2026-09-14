import { createReferenceCppsService } from "./service";

/**
 * Process-local reference CPPS used only in explicitly enabled demo/UAT mode.
 * It is deliberately not durable storage and must never be treated as the real
 * OWC CPPS database.
 */
export let referenceCppsService = createReferenceCppsService();

/** Restores a new empty process-local CPPS instance for repeatable demos/UAT. */
export function resetReferenceCppsRuntime(): void {
  referenceCppsService = createReferenceCppsService();
}
