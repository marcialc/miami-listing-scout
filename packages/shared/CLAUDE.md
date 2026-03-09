# CLAUDE.md — @miami-listing-scout/shared

## Overview

Pure TypeScript types, schemas, and constants shared across the monorepo. No runtime logic — only type definitions and constants.

## Structure

Single source file: `src/index.ts` (builds to `dist/` via `tsc`).

## Commands

```bash
pnpm build       # tsc → dist/
pnpm typecheck   # tsc --noEmit
pnpm dev         # tsc --watch
```

## Exports

**Constants:**
- `ANALYSIS_MODULES` — 6 analysis module names (`investment_potential`, `price_vs_comps`, `red_flags`, `neighborhood_insights`, `rental_analysis`, `flip_potential`)
- `DEFAULT_CONFIG` — Default scout config with Miami-area cities, $300k–$1.5M price range

**Types:**
- `AnalysisModule` — Union of the 6 module names
- `Recommendation` — `"strong_buy" | "buy" | "watch" | "pass"`

**Interfaces:**
- `ListingFilters` — Search criteria (cities, price, beds/baths, sqft, property types, keywords)
- `ScoutConfig` — Full config (user info, filters, modules, custom requirements, schedule)
- `BridgeListing` — Normalized MLS listing (address, property, photos, agent, geo, dates, financial)
- `ModuleResult` — Single module output (score, analysis, highlights)
- `ListingAnalysis` — Full analysis (overall score, module results, recommendation)
- `DailyReport` — Aggregated report with stats and analyzed listings

## Notes

- This package must build before `worker` and `web` (they import from `@miami-listing-scout/shared`)
- Target: ES2022, module resolution: bundler, strict mode
