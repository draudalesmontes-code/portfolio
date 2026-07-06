#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd -- "${SCRIPT_DIR}/../.." && pwd)"
COMPOSE_FILE="${SCRIPT_DIR}/compose.yml"
ENV_FILE="${1:-${ROOT_DIR}/.env.production}"

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "Missing production environment file: ${ENV_FILE}" >&2
  echo "Copy infra/vps/production.env.example to .env.production first." >&2
  exit 1
fi

required_variables=(
  DOMAIN
  ACME_EMAIL
  BASE_URL
  POSTGRES_USER
  POSTGRES_PASSWORD
  POSTGRES_DB
  JWT_SECRET
  RESEND_API_KEY
  RESEND_FROM
  GROQ_API_KEY
)

set -a
# shellcheck disable=SC1090
source "${ENV_FILE}"
set +a

for variable in "${required_variables[@]}"; do
  if [[ -z "${!variable:-}" ]]; then
    echo "Required variable ${variable} is empty in ${ENV_FILE}." >&2
    exit 1
  fi
done

if [[ "${BASE_URL}" != "https://${DOMAIN}" ]]; then
  echo "BASE_URL must exactly equal https://${DOMAIN}." >&2
  exit 1
fi

compose=(
  docker compose
  --env-file "${ENV_FILE}"
  -f "${COMPOSE_FILE}"
)

"${compose[@]}" config --quiet
"${compose[@]}" up -d --build --remove-orphans

# nginx resolves Docker service names when it starts. Recreate the two edge
# proxies after application containers change so no stale upstream IP remains.
"${compose[@]}" up -d --force-recreate gateway caddy
"${compose[@]}" ps

echo
echo "Deployment started: https://${DOMAIN}"
echo "The first AI startup may take several minutes while its model downloads."
