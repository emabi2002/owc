#!/usr/bin/env bash
set -euo pipefail

log() {
  printf '[owc-demo-preflight] %s\n' "$*"
}

fail() {
  log "FAIL: $*"
  exit 1
}

require_exact() {
  local name="$1"
  local expected="$2"
  local actual="${!name:-}"
  if [[ "$actual" != "$expected" ]]; then
    fail "${name} must be '${expected}' for the OWC demonstration profile."
  fi
}

require_nonempty() {
  local name="$1"
  if [[ -z "${!name:-}" ]]; then
    fail "${name} must be configured."
  fi
}

log "Validating OWC demonstration/reference profile. Secret values are never printed."

require_exact OWC_IDENTITY_MODE demonstration
require_exact OWC_ENABLE_DEMO_RESET true
require_exact OWC_ENABLE_REFERENCE_ECOSYSTEM true
require_exact OWC_ENABLE_SANDBOX true
require_exact OWC_ENABLE_REFERENCE_MALWARE_SCANNER true
require_exact OWC_ENABLE_REFERENCE_EVIDENCE_REPOSITORY true
require_exact OWC_ENABLE_REFERENCE_NOTIFICATION_GATEWAY true

require_nonempty OWC_DEMO_SESSION_SECRET
require_nonempty OWC_DEMO_PASSWORD
require_nonempty OWC_DEMO_MFA_CODE

if (( ${#OWC_DEMO_SESSION_SECRET} < 32 )); then
  fail "OWC_DEMO_SESSION_SECRET must contain at least 32 characters."
fi

if (( ${#OWC_DEMO_PASSWORD} < 12 )); then
  fail "OWC_DEMO_PASSWORD must contain at least 12 characters."
fi

if [[ ! "$OWC_DEMO_MFA_CODE" =~ ^[0-9]{6}$ ]]; then
  fail "OWC_DEMO_MFA_CODE must be a six-digit demonstration code."
fi

# Payment is deliberately simulation-only. These legacy/live-style variables
# must remain unset so an operator cannot accidentally turn the presentation
# profile into a financial-institution connection.
if [[ -n "${OWC_PAYMENT_API_BASE_URL:-}" ]]; then
  fail "OWC_PAYMENT_API_BASE_URL must remain unset; payment is simulation-only."
fi
if [[ -n "${OWC_PAYMENT_API_KEY:-}" ]]; then
  fail "OWC_PAYMENT_API_KEY must remain unset; payment is simulation-only."
fi

log "PASS: demonstration/reference services are explicitly enabled."
log "PASS: identity credential shapes are valid."
log "PASS: live payment variables are absent; simulated transactions move no money."
log "OWC demonstration preflight passed."
