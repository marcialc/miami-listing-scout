# CLAUDE.md — @miami-listing-scout/worker

## Overview

Cloudflare Worker that runs the daily listing scout pipeline: fetch MLS data, deduplicate, analyze with Claude AI, and email a curated report. Also serves an HTTP API for the web dashboard.

## Commands

```bash
pnpm dev         # wrangler dev (localhost:8787)
pnpm build       # wrangler deploy --dry-run --outdir=dist
pnpm typecheck   # tsc --noEmit
```

## Source Files

| File | Purpose |
|------|---------|
| `src/index.ts` | HTTP API routes + cron handler + pipeline orchestrator |
| `src/bridge.ts` | Bridge Interactive API client (OData, pagination, field mapping) |
| `src/analyzer.ts` | Claude Haiku 4.5 analysis engine (batched, 6 modules) |
| `src/email.ts` | Report builder + HTML renderer + Resend sender |
| `src/config.ts` | KV config/state management (config, dedup, timestamps) |
| `src/mock.ts` | 5 realistic Miami mock listings for testing |

## Pipeline Flow

1. Load `ScoutConfig` from KV
2. Fetch listings from Bridge API (or mock data)
3. Deduplicate against `SEEN_LISTINGS` KV
4. Analyze with Claude in batches of 5 (`Promise.allSettled`)
5. Build `DailyReport`, render HTML email
6. Send via Resend API
7. Mark listings seen (30-day TTL), update last run timestamp

## API Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | None | Status, lastRun, mockMode |
| GET | `/api/config` | X-API-Key | Get ScoutConfig |
| PUT | `/api/config` | X-API-Key | Update ScoutConfig |
| POST | `/api/test-run` | X-API-Key | Trigger pipeline (async) |

## KV Storage

Two namespaces bound in `wrangler.toml`:
- **SCOUT_CONFIG** — Keys: `scout_config`, `last_run_timestamp`
- **SEEN_LISTINGS** — Keys: `seen:<listingId>` (30-day TTL)

## Environment

**Secrets** (via `wrangler secret put`): `BRIDGE_API_TOKEN`, `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `CONFIG_API_KEY`

**Vars** (in `wrangler.toml`): `EMAIL_FROM`, `MOCK_MODE`

**Local dev**: secrets go in `.dev.vars`

## Key Patterns

- Cron: `0 12 * * *` (daily at 12:00 UTC / 7 AM EST)
- Bridge API: OData protocol, 200 records/page, `miamire` dataset
- Claude API: Direct HTTP calls (no SDK), structured JSON responses only
- Resend: Direct HTTP POST
- CORS headers on all API responses
- Errors are logged with `[component]` prefixes, pipeline continues on partial failures
