# @miami-listing-scout/worker

Cloudflare Worker powering the Miami Listing Scout backend — daily cron pipeline and configuration API.

## What It Does

1. **Daily at 7 AM EST** — Fetches new MLS listings via Bridge Interactive API
2. **Deduplicates** against previously seen listings (Cloudflare KV with 30-day TTL)
3. **Analyzes** each listing with Claude Haiku 4.5 across 6 dimensions (investment, comps, red flags, neighborhood, rental, flip)
4. **Emails** a curated HTML report via Resend

## API

All routes are served at the worker URL. Auth via `X-API-Key` header.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | No | Worker status + last run time |
| GET | `/api/config` | Yes | Retrieve scout configuration |
| PUT | `/api/config` | Yes | Update scout configuration |
| POST | `/api/test-run` | Yes | Trigger an immediate scan |

## Development

### Prerequisites

- Cloudflare account with KV namespaces created (see root README)
- API credentials in `.dev.vars`:

```env
BRIDGE_API_TOKEN=your_bridge_token
ANTHROPIC_API_KEY=your_anthropic_key
RESEND_API_KEY=your_resend_key
CONFIG_API_KEY=any_secret_string
```

### Run Locally

```bash
pnpm dev    # Starts at http://localhost:8787
```

### Mock Mode

Set `MOCK_MODE=true` in `.dev.vars` to use 5 hardcoded Miami listings instead of calling the Bridge API. Useful for testing the full pipeline without MLS credentials.

## Deployment

```bash
pnpm --filter @miami-listing-scout/worker exec wrangler deploy
```

Or from the monorepo root:

```bash
pnpm deploy:worker
```

Secrets must be set via `wrangler secret put` before first deploy.

## Architecture

```
Cron/API Request
  → Load config from KV
  → Fetch listings (Bridge API or mock)
  → Deduplicate via KV
  → Analyze with Claude (batches of 5)
  → Build HTML report
  → Send email via Resend
  → Update KV state
```
