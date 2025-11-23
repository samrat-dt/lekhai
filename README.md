# Lekhāi — Legal Document Drafting Platform

**Precision with empathy.** Generate professional Indian legal documents using AI.

## Features

- **9 Ready-to-Use Forms**
  - Lost Document Affidavit
  - Name Correction Affidavit
  - Address Proof Affidavit
  - Bank Request Letter
  - Rent Receipt Generator
  - Payment Default Notice
  - Work Delay Notice
  - F&F Settlement Notice
  - Rent Default Notice

- **Credit-Based System**
  - Track usage with credit balance
  - Automatic refunds on failures
  - Transaction logging

- **AI Document Generation**
  - FREE tier using OpenRouter
  - Indian legal formatting
  - Context-aware drafting
  - Professional output

- **Indian Localization**
  - DD/MM/YYYY date format
  - ₹ (Rupee) currency
  - Indian legal terminology
  - Regional compliance

## Tech Stack

- **Frontend:** Next.js 15, React 19, TailwindCSS
- **Backend:** Next.js Server Actions
- **Database:** PostgreSQL (Railway)
- **ORM:** Drizzle
- **AI:** OpenRouter API (FREE model)
- **Auth:** Custom JWT-based

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
# Add your OPENROUTER_API_KEY to .env

# Run database migrations
npm run db:migrate

# Start development server
npm run dev

# Open Drizzle Studio (database viewer)
npm run db:studio
```

Visit http://localhost:3003

## Environment Variables

```bash
# Database
POSTGRES_URL=postgresql://...

# Authentication
AUTH_SECRET=...
BASE_URL=http://localhost:3003

# OpenRouter API (FREE)
OPENROUTER_API_KEY=sk-or-v1-...

# Stripe (Optional - for credit purchases)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Project Structure

```
app/
├── (dashboard)/dashboard/
│   └── documents/
│       ├── actions.ts          # Document generation logic
│       ├── page.tsx            # Document list
│       ├── new/page.tsx        # Type selector + forms
│       └── [id]/page.tsx       # View generated doc

components/documents/
├── LostDocumentAffidavitForm.tsx
├── NameCorrectionAffidavitForm.tsx
├── RentReceiptForm.tsx
└── ... (9 form components)

lib/
├── db/
│   ├── schema.ts              # Database tables
│   └── migrations/
└── document-types.ts          # Document type definitions
```

## Design System

Lekhāi follows a minimal, professional design language:

- **Colors:** Courtroom Black (#0B0E11), Stamp Red (#C53030), Ivory Paper (#F8F5EF), Peacock Blue (#03658C)
- **Typography:** Inter (UI), IBM Plex Serif (Documents)
- **Voice:** Direct, minimal, no legal jargon
- **Motion:** ≤ 200ms, ease-out, no bounce

See [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) for complete guidelines.

## Development

```bash
# Run dev server
npm run dev

# View database
npm run db:studio

# Generate migrations
npm run db:generate

# Run migrations
npm run db:migrate

# Add test credits
npx tsx scripts/add-credits.ts
```

## Deployment

1. Deploy to Vercel
2. Add environment variables
3. Ensure DATABASE_URL is set
4. Set BASE_URL to production URL

---

**Lekhāi** — We clarify. We reduce risk. We make legal simple.
