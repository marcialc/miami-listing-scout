# @miami-listing-scout/shared

Shared TypeScript types, schemas, and constants for the Miami Listing Scout monorepo.

## What's Inside

This package defines the data contracts used across the worker and web packages:

- **ListingFilters** — Search criteria for MLS queries
- **ScoutConfig** — User configuration (filters, analysis modules, schedule, email)
- **BridgeListing** — Normalized MLS listing data structure
- **ListingAnalysis** — AI analysis results with scores and recommendations
- **DailyReport** — Aggregated daily report structure
- **ANALYSIS_MODULES** — Available analysis modules (investment potential, comps, red flags, neighborhood, rental, flip)
- **DEFAULT_CONFIG** — Sensible defaults for Miami-area scouting

## Usage

```typescript
import { ScoutConfig, BridgeListing, ListingAnalysis, ANALYSIS_MODULES } from "@miami-listing-scout/shared";
```

## Scripts

```bash
pnpm build       # Compile TypeScript to dist/
pnpm typecheck   # Type-check without emitting
pnpm dev         # Watch mode
```

## Build

This package must be built before `worker` and `web`, as they depend on the compiled output at `dist/index.js`. Turborepo handles this automatically via `dependsOn: ["^build"]`.
