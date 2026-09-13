<?php

declare(strict_types=1);

namespace Drupal\owc_identity;

use Drupal\user\UserInterface;

final class ManagedRoles
{
    /** @return list<string> */
    public static function ids(): array
    {
        return [
            'cms_administrator',
            'content_editor',
            'reviewer',
            'publisher',
            'auditor',
        ];
    }

    /** @return list<string> */
    public static function fromAccount(UserInterface $account): array
    {
        return array_values(array_intersect(self::ids(), $account->getRoles()));
    }
}
