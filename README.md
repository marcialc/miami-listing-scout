# Miami Listing Scout

AI-powered daily real estate listing scout for Miami-area realtors. Automatically fetches new MLS listings via Bridge API, analyzes them with Claude AI across multiple dimensions (investment potential, comps, red flags, neighborhood, rentals, flip potential), and delivers a curated daily report via email.

## Architecture

```
                        ┌─────────────────┐
                        │  Cron (daily)   │
                        │  7 AM EST       │
                        └────────┬────────┘
                                 │
                                 ▼
┌──────────────┐     ┌───────────────────────┐     ┌──────────────┐
│  Bridge API  │────▶│   Cloudflare Worker   │────▶│  Resend API  │
│  (MLS data)  │     │                       │     │  (email)     │
└──────────────┘     │  1. Fetch listings    │     └──────────────┘
                     │  2. Dedup via KV      │
                     │  3. Analyze w/ Claude │
                     │  4. Build report      │
                     │  5. Send email        │
                     └───────────┬───────────┘
                                 │
                     ┌───────────┴───────────┐
                     │    HTTP API (/api/)   │
                     │  config, health,      │
                     │  test-run             │
                     └───────────┬───────────┘
                                 │
                                 ▼
                     ┌───────────────────────┐
                     │   Cloudflare Pages    │
                     │   React Dashboard     │
                     │   (config UI)         │
                     └───────────────────────┘
```

```
miami-listing-scout/
├── packages/
│   ├── shared/        # TypeScript types, schemas, constants
│   ├── worker/        # Cloudflare Worker — cron + API
│   │   └── src/
│   │       ├── index.ts      # HTTP API + cron orchestrator
│   │       ├── bridge.ts     # Bridge Interactive API client
│   │       ├── analyzer.ts   # Claude AI analysis engine
│   │       ├── email.ts      # Resend email builder + sender
│   │       ├── config.ts     # KV config management
│   │       └── mock.ts       # Mock listings for testing
│   └── web/           # React + Vite dashboard
│       └── src/
│           ├── App.tsx        # Main dashboard
│           ├── api.ts         # Worker API client
│           └── components/    # UI components
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

## Stack

| Layer        | Technology                          |
| ------------ | ----------------------------------- |
| Monorepo     | Turborepo + pnpm workspaces        |
| Language     | TypeScript everywhere               |
| MLS Data     | Bridge Interactive API              |
| AI Analysis  | Anthropic Claude Haiku 4.5          |
| Email        | Resend                              |
| Backend      | Cloudflare Worker (cron + API)      |
| Frontend     | React 19 + Vite + Tailwind CSS v4   |
| Hosting      | Cloudflare Pages + Workers          |
| Storage      | Cloudflare KV                       |

## Prerequisites

- **Node.js** >= 18
- **pnpm** >= 9 (`npm install -g pnpm`)
- **Cloudflare account** (free tier works)
- **Wrangler CLI** (installed as a project dependency)

## Setup

### 1. Clone and Install

```bash
git clone <repo-url> miami-listing-scout
cd miami-listing-scout
pnpm install
```

### 2. Create Cloudflare KV Namespaces

```bash
# Create production namespaces
cd packages/worker
npx wrangler kv namespace create SCOUT_CONFIG
npx wrangler kv namespace create SEEN_LISTINGS

# Create preview namespaces (for local dev)
npx wrangler kv namespace create SCOUT_CONFIG --preview
npx wrangler kv namespace create SEEN_LISTINGS --preview
```

Copy the output IDs into `packages/worker/wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "SCOUT_CONFIG"
id = "<production-id>"
preview_id = "<preview-id>"

[[kv_namespaces]]
binding = "SEEN_LISTINGS"
id = "<production-id>"
preview_id = "<preview-id>"
```

### 3. Set Secrets

For **production** (Cloudflare dashboard or CLI):

```bash
cd packages/worker
npx wrangler secret put BRIDGE_API_TOKEN
npx wrangler secret put ANTHROPIC_API_KEY
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put CONFIG_API_KEY
```

For **local development**, create `packages/worker/.dev.vars`:

```env
BRIDGE_API_TOKEN=your_bridge_token
ANTHROPIC_API_KEY=your_anthropic_key
RESEND_API_KEY=your_resend_key
CONFIG_API_KEY=any_secret_string_you_choose
```

### 4. Configure Web UI Environment

Create `packages/web/.env`:

```env
VITE_WORKER_API_URL=http://localhost:8787
VITE_CONFIG_API_KEY=same_config_api_key_as_worker
```

### 5. Run Locally

```bash
# From the monorepo root — starts both worker and web UI concurrently
pnpm dev
```

- Worker runs at `http://localhost:8787`
- Web UI runs at `http://localhost:5173`

