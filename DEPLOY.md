# Deploy: Frontend (Vercel) + Backend (Render)

## 1. Backend on Render

1. **Create a PostgreSQL database**
   - [Render Dashboard](https://dashboard.render.com) → New → PostgreSQL (or use Neon/Supabase).
   - Copy the **Internal Database URL** (or external URL if you use an external DB).

2. **Create a Web Service from this repo**
   - New → Web Service.
   - Connect your Git repo.
   - Render will detect `render.yaml`. Confirm:
     - **Root Directory:** `backend`
     - **Build Command:** `npm install && npx prisma generate && npm run build`
     - **Start Command:** `npm start`

3. **Set environment variables** (Dashboard → your service → Environment):
   | Variable | Description |
   |----------|-------------|
   | `DATABASE_URL` | Full PostgreSQL URL (e.g. `postgresql://user:pass@host/db?sslmode=require`) |
   | `JWT_SECRET` | Strong random string (e.g. `openssl rand -hex 32`) |
   | `FRONTEND_URL` | Your Vercel app URL, e.g. `https://your-app.vercel.app` (set after deploying frontend) |
   | `GOOGLE_CLIENT_ID` | Google OAuth 2.0 Client ID |
   | `GOOGLE_CLIENT_SECRET` | Google OAuth 2.0 Client secret |
   | `GOOGLE_REDIRECT_URI` | `https://<your-render-service-url>/api/auth/callback/google` |

4. **Apply database schema**
   - After first deploy, open the service → Shell (or use Render’s “Run Command” if available).
   - Run: `npx prisma db push` (or `npx prisma migrate deploy` if you use migrations).

5. **Note your backend URL**  
   Example: `https://logic-looper-api.onrender.com`

---

## 2. Frontend on Vercel

1. **Import the repo**
   - [Vercel](https://vercel.com) → Add New → Project → Import your Git repo.

2. **Configure the project**
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite (auto-detected)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `dist` (default)

3. **Add environment variable**
   - Settings → Environment Variables:
   - **Name:** `VITE_API_URL`
   - **Value:** Your Render backend URL, e.g. `https://logic-looper-api.onrender.com` (no trailing slash)

4. **Deploy**  
   Trigger a deploy (or push to your main branch).

5. **Update backend `FRONTEND_URL`**  
   In Render, set `FRONTEND_URL` to your Vercel URL (e.g. `https://your-project.vercel.app`).

---

## 3. Google OAuth (if you use Sign in with Google)

- In [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials:
  - **Authorized redirect URIs:** add `https://<your-render-url>/api/auth/callback/google`
  - **Authorized JavaScript origins:** add your Vercel URL (e.g. `https://your-app.vercel.app`)

---

## Quick reference

| Platform | Root | Build | Start / Output |
|----------|------|--------|----------------|
| **Render (backend)** | `backend` | `npm install && npx prisma generate && npm run build` | `npm start` |
| **Vercel (frontend)** | `frontend` | `npm run build` | output: `dist` |
