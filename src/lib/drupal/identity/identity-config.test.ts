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

  test("enforces SSO with an explicit UID 1 break-glass exception", async () => {
    const policy = await read("drupal/modules/custom/owc_identity/src/IdentityPolicy.php");
    const moduleCode = await read("drupal/modules/custom/owc_identity/owc_identity.module");

    expect(policy).toContain("OWC_IDENTITY_ENFORCE_SSO");
    expect(policy).toContain("OWC_BREAK_GLASS_LOCAL_LOGIN");
    expect(policy).toContain("get('uid')->value");
    expect(policy).toContain("=== '1'");
    expect(moduleCode).toContain("owc_identity_form_user_login_form_alter");
    expect(moduleCode).toContain("owc_identity_validate_local_login");
    expect(moduleCode).toContain("local_login_denied");
    expect(moduleCode).toContain("break_glass_login");
  });

  test("defines the exact OWC-managed roles and identity audit hooks", async () => {
    const roles = await read("drupal/modules/custom/owc_identity/src/ManagedRoles.php");
    const moduleCode = await read("drupal/modules/custom/owc_identity/owc_identity.module");

    for (const role of [
      "cms_administrator",
      "content_editor",
      "reviewer",
      "publisher",
      "auditor",
    ]) {
      expect(roles).toContain(`'${role}'`);
    }
    expect(moduleCode).toContain("owc_identity_openid_connect_post_authorize");
    expect(moduleCode).toContain("owc_identity_entity_update");
    expect(moduleCode).toContain("oidc_authorized");
    expect(moduleCode).toContain("managed_roles_changed");
  });

  test("commits OIDC modules and all five group-to-role mappings without a secret", async () => {
    const extensions = await read("drupal/config/sync/core.extension.yml");
    const settings = await read("drupal/config/sync/openid_connect.settings.yml");

    expect(extensions).toContain("externalauth: 0");
    expect(extensions).toContain("openid_connect: 0");
    expect(extensions).toContain("owc_identity: 0");
    expect(settings).toContain("force_reset_role_mappings: true");
    expect(settings).toContain("cms_administrator:");
    expect(settings).toContain("owc-cms-administrators");
    expect(settings).toContain("content_editor:");
    expect(settings).toContain("owc-content-editors");
    expect(settings).toContain("reviewer:");
    expect(settings).toContain("owc-reviewers");
    expect(settings).toContain("publisher:");
    expect(settings).toContain("owc-publishers");
    expect(settings).toContain("auditor:");
    expect(settings).toContain("owc-auditors");
    expect(settings).not.toContain("client_secret");
  });

  test("documents and verifies runtime identity configuration without exposing secrets", async () => {
    const env = await read("drupal/.env.example");
    const configure = await read("drupal/scripts/configure-identity.php");
    const verify = await read("drupal/scripts/verify-identity.php");

    for (const name of [
      "OWC_OIDC_CLIENT_ID",
      "OWC_OIDC_CLIENT_SECRET",
      "OWC_OIDC_AUTHORIZATION_ENDPOINT",
      "OWC_OIDC_TOKEN_ENDPOINT",
      "OWC_OIDC_USERINFO_ENDPOINT",
      "OWC_IDENTITY_ENFORCE_SSO",
      "OWC_BREAK_GLASS_LOCAL_LOGIN",
    ]) {
      expect(env).toContain(name);
    }
    expect(configure).toContain("OWC_OIDC_CLIENT_SECRET");
    expect(configure).not.toContain("print $clientSecret");
    expect(configure).not.toContain("echo $clientSecret");
    expect(verify).toContain("OWC_IDENTITY_ENFORCE_SSO");
    expect(verify).toContain("not_configured");
    expect(verify).toContain("identity readiness failed");
  });

  test("runs identity shell validation readiness and runtime client provisioning in clean-room CI", async () => {
    const workflow = await read(".github/workflows/deploy.yml");
    expect(workflow).toContain("bash -n drupal/scripts/configure-identity.sh");
    expect(workflow).toContain("bash -n drupal/scripts/verify-identity.sh");
    expect(workflow).toContain("Verify Drupal editor identity readiness");
    expect(workflow).toContain("Configure CI OIDC client");
    expect(workflow).toContain("/opt/owc-drupal/scripts/configure-identity.sh");
    expect(workflow).toContain("/opt/owc-drupal/scripts/verify-identity.sh");
  });
});
