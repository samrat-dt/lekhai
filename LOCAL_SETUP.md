# Local Development Setup for Lekhai

This guide will help you set up Lekhai for local development.

## Step 1: Set Up PostgreSQL Database

### Option A: Neon (Recommended - Free Serverless)

1. Go to https://neon.tech
2. Sign up (no credit card required)
3. Click "Create a project"
4. Copy the connection string (looks like: `postgresql://user:pass@host/dbname`)
5. Skip to Step 2 below

### Option B: Supabase (Free with Extras)

1. Go to https://supabase.com
2. Sign up and create a new project
3. Wait for project to initialize (2-3 minutes)
4. Go to Project Settings > Database
5. Copy the "Connection string" (Session mode)
6. Skip to Step 2 below

### Option C: Install PostgreSQL Locally (Advanced)

If you want a fully local setup:

**Install Homebrew first:**
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

**Then install PostgreSQL:**
```bash
brew install postgresql@15
brew services start postgresql@15
createdb lekhai_dev
```

Your connection string will be:
```
postgresql://localhost/lekhai_dev
```

---

## Step 2: Configure Environment Variables

Edit the `.env` file in the project root:

```bash
# Database (replace with your actual connection string from Neon/Supabase)
POSTGRES_URL=postgresql://your-connection-string-here

# Stripe (get from https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY=sk_test_your_test_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Base URL
BASE_URL=http://localhost:3002

# Auth Secret (generate with: openssl rand -base64 32)
AUTH_SECRET=your-random-secret-key-here

# Claude API (get from https://console.anthropic.com/)
ANTHROPIC_API_KEY=sk-ant-your-api-key-here
```

### Getting API Keys:

**Stripe Test Keys:**
1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy "Secret key" (starts with `sk_test_`)
3. For webhook secret, we'll set this up later in Step 4

**Claude API Key:**
1. Go to https://console.anthropic.com/
2. Sign up if you haven't
3. Go to API Keys
4. Create a new key
5. Copy the key (starts with `sk-ant-`)

**Auth Secret:**
Run this command to generate a random secret:
```bash
openssl rand -base64 32
```

---

## Step 3: Run Database Migrations

Once your `.env` is configured with the correct `POSTGRES_URL`:

```bash
# Apply all migrations (creates tables)
npm run db:migrate
```

This will create all the tables:
- users
- teams (legacy, will be removed later)
- team_members (legacy)
- activity_logs (legacy)
- invitations (legacy)
- legal_documents (new)
- user_credits (new)
- credit_transactions (new)

---

## Step 4: Start Development Server

```bash
npm run dev
```

The app will be available at: http://localhost:3002

---

## Step 5: Test the App

1. **Sign up for an account:**
   - Go to http://localhost:3002/sign-up
   - Create a test account

2. **Check database:**
   - You should see a new user in the `users` table
   - You should see a corresponding row in `user_credits` with 0 credits

---

## Step 6: Set Up Stripe Webhook (For Testing Payments)

To test credit purchases locally, you need to forward Stripe webhooks:

1. **Install Stripe CLI:**
   ```bash
   brew install stripe/stripe-cli/stripe
   ```

2. **Login to Stripe:**
   ```bash
   stripe login
   ```

3. **Forward webhooks to your local server:**
   ```bash
   stripe listen --forward-to localhost:3002/api/stripe/webhook
   ```

4. **Copy the webhook signing secret:**
   - The CLI will output a webhook secret (starts with `whsec_`)
   - Add it to your `.env` file as `STRIPE_WEBHOOK_SECRET`

5. **In another terminal, trigger a test payment:**
   ```bash
   stripe trigger checkout.session.completed
   ```

---

## Development Workflow

### Daily Development:
```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: (Optional) If testing payments
stripe listen --forward-to localhost:3002/api/stripe/webhook
```

### When you change the database schema:
```bash
# Generate migration
npm run db:generate

# Apply migration
npm run db:migrate
```

### View database contents:
```bash
# Open Drizzle Studio (web UI for your database)
npm run db:studio
```

This opens a browser at http://localhost:4983 where you can browse tables.

---

## Troubleshooting

### "relation does not exist" error
- Run `npm run db:migrate` to apply migrations

### "ECONNREFUSED" database error
- Check your `POSTGRES_URL` is correct in `.env`
- Make sure your database is running (if local)
- If using Neon/Supabase, check if your IP is allowed (usually auto-allowed)

### Port 3000 already in use
- The dev server will auto-switch to 3002 (or next available)
- Or kill the process using port 3000: `lsof -ti:3000 | xargs kill`

### Stripe webhook not receiving events
- Make sure `stripe listen` is running
- Check the webhook secret in `.env` matches the CLI output
- Restart dev server after updating `.env`

---

## Next Steps

Once everything works locally:
1. Implement document generation (STEP 3)
2. Implement credit purchase flow (STEP 5)
3. Deploy to Vercel
4. Set up production database (Vercel Postgres or Neon)
5. Set up production Stripe webhook
