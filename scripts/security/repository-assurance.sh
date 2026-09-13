#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

fail() {
  echo "OWC repository security assurance failed: $1" >&2
  exit 1
}

require_file_contains() {
  local file="$1"
  local pattern="$2"
  local description="$3"
  grep -Fq -- "$pattern" "$file" || fail "$description"
}

# Local runtime secrets must never be tracked.
if git ls-files --error-unmatch .env.local >/dev/null 2>&1; then
  fail ".env.local is tracked by Git"
fi

# Reject tracked private-key material by content. Do not print the content or
# any environment variables if a match is found.
while IFS= read -r tracked_file; do
  [[ -f "$tracked_file" ]] || continue
  if grep -Eq '-----BEGIN ([A-Z0-9 ]+ )?PRIVATE KEY-----' "$tracked_file" 2>/dev/null; then
    fail "tracked repository content contains a PRIVATE KEY block"
  fi
done < <(git ls-files)

# Production CSP must not enable JavaScript eval semantics.
if grep -Fq "unsafe-eval" deploy/nginx.conf; then
  fail "production Content-Security-Policy contains unsafe-eval"
fi

# Database authorization invariants.
require_file_contains src/lib/db/schema.sql "status = 'active'" \
  "database role/staff helpers do not enforce active account status"
require_file_contains src/lib/db/schema.sql "protect_profile_privileged_fields" \
  "profile privileged-field protection trigger/function is missing"
require_file_contains src/lib/db/schema.sql "new.role is distinct from old.role" \
  "profile role self-escalation protection is missing"
require_file_contains src/lib/db/schema.sql "new.status is distinct from old.status" \
  "profile status self-escalation protection is missing"

# Security documentation baseline.
require_file_contains docs/SECURITY_CHECKLIST.md "OWASP Top 10:2025" \
  "security checklist is not mapped to OWASP Top 10:2025"
require_file_contains docs/SECURITY_CHECKLIST.md "ASVS 5.0.0" \
  "security checklist does not reference ASVS 5.0.0"

echo "OWC repository security assurance passed"
