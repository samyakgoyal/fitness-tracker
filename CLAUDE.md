# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal fitness tracking web application for logging gym workouts, tracking exercises, sets, reps, weights, and monitoring progress over time.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite with Prisma ORM
- **Deployment**: Vercel (planned)

## Commands

```bash
# Development
npm run dev          # Start dev server at http://localhost:3000

# Build & Production
npm run build        # Build for production
npm run start        # Run production build

# Database
npx prisma migrate dev --name <migration_name>  # Create and apply migration
npx prisma studio                                # Open database GUI
npx prisma generate                              # Regenerate Prisma client
npx prisma db push                               # Push schema changes (dev only)

# Linting
npm run lint         # Run ESLint
```

## Architecture

### Database Schema (`prisma/schema.prisma`)

```
User (auth)
  └── Workout (session)
        └── WorkoutExercise (exercise in workout)
              └── Set (individual set with weight/reps)
  └── Exercise (exercise library)
```

Key relationships:
- User owns Workouts and custom Exercises
- Workout contains WorkoutExercises (ordered)
- WorkoutExercise links to Exercise and contains Sets
- Exercise can be global (userId=null) or user-created

### App Structure (`src/app/`)

| Route | Purpose |
|-------|---------|
| `/` | Home/dashboard |
| `/workouts` | Workout history list |
| `/workouts/new` | Log new workout |
| `/workouts/[id]` | View/edit specific workout |
| `/exercises` | Exercise library management |
| `/progress` | Stats and progress charts |

### Key Files

- `src/lib/prisma.ts` - Prisma client singleton (prevents connection exhaustion in dev)
- `src/app/api/` - API routes (Next.js Route Handlers)
- `src/components/` - Reusable React components

## Data Flow

1. **Logging a workout**: Create Workout → Add WorkoutExercises → Add Sets to each
2. **Exercise lookup**: Check user exercises first, then global exercises
3. **PR tracking**: Query Sets by exercise, find max weight for given reps

## Current Status

Phase 1 (Foundation) - In Progress:
- [x] Project setup with Next.js, TypeScript, Tailwind
- [x] Database schema designed
- [x] Basic page structure and navigation
- [ ] User authentication (NextAuth.js)
- [ ] Exercise CRUD API
- [ ] Workout logging functionality

## Feature Roadmap

1. **Phase 1**: Auth, exercise library, basic workout logging
2. **Phase 2**: PR tracking, workout history, basic charts
3. **Phase 3**: Workout templates, rest timer, previous workout comparison
4. **Phase 4**: Body measurements, calendar view, data export