### 6. Mock Mode (No Bridge API Needed)

To test the full pipeline without Bridge API credentials, set `MOCK_MODE=true` in `packages/worker/.dev.vars` or in `wrangler.toml`:

```toml
[vars]
MOCK_MODE = "true"
```

This uses 5 hardcoded realistic Miami listings. The web UI shows a yellow "Mock Mode" banner when connected to a mock-mode worker.

## Getting API Credentials

### Bridge Interactive API

1. Go to [Bridge Interactive](https://www.bridgedataoutput.com/) and create an account
2. Request access to the Miami RETS/MLS feed (dataset: `miamire`)
3. Generate an API token from your dashboard
4. The token goes into `BRIDGE_API_TOKEN`

### Anthropic API

1. Sign up at [console.anthropic.com](https://console.anthropic.com)
2. Create an API key
3. The key goes into `ANTHROPIC_API_KEY`

### Resend

1. Sign up at [resend.com](https://resend.com)
2. Verify a sending domain or use the sandbox
3. Create an API key
4. Update `EMAIL_FROM` in `wrangler.toml` to your verified sender address
5. The key goes into `RESEND_API_KEY`

## Environment Variables Reference

### Worker Secrets (set via `wrangler secret put`)

| Variable           | Description                                     |
| ------------------ | ----------------------------------------------- |
| `BRIDGE_API_TOKEN` | Bridge Interactive API bearer token              |
| `ANTHROPIC_API_KEY`| Anthropic Claude API key                         |
| `RESEND_API_KEY`   | Resend email API key                             |
| `CONFIG_API_KEY`   | Shared secret for web UI → worker API auth       |

### Worker Vars (set in `wrangler.toml`)

| Variable     | Description                                | Default               |
| ------------ | ------------------------------------------ | --------------------- |
| `EMAIL_FROM` | Verified Resend sender email address        | `scout@yourdomain.com`|
| `MOCK_MODE`  | Use mock listings instead of Bridge API     | `false`               |

### Web UI (set in `packages/web/.env`)

| Variable               | Description                    | Default               |
| ---------------------- | ------------------------------ | --------------------- |
| `VITE_WORKER_API_URL`  | Worker API base URL             | (empty)               |
| `VITE_CONFIG_API_KEY`  | Must match worker CONFIG_API_KEY| (empty)               |

## Scripts

| Command              | Description                                        |
| -------------------- | -------------------------------------------------- |
| `pnpm install`       | Install all dependencies                            |
| `pnpm build`         | Build all packages                                  |
| `pnpm dev`           | Start worker + web UI in dev mode                   |
| `pnpm typecheck`     | Type-check all packages                             |
| `pnpm deploy:worker` | Deploy worker to Cloudflare                         |
| `pnpm deploy:web`    | Deploy web UI to Cloudflare Pages                   |

## Deployment

### Worker

```bash
pnpm deploy:worker
```

### Web UI

```bash
pnpm deploy:web
```

Or connect the repo to Cloudflare Pages with:
- **Build command**: `cd ../.. && pnpm build --filter=@miami-listing-scout/web`
- **Build output directory**: `packages/web/dist`
- **Root directory**: `packages/web`

Set `VITE_WORKER_API_URL` and `VITE_CONFIG_API_KEY` as environment variables in the Cloudflare Pages dashboard.

## API Endpoints

All endpoints are served by the Cloudflare Worker:

| Method | Path             | Auth     | Description                    |
| ------ | ---------------- | -------- | ------------------------------ |
| GET    | `/api/health`    | None     | Status + last run + mock mode  |
| GET    | `/api/config`    | API Key  | Get current ScoutConfig        |
| PUT    | `/api/config`    | API Key  | Update ScoutConfig             |
| POST   | `/api/test-run`  | API Key  | Trigger manual scan            |

Auth via `X-API-Key` header matching the `CONFIG_API_KEY` secret.
