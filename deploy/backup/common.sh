#!/usr/bin/env bash
set -euo pipefail
umask 077

BACKUP_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OWC_REPO_ROOT="$(cd "$BACKUP_SCRIPT_DIR/../.." && pwd)"

require_command() {
  local command_name="$1"
  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "Required command is unavailable: $command_name" >&2
    exit 1
  fi
}

require_env() {
  local variable_name="$1"
  if [[ -z "${!variable_name:-}" ]]; then
    echo "Required environment variable is not set: $variable_name" >&2
    exit 1
  fi
}

require_backup_set_dir() {
  require_env OWC_BACKUP_SET_DIR
  mkdir -p "$OWC_BACKUP_SET_DIR"
  chmod 700 "$OWC_BACKUP_SET_DIR"
}

require_nonproduction_rehearsal() {
  if [[ "${OWC_DR_REHEARSAL_CONFIRM:-}" != "NONPRODUCTION" ]]; then
    echo "Restore rehearsal requires OWC_DR_REHEARSAL_CONFIRM=NONPRODUCTION" >&2
    exit 1
  fi

  require_env OWC_ENVIRONMENT
  local environment_label
  environment_label="$(printf '%s' "$OWC_ENVIRONMENT" | tr '[:upper:]' '[:lower:]')"
  case "$environment_label" in
    prod|production|live)
      echo "Repository restore tooling refuses production/live targets." >&2
      exit 1
      ;;
  esac
}

safe_environment_label() {
  require_env OWC_ENVIRONMENT
  if [[ ! "$OWC_ENVIRONMENT" =~ ^[A-Za-z0-9._-]+$ ]]; then
    echo "OWC_ENVIRONMENT must contain only letters, numbers, dot, underscore or hyphen." >&2
    exit 1
  fi
  printf '%s' "$OWC_ENVIRONMENT"
}
