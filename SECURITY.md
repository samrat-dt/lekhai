# Security Policy

## ⚠️ CRITICAL: Credential Rotation Required

**The `.env` file in this repository contains exposed credentials that MUST be rotated immediately.**

### Immediate Actions Required:

1. **Generate New AUTH_SECRET:**
   ```bash
   openssl rand -base64 32
   ```
   Update `.env` with the new value

2. **Generate New ENCRYPTION_KEY:**
   ```bash
   openssl rand -base64 32
   ```
   Add to `.env`

3. **Rotate Database Credentials:**
   - Create a new database or reset credentials in Railway/Neon
   - Update `POSTGRES_URL` in `.env`

4. **Generate New OpenRouter API Key:**
   - Go to https://openrouter.ai/keys
   - Revoke old key
   - Generate new key
   - Update `OPENROUTER_API_KEY` in `.env`

5. **Never Commit `.env`:**
   - `.env` is already in `.gitignore`
   - Use `.env.local` for local development
   - Use environment variables in production (Vercel, Railway, etc.)

## Reporting a Vulnerability

If you discover a security vulnerability, please email security@yourdomain.com or create a private security advisory on GitHub.

**DO NOT** create a public issue for security vulnerabilities.

## Security Best Practices

### For Developers:
- Always use `.env.local` for local secrets
- Never commit API keys or passwords
- Use strong, unique passwords (12+ characters)
- Enable 2FA on all accounts
- Review code for SQL injection, XSS, CSRF vulnerabilities

### For Production:
- Enable HTTPS only (no HTTP)
- Set secure cookie flags
- Implement rate limiting
- Enable audit logging
- Regular security updates
- Backup database daily
- Monitor for suspicious activity

## Compliance

This application aims to comply with:
- OWASP Top 10 Security Standards
- GDPR Data Protection Requirements
- SOC 2 Security Controls
- ISO 27001 Information Security Standards

## Security Features

- ✅ JWT-based authentication
- ✅ Bcrypt password hashing
- ✅ Input validation with Zod
- ✅ CSRF protection
- ✅ Rate limiting
- ✅ SQL injection prevention (Drizzle ORM)
- ✅ XSS protection
- ✅ Secure HTTP headers
- ✅ Data encryption at rest
- ✅ Audit logging

## Last Updated

2025-01-23
