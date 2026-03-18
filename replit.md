# Workspace

## Overview

pnpm workspace monorepo using TypeScript. NomadFlow — a mobile travel itinerary app built with Expo React Native.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Mobile**: Expo SDK 54, React Native, Expo Router
- **State**: React Query (@tanstack/react-query)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server (trips + activities routes)
│   └── mobile/             # Expo React Native app (NomadFlow)
│       ├── app/
│       │   ├── _layout.tsx          # Root layout with providers
│       │   ├── (tabs)/
│       │   │   ├── _layout.tsx      # Tab navigation (NativeTabs/Classic)
│       │   │   └── index.tsx        # Trips dashboard screen
│       │   └── trip/[id].tsx        # Trip detail + timeline screen
│       ├── components/
│       │   ├── TripCard.tsx          # Trip card with status badge
│       │   ├── ActivityNode.tsx      # Timeline activity node
│       │   ├── AddActivitySheet.tsx  # Bottom sheet for adding activities
│       │   ├── CreateTripSheet.tsx   # Bottom sheet for creating trips
│       │   ├── ErrorBoundary.tsx     # Error boundary wrapper
│       │   └── ErrorFallback.tsx     # Error fallback UI
│       ├── constants/colors.ts       # NomadFlow color theme
│       ├── types/index.ts            # TypeScript types
│       └── utils/
│           ├── api.ts               # API client functions
│           └── helpers.ts           # Date, time, category utilities
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/
│       └── src/schema/
│           ├── trips.ts     # trips table schema
│           └── activities.ts # activities table schema
└── scripts/                # Utility scripts
```

## Features

- **My Trips Dashboard**: Visual cards grouped by status (Active/Upcoming/Past) with days remaining
- **Smart Timeline**: Vertical timeline with categorized activity nodes (transport, food, accommodation, etc.)
- **Category Auto-detection**: Activities get icons/colors based on title keywords
- **Day Navigator**: Horizontal scrollable day tabs with activity count badges
- **Quick-Add Sheet**: Bottom sheet for adding activities with category picker
- **Trip Creation**: Color-coded trip cards with real-time preview
- **Full CRUD**: Create/delete trips and activities backed by PostgreSQL

## API Routes

- `GET /api/trips` — list all trips
- `POST /api/trips` — create trip
- `GET /api/trips/:id` — get trip with activities
- `DELETE /api/trips/:id` — delete trip (cascades activities)
- `GET /api/trips/:id/activities` — list activities (optional `?dayIndex=`)
- `POST /api/trips/:id/activities` — add activity
- `PUT /api/trips/:id/activities/:actId` — update activity
- `DELETE /api/trips/:id/activities/:actId` — delete activity

## DB Schema

### trips
- id, name, destination, startDate, endDate, coverColor, createdAt

### activities
- id, tripId (FK→trips), dayIndex, title, category, startTime, endTime, location, notes, createdAt

## Activity Categories

transport | accommodation | food | nature | culture | shopping | nightlife | other

Each has a color and Ionicon assigned automatically based on title keywords.

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. Run `pnpm run typecheck` from root.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly`
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API client from openapi.yaml
- `pnpm --filter @workspace/db run push` — push schema changes to DB
