import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";

const read = (path: string) => readFile(path, "utf8");

describe("Drupal editor identity foundation", () => {
  test("packages OpenID Connect and the OWC identity module into Drupal", async () => {
    const dockerfile = await read("drupal/Dockerfile");
    const info = await read("drupal/modules/custom/owc_identity/owc_identity.info.yml");
    const services = await read("drupal/modules/custom/owc_identity/owc_identity.services.yml");

    expect(dockerfile).toContain("drupal/openid_connect:^3.0@alpha");
    expect(dockerfile).toContain("COPY modules/custom /opt/drupal/web/modules/custom");
    expect(info).toContain("name: OWC Identity Policy");
    expect(info).toContain("openid_connect:openid_connect");
    expect(services).toContain("owc_identity.policy:");
  });
});
