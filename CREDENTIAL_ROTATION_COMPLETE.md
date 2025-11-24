# Credential Rotation Status

## COMPLETED ROTATIONS

### 1. AUTH_SECRET - ROTATED
**Old value:** UPE1zWlwYuNwsw1BrmFAlemuQOAAOP47Xoosn+EaX0g=
**New value:** EJfI8SEkawQzjAug7fBtYraUX8l/uphoazBcZ6xeS1c=
**Status:** Updated in .env file
**Action Required:** None - this is automatically rotated

### 2. ENCRYPTION_KEY - NEWLY ADDED
**New value:** JV1/BGaIX6JPk1Br3gZuLTSigOEsEI1WfvLdLgixFkc=
**Status:** Added to .env file
**Action Required:** None - this is a new secure key

## MANUAL ACTIONS REQUIRED

### 3. OpenRouter API Key - REQUIRES YOUR ACTION

**Current exposed key (MUST REVOKE):**
```
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
```

**Steps to complete:**
1. Go to https://openrouter.ai/keys
2. Sign in to your account
3. Find and REVOKE the old key above
4. Click "Create Key" to generate a new key
5. Copy the new key
6. Open .env file
7. Replace `OPENROUTER_API_KEY=REPLACE_WITH_NEW_KEY_FROM_OPENROUTER` with your new key
8. Save the file

### 4. Database Credentials - REQUIRES YOUR ACTION

**Current database (EXPOSED):**
```
postgresql://postgres:xAtWwfuCcjAwlTTvGtaPRgULBNahyBGb@switchyard.proxy.rlwy.net:31460/railway
```

**Options:**

**Option A: Create New Database on Railway (Recommended)**
1. Go to https://railway.app
2. Sign in to your account
3. Create a new PostgreSQL database
4. Copy the connection string (POSTGRES_URL)
5. Update .env with new POSTGRES_URL
6. Run database migrations: `npm run db:migrate`

**Option B: Rotate Existing Database Credentials**
1. Go to Railway dashboard
2. Select your current database
3. Go to Settings > Reset Password
4. Copy new connection string
5. Update .env with new POSTGRES_URL
6. No migrations needed (same database)

**Option C: Keep Current Database (NOT RECOMMENDED for Production)**
- Only acceptable if this is purely for local development/testing
- Change database before pushing to GitHub or deploying

### 5. Stripe Keys - REQUIRES YOUR ACTION (if using Stripe)

**Current status:** Using placeholder values
**Action Required:**
1. Go to https://dashboard.stripe.com/test/apikeys
2. Sign in to your Stripe account
3. Copy your Secret Key (starts with sk_test_)
4. Update STRIPE_SECRET_KEY in .env
5. Go to Developers > Webhooks
6. Create webhook endpoint or copy existing webhook secret
7. Update STRIPE_WEBHOOK_SECRET in .env

## VERIFICATION CHECKLIST

After completing manual actions:

- [ ] OpenRouter API key rotated and updated in .env
- [ ] Database credentials rotated (new database OR password reset)
- [ ] .env file has all required values (no REPLACE_WITH placeholders)
- [ ] Test the application locally: `npm run dev`
- [ ] Verify database connection works
- [ ] Test document generation with new OpenRouter key
- [ ] Verify .env is in .gitignore (already confirmed)
- [ ] Run `git status` to ensure .env is NOT tracked

## NEXT STEPS AFTER ROTATION

1. Test Application Locally
```bash
npm run dev
# Visit http://localhost:3002
# Try signing up, generating a document
```

2. Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/lekhai.git
git branch -M main
git push -u origin main
```

3. Deploy to Production (Vercel)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard:
# - POSTGRES_URL (new database connection)
# - AUTH_SECRET (new value from .env)
# - ENCRYPTION_KEY (new value from .env)
# - OPENROUTER_API_KEY (new value from .env)
# - BASE_URL (production domain)
# - STRIPE_SECRET_KEY (if using Stripe)
# - STRIPE_WEBHOOK_SECRET (if using Stripe)

# Run migrations in production
vercel env pull .env.production.local
npm run db:migrate
```

## SECURITY NOTES

- The old AUTH_SECRET has been rotated and is now invalid
- The old OpenRouter API key is publicly exposed and MUST be revoked
- The database credentials are publicly exposed - strongly recommend creating new database
- Never commit .env file to git
- Use environment variables in production (Vercel/Railway dashboard)
- Keep this file (CREDENTIAL_ROTATION_COMPLETE.md) for reference but do NOT commit it

## AUTOMATED ROTATIONS COMPLETED

The following have been automatically rotated and are secure:
- AUTH_SECRET: New 32-byte random value
- ENCRYPTION_KEY: New 32-byte random value

These keys are cryptographically secure and can be used in production.
