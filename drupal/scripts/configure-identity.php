<?php

declare(strict_types=1);

$flag = static function (string $name): bool {
    $value = strtolower(trim((string) (getenv($name) ?: '')));
    return in_array($value, ['1', 'true', 'yes', 'on'], true);
};

$required = [
    'client_id' => 'OWC_OIDC_CLIENT_ID',
    'client_secret' => 'OWC_OIDC_CLIENT_SECRET',
    'authorization_endpoint' => 'OWC_OIDC_AUTHORIZATION_ENDPOINT',
    'token_endpoint' => 'OWC_OIDC_TOKEN_ENDPOINT',
    'userinfo_endpoint' => 'OWC_OIDC_USERINFO_ENDPOINT',
];

$values = [];
$missing = [];
foreach ($required as $setting => $environmentName) {
    $value = trim((string) (getenv($environmentName) ?: ''));
    $values[$setting] = $value;
    if ($value === '') {
        $missing[] = $environmentName;
    }
}

$enforce = $flag('OWC_IDENTITY_ENFORCE_SSO');
if ($missing) {
    if ($enforce) {
        throw new RuntimeException('OIDC configuration is required while SSO enforcement is enabled. Missing: ' . implode(', ', $missing));
    }
    print json_encode([
        'status' => 'not_configured',
        'client' => 'owc_corporate',
        'missing' => $missing,
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . PHP_EOL;
    return;
}

$storage = \Drupal::entityTypeManager()->getStorage('openid_connect_client');
$client = $storage->load('owc_corporate');
if (!$client) {
    $client = $storage->create([
        'id' => 'owc_corporate',
        'label' => 'OWC Corporate Identity',
        'plugin' => 'generic',
        'settings' => [],
    ]);
}

$plugin = $client->getPlugin();
$settings = $plugin->getConfiguration();
$settings = array_replace($settings, $values);
$endSessionEndpoint = trim((string) (getenv('OWC_OIDC_END_SESSION_ENDPOINT') ?: ''));
if ($endSessionEndpoint !== '') {
    $settings['end_session_endpoint'] = $endSessionEndpoint;
}

$client->set('label', 'OWC Corporate Identity');
$client->set('plugin', 'generic');
$client->set('settings', $settings);
if (method_exists($client, 'enable')) {
    $client->enable();
}
$client->save();

print json_encode([
    'status' => 'configured',
    'client' => 'owc_corporate',
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . PHP_EOL;
