#!/usr/bin/env bash
# Verify required Cloudflare Worker secrets are set before deploying.
# Fails loud so we don't ship a worker with missing credentials.

set -euo pipefail

REQUIRED_SECRETS=(
  "BRIDGE_API_TOKEN"
  "ANTHROPIC_API_KEY"
  "RESEND_API_KEY"
  "CONFIG_API_KEY"
)

cd "$(dirname "$0")/../packages/worker"

echo "Checking worker secrets..."
SECRETS_JSON=$(pnpm exec wrangler secret list 2>/dev/null)

MISSING=()
for secret in "${REQUIRED_SECRETS[@]}"; do
  if ! echo "$SECRETS_JSON" | grep -q "\"name\": \"$secret\""; then
    MISSING+=("$secret")
  fi
done

if [ ${#MISSING[@]} -gt 0 ]; then
  echo ""
  echo "ERROR: Missing required worker secrets:"
  for secret in "${MISSING[@]}"; do
    echo "  - $secret"
  done
  echo ""
  echo "Set them with: pnpm --filter @miami-listing-scout/worker exec wrangler secret put <NAME>"
  exit 1
fi

echo "All required secrets are set."
