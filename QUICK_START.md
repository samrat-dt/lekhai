# Quick Start Guide - Get Running in 5 Minutes

Since local PostgreSQL requires admin access, we'll use free cloud services. This is actually better for testing and matches what you'll use in production.

## Step 1: Set Up Neon Database (2 minutes)

1. **Go to https://neon.tech** in your browser
2. Click "Sign Up" (use GitHub login for fastest setup)
3. Once logged in, click "Create a project"
4. Project name: `lekhai-dev`
5. Region: Choose closest to you
6. Click "Create project"
7. **IMPORTANT:** Copy the connection string that appears (starts with `postgresql://`)
   - It looks like: `postgresql://username:password@ep-something.region.aws.neon.tech/neondb`

## Step 2: Get API Keys (3 minutes)

### Stripe Test Key (1 minute)
1. Go to https://dashboard.stripe.com/register
2. Sign up (email + password)
3. Skip onboarding (click "Skip for now" buttons)
4. Go to Developers > API Keys: https://dashboard.stripe.com/test/apikeys
5. Copy the "Secret key" (starts with `sk_test_`)

### Claude API Key (2 minutes)
1. Go to https://console.anthropic.com/
2. Sign in with email/Google
3. Click "Get API keys" or go to Settings > API Keys
4. Click "Create Key"
5. Copy the key (starts with `sk-ant-`)
6. **Note:** You need to add billing info and credits, but you get free credits initially

## Step 3: Update .env File

Open the `.env` file in your project and update these lines:

```bash
# Replace with your Neon connection string
POSTGRES_URL=postgresql://username:password@ep-something.region.aws.neon.tech/neondb

# Replace with your Stripe test key
STRIPE_SECRET_KEY=sk_test_your_key_here

# Replace with your Claude API key
ANTHROPIC_API_KEY=sk-ant-your_key_here

# These are fine as-is for now
STRIPE_WEBHOOK_SECRET=whsec_placeholder
BASE_URL=http://localhost:3002
AUTH_SECRET=UPE1zWlwYuNwsw1BrmFAlemuQOAAOP47Xoosn+EaX0g=
```

Save the file.

## Step 4: Run Migrations

In your terminal:

```bash
npm run db:migrate
```

Expected output: "Migrations applied successfully"

## Step 5: Test the App

1. Go to http://localhost:3002/sign-up
2. Create a test account:
   - Email: test@example.com
   - Password: testpassword123
3. If it works, you're ready!

---

## Troubleshooting

**"Connection refused" error:**
- Check your POSTGRES_URL is correct
- Make sure you copied the entire connection string from Neon

**"Invalid API key" error:**
- Check your Stripe/Claude keys are correct
- Make sure there are no extra spaces

**Need help?**
- Check if dev server is running: http://localhost:3002
- Restart dev server: Stop it (Ctrl+C) and run `npm run dev` again
- Check `.env` file has no syntax errors
