import type { ContentSource } from "@/lib/env";

export class DrupalContentUnavailableError extends Error {
  constructor() {
    super("OWC public content service is temporarily unavailable.");
    this.name = "DrupalContentUnavailableError";
  }
}

export function selectAuthoritativeContent<T>(
  mode: ContentSource,
  drupal: T[] | null,
  legacy: T[],
): T[] {
  if (mode === "supabase") return legacy;

  if (mode === "drupal") {
    if (drupal === null) throw new DrupalContentUnavailableError();
    return drupal;
  }

  return drupal?.length ? drupal : legacy;
}
