# CLAUDE.md — Miami Listing Scout

## Project Overview

AI-powered daily real estate listing scout for Miami-area realtors. Fetches MLS listings via Bridge API, analyzes with Claude AI, and delivers curated daily reports via email.

## Architecture

Turborepo monorepo with pnpm workspaces. Three packages:

- **`packages/shared`** — TypeScript types, schemas, constants (builds with `tsc`)
- **`packages/worker`** — Cloudflare Worker: cron trigger + HTTP API (Bridge API, Claude AI analysis, Resend email)
- **`packages/web`** — React 19 + Vite + Tailwind CSS v4 dashboard for configuration

## Tech Stack

- **Monorepo**: Turborepo + pnpm (v9) workspaces
- **Language**: TypeScript everywhere
- **Backend**: Cloudflare Worker (cron + REST API)
- **Frontend**: React 19, Vite 6, Tailwind CSS v4
- **Storage**: Cloudflare KV (config + dedup)
- **APIs**: Bridge Interactive (MLS), Anthropic Claude Haiku 4.5, Resend (email)
- **Hosting**: Cloudflare Pages + Workers

## Common Commands

```bash
pnpm install          # Install all dependencies
pnpm dev              # Start worker (port 8787) + web UI (port 5173) in parallel
pnpm build            # Build all packages (shared must build first)
pnpm typecheck        # Type-check all packages
pnpm deploy:worker    # Deploy worker to Cloudflare
pnpm deploy:web       # Deploy web UI to Cloudflare Pages
```

## Build Order

`shared` must build before `worker` and `web` (they depend on it via `workspace:*`). Turborepo handles this via `dependsOn: ["^build"]`.

## Key Files

- `packages/worker/src/index.ts` — HTTP API routes + cron orchestrator
- `packages/worker/src/bridge.ts` — Bridge Interactive API client
- `packages/worker/src/analyzer.ts` — Claude AI analysis engine
- `packages/worker/src/email.ts` — Resend email builder + sender
- `packages/worker/src/config.ts` — KV config management
- `packages/worker/src/mock.ts` — Mock listings for testing
- `packages/worker/wrangler.toml` — Worker config (KV bindings, cron, vars)
- `packages/web/src/App.tsx` — Main dashboard component
- `packages/web/src/api.ts` — Worker API client

## Environment & Secrets

Worker secrets (via `wrangler secret put`): `BRIDGE_API_TOKEN`, `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `CONFIG_API_KEY`

Worker vars (in `wrangler.toml`): `EMAIL_FROM`, `MOCK_MODE`

Web UI env (`packages/web/.env`): `VITE_WORKER_API_URL`, `VITE_CONFIG_API_KEY`

Local dev secrets go in `packages/worker/.dev.vars`.

## Code Conventions

- No semicolons preference not enforced — follow existing file style
- Shared types live in `packages/shared`, imported as `@miami-listing-scout/shared`
- Worker uses Cloudflare Workers API patterns (fetch handler, scheduled handler, KV bindings)
- API auth via `X-API-Key` header matching `CONFIG_API_KEY`
