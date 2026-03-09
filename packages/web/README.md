# @miami-listing-scout/web

React dashboard for configuring and monitoring the Miami Listing Scout.

## Features

- **Listing Filters** — Configure cities, price range, beds/baths, square footage, property types, and MLS keyword search
- **AI Analysis** — Toggle 6 analysis modules (investment, comps, red flags, neighborhood, rental, flip) and add custom questions
- **Email & Schedule** — Set recipient, timezone, and daily send time
- **Health Monitor** — View last run time, next scheduled run, and trigger manual scans
- **Mock Mode Indicator** — Yellow banner when connected to a mock-mode worker

## Development

### Prerequisites

Create `.env` in this directory:

```env
VITE_WORKER_API_URL=http://localhost:8787
VITE_CONFIG_API_KEY=same_as_worker_CONFIG_API_KEY
```

### Run

```bash
pnpm dev    # Starts at http://localhost:5173
```

The worker must also be running for the dashboard to function (`pnpm dev` from root starts both).

## Tech Stack

- **React 19** with TypeScript
- **Vite 6** for dev server and builds
- **Tailwind CSS v4** via Vite plugin
- **DM Sans** font, custom green accent palette

## Components

| Component | Description |
|-----------|-------------|
| `Header` | Top bar with branding, health status, Run Now button |
| `FiltersSection` | MLS search filter configuration |
| `AnalysisSection` | AI module toggles and custom requirements |
| `EmailScheduleSection` | Recipient and delivery schedule |
| `SaveBar` | Fixed bottom bar for saving changes |
| `SectionCard` | Reusable card container |
| `TagInput` | Tag/pill input for arrays (cities, keywords) |
| `Toast` | Success/error notifications |

## Deployment

Deploy to Cloudflare Pages:

```bash
pnpm deploy:web
```

Set `VITE_WORKER_API_URL` and `VITE_CONFIG_API_KEY` as environment variables in the Cloudflare Pages dashboard for production.
