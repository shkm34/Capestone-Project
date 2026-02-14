# Logic Looper – Daily Puzzle MVP

This repository contains an internship demo project for a **client‑first daily logic puzzle game** called **Logic Looper**.

### Current scope (MVP slice)

- **Frontend** (`frontend/`): React + TypeScript + Vite, Tailwind CSS v4, Bluestock-inspired branding.
  - Daily **Sequence Solver** puzzle (client-side generation and validation).
  - Local **streak** and **hint** (one per day), persisted in `localStorage` via `dailyMeta`.
  - Refactored structure: `hooks/`, `components/`, `state/`, `game/`.
- **Backend** (`backend/`): Minimal Express + TypeScript API.
  - `GET /health`, `POST /api/score` (accepts score payload; persistence can be wired via Prisma).
  - Prisma schema in `backend/prisma/schema.prisma` (User, UserStats, DailyScore).

### How to run

**Frontend**

```bash
cd frontend
npm install    # first time only
npm run dev
```

Open the URL printed by Vite (usually `http://localhost:5173`).

**Backend (optional)**

```bash
cd backend
npm install
npm run dev
```

API runs at `http://localhost:3000`. See `backend/README.md` for routes and optional DB setup.

### Next steps (if time allows)

- Wire frontend to `POST /api/score` after solving (e.g. from `useDailySequenceGame`).
- Add Jest tests for `sequencePuzzle` and `dailyMeta` (e.g. `computeStreak`).

