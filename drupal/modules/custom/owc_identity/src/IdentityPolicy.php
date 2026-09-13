<?php

declare(strict_types=1);

namespace Drupal\owc_identity;

use Drupal\user\UserInterface;

final class IdentityPolicy
{
    public function ssoEnforced(): bool
    {
        return self::environmentFlag('OWC_IDENTITY_ENFORCE_SSO');
    }

    public function breakGlassEnabled(): bool
    {
        return self::environmentFlag('OWC_BREAK_GLASS_LOCAL_LOGIN');
    }

    public function localLoginAllowed(?UserInterface $account): bool
    {
        if (!$this->ssoEnforced()) {
            return true;
        }
        if (!$this->breakGlassEnabled() || $account === null) {
            return false;
        }

        $uid = (string) $account->get('uid')->value;
        return $uid === '1';
    }

    private static function environmentFlag(string $name): bool
    {
        $value = strtolower(trim((string) (getenv($name) ?: '')));
        return in_array($value, ['1', 'true', 'yes', 'on'], true);
    }
}
