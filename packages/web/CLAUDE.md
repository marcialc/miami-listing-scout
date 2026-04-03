# CLAUDE.md — @miami-listing-scout/web

## Overview

React 19 dashboard for configuring the Miami Listing Scout. Allows users to set listing filters, AI analysis modules, custom requirements, email delivery, and scheduling. Communicates with the worker API.

## Commands

```bash
pnpm dev         # vite dev server (localhost:5173)
pnpm build       # vite build → dist/
pnpm typecheck   # tsc --noEmit
pnpm preview     # vite preview (serve built output)
```

## Stack

- React 19 + TypeScript (ES2022, JSX: react-jsx)
- Vite 6 (with @vitejs/plugin-react)
- Tailwind CSS v4 (via @tailwindcss/vite plugin)
- Custom font: DM Sans
- Custom accent color palette (green tones)

## Source Structure

| File | Purpose |
|------|---------|
| `src/main.tsx` | Entry point, renders App in StrictMode, wraps with I18nProvider |
| `src/App.tsx` | Main component — state management, API calls, layout |
| `src/api.ts` | Worker API client (fetchHealth, fetchConfig, saveConfig, triggerTestRun) |
| `src/index.css` | Tailwind import + custom theme (font, accent colors) |
| `src/components/Header.tsx` | Top bar with branding, health status, "Run Now" button |
| `src/components/FiltersSection.tsx` | Listing filter config (cities, price, beds/baths, sqft, property types, keywords) |
| `src/components/AnalysisSection.tsx` | AI module toggles + custom requirements |
| `src/components/EmailScheduleSection.tsx` | Email, name, timezone, send time |
| `src/components/SaveBar.tsx` | Fixed bottom bar, appears when unsaved changes exist |
| `src/components/SectionCard.tsx` | Reusable card wrapper (title, description, content) |
| `src/components/TagInput.tsx` | Reusable tag/pill input (Enter/comma to add, backspace to remove) |
| `src/components/Toast.tsx` | Success/error notification (top-right, animated) |
| `src/i18n/en.ts` | English translations (~150 keys), exports `TranslationKey` type |
| `src/i18n/es.ts` | Spanish translations, typed as `Record<TranslationKey, string>` |
| `src/i18n/format.ts` | Locale-aware currency, number, date, time formatting |
| `src/i18n/index.tsx` | `I18nProvider` (React Context), `useI18n()` hook, re-exports |

## State Management

- All state in `App.tsx` via `useState` hooks (no external state library)
- Config object is the single source of truth
- Child components receive `updateConfig` callback for mutations
- Change detection by comparing current config vs last saved config

## i18n

- Custom React Context — no external library, zero new dependencies
- Two languages: English (`en`) and Spanish (`es`)
- Translations are flat key-value objects in `src/i18n/en.ts` and `es.ts`
- `es.ts` is typed as `Record<TranslationKey, string>` — missing Spanish keys cause compile errors
- `useI18n()` hook provides `{ locale, setLocale, t }` — `t(key, params?)` looks up translation and replaces `{param}` placeholders
- Locale-aware formatting helpers: `formatCurrency`, `formatNumber`, `formatDate`, `formatTime` (uses `en-US` / `es-US`)
- Locale persisted to `localStorage("miami-scout-locale")` and to `ScoutConfig.locale` on save
- On first visit, auto-detects browser language (`navigator.language` starting with `"es"`)
- On config load, syncs saved `config.locale` to the i18n context
- EN/ES toggle in Header component
- Property type API values stay English regardless of UI language (display is translated)

## API Integration

- Base URL: `VITE_WORKER_API_URL` env var
- Auth: `VITE_CONFIG_API_KEY` sent as `X-API-Key` header
- Graceful degradation: loads `DEFAULT_CONFIG` from shared package on network failure
- User-friendly error messages via `friendlyError()` helper

## Environment

Set in `.env` or Cloudflare Pages dashboard:

```env
VITE_WORKER_API_URL=http://localhost:8787
VITE_CONFIG_API_KEY=same_as_worker_CONFIG_API_KEY
```

## Deployment

Deployed to Cloudflare Pages:

```bash
pnpm deploy:web
```

Or connect repo to Cloudflare Pages with build command:
`cd ../.. && pnpm build --filter=@miami-listing-scout/web`
