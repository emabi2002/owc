export type IdentityMode = "live" | "demonstration";

/**
 * Identity selection is always explicit. Missing/unknown configuration remains
 * on the live provider and therefore fails closed when live auth is unavailable.
 */
export function getIdentityMode(
  configured = process.env.OWC_IDENTITY_MODE,
): IdentityMode {
  return configured === "demonstration" ? "demonstration" : "live";
}

export function isDemonstrationIdentityMode(
  configured = process.env.OWC_IDENTITY_MODE,
): boolean {
  return getIdentityMode(configured) === "demonstration";
}
