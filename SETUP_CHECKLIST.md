# Setup Checklist for Lekhai

Follow these steps in order to get your local development environment running.

## 1. Database Setup

- [ ] Choose a database option:
  - [ ] **Option A (Recommended):** Create free account at https://neon.tech
  - [ ] **Option B:** Create free account at https://supabase.com
  - [ ] **Option C:** Install PostgreSQL locally via Homebrew

- [ ] Get your database connection string
- [ ] Update `POSTGRES_URL` in `.env` file

**Connection string format:**
```
postgresql://username:password@host:port/database
```

---

## 2. API Keys Setup

### Stripe (for payments)
- [ ] Go to https://dashboard.stripe.com/register
- [ ] Complete registration (use test mode)
- [ ] Go to https://dashboard.stripe.com/test/apikeys
- [ ] Copy "Secret key" and update `STRIPE_SECRET_KEY` in `.env`
- [ ] (Webhook secret will be set up later with Stripe CLI)

### Anthropic Claude API (for document generation)
- [ ] Go to https://console.anthropic.com/
- [ ] Create account / Sign in
- [ ] Go to "API Keys" section
- [ ] Click "Create Key"
- [ ] Copy the key (starts with `sk-ant-`)
- [ ] Update `ANTHROPIC_API_KEY` in `.env`

**Note:** Claude API requires adding credits. You'll get some free credits initially.

---

## 3. Environment Variables Check

Open `.env` and verify these are filled in:

```bash
✓ POSTGRES_URL=postgresql://...    (from Step 1)
✓ STRIPE_SECRET_KEY=sk_test_...    (from Step 2)
✓ ANTHROPIC_API_KEY=sk-ant-...     (from Step 2)
✓ AUTH_SECRET=...                   (already generated)
✓ BASE_URL=http://localhost:3002   (default, don't change)

⏸ STRIPE_WEBHOOK_SECRET=whsec_...  (will set up later)
```

---

## 4. Database Migration

Once your `.env` is properly configured:

```bash
# Run migrations to create all tables
npm run db:migrate
```

**Expected output:**
```
✓ Migrations applied successfully
```

**If it fails:**
- Check your `POSTGRES_URL` is correct
- Make sure database is accessible
- See troubleshooting in LOCAL_SETUP.md

---

## 5. Start Development Server

```bash
npm run dev
```

**Expected output:**
```
✓ Ready in XXXms
- Local: http://localhost:3002
```

---

## 6. Test Basic Functionality

- [ ] Open http://localhost:3002 in browser
- [ ] Verify landing page shows "Lekhai" branding
- [ ] Click "Get Started" or go to http://localhost:3002/sign-up
- [ ] Try to create a test account
  - Email: test@example.com
  - Password: testpassword123

**If sign-up works:**
- [ ] You should be redirected to /dashboard
- [ ] Check your database - there should be a new user in `users` table
- [ ] Check `user_credits` table - should have 1 row with 0 credits

---

## 7. Optional: Set Up Stripe Webhooks (for payment testing)

Only do this when you're ready to test credit purchases:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local server (keep this running)
stripe listen --forward-to localhost:3002/api/stripe/webhook
```

Copy the webhook secret from the output and update `STRIPE_WEBHOOK_SECRET` in `.env`.

---

## Current Status Checklist

**Completed:**
- [x] STEP 1: Rebranding to "Lekhai"
- [x] STEP 2: Database schema for legal documents + credits
- [ ] STEP 3: Dashboard UX for document creation
- [ ] STEP 4: LLM integration for document generation
- [ ] STEP 5: Stripe pay-as-you-go credits flow

**Next:** Once your local environment is working, we'll move to STEP 3.

---

## Quick Commands Reference

```bash
# Development
npm run dev              # Start dev server

# Database
npm run db:generate      # Generate new migration (after schema changes)
npm run db:migrate       # Apply migrations
npm run db:studio        # Open database browser UI

# Stripe (after installing CLI)
stripe listen --forward-to localhost:3002/api/stripe/webhook
```

---

## Need Help?

See detailed troubleshooting in `LOCAL_SETUP.md`.

Common issues:
- Database connection errors → Check POSTGRES_URL
- Auth errors → Make sure AUTH_SECRET is set
- Port in use → Dev server will auto-switch to 3002
