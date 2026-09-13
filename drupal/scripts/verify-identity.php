<?php

declare(strict_types=1);

$flag = static function (string $name): bool {
    $value = strtolower(trim((string) (getenv($name) ?: '')));
    return in_array($value, ['1', 'true', 'yes', 'on'], true);
};

$issues = [];
$moduleHandler = \Drupal::moduleHandler();
foreach (['externalauth', 'openid_connect', 'owc_identity'] as $module) {
    if (!$moduleHandler->moduleExists($module)) {
        $issues[] = "module_not_enabled:{$module}";
    }
}

$expectedMappings = [
    'cms_administrator' => ['owc-cms-administrators'],
    'content_editor' => ['owc-content-editors'],
    'reviewer' => ['owc-reviewers'],
    'publisher' => ['owc-publishers'],
    'auditor' => ['owc-auditors'],
];
$settings = \Drupal::config('openid_connect.settings');
foreach ($expectedMappings as $role => $groups) {
    $actual = $settings->get("role_mappings.{$role}");
    if ($actual !== $groups) {
        $issues[] = "role_mapping_mismatch:{$role}";
    }
}
if ($settings->get('force_reset_role_mappings') !== true) {
    $issues[] = 'role_mapping_reset_disabled';
}

$requiredEnvironment = [
    'OWC_OIDC_CLIENT_ID',
    'OWC_OIDC_CLIENT_SECRET',
    'OWC_OIDC_AUTHORIZATION_ENDPOINT',
    'OWC_OIDC_TOKEN_ENDPOINT',
    'OWC_OIDC_USERINFO_ENDPOINT',
];
$missingEnvironment = [];
foreach ($requiredEnvironment as $name) {
    if (trim((string) (getenv($name) ?: '')) === '') {
        $missingEnvironment[] = $name;
    }
}

$client = null;
if ($moduleHandler->moduleExists('openid_connect')) {
    $client = \Drupal::entityTypeManager()->getStorage('openid_connect_client')->load('owc_corporate');
}
$enforced = $flag('OWC_IDENTITY_ENFORCE_SSO');
$breakGlass = $flag('OWC_BREAK_GLASS_LOCAL_LOGIN');

$status = (!$missingEnvironment && $client) ? 'configured' : 'not_configured';
if ($enforced && ($missingEnvironment || !$client)) {
    $issues[] = 'sso_enforced_without_complete_oidc_client';
}

$result = [
    'status' => $status,
    'ssoEnforced' => $enforced,
    'breakGlassEnabled' => $breakGlass,
    'clientPresent' => (bool) $client,
    'missingConfiguration' => $missingEnvironment,
    'issueCount' => count($issues),
    'issues' => $issues,
];

print json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . PHP_EOL;

if ($issues) {
    throw new RuntimeException('identity readiness failed: ' . implode(', ', $issues));
}
