# iRacing Leaderboard

## Project Overview
Next.js 16 (App Router) + TypeScript web app for browsing iRacing driver leaderboards and stats. Uses SQLite via Prisma for data storage, Recharts for iRating history charts, Tailwind CSS v4 for styling.

Currently runs in **demo mode** with 150 mock drivers. The iRacing OAuth2 API client is fully implemented in `lib/iracing-api.ts` but iRacing has paused new OAuth client registration (as of March 2026).

## Tech Stack
- **Framework:** Next.js 16 (App Router) + TypeScript
- **Database:** SQLite via Prisma 7 + better-sqlite3 adapter
- **Styling:** Tailwind CSS v4 (dark theme, `@theme` directive in globals.css)
- **Charts:** Recharts (client-side only, SSR-safe via dynamic import)
- **Deployment:** Railway (Dockerfile with node:22-alpine, standalone output)

## Commands
- `npm run dev` — Start dev server
- `npm run build` — Production build (standalone output for Docker)
- `npm run db:push` — Push Prisma schema to SQLite
- `npm run db:seed` — Seed database with 150 mock drivers
- `npm run lint` — Run ESLint

## Project Structure
- `app/` — Next.js App Router pages and API routes
  - `app/api/leaderboard/` — Top 100 by iRating per category (DB query)
  - `app/api/drivers/search/` — Driver search by name/custId
  - `app/api/drivers/[custId]/` — Full driver stats
  - `app/api/ingest/` — Data ingestion trigger (for live mode)
  - `app/driver/[custId]/` — Driver profile page
- `components/` — React components (SearchBar, LeaderboardTable, CategoryTabs, DriverHeader, DriverStats, IRatingChart, RecentRaces)
- `lib/` — Core logic
  - `iracing-api.ts` — API client with mock/live modes (controlled by `USE_MOCK_DATA` env var)
  - `mock-data.ts` — Deterministic mock data generator (150 drivers)
  - `types.ts` — Shared TypeScript interfaces
  - `db.ts` — Prisma client singleton
  - `seed.ts` — Database seeder
- `prisma/schema.prisma` — Driver and IngestLog models

## Key Patterns
- Database path is resolved via `DATABASE_PATH` env var (absolute path) or falls back to `./dev.db`
- Prisma 7 uses driver adapter pattern: `PrismaBetterSqlite3` from `@prisma/adapter-better-sqlite3`
- The iRacing API client (`lib/iracing-api.ts`) checks `USE_MOCK_DATA` env var — when not `"false"`, delegates to mock data
- Server components call `getDriverData()` directly (no internal HTTP fetch)
- Tailwind v4: no `tailwind.config.ts`, custom colors defined via `@theme` in `app/globals.css`

## Environment Variables
- `USE_MOCK_DATA` — `"true"` for demo mode (default), `"false"` for live iRacing API
- `DATABASE_PATH` — Absolute path to SQLite file (used in Docker/Railway)
- `DATABASE_URL` — Prisma datasource URL (e.g., `file:./dev.db`)
- `IRACING_CLIENT_ID`, `IRACING_CLIENT_SECRET`, `IRACING_EMAIL`, `IRACING_PASSWORD` — OAuth2 credentials (for live mode)
- `INGEST_SECRET` — Bearer token for the ingestion endpoint

## Deployment
- **GitHub:** ricardosilva1998/iracing-leaderboard
- **Railway:** Uses custom Dockerfile (node:22-alpine, multi-stage build)
- Railway project name: selfless-art
