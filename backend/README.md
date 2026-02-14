# Logic Looper API

Express API with PostgreSQL (Prisma) for users and daily scores.

## Routes

- **GET /health** – Returns `{ status, db: "connected"|"disconnected", timestamp }`. Use for readiness checks.
- **POST /api/users** – Create user. Body: `{ email? }`. Returns created user (guest if no email).
- **GET /api/users/:id** – Get user by id with stats and recent daily scores.
- **POST /api/score** – Create or update daily score. Body: `{ userId, date, puzzleId, score, timeTakenMs?, streak? }`. Streak is taken from the client (already computed); server stores it and does not recalculate. Returns `{ accepted: true, streak }`.
- **GET /api/score** – Get one score. Query: `userId`, `date` (YYYY-MM-DD).
- **GET /api/score/leaderboard** – Leaderboard for a date. Query: `date` (required), `limit` (default 50, max 100).

## Database (PostgreSQL)

1. Create a PostgreSQL database (e.g. [Neon.tech](https://neon.tech)).
2. Copy `.env.example` to `.env` and set `DATABASE_URL` to your connection string.
3. Generate Prisma Client and create tables:

   ```bash
   npm run db:generate
   npm run db:push
   ```

4. Start the server: `npm run dev`. The server connects to the DB on startup and exits if the connection fails.

## Run locally

```bash
cd backend
npm install
# Set DATABASE_URL in .env, then:
npm run db:generate
npm run db:push
npm run dev
```

API runs at `http://localhost:3000`.
