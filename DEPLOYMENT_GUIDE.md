# Deployment Guide - Lekhāi

## 🔴 CRITICAL: Before Pushing to GitHub

### 1. Rotate ALL Credentials (MANDATORY)

Your `.env` file contains exposed credentials. **DO THIS IMMEDIATELY:**

```bash
# 1. Generate new AUTH_SECRET
openssl rand -base64 32
# Copy output and update .env

# 2. Generate ENCRYPTION_KEY
openssl rand -base64 32
# Copy output and add to .env

# 3. Get new OpenRouter API key
# Visit: https://openrouter.ai/keys
# Revoke: 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
# Generate new key and update .env

# 4. Create new database or rotate credentials
# Railway: https://railway.app
# Current DB is EXPOSED - create fresh one
```

### 2. Verify .env is NOT in Git

```bash
# This should show .env in .gitignore
cat .gitignore | grep "^.env$"

# This should return empty (good!)
git ls-files | grep "^.env$"
```

---

## 📤 Push to GitHub

```bash
# 1. Create a new repository on GitHub (don't initialize with README)
# Visit: https://github.com/new
# Name: lekhai

# 2. Add remote and push
git remote add origin https://github.com/YOUR_USERNAME/lekhai.git
git branch -M main
git push -u origin main
```

---

## 🚀 Deploy to Production

### Option 1: Vercel (Recommended)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy
vercel

# 3. Add environment variables in Vercel dashboard:
# - POSTGRES_URL (new database!)
# - AUTH_SECRET (newly generated!)
# - OPENROUTER_API_KEY (new key!)
# - ENCRYPTION_KEY (newly generated!)
# - STRIPE_SECRET_KEY
# - STRIPE_WEBHOOK_SECRET
# - BASE_URL (https://yourdomain.com)

# 4. Run migrations
vercel env pull .env.production.local
npm run db:migrate
```

### Option 2: Railway

```bash
# 1. Install Railway CLI
npm i -g @railway/cli

# 2. Login and initialize
railway login
railway init

# 3. Deploy
railway up

# 4. Add environment variables via Railway dashboard

# 5. Run migrations
railway run npm run db:migrate
```

---

## ✅ Post-Deployment Checklist

### Immediate (Today):

- [ ] All credentials rotated
- [ ] Old credentials revoked
- [ ] `.env` verified NOT in git
- [ ] Code pushed to GitHub (without secrets)
- [ ] Production environment variables configured
- [ ] Database migrations run
- [ ] Production site accessible

### This Week:

- [ ] Add custom domain
- [ ] Configure DNS (A/CNAME records)
- [ ] SSL certificate active (auto via Vercel/Railway)
- [ ] Test document generation end-to-end
- [ ] Test credit purchase with Razorpay test mode
- [ ] Configure Razorpay webhook in production
- [ ] Set up error monitoring (Sentry)
- [ ] Set up uptime monitoring

### Before Public Launch:

- [ ] Switch Razorpay to live mode
- [ ] Add Terms of Service page
- [ ] Add Privacy Policy page
- [ ] Add GDPR data export endpoint
- [ ] Configure rate limiting (Upstash Redis)
- [ ] Enable audit logging
- [ ] Set up automated backups
- [ ] Run security scan
- [ ] Load testing
- [ ] SEO optimization

---

## 🛡️ Security Hardening Steps

### Phase 2: HIGH PRIORITY (This Week)

See the full security audit report in [SECURITY.md](SECURITY.md).

#### ✅ COMPLETED Security Improvements:

1. **Rate Limiting (✅ IMPLEMENTED with graceful degradation):**

   Rate limiting is implemented in the codebase and works with or without Redis:
   - **Without Redis**: Logs warning but allows all requests (development mode)
   - **With Redis**: Enforces limits (production mode)

   To enable production rate limiting:
   ```bash
   # Sign up for Upstash Redis (free tier)
   # https://console.upstash.com/

   # Add to .env:
   UPSTASH_REDIS_REST_URL=https://...
   UPSTASH_REDIS_REST_TOKEN=...
   ```

   Current limits:
   - Authentication endpoints: 5 requests per 15 minutes per IP
   - Document generation: 10 requests per hour per user
   - General API: 100 requests per minute per IP

2. **Password Strength Requirements (✅ IMPLEMENTED):**
   - Minimum 8 characters
   - Must contain: uppercase, lowercase, number, special character
   - Applied to sign-up and password change

3. **LLM Input Sanitization (✅ IMPLEMENTED):**
   - Prevents prompt injection attacks
   - Removes dangerous patterns (system prompts, role-playing attempts)
   - Validates against token exhaustion attacks
   - All user inputs sanitized before LLM processing

4. **CSRF Protection (✅ IMPLEMENTED):**
   - Origin verification on all POST requests
   - Security headers added (X-Frame-Options, X-Content-Type-Options, etc.)
   - Next.js Server Actions provide built-in CSRF protection

5. **Authorization Fixes (✅ IMPLEMENTED):**
   - `removeTeamMember` now requires owner role
   - Added verification of team membership
   - Prevents self-removal

#### 🔄 REMAINING Tasks:

1. **Database Indexes:**
   Need to add indexes for performance optimization
   ```bash
   # Add indexes to lib/db/schema.ts
   # Then run:
   npm run db:generate
   npm run db:migrate
   ```

---

## 📊 Monitoring Setup

### Error Tracking (Sentry)

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs

# Add SENTRY_DSN to environment variables
```

### Uptime Monitoring

Free options:
- UptimeRobot: https://uptimerobot.com
- Pingdom: https://www.pingdom.com
- Better Uptime: https://betteruptime.com

### Analytics

- Vercel Analytics (built-in)
- Google Analytics
- Plausible (privacy-friendly)

---

## 🔧 Environment Variables Reference

### Required (All Environments):

```bash
POSTGRES_URL=postgresql://...
AUTH_SECRET=...
OPENROUTER_API_KEY=sk-or-v1-...
ENCRYPTION_KEY=...
BASE_URL=...
```

### Optional (Production Recommended):

```bash
# Razorpay (for payments)
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_SECRET=...

# Email Service (for password reset)
RESEND_API_KEY=...

# Rate Limiting & Caching
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...

# Monitoring
SENTRY_DSN=...
NEXT_PUBLIC_SENTRY_DSN=...

# Analytics
NEXT_PUBLIC_GA_ID=G-...
```

---

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Test connection
psql $POSTGRES_URL -c "SELECT 1"

# Check migrations
npm run db:studio
```

### Deployment Fails

```bash
# Clear build cache
vercel --force

# Check logs
vercel logs
```

### OpenRouter API Errors

```bash
# Test API key
curl https://openrouter.ai/api/v1/models \
  -H "Authorization: Bearer $OPENROUTER_API_KEY"
```

---

## 📞 Support

For issues:
1. Check [SECURITY.md](SECURITY.md) for security concerns
2. Review [README.md](README.md) for setup instructions
3. Open an issue on GitHub

---

**Last Updated:** 2025-01-23
**Version:** 1.0.0
