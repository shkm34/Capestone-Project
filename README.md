# Logic Looper – Daily Puzzle MVP

This repository contains an internship demo project for a **client‑first daily logic puzzle game** called **Logic Looper**.

### Current scope (MVP slice)

- **Frontend**: `frontend/`
  - React + TypeScript + Vite.
  - Tailwind CSS v4 (CSS‑first setup).
  - A deterministic **Sequence Solver** daily puzzle:
    - Puzzle is generated purely on the client from today&apos;s date.
    - User fills in the missing value in an arithmetic sequence.
    - Client‑side validator returns correctness and a simple score.

### How to run the frontend

```bash
cd frontend
npm install    # first time only
npm run dev
```

Then open the URL printed by Vite (usually `http://localhost:5173`).

### Next steps (if time allows)

- Add local streak tracking and a small heatmap.
- Extract puzzle engine into reusable modules for additional puzzle types.
- Introduce a minimal backend (Express + Prisma) for persisting scores and streaks.

