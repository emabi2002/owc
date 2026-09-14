import { describe, expect, test } from "bun:test";
import { buildDemonstrationRelease } from "./release";

describe("OWC demonstration release rehearsal", () => {
  test("reports repository-ready with an external host when host configuration is absent", async () => {
    const release = await buildDemonstrationRelease({
      releaseSha: "0123456789abcdef0123456789abcdef01234567",
      generatedAt: "2026-09-14T00:00:00.000Z",
      hostConfiguration: {},
    });

    expect(release.releaseStatus).toBe("REPOSITORY_READY / DEMO_HOST_EXTERNAL");
    expect(release.environment).toBe("DEMONSTRATION");
    expect(release.syntheticData).toBe(true);
    expect(release.demonstrationAcceptance).toBe(true);
    expect(release.productionAcceptance).toBe(false);
    expect(release.uat.summary).toEqual({ total: 7, passed: 7, failed: 0, status: "passed" });
    expect(release.moneyMovement).toBe(false);
    expect(release.host.configured).toBe(false);
    expect(release.host.verified).toBe(false);
    expect(release.host.missing).toEqual([
      "DEPLOY_HOST",
      "DEPLOY_USER",
      "DEPLOY_PATH",
      "DEPLOY_SSH_KEY",
    ]);
  });

  test("never converts configured credentials into a deployed claim", async () => {
    const release = await buildDemonstrationRelease({
      hostConfiguration: {
        DEPLOY_HOST: "demo.example.invalid",
        DEPLOY_USER: "demo-user",
        DEPLOY_PATH: "/srv/owc-demo",
        DEPLOY_SSH_KEY: "not-a-real-secret-for-test",
      },
    });

    expect(release.releaseStatus).toBe(
      "REPOSITORY_READY / DEMO_HOST_CONFIGURED_PENDING_EXTERNAL_VERIFICATION",
    );
    expect(release.host.configured).toBe(true);
    expect(release.host.verified).toBe(false);
    expect(JSON.stringify(release)).not.toContain("not-a-real-secret-for-test");
    expect(release.productionAcceptance).toBe(false);
  });
});
