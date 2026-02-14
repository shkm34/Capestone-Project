# How to get and set your database URL

## 1. Get a free PostgreSQL database

### Option A: Neon (recommended, free tier)

1. Go to **https://neon.tech** and sign up (GitHub or email).
2. Click **Create a project** and pick a name/region.
3. On the project dashboard, open the **Connection string** section.
4. Copy the connection string (it looks like  
   `postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`).

### Option B: Supabase (free tier)

1. Go to **https://supabase.com** and sign up.
2. Create a new project and wait for it to be ready.
3. Go to **Project Settings** → **Database**.
4. Under **Connection string**, choose **URI** and copy it.  
   It looks like:  
   `postgresql://postgres.[ref]:[YOUR-PASSWORD]@aws-0-region.pooler.supabase.com:5432/postgres`

## 2. Set the URL in your project

1. Open **`backend/.env`** in this repo.
2. Replace the value of `DATABASE_URL` with your copied connection string.

   - If the URL already has a password, use it as-is.
   - For Supabase, replace `[YOUR-PASSWORD]` with the database password you set when creating the project.

Example (yours will be different):

```env
DATABASE_URL="postgresql://myuser:abc123xyz@ep-cool-name-123456.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

## 3. Apply the schema and run the backend

From the project root:

```bash
cd backend
npx prisma db push
npm run dev
```

The API will use this database for users and scores.
