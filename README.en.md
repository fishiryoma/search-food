# What to Eat Nearby

[繁體中文](README.md)

A walkable-distance restaurant recommendation app, built as a vibe coding (AI-collaborative development) project. After getting your location and answering a couple of quick questions, AI analyzes restaurants within 1 km and sorts them by flavor and menu, helping even the most indecisive user pick something that fits their appetite.

![Restaurant recommendations and menu filtering screen](public/menu-show.png)

## Features

- Automatic geolocation, searches restaurants within a 1 km radius
- Pre-search questionnaire: budget and flavor preference (optional, can be skipped)
- Gemini AI analyzes each restaurant, inferring cuisine, signature dishes, a one-line summary, and a recommendation score
- Sorted by AI score, with a gold badge for the top pick
- Map markers + InfoWindow showing price level, rating, and walking time
- Two-dimensional flavor / recommended-dish filtering (with one-click clear)
- "Show more recommendations" (+5 at a time)
- Re-analyze: re-fetches the Nearby API for fresh results before recomputing

## Tech Stack

Frontend and backend are separated.

**Frontend (Vite static export)**

- Vite + React 19
- TypeScript + Tailwind CSS
- @vis.gl/react-google-maps
- Zustand (filter state)
- Zod (schema shared with the backend)

**Backend (Firebase Cloud Functions Gen2)**

- `/nearby` → Google Places Nearby Search API
- `/analyze` → Google Gemini 2.0 Flash
- Firestore → cache (10-minute TTL) + rate limiting
- Secret Manager → holds all API keys

The frontend is a pure static build deployed to Firebase Hosting; all API keys live only on the backend.

## Security Design

- **API key isolation**: all keys (Google Places, Gemini) are stored in Firebase Secret Manager and read only by Cloud Functions; the frontend bundle contains no backend keys
- **CORS allowlist**: in production, Cloud Functions only accept requests from the app's own Hosting domain; everything else is rejected
- **Two-tier rate limiting**: 30 requests/minute per IP, plus a site-wide daily cap of 100 Nearby API calls, to prevent abuse from a single source or runaway cost
- **Firestore access control**: `firestore.rules` explicitly denies all client SDK / REST API access; the database is reachable only through the Cloud Functions Admin SDK
- **Uniform error format**: every external API call is wrapped in try/catch, and errors always return `{ error: string }` without leaking internal details

