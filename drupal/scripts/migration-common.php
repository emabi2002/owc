<?php

declare(strict_types=1);

const OWC_MIGRATION_UUID_NAMESPACE = 'owc-enterprise-cms-content-v1';

function owc_migration_uuid(string $key): string
{
    $hex = sha1(OWC_MIGRATION_UUID_NAMESPACE . ':' . $key);

    $timeLow = substr($hex, 0, 8);
    $timeMid = substr($hex, 8, 4);
    $timeHi = dechex((hexdec(substr($hex, 12, 4)) & 0x0fff) | 0x5000);
    $clockSeq = dechex((hexdec(substr($hex, 16, 4)) & 0x3fff) | 0x8000);
    $node = substr($hex, 20, 12);

    return sprintf(
        '%s-%s-%04s-%04s-%s',
        $timeLow,
        $timeMid,
        str_pad($timeHi, 4, '0', STR_PAD_LEFT),
        str_pad($clockSeq, 4, '0', STR_PAD_LEFT),
        $node,
    );
}

function owc_migration_scalar(mixed $value): mixed
{
    if (is_bool($value) || is_int($value) || is_float($value) || is_string($value) || $value === null) {
        return $value;
    }

    throw new InvalidArgumentException('Migration attribute values must be scalar or null.');
}
