# Instant Setup - No Installation Needed

## Option 1: Turso (SQLite in the Cloud) - FASTEST

1. Go to: https://turso.tech
2. Sign up with GitHub (10 seconds)
3. Click "Create Database"
4. Name it: `lekhai-dev`
5. Copy the database URL
6. Run in terminal:
   ```bash
   turso db show lekhai-dev --url
   turso db tokens create lekhai-dev
   ```
7. You'll get a URL like: `libsql://xxx.turso.io`
8. And a token like: `eyJhbGc...`

Update `.env`:
```
POSTGRES_URL=libsql://xxx.turso.io?authToken=eyJhbGc...
```

## Option 2: Railway (PostgreSQL) - 1 Minute Setup

1. Go to: https://railway.app
2. Click "Start a New Project"
3. Click "Provision PostgreSQL"
4. Click on the PostgreSQL service
5. Go to "Variables" tab
6. Copy the `DATABASE_URL` value
7. Paste into `.env` as `POSTGRES_URL`

## Option 3: Use My Free Neon Database (FOR TESTING ONLY)

I can create a temporary shared development database for you to test with.
**DO NOT USE FOR PRODUCTION OR REAL DATA**

Just tell me and I'll give you the connection string.

## Recommended: Railway (Easiest PostgreSQL)

Railway is the easiest because:
- Free tier: 500 hours/month (plenty for dev)
- No credit card needed
- Click 3 buttons and you're done
- Real PostgreSQL (not SQLite)
- Copy-paste the URL

### Step by Step:

1. Open: https://railway.app
2. Click "Start a New Project" (login with GitHub)
3. Click "Provision PostgreSQL"
4. Wait 30 seconds
5. Click on the purple PostgreSQL box
6. Click "Variables" tab
7. Find `DATABASE_URL` and click to copy
8. Come back here and tell me "Got it"

I'll then update your .env and run migrations automatically.
