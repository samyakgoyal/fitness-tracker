# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FitTrack — personal fitness tracking PWA for logging gym workouts, tracking exercises/sets/reps/weights, and monitoring progress over time.

## Commands

```bash
npm run dev              # Dev server at localhost:3000
npm run build            # prisma generate + next build
npm run lint             # ESLint

npx prisma migrate dev --name <name>  # Create and apply migration
npx prisma studio                      # Database GUI
npx prisma db push                     # Push schema changes (dev only)
```

No test framework is configured.

## Tech Stack

- **Next.js 14** (App Router), TypeScript, Tailwind CSS
- **Prisma ORM** with SQLite (local) or Turso/libSQL (production via `TURSO_DATABASE_URL`)
- **NextAuth v5** (beta) — JWT strategy, GitHub + Google OAuth + email/password credentials
- **Zustand** for client-side workout state (persisted to localStorage as `fittrack-workout`)
- **shadcn/ui** components (Radix primitives in `src/components/ui/`)
- **Zod** for API input validation (`src/lib/validations.ts`)
- **PWA**: service worker (`public/sw.js`), manifest, offline page

## Architecture

### Route Groups

- `(auth)` — unauthenticated: `/login`
- `(app)` — authenticated (behind middleware redirect): all app pages, wraps children in `<Providers>` (SessionProvider) + `<NavBar>` + service worker registration

### Auth Flow

- `src/lib/auth.ts` — NextAuth config with PrismaAdapter, JWT callbacks that inject `user.id` into token/session
- `src/middleware.ts` — protects all routes except `/login`, `/api/auth/*`, and static assets; redirects unauthenticated users to `/login`
- `src/lib/auth-utils.ts` — `getCurrentUser()` and `requireAuth()` helpers for server-side auth in API routes
- `src/app/api/auth/signup/route.ts` — email/password registration with bcrypt

### API Pattern

All API routes in `src/app/api/` follow the same pattern:

1. Call `auth()` to get session
2. Check `session?.user?.id` (return 401 if missing)
3. Prisma query scoped to `userId`
4. Return JSON response

Nested REST structure: `/api/workouts/[id]/exercises/[exerciseId]/sets/`

### Database

SQLite locally, Turso in production. `src/lib/prisma.ts` auto-detects: if `TURSO_DATABASE_URL` is set, uses `PrismaLibSql` adapter; otherwise plain `PrismaClient`. Global singleton prevents connection exhaustion in dev.

Key schema points:

- `Exercise` can be global (`userId=null`, `isCustom=false`) or user-created — unique constraint on `[name, userId]`
- `WorkoutExercise` has `order` field for drag-to-reorder
- `Set` tracks `weight`, `reps`, `rpe`, `isWarmup`, `setNumber`
- `WorkoutTemplate` / `TemplateExercise` for saved routines

### Client-Side Workout State

`src/lib/hooks/use-workout-store.ts` — Zustand store persisted to localStorage. Manages the active workout session: exercises, sets, rest timer, ghost values (previous workout data). This is the source of truth during a workout; data is saved to the API on finish.

### Exercise Database

`src/lib/exerciseDatabase.ts` — large static catalog of exercises with muscle groups, equipment types, and search aliases. Used by the exercise picker for fuzzy matching.

## Environment Variables

Required: `DATABASE_URL`, `NEXTAUTH_SECRET`, `GITHUB_ID`, `GITHUB_SECRET`
Optional: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`
