# Logic Looper API

Express API with PostgreSQL (Prisma) for users and daily scores.

## Routes

### Auth (NextAuth-style)

- **GET /api/auth/session** – Current user if signed in (`Authorization: Bearer <token>`). Returns `{ user: { id, email } }` or 401.
- **GET /api/auth/signin/google** – Redirects to Google OAuth.
- **GET /api/auth/callback/google** – OAuth callback; creates/updates user, redirects to `FRONTEND_URL#token=<jwt>` (client stores token and sends it as Bearer).
- **POST /api/auth/signout** – Returns 200; client drops the token.

### Other

- **GET /health** – Returns `{ status, db: "connected"|"disconnected", timestamp }`. Use for readiness checks.
- **POST /api/users** – Create user. Body: `{ email? }`. Returns created user plus `token` (JWT). **Option A (guest):** guests get a JWT in the response; the client stores it and sends `Authorization: Bearer <token>` so they can call protected endpoints (e.g. submit score) like signed-in users.
- **GET /api/users/:id** – Get user by id with stats and recent daily scores.
- **POST /api/score** – **Requires auth** (Bearer token). Create or update daily score for the authenticated user. Body: `{ date, puzzleId, score, timeTakenMs?, streak? }`. User id comes from the JWT, not the body. Returns `{ accepted: true, streak }`.
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

## Google OAuth setup

1. In [Google Cloud Console](https://console.cloud.google.com/apis/credentials), create an OAuth 2.0 Client ID (Web application).
2. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google` (and your production callback URL when you deploy).
3. In `backend/.env` add:

   ```
   GOOGLE_CLIENT_ID="..."
   GOOGLE_CLIENT_SECRET="..."
   GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/callback/google"
   FRONTEND_URL="http://localhost:5173"
   JWT_SECRET="a-long-random-secret"
   ```

4. Restart the backend. The frontend will show “Sign in with Google”; after sign-in, the callback redirects with the token in the URL hash; the frontend stores it and sends `Authorization: Bearer <token>` on API requests.