> The purpose, document ID scheme, fields, and cleanup strategy for each Firestore collection (`places_cache`, `rate_limits`, `global_usage`) are documented in [`dev-log/phases/M6-cache-security.md`](dev-log/phases/M6-cache-security.md#firestore-資料結構參考補記於-2026-09-24) (in Traditional Chinese).

## Development Approach: Vibe Coding

This project was built via vibe coding, working with AI throughout, using two mechanisms to keep development quality and decisions traceable:

- **CLAUDE.md**: defines the project's technical conventions and AI behavior rules (e.g. no `any` in the frontend, pnpm only, mandatory lint/tsc/format checks after every change), so the AI assistant follows the same rules on every collaboration.
- **dev-log/**: records the development process and its outcomes, preventing lost context or untraceable decisions across AI collaboration sessions. The dev-log itself is kept in Traditional Chinese. Look here for specific details:
  - `00-overview.md`: project overview, tech stack summary, version history
  - `01-requirements.md`: full feature spec and out-of-scope items
  - `02-architecture-decisions.md`: architecture decisions (ADRs), e.g. why Cloud Functions instead of Next.js API Routes, why Next.js was later replaced with Vite
  - `03-api-research.md`: cost estimates, limits, and model choices for the Google Places / Gemini APIs
  - `04-ai-discussions.md`: summaries of design decisions reached through discussions with AI
  - `05-issues-and-solutions.md`: bugs encountered and how they were fixed (TypeScript typing issues, deployment errors, etc.)
  - `phases/`: goals, progress, and open issues per milestone — e.g. `M6-cache-security.md` holds the full record of the Firestore data model and the caching/rate-limiting/security design

## Prerequisites

- Node.js >= 20
- pnpm >= 9
- Firebase CLI: `npm install -g firebase-tools`
- An existing Firebase project (with Firestore, Cloud Functions, and Hosting enabled)

Required API keys (all created in the GCP Console):

| Key | Purpose |
|---|---|
| Google Maps JavaScript API Key | Frontend map display (restrict by HTTP referrer) |
| Google Maps Map ID | Required for AdvancedMarker; falls back to DEMO_MAP_ID automatically if unset (optional) |
| Google Places API Key | Backend Nearby Search (restrict to Cloud Functions IPs) |
| Gemini API Key | Backend AI analysis |

## Local Development

**1. Install frontend dependencies**

```bash
pnpm install
```

**2. Set up frontend environment variables**

```bash
cp .env.local.example .env.local
# Fill in VITE_GOOGLE_MAPS_KEY and VITE_GOOGLE_MAPS_ID
```

**3. Install Functions dependencies**

```bash
cd functions && npm install && cd ..
```

**4. Set up local Functions secrets**

```bash
# functions/.secret.local (not committed to version control)
GOOGLE_PLACES_KEY=your_places_api_key
GEMINI_API_KEY=your_gemini_api_key
```

**5. Start the local environment (two terminals)**

```bash
# Terminal 1: Firebase Emulator (Functions + Firestore)
firebase emulators:start --only functions,firestore

# Terminal 2: Vite dev server
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173)

> **Note**: `firebase emulators:start` does not automatically recompile TypeScript — the emulator actually runs whatever was last compiled into `functions/lib/`. If you edit `functions/src/*.ts` without rebuilding, the emulator keeps running the old code. After changing Functions code, use one of the following so the emulator picks up the latest version:
>
> ```bash
> # Option A: rebuild once per change
> cd functions && npm run build && cd ..
>
> # Option B: open another terminal and watch continuously
> cd functions && npm run build:watch
> ```

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── AnalyzeFilter.tsx     # Flavor / recommended-dish filters
│   │   ├── LoadingSpinner.tsx
│   │   ├── MapView.tsx           # Google Maps + markers + InfoWindow
│   │   ├── QuestionnaireOverlay.tsx  # Questionnaire overlay
│   │   └── RestaurantCard.tsx    # Restaurant card
│   ├── hooks/
│   │   ├── useGeolocation.ts
│   │   ├── usePlaces.ts
│   │   └── useWalkingTime.ts     # Haversine-based walking-time estimate
│   ├── lib/
│   │   ├── api.ts                # fetchNearby / fetchAnalyze
│   │   ├── questionnaire.ts      # Questionnaire option constants
│   │   └── schemas.ts            # Zod schemas (shared with the backend)
│   ├── store/
│   │   └── useFilterStore.ts     # Zustand filter state
│   ├── App.tsx                   # Main flow control
│   └── main.tsx                  # Entry point
├── functions/src/
│   ├── nearby.ts                 # /nearby endpoint
│   ├── analyze.ts                # /analyze endpoint (Gemini)
│   └── utils.ts                  # CORS, rate limiting
└── index.html
```

## Scripts

```bash
pnpm dev              # Start the dev server
pnpm build            # Static build to dist/
pnpm preview          # Preview the build output
pnpm lint             # ESLint
pnpm tsc --noEmit     # TypeScript type check
pnpm format           # Prettier formatting
pnpm format:check     # Prettier format check
```

## Deployment

```bash
# Deploy frontend + Functions together (firebase deploy does not build automatically; build the frontend first)
pnpm build && firebase deploy

# Deploy Functions only
firebase deploy --only functions

# Deploy frontend only
pnpm build && firebase deploy --only hosting
```

Functions use Firebase Secret Manager for API keys; set these before deploying:

```bash
firebase functions:secrets:set GOOGLE_PLACES_KEY
firebase functions:secrets:set GEMINI_API_KEY
```
