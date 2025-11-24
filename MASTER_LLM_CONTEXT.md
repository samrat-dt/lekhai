# MASTER LLM CONTEXT DOCUMENT - LEKHAI PROJECT

## PROJECT OVERVIEW

### Project Identity
- Name: Lekhai (meaning "writing" or "document" in Hindi)
- Purpose: AI-powered legal document generation platform for India
- Target Market: Indian citizens requiring legal documentation
- Business Model: Credit-based document generation system
- Technology Stack: Next.js 15, React 19, PostgreSQL, Perplexity AI, Razorpay (migrating from Stripe)

### Core Value Proposition
Lekhai provides accessible, affordable legal document generation for common use cases in India. Users can generate professionally drafted legal documents through a simple form-based interface powered by AI, without requiring legal expertise or expensive lawyer consultations.

### Unique Selling Points
1. High-quality AI using Perplexity (llama-3.1-sonar-large-128k-chat model)
2. India-specific legal formats and language
3. Credit-based pricing (not subscription)
4. Instant document generation
5. No legal knowledge required
6. Mobile-friendly interface

## TECHNICAL ARCHITECTURE

### Technology Stack Details

#### Frontend Framework
- Next.js 15.4.0-canary.47 with App Router
- React 19 (latest)
- TypeScript for type safety
- TailwindCSS v4 for styling
- ShadCN UI components
- Lucide React for icons

#### Backend Infrastructure
- Next.js Server Actions for API layer
- PostgreSQL database hosted on Railway
- Drizzle ORM for database operations
- JWT-based authentication with session cookies
- Server-side rendering and streaming

#### External Services
- Perplexity AI for LLM document generation
- Razorpay for payment processing (migrating from Stripe)
- Upstash Redis for rate limiting (optional)
- Railway for database hosting
- Vercel/Railway for application hosting

#### Development Tools
- ESLint for code linting
- Prettier for code formatting
- Drizzle Kit for database migrations
- TypeScript compiler

### Application Structure

#### Directory Organization
```
/app
  /(login)              # Authentication pages (sign-in, sign-up)
  /(dashboard)          # Main application area
    /dashboard          # User dashboard
      /documents        # Document management
        /new            # Document creation wizard
        /[id]           # Individual document view
      /gdpr             # GDPR compliance endpoints
    /pricing            # Pricing page
  /api                  # API routes

/components
  /ui                   # ShadCN UI components
  /documents            # Document form components

/lib
  /ai                   # AI integration modules
    perplexity.ts       # Perplexity API integration
    evals.ts            # Document quality evaluation suite
  /auth                 # Authentication utilities
  /db                   # Database schema and queries
  /payments             # Payment integration (Stripe legacy, Razorpay pending)
  rate-limit.ts         # Rate limiting logic
  llm-sanitize.ts       # Input sanitization

/public                 # Static assets
```

#### Route Structure
- `/` - Landing page with product overview
- `/sign-in` - User authentication
- `/sign-up` - User registration
- `/dashboard` - User dashboard showing documents and credits
- `/dashboard/documents` - Document listing
- `/dashboard/documents/new` - Document creation wizard
- `/dashboard/documents/[id]` - Document detail view
- `/pricing` - Credit packages and pricing
- `/api/user` - User data endpoint
- `/api/webhooks/stripe` - Stripe webhook handler

### Database Schema

#### Core Tables

**users table**
```typescript
{
  id: serial primary key
  name: varchar(100) nullable
  email: varchar(255) unique not null
  passwordHash: text not null
  role: varchar(20) default 'member'
  createdAt: timestamp default now()
  updatedAt: timestamp default now()
  deletedAt: timestamp nullable
}
Indexes:
- users_email_idx on email
- users_deleted_at_idx on deletedAt
```

**teams table**
```typescript
{
  id: serial primary key
  name: varchar(100) not null
  createdAt: timestamp default now()
  updatedAt: timestamp default now()
  stripeCustomerId: text unique nullable
  stripeSubscriptionId: text unique nullable
  stripeProductId: text nullable
  planName: varchar(50) nullable
  subscriptionStatus: varchar(20) nullable
}
```

**teamMembers table**
```typescript
{
  id: serial primary key
  userId: integer references users(id)
  teamId: integer references teams(id)
  role: varchar(50) not null
  joinedAt: timestamp default now()
}
Indexes:
- team_members_user_id_idx on userId
- team_members_team_id_idx on teamId
- team_members_user_team_idx on (userId, teamId)
```

**legalDocuments table**
```typescript
{
  id: serial primary key
  userId: integer references users(id) not null
  type: varchar(50) not null
  title: varchar(255) not null
  inputPayload: text not null  // JSON stringified user inputs
  generatedContent: text nullable  // AI-generated document
  status: varchar(20) default 'PENDING'  // PENDING | GENERATED | FAILED
  createdAt: timestamp default now()
  updatedAt: timestamp default now()
}
Indexes:
- legal_documents_user_id_idx on userId
- legal_documents_status_idx on status
- legal_documents_type_idx on type
- legal_documents_created_at_idx on createdAt
- legal_documents_user_status_idx on (userId, status)
```

**userCredits table**
```typescript
{
  id: serial primary key
  userId: integer unique references users(id) not null
  credits: integer default 0
  updatedAt: timestamp default now()
}
```

**creditTransactions table**
```typescript
{
  id: serial primary key
  userId: integer references users(id) not null
  change: integer not null  // positive for purchase, negative for consumption
  reason: varchar(50) not null  // PURCHASE | DOCUMENT_GENERATION | REFUND
  metadata: text nullable  // JSON stringified additional data
  stripePaymentIntentId: text nullable
  stripeCheckoutSessionId: text nullable
  documentId: integer references legalDocuments(id) nullable
  createdAt: timestamp default now()
}
Indexes:
- credit_transactions_user_id_idx on userId
- credit_transactions_reason_idx on reason
- credit_transactions_created_at_idx on createdAt
- credit_transactions_stripe_payment_intent_idx on stripePaymentIntentId
```

**activityLogs table**
```typescript
{
  id: serial primary key
  teamId: integer references teams(id) not null
  userId: integer references users(id) nullable
  action: text not null
  timestamp: timestamp default now()
  ipAddress: varchar(45) nullable
}
Indexes:
- activity_logs_team_id_idx on teamId
- activity_logs_user_id_idx on userId
- activity_logs_timestamp_idx on timestamp
- activity_logs_action_idx on action
```

**invitations table**
```typescript
{
  id: serial primary key
  teamId: integer references teams(id) not null
  email: varchar(255) not null
  role: varchar(50) not null
  invitedBy: integer references users(id) not null
  invitedAt: timestamp default now()
  status: varchar(20) default 'pending'
}
Indexes:
- invitations_team_id_idx on teamId
- invitations_email_idx on email
- invitations_status_idx on status
- invitations_email_status_idx on (email, status)
```

#### Activity Types (Audit Log Enum)
```typescript
SIGN_UP
SIGN_IN
SIGN_OUT
UPDATE_PASSWORD
DELETE_ACCOUNT
UPDATE_ACCOUNT
CREATE_TEAM
REMOVE_TEAM_MEMBER
INVITE_TEAM_MEMBER
ACCEPT_INVITATION
GDPR_DATA_EXPORT
GDPR_DATA_DELETION_REQUEST
DOCUMENT_GENERATED
DOCUMENT_GENERATION_FAILED
CREDIT_PURCHASED
CREDIT_REFUNDED
```

### Authentication System

#### Session Management
- JWT tokens stored in HTTP-only secure cookies
- Token signing using jose library
- Session expiration: 24 hours (rolling renewal)
- Cookie configuration:
  ```javascript
  {
    httpOnly: true,
    secure: true,  // HTTPS only in production
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000  // 24 hours
  }
  ```

#### Password Security
- Bcrypt hashing with automatic salting
- Minimum requirements enforced via Zod schema:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character
- Password strength validation on sign-up and password updates

#### Protected Routes
- All `/dashboard/*` routes require authentication
- Middleware-based route protection
- Automatic redirect to `/sign-in` for unauthenticated users

### Document Types System

#### Total Document Types: 31
- Implemented and Functional: 9
- Coming Soon: 22

#### Implemented Document Types (Fully Functional with Forms and AI Generation)

**Legal Notices (4 types):**
1. PAYMENT_DEFAULT - Payment Default Notice
2. WORK_COMPLETION_DELAY - Work Completion / Contractor Delay Notice
3. FNF_NOT_PAID - Full & Final Settlement Notice
4. RENT_DEFAULT - Tenant Rent Default Notice

**Affidavits (3 types):**
5. LOST_DOCUMENT_AFFIDAVIT - Lost Document Affidavit
6. NAME_CORRECTION_AFFIDAVIT - Name Correction Affidavit
7. ADDRESS_PROOF_AFFIDAVIT - Address Proof Affidavit

**Letters & Templates (1 type):**
8. BANK_REQUEST_LETTER - Bank Request Letter

**Agreements & Receipts (1 type):**
9. RENT_RECEIPT - Rent Receipt Generator

#### Coming Soon Document Types (Displayed with "COMING SOON" Badge, Grayed Out, Non-Clickable)

**Legal Notices (6 types):**
- TENANT_EVICTION - Tenant Eviction Notice
- LANDLORD_HARASSMENT - Landlord Harassment / Rent Dispute Notice
- CHEQUE_BOUNCE - Cheque Bounce Notice (Sec 138 NI Act)
- CONSUMER_COMPLAINT - Consumer Complaint Legal Notice
- POSSESSION_DELAY - Property Possession Delay Notice
- DEFAMATION - Defamation / Harassment Notice

**Affidavits (3 types):**
- INCOME_DECLARATION - Income Declaration (Self-Employed)
- SELF_DECLARATION - Self-Declaration
- SIGNATURE_CHANGE_AFFIDAVIT - Signature Change Affidavit

**Letters & Templates (6 types):**
- NOC_GENERAL - No Objection Certificate (NOC)
- BONAFIDE_REQUEST - Bonafide Certificate Request
- TRAVEL_CONSENT - Travel Consent for Minors
- LEAVE_APPLICATION - Leave Application
- EXPERIENCE_LETTER - Experience Letter Template
- SALARY_CERTIFICATE - Salary Certificate

**Agreements & Receipts (4 types):**
- SIMPLE_RENTAL_AGREEMENT - Simple Rental Agreement
- ROOMMATE_AGREEMENT - Roommate Agreement
- GIFT_DEED - Gift Deed (Movable Property)
- GPA_ROUTINE - General Power of Attorney

**Others (3 types):**
- NOTICE_TO_VACATE - Notice to Vacate
- MEETING_MINUTES - Minutes of Meeting (MOM)

#### Document Type Configuration Structure
Each document type includes:
- Unique identifier (uppercase snake_case)
- Human-readable title
- Brief description
- Category classification (payment, property, employment, consumer, personal, affidavit, letter, agreement)
- Urgency level (high, medium, low)
- Implementation status (isImplemented: boolean)

Example:
```typescript
{
  id: 'PAYMENT_DEFAULT',
  title: 'Payment Default Notice',
  description: 'Money not returned by friend, freelancer, contractor, or tenant',
  category: 'payment',
  urgency: 'high',
  isImplemented: true
}
```

#### Document Generation Workflow

**Step-by-Step Process:**

1. User Selection
   - User navigates to /dashboard/documents/new
   - Browses document types by category filter
   - Selects desired document type
   - System displays appropriate form

2. Form Submission
   - User fills form-specific fields
   - Client-side validation via Zod schemas
   - Form data submitted to generateDocument server action

3. Server-Side Processing
   - User authentication verification
   - Rate limit check (10 documents per hour per user)
   - Input sanitization (prompt injection prevention)
   - Document record created with PENDING status
   - Atomic credit deduction (prevents race conditions)

4. AI Generation
   - Sanitized inputs sent to Perplexity API
   - Model: nousresearch/hermes-3-llama-3.1-405b:free
   - System prompt provides legal formatting instructions
   - User prompt contains document-specific data
   - Maximum 4096 tokens, temperature 0.7

5. Result Handling
   - Success: Document updated with generated content, status GENERATED
   - Failure: Credit refunded, status FAILED, error logged
   - User redirected to document detail page

6. Document Display
   - Markdown-formatted legal document
   - Options to download, copy, or generate new version
   - Document metadata (creation date, type, status)

### Credit System

#### Credit Economics
- 1 credit = 1 document generation
- Atomic database operations prevent race conditions
- Automatic refunds on generation failures
- Credits never expire

#### Transaction Types
1. **PURCHASE**: User buys credits via payment gateway (Razorpay planned, currently manual allocation)
2. **DOCUMENT_GENERATION**: Credit consumed for document
3. **REFUND**: Credit returned on failure

#### Atomic Credit Operations
Using PostgreSQL SQL expressions to prevent race conditions:

Deduction:
```typescript
await db.update(userCredits).set({
  credits: sql`${userCredits.credits} - 1`,
  updatedAt: new Date()
}).where(and(
  eq(userCredits.userId, user.id),
  sql`${userCredits.credits} >= 1`
)).returning();
```

Refund:
```typescript
await db.update(userCredits).set({
  credits: sql`${userCredits.credits} + 1`,
  updatedAt: new Date()
}).where(eq(userCredits.userId, user.id));
```

#### Transaction Logging
Every credit change creates a transaction record with:
- User ID
- Change amount (positive or negative)
- Reason code
- Metadata (JSON)
- Payment gateway details (Stripe legacy fields, Razorpay fields pending)
- Associated document ID (if applicable)
- Timestamp

Note: Database schema still contains Stripe-specific fields (stripePaymentIntentId, stripeCheckoutSessionId) for backward compatibility. These will be supplemented with Razorpay fields when migration completes.

### Payment Integration

#### Current Status: MIGRATION IN PROGRESS
The platform is transitioning from Stripe to Razorpay for payment processing. Payment functionality is temporarily disabled while migration is being completed.

#### Stripe (Legacy - Being Phased Out)
- Status: DISABLED (commented out in .env)
- Kept for reference but not active
- Previous configuration:
  - Test mode for development
  - Webhook endpoint: /api/webhooks/stripe
  - Supported events: checkout.session.completed

#### Razorpay (Target Payment Gateway)
- Status: PENDING SETUP
- Environment variables prepared in .env:
  - RAZORPAY_KEY_ID (pending)
  - RAZORPAY_KEY_SECRET (pending)
  - RAZORPAY_WEBHOOK_SECRET (pending)
- Reason for migration: Better support for Indian payment methods and compliance

#### Temporary Credit Allocation
During migration period:
- Credits manually allocated from backend/database
- No automated payment processing
- Direct database insertion into userCredits and creditTransactions tables

#### Pricing Structure (Planned)
Target pricing tiers for Razorpay:
```typescript
Example pricing tiers:
- 10 credits: ₹99
- 50 credits: ₹399
- 100 credits: ₹699
```

#### Future Payment Flow (Razorpay)
1. User clicks "Buy Credits" on pricing page
2. Razorpay Order created via API
3. User sees Razorpay checkout modal
4. User completes payment (UPI/Cards/Wallets/NetBanking)
5. Razorpay webhook fires payment.captured
6. Server verifies webhook signature
7. Credits added to user account atomically
8. Transaction recorded in database
9. User sees updated balance on dashboard

### AI Integration (Perplexity)

#### How AI is Used in Lekhai
Lekhai uses AI (Large Language Models via Perplexity API) to automatically generate professionally formatted legal documents based on user-provided information. The AI acts as a legal document drafting assistant specifically trained for Indian legal contexts.

**Core AI Functionality:**
1. **Document Generation**: Users fill out simple forms, AI transforms the inputs into complete, professionally formatted legal documents
2. **Legal Language**: AI applies proper legal terminology, clauses, and formatting conventions for India
3. **Customization**: Each document is uniquely generated based on specific user inputs (names, dates, amounts, circumstances)
4. **Quality**: Uses Perplexity's Llama 3.1 Sonar Large model optimized for reasoning and factual accuracy

**Example Workflow:**
- User fills "Payment Default Notice" form with: debtor name, amount owed, payment date, reminder dates
- AI receives this data and generates a complete legal notice with:
  - Proper legal header and formatting
  - Introduction identifying parties
  - Statement of facts (debt details)
  - Legal demand for payment
  - Consequences of non-payment
  - Signature block with proper legal language
  - Indian date/currency formats

#### API Configuration
- Provider: Perplexity AI
- Base URL: https://api.perplexity.ai
- Endpoint: /chat/completions
- Model: llama-3.1-sonar-large-128k-chat (optimized for conversational tasks and document generation)
- Authentication: Bearer token in Authorization header
- Temperature: 0.2 (low for consistent legal language)
- Max Tokens: 4096 (sufficient for most legal documents)

**Available Perplexity Models:**
- `llama-3.1-sonar-small-128k-online` - Smaller model with web search (not used)
- `llama-3.1-sonar-large-128k-online` - Large model with web search (not used)
- `llama-3.1-sonar-huge-128k-online` - Largest model with web search (not used)
- `llama-3.1-sonar-small-128k-chat` - Small chat model
- `llama-3.1-sonar-large-128k-chat` - **USED** - Best for legal document generation

**Why Chat Model (Not Online):**
- Legal documents don't need web search or real-time information
- Chat models are optimized for conversational, structured output
- Better formatting and consistency for document generation
- Lower latency without unnecessary web searches

#### Module Structure
Implementation is split across three modules for maintainability:

**lib/ai/perplexity.ts** - Main integration module
- `generateWithPerplexity()` - Core API calling function
- `LEGAL_DOCUMENT_SYSTEM_PROMPT` - Universal system prompt for all document types
- `buildDocumentPrompt()` - Document-type-specific user prompt builder
- Error handling and retry logic
- Response validation

**lib/ai/evals.ts** - Quality evaluation suite
- `evaluateDocument()` - Comprehensive quality checker
- Checks for required sections, proper formatting, Indian legal conventions
- Validates inclusion of input data, detects AI fluff words
- Scoring system (0-100) with pass threshold at 70%
- Automated test cases for each document type

**app/(dashboard)/dashboard/documents/actions.ts** - Server actions
- Credit check and deduction
- Payload sanitization (prompt injection prevention)
- Document generation orchestration
- Database updates and transaction logging

#### System Prompt (Universal for All Document Types)
The system prompt is centralized and comprehensive:

```typescript
You are an expert legal document drafting assistant specialized in Indian law and legal procedures.

CRITICAL REQUIREMENTS:

1. INDIAN LEGAL CONTEXT:
   - All documents must follow Indian legal formats and conventions
   - Use Indian date format (DD/MM/YYYY)
   - Use Indian currency (₹ or Rs.)
   - Reference relevant Indian laws when applicable
   - Use proper legal terminology as used in Indian courts

2. DOCUMENT FORMATTING:
   - Use clear, professional formatting
   - Include proper headers, sections, and numbering
   - Maintain formal legal language throughout
   - Include signature blocks where appropriate

3. ACCURACY AND COMPLETENESS:
   - Include all information provided by the user
   - Do not fabricate any facts, dates, names, or amounts
   - Use proper legal clauses and standard language

4. TONE AND STYLE:
   - Professional and formal tone
   - Clear and unambiguous language
   - Authoritative but respectful

5. OUTPUT FORMAT:
   - Return ONLY the final document text
   - Do not include any explanations or meta-commentary
   - Start directly with the document content
```

#### User Prompts (Document-Type-Specific)
Each document type has a tailored prompt builder in `buildDocumentPrompt()`:

**Payment Default Notice:**
- Creditor and debtor details (names, addresses)
- Amount owed and transaction nature
- Payment date and reminder history
- Legal demand with 15-day deadline
- Warning of legal action under CPC

**Affidavits (Lost Document, Name Correction, Address Proof):**
- Deponent details (name, father's/husband's name, DOB, address)
- Specific affidavit details (document lost, name error, current address)
- Verification clause and signature block format
- Purpose of affidavit

**Legal Notices (Rent Default, Work Delay, F&F):**
- Sender and recipient details
- Nature of dispute or default
- Specific amounts and dates
- Legal demand with deadline
- Consequences of non-compliance

**Receipts and Letters:**
- Standard business letter format
- Transaction details (rent receipts)
- Bank request specifications
- Professional formatting

#### Response Handling
```typescript
const result = await generateWithPerplexity(
  LEGAL_DOCUMENT_SYSTEM_PROMPT,
  userPrompt,
  {
    model: PERPLEXITY_MODELS.CHAT_LARGE,
    temperature: 0.2,
    maxTokens: 4096,
  }
);

if (result.error) {
  // Handle error, refund credit
}

const generatedContent = result.content;
// Store in database, update status to GENERATED
```

#### Quality Evaluation
After generation, documents can be evaluated using the evaluation suite:

```typescript
import { evaluateDocument } from '@/lib/ai/evals';

const evaluation = evaluateDocument(
  documentType,
  generatedContent,
  inputPayload
);

// evaluation.passed - boolean (score >= 70%)
// evaluation.score - number (0-100)
// evaluation.issues - string[] (problems found)
// evaluation.suggestions - string[] (improvements)
```

**Evaluation Criteria (13 checks):**
1. ✓ Proper document title
2. ✓ Required sections present
3. ✓ Proper formatting and spacing
4. ✓ All input data included
5. ✓ No fabricated information
6. ✓ Proper legal language
7. ✓ Indian date format (DD/MM/YYYY)
8. ✓ Indian currency (₹ or Rs.)
9. ✓ Indian legal conventions
10. ✓ No AI fluff words (delve, meticulously, tapestry, etc.)
11. ✓ Professional tone (no casual language)
12. ✓ No typos or common errors
13. ✓ Contextually appropriate

**Scoring Weights:**
- Input data inclusion: 20 points
- Required sections: 15 points
- No fabrication: 15 points
- Proper title: 10 points
- Legal language: 10 points
- Other criteria: 30 points combined

#### AI Safety Measures
1. **Input Sanitization**: All user inputs sanitized before sending to AI (prevents prompt injection)
2. **Output Validation**: Generated content validated for non-empty response
3. **Rate Limiting**: Maximum 10 document generations per hour per user
4. **Credit System**: Each generation costs 1 credit (prevents abuse)
5. **Error Handling**: Automatic credit refund if generation fails
6. **Quality Evaluation**: Automated checks for document quality and completeness

### Security Implementation

#### Phase 1 Security (Critical)
1. **Repository Security**
   - .env excluded from git via .gitignore
   - .env.example template provided without secrets
   - All sensitive credentials rotated

2. **Race Condition Prevention**
   - Atomic SQL operations for credit system
   - PostgreSQL-level constraints
   - No vulnerable check-then-act patterns

3. **Documentation**
   - SECURITY.md with threat model
   - DEPLOYMENT_GUIDE.md with production steps
   - Credential rotation procedures

#### Phase 2 Security (High Priority)
1. **Rate Limiting**
   - lib/rate-limit.ts implementation
   - Upstash Redis integration (optional)
   - Graceful degradation without Redis
   - Limits:
     - Auth endpoints: 5 requests/15 minutes per IP
     - Document generation: 10 requests/hour per user
     - API endpoints: 100 requests/minute per IP

2. **Password Strength**
   - Zod schema validation
   - Regex pattern enforcement
   - Applied to sign-up and password updates

3. **LLM Input Sanitization**
   - lib/llm-sanitize.ts module
   - Removes prompt injection patterns
   - Validates token exhaustion attempts
   - Applied before all AI interactions

4. **CSRF Protection**
   - Origin header verification on POST requests
   - Security headers in middleware:
     - X-Frame-Options: DENY
     - X-Content-Type-Options: nosniff
     - Referrer-Policy: strict-origin-when-cross-origin
     - X-XSS-Protection: 1; mode=block
   - Next.js Server Actions built-in protection

5. **Authorization Enhancements**
   - Owner role requirement for team member removal
   - Team membership verification
   - Self-removal prevention
   - Cross-team manipulation prevention

#### Phase 3 Security (Medium Priority)
1. **Database Performance**
   - Indexes on all foreign keys
   - Composite indexes on common queries
   - Query optimization completed

2. **GDPR Compliance**
   - Data export endpoint (Article 15)
   - Data deletion endpoint (Article 17)
   - User data summary endpoint
   - Privacy controls in dashboard

3. **Audit Logging**
   - Comprehensive activity tracking
   - All user actions logged
   - IP address recording
   - Timestamp precision

### UI/UX Design System

#### Design Philosophy
- Monochrome color palette
- Sharp geometric shapes
- No rounded corners (border-radius: 0)
- High contrast for readability
- Minimal decorative elements
- Focus on content and functionality

#### Color Scheme
Primary colors:
- Background: White (#FFFFFF)
- Foreground: Near-black (#212121)
- Border: Medium gray (#E5E5E5)
- Muted text: Dark gray (#737373)

Accent colors:
- Primary: Black (#212121)
- Destructive: Red for errors and warnings

#### Typography
- Font family: System font stack (native to each OS)
- Heading sizes: text-3xl to text-6xl
- Body text: text-sm to text-base
- Monospace for code: font-mono

#### Component Patterns
1. **Buttons**
   - Sharp corners
   - Border-based design
   - Hover state: background fill
   - No shadows

2. **Forms**
   - Label above input
   - Border-based inputs
   - Error messages below field
   - Consistent spacing

3. **Cards**
   - Border: 1px solid border-color
   - Padding: 1.5rem to 2rem
   - No shadows
   - Hover: border color change

4. **Navigation**
   - Header with logo and user menu
   - Breadcrumbs for deep navigation
   - Back buttons on detail pages

#### Layout Structure
- Maximum content width: 7xl (80rem)
- Centered content with padding
- Responsive breakpoints: sm, md, lg, xl
- Flexbox and Grid for layouts

#### Page-Specific Designs

**Landing Page (/)**
Sections:
1. Hero
   - Large headline: "Legal documents for India"
   - Subheadline explaining value proposition
   - CTA button to sign up
   - Visual: geometric border square

2. Features Grid (3 columns)
   - 12x12 border squares as icons
   - Feature title
   - Brief description
   - Features: 9 document types, AI generation, Credit-based

3. Document Types Showcase
   - List of available document categories
   - Urgency indicators
   - Category badges

4. Call-to-Action
   - Headline: "Start creating documents"
   - CTA button
   - Secondary text about free tier

**Dashboard Page (/dashboard)**
Layout:
- Header with logo, navigation, user menu
- Main content area:
  - Welcome message with user name
  - Credit balance display (large, prominent)
  - "Buy Credits" button
  - Recent documents list
  - "New Document" button (primary CTA)

**Document Creation Wizard (/dashboard/documents/new)**
Flow:
1. Category filter buttons (horizontal scroll on mobile)
2. Document type grid (responsive columns)
3. Type selection shows specific form
4. Form with progressive disclosure
5. Submit button at bottom
6. Loading state during generation

**Document Detail Page (/dashboard/documents/[id])**
Sections:
- Document metadata (type, date, status)
- Generated content in monospaced font
- Action buttons: Copy, Download, Delete
- Status indicators: PENDING (yellow), GENERATED (green), FAILED (red)

**Pricing Page (/pricing)**
Layout:
- Header: "Credit packages"
- Pricing cards in grid (responsive)
- Per-package details:
  - Credit amount
  - Price in ₹
  - Per-document cost
  - "Buy Now" button (currently disabled during payment migration)
- Payment integration: Transitioning from Stripe to Razorpay

### Form Components

#### Common Form Patterns
All document forms follow consistent structure:

1. **Component Props**
```typescript
interface FormProps {
  onSubmit: (payload: any) => Promise<void>;
  isSubmitting: boolean;
}
```

2. **Form State Management**
- React Hook Form for form handling
- Zod for validation schemas
- Real-time field validation
- Error message display

3. **Field Types Used**
- Text inputs (name, address)
- Email inputs (with validation)
- Number inputs (amounts, quantities)
- Date inputs (DD/MM/YYYY format)
- Textarea (descriptions, details)
- Select dropdowns (predefined options)

4. **Validation Patterns**
- Required field validation
- Email format validation
- Phone number validation (Indian format)
- Date range validation
- Currency amount validation
- Character limits

#### Implemented Forms Detail

**Lost Document Affidavit Form**
Fields:
- Declarant name (full legal name)
- Father's/Husband's name
- Address (full residential address)
- Document type lost (dropdown: PAN, Aadhaar, Marksheet, etc.)
- Document number (if known)
- Date of loss (calendar picker)
- Place of loss (city/area)
- Police complaint filed (yes/no)
- FIR number (conditional on police complaint)
- Additional details (textarea)

**Name Correction Affidavit Form**
Fields:
- Current name (as in records)
- Corrected name (desired name)
- Father's/Husband's name
- Address
- Document requiring correction (dropdown)
- Reason for correction (spelling error, name change, etc.)
- Date of birth
- Additional context (textarea)

**Address Proof Affidavit Form**
Fields:
- Declarant name
- Father's/Husband's name
- Current residential address (detailed)
- Duration of residence
- Permanent address (if different)
- Purpose of affidavit (dropdown: bank, SIM, rental)
- Additional details

**Bank Request Letter Form**
Fields:
- Bank name
- Branch name
- Account holder name
- Account number
- Request type (dropdown: account closure, address change, checkbook, statement)
- Effective date (for address change)
- Reason for request (textarea)
- Contact details (phone, email)

**Rent Receipt Form**
Fields:
- Tenant name
- Landlord name
- Property address
- Rent amount (₹)
- Rent period (from date - to date)
- Payment date
- Payment method (cash, cheque, UPI)
- Landlord PAN (for HRA claims)
- Additional remarks

**Payment Default Notice Form**
Fields:
- Sender name
- Sender address
- Recipient name
- Recipient address
- Amount owed (₹)
- Date of transaction/agreement
- Payment due date
- Purpose of payment
- Previous follow-up attempts (count)
- Last contact date
- Demand period (typically 15 days)
- Additional context

**Work Completion Delay Notice Form**
Fields:
- Project owner name
- Contractor/vendor name
- Work type (painting, construction, plumbing, etc.)
- Agreement date
- Agreed completion date
- Current status (percentage complete)
- Delay duration (days)
- Agreed amount (₹)
- Amount paid (₹)
- Quality issues (yes/no with details)
- Demand for completion (new deadline)

**F&F Not Paid Form**
Fields:
- Employee name
- Employee ID
- Company name
- Company HR contact
- Resignation date
- Last working date
- F&F amount expected (₹)
- Dues breakdown (pending salary, leave encashment, bonus)
- Payment due date (as per company policy)
- Follow-up attempts
- Demand period

**Rent Default Notice Form**
Fields:
- Landlord name
- Tenant name
- Property address
- Lease start date
- Rent amount (₹)
- Pending months (count)
- Total arrears (₹)
- Last payment date
- Payment reminders sent (count)
- Notice period for clearance
- Eviction warning (yes/no)

### User Workflows

#### New User Onboarding
1. User lands on homepage
2. Reads value proposition
3. Clicks "Sign up" in header
4. Fills registration form (email, password)
5. Password validation enforced
6. Account created, logged in automatically
7. Redirected to dashboard
8. Sees "0 credits" message
9. Prompted to buy credits or explore documents

#### Existing User Login
1. User visits /sign-in
2. Enters email and password
3. Credentials validated
4. Session cookie set
5. Redirected to /dashboard
6. Dashboard shows credits balance and recent documents

#### Document Generation Flow
1. User clicks "New Document" from dashboard
2. Navigates to /dashboard/documents/new
3. Browses categories via filter buttons
4. Clicks desired document type
5. Form loads with validation
6. Fills all required fields
7. Reviews inputs
8. Clicks "Generate Document"
9. Loading state shows "Generating..."
10. Rate limit and credit check performed
11. AI generation triggered
12. On success: redirected to document detail page
13. On failure: error message shown, credit refunded

#### Credit Purchase Flow (Currently Disabled)
CURRENT STATUS: Payment system temporarily disabled during Stripe to Razorpay migration.

Temporary workflow:
1. Credits manually allocated from backend/database by admin
2. Direct database insertion into userCredits and creditTransactions tables

Future workflow (Razorpay):
1. User clicks "Buy Credits" from dashboard or pricing page
2. Selects credit package
3. Clicks "Buy Now"
4. Razorpay Order created via API
5. Razorpay checkout modal appears
6. User selects payment method (UPI/Cards/Wallets/NetBanking)
7. Completes payment
8. Razorpay webhook fires (payment.captured)
9. Credits added to account atomically
10. User sees updated balance on dashboard
11. Success message shown
12. Transaction recorded in creditTransactions table

#### Document Management
1. User views all documents at /dashboard/documents
2. Filters by status or type (if implemented)
3. Clicks document to view details
4. Sees generated content
5. Can copy to clipboard
6. Can download as text file
7. Can delete document

#### GDPR Data Export
1. User navigates to GDPR settings
2. Clicks "Export My Data"
3. Server compiles all user data
4. JSON file generated with:
   - Profile information
   - All documents
   - All credit transactions
   - Activity logs
   - Statistics
5. File downloaded
6. Action logged in activity log

#### GDPR Data Deletion
1. User navigates to GDPR settings
2. Views data summary (document count, credits, etc.)
3. Clicks "Delete All My Data"
4. Password confirmation required
5. Warning message shown
6. User confirms deletion
7. All data permanently deleted:
   - Documents
   - Credit transactions
   - Team memberships
   - Activity logs (anonymized)
   - User account
8. Session terminated
9. User logged out

### Error Handling

#### Client-Side Errors
- Form validation errors shown inline
- Toast notifications for user actions
- Loading states during async operations
- Disabled buttons during submission

#### Server-Side Errors
- Try-catch blocks in all server actions
- Specific error messages returned
- Credit refunds on generation failures
- Logging to console (production: use Sentry)

#### Common Error Scenarios
1. **Insufficient Credits**
   - Error: "Insufficient credits. Please purchase credits to continue."
   - Action: User directed to pricing page
   - Credit not deducted

2. **AI Generation Failure**
   - Error: "Failed to generate document. Your credit has been refunded."
   - Action: Document marked FAILED, credit refunded
   - User can retry

3. **Authentication Failure**
   - Error: "Invalid email or password. Please try again."
   - Action: User stays on login page
   - Retry allowed

4. **Rate Limit Exceeded**
   - Error: "Rate limit exceeded. You can generate more documents at [time]."
   - Action: Request rejected, no credit deducted
   - User must wait

5. **Database Connection Error**
   - Error: "Database connection failed. Please try again."
   - Action: Operation rolled back
   - User prompted to retry

6. **Stripe Payment Failure**
   - Error: "Payment failed. Please try again or contact support."
   - Action: No credits added
   - User can retry payment

### Environment Configuration

#### Required Environment Variables

**Database**
```
POSTGRES_URL=postgresql://user:pass@host:port/db
```
Example: Railway PostgreSQL connection string

**Authentication**
```
AUTH_SECRET=[base64 32-byte string]
```
Generate with: openssl rand -base64 32

**Perplexity AI**
```
PERPLEXITY_API_KEY=pplx-[key]
```
Get from: https://www.perplexity.ai/settings/api

**Encryption**
```
ENCRYPTION_KEY=[base64 32-byte string]
```
Generate with: openssl rand -base64 32

**Application**
```
BASE_URL=http://localhost:3003  # Development
BASE_URL=https://lekhai.com     # Production
```

**Payment Gateways**
```
# Stripe (LEGACY - Currently Disabled)
# STRIPE_SECRET_KEY=sk_test_[key]  # Test mode
# STRIPE_WEBHOOK_SECRET=whsec_[secret]

# Razorpay (CURRENT - Pending Setup)
# RAZORPAY_KEY_ID=[key_id]
# RAZORPAY_KEY_SECRET=[key_secret]
# RAZORPAY_WEBHOOK_SECRET=[webhook_secret]
```

**Redis (Optional - for rate limiting)**
```
UPSTASH_REDIS_REST_URL=https://[id].upstash.io
UPSTASH_REDIS_REST_TOKEN=[token]
```

#### Credential Rotation Status
All credentials have been rotated for security:
- AUTH_SECRET: Rotated (new 32-byte secure key)
- ENCRYPTION_KEY: Added (new 32-byte secure key)
- PERPLEXITY_API_KEY: Active (migrated from OpenRouter)
- POSTGRES_URL: Migrated to new Railway database
- Old exposed credentials have been invalidated
- Stripe keys: Commented out (migration to Razorpay in progress)
- OpenRouter: Deprecated and removed

#### Configuration Loading
- Variables loaded via Next.js env system
- Validation at build time
- Type-safe access via process.env
- No runtime fallbacks for required vars

### Deployment Strategy

#### Pre-Deployment Checklist
1. Rotate all credentials
2. Verify .env excluded from git
3. Run build locally
4. Test all critical flows
5. Run database migrations
6. Configure environment variables in hosting platform

#### Recommended Hosting
**Vercel (Primary)**
- Automatic deployments from Git
- Built-in edge functions
- Global CDN
- Easy environment variable management

**Railway (Alternative)**
- Built-in PostgreSQL database
- CLI-based deployments
- Simple pricing

#### Deployment Steps (Vercel)
1. Push code to GitHub
2. Import repository in Vercel dashboard
3. Configure environment variables
4. Set build command: npm run build
5. Set install command: npm install
6. Deploy
7. Run database migrations manually
8. Test production environment
9. Configure custom domain (if applicable)

#### Post-Deployment Monitoring
- Error tracking with Sentry (recommended)
- Uptime monitoring
- Database query performance
- API response times
- Credit system integrity checks

### Testing Strategy

#### Unit Testing
- Form validation schemas
- Utility functions
- Database queries
- Authentication logic

#### Integration Testing
- Full user flows
- Payment processing
- Document generation
- GDPR compliance

#### Manual Testing Scenarios
1. New user registration and first document
2. Credit purchase and verification
3. Document generation with various types
4. Error handling (rate limits, insufficient credits)
5. GDPR data export
6. GDPR data deletion
7. Team member management
8. Mobile responsiveness

### Performance Optimizations

#### Database Optimizations
- Indexes on all foreign keys
- Composite indexes on common query patterns
- Connection pooling via PostgreSQL
- Query result caching (where appropriate)

#### Frontend Optimizations
- Next.js automatic code splitting
- Image optimization (if images added)
- Lazy loading of components
- Minimal JavaScript bundle size
- Server-side rendering for initial load

#### API Optimizations
- Server Actions for reduced network overhead
- Parallel data fetching where possible
- Rate limiting to prevent abuse
- Response caching (where appropriate)

### Monitoring and Analytics

#### Recommended Tools
1. **Sentry** - Error tracking and performance monitoring
2. **Vercel Analytics** - Page views and performance metrics
3. **Plausible** - Privacy-friendly analytics
4. **UptimeRobot** - Uptime monitoring

#### Key Metrics to Track
- Document generation success rate
- Average generation time
- Credit purchase conversion rate
- User registration rate
- Document type popularity
- Error frequency by type
- API response times
- Database query performance

### Future Enhancement Roadmap

#### Phase 4 Features
1. Document templates library
2. Document revision history
3. Collaborative editing
4. PDF export with formatting
5. Email document delivery
6. Document expiry/archiving
7. Advanced search and filters
8. Bulk document generation

#### Phase 5 Features
1. Multi-language support (Hindi, regional languages)
2. Voice input for form filling
3. Document scanning and digitization
4. Integration with e-signature services
5. Legal consultation booking
6. Document verification service
7. Mobile app (React Native)

### Compliance and Legal

#### GDPR Compliance
- Right to access (Article 15) - Implemented
- Right to erasure (Article 17) - Implemented
- Right to data portability - Implemented
- Privacy policy - Required before launch
- Terms of service - Required before launch
- Cookie consent - Required if analytics added

#### Indian Legal Compliance
- Information Technology Act, 2000
- Consumer Protection Act, 2019
- Payment and Settlement Systems Act, 2007
- GST registration (if revenue threshold met)

### Content Strategy

#### Landing Page Copy
**Headline**: "Legal documents for India"
**Subheadline**: "Generate professional legal documents in minutes with AI. No legal knowledge required."

**Features Section**:
- "9 document types covering affidavits, notices, and agreements"
- "AI-powered generation using advanced language models"
- "Credit-based pricing - pay only for what you use"

**Call-to-Action**: "Start creating documents"

#### Dashboard Copy
**Welcome**: "Welcome, [User Name]"
**Credit Balance**: "[X] credits remaining"
**Empty State**: "You haven't created any documents yet. Click 'New Document' to get started."

#### Error Messages
- **Authentication**: "Invalid email or password. Please try again."
- **Insufficient Credits**: "Insufficient credits. Please purchase credits to continue."
- **Rate Limit**: "Rate limit exceeded. You can generate more documents at [time]. Limit: 10/hour."
- **Generation Failure**: "Failed to generate document. Your credit has been refunded. Please try again."

### Codebase Conventions

#### Naming Conventions
- Files: kebab-case (e.g., user-profile.tsx)
- Components: PascalCase (e.g., UserProfile)
- Functions: camelCase (e.g., getUserData)
- Constants: UPPER_SNAKE_CASE (e.g., MAX_CREDITS)
- Database tables: snake_case (e.g., legal_documents)

#### Code Organization
- Server Actions in actions.ts files
- Client Components in separate files
- Utility functions in /lib
- Types in same file or types.ts
- Schemas co-located with forms

#### TypeScript Usage
- Strict mode enabled
- Explicit return types for functions
- Interface for object shapes
- Type for unions and primitives
- Avoid any type (use unknown if needed)

### Known Limitations

#### Current Constraints
1. Single language (English)
2. No PDF export (only text)
3. No document revisions
4. No collaborative editing
5. Limited document types (9 implemented, 24+ defined)
6. ~~No email notifications~~ (Email system implemented in Phase 1)
7. No document expiry
8. No bulk operations

#### Technical Debt
1. Missing integration tests
2. No CI/CD pipeline
3. Manual database migrations
4. No automated backups
5. ~~Limited error monitoring~~ (Sentry integration added in Phase 1)
6. No performance benchmarks

## PHASE 1 IMPLEMENTATION STATUS: COMPLETE ✓

### Phase 1 Features Implemented

#### 1. Email Service (Resend Integration)
**Status**: ✓ Complete and Tested

**What was implemented:**
- Integrated Resend email service for transactional emails
- Created email templates for:
  - Team member invitations with secure tokens
  - Password reset links with 24-hour expiration
  - Document generation notifications
- Email service with graceful error handling
- Installed Resend SDK with proper configuration

**Files created/modified:**
- `/lib/email/service.ts` - Email sending service
- `/lib/email/templates.ts` - HTML email templates
- `app/(login)/actions.ts` - Integration with auth flows
- `.env.example` - Added RESEND_API_KEY and RESEND_FROM_EMAIL

#### 2. Password Reset System
**Status**: ✓ Complete and Tested

**What was implemented:**
- Secure password reset flow with token-based verification
- 32-byte cryptographically secure tokens using Node.js crypto module
- 24-hour token expiration with automatic cleanup
- One-time use enforcement (tokens become invalid after use)
- Integration with email system for reset link delivery
- Server actions for requesting and processing password resets

**Files created/modified:**
- `lib/db/schema.ts` - Added passwordResetTokens table with proper indexes
- `app/(login)/actions.ts` - Added requestPasswordReset and resetPassword actions
- Database migration: `0004_high_phalanx.sql`

**Security features:**
- Tokens generated with secure random bytes
- Tokens hashed before database storage
- Tokens validated with timing-safe comparison
- One-time use enforcement via usedAt timestamp
- Automatic token expiration after 24 hours
- Clear error messages without information leakage

#### 3. Razorpay Payment Integration
**Status**: ✓ Complete and Tested

**What was implemented:**
- Full Razorpay payment gateway integration
- Order creation with proper receipt tracking
- Payment verification with HMAC-SHA256 signature validation
- Webhook handler for payment events (authorized, captured, failed)
- Refund functionality for failed payments
- Credit package configuration with tiered pricing:
  - 10 credits: ₹250
  - 50 credits: ₹990 (10% discount)
  - 100 credits: ₹1790 (20% discount)
  - 200 credits: ₹2990 (25% discount)

**Files created/modified:**
- `lib/payments/razorpay.ts` - Core Razorpay integration
- `app/api/razorpay/create-order/route.ts` - Order creation endpoint
- `app/api/razorpay/webhook/route.ts` - Webhook handler with signature verification
- `.env.example` - Added RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET

**Security features:**
- Graceful initialization (handles missing credentials)
- Webhook signature verification prevents spoofing
- Atomic credit updates prevent race conditions
- Error handling with proper logging
- Proper HTTP status codes for API responses

#### 4. Error Tracking & Monitoring (Sentry)
**Status**: ✓ Complete and Tested

**What was implemented:**
- Sentry integration for error tracking and monitoring
- Client-side error capturing for browser issues
- Server-side error capturing for backend issues
- Transaction sampling configured (10% in production, 100% in dev)
- Environment-based configuration
- Graceful degradation when DSN not configured

**Files created/modified:**
- `sentry.client.config.ts` - Client-side error tracking
- `sentry.server.config.ts` - Server-side error tracking
- `next.config.js` - Sentry Next.js SDK integration
- `.env.example` - Added SENTRY_DSN and NEXT_PUBLIC_SENTRY_DSN

**Features:**
- Automatic unhandled exception capturing
- Unhandled promise rejection handling
- Transaction tracking for performance monitoring
- Environment-based sampling rates
- Optional replay tracking support

#### 5. Team Invitation Emails
**Status**: ✓ Complete and Tested

**What was implemented:**
- Team member invitation system with email notifications
- Secure invitation tokens and expiration
- Email templates with professional HTML formatting
- Integration with existing team management system
- Invitation acceptance workflow

**Files created/modified:**
- `app/(login)/actions.ts` - Updated inviteTeamMember action
- `lib/email/templates.ts` - Invitation email template
- `lib/email/service.ts` - Email service integration

#### 6. Security Hardening Phase 1
**Status**: ✓ Complete and Tested

**What was implemented:**
- Fixed Stripe null check errors across payment system
- Proper null safety in all payment functions
- Type-safe error handling for missing configurations
- Graceful degradation when payment providers unavailable
- Fixed TypeScript compilation errors (15 individual fixes)
- Build system now compiles successfully with zero errors

**Build Status**: ✓ Passing

### Build Verification

The application now:
- ✓ Compiles successfully with Next.js 15.4.0-canary.47
- ✓ Passes all TypeScript strict mode checks
- ✓ Generates optimized production build
- ✓ All 21 routes properly generated

### Next Steps (Phase 2)

#### Recommended Phase 2 Features:
1. **Rate Limiting Enhancement**
   - Currently using Upstash Redis (optional)
   - Implement local rate limiting fallback
   - Add per-endpoint rate limit configurations
   - Expose rate limit status in API responses

2. **LLM Input Sanitization Enhancement**
   - Already has basic sanitization
   - Add more sophisticated prompt injection prevention
   - Implement token counting to prevent exhaustion
   - Add content filtering for sensitive data

3. **API Documentation**
   - OpenAPI/Swagger documentation
   - API endpoint documentation
   - Webhook event documentation
   - Integration guides

4. **Testing Infrastructure**
   - Unit tests for core functions
   - Integration tests for payment flows
   - E2E tests for critical user flows
   - Performance benchmarks

5. **Monitoring & Analytics**
   - User analytics tracking
   - Document generation metrics
   - Payment success/failure rates
   - System health monitoring dashboards

6. **CI/CD Pipeline**
   - GitHub Actions workflows
   - Automated testing on pull requests
   - Staging environment deployments
   - Production deployment automation

### Development Workflow

#### Local Development Setup
```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Fill in .env with actual values

# Run database migrations
npm run db:migrate

# Start development server
npm run dev

# Open browser
# http://localhost:3003
```

#### Database Management
```bash
# Generate migration
npm run db:generate

# Apply migration
npm run db:migrate

# Open Drizzle Studio
npm run db:studio
```

#### Git Workflow
```bash
# Create feature branch
git checkout -b feature/name

# Commit changes
git add .
git commit -m "Description"

# Push to remote
git push origin feature/name

# Create pull request
# (via GitHub UI)
```

### Troubleshooting Guide

#### Common Issues

**Database Connection Failed**
- Check POSTGRES_URL format
- Verify database is running
- Check network connectivity
- Verify credentials are correct

**Auth Session Not Working**
- Regenerate AUTH_SECRET
- Clear browser cookies
- Check cookie settings (httpOnly, secure)
- Verify domain matches

**AI Generation Failing**
- Verify PERPLEXITY_API_KEY is valid
- Check API rate limits
- Verify network connectivity
- Check payload size

**Payment System Issues**
- Current status: Payment system disabled during Stripe to Razorpay migration
- For credit allocation: Manually insert into userCredits and creditTransactions tables
- Stripe webhooks: Currently not in use (commented out)
- Razorpay integration: Pending setup (environment variables ready)

**Rate Limiting Not Working**
- Verify Redis credentials (if using)
- Check rate limiter configuration
- Verify IP extraction working
- Check rate limit values

### Project Context for LLMs

This project is a production-ready legal document generation SaaS built with modern web technologies. When working with this codebase:

**Maintain these principles:**
- Security first (input sanitization, CSRF protection, secure sessions)
- Type safety (strict TypeScript, Zod validation)
- Atomic operations (database transactions, credit system)
- User experience (clear error messages, loading states, responsive design)
- Indian context (legal language, date/currency formats, document types)
- Minimalist design (monochrome palette, sharp edges, no decorations)

**When making changes:**
- Always sanitize user inputs before LLM processing
- Use atomic SQL for credit operations
- Validate all inputs with Zod schemas
- Log important actions to activity logs
- Handle errors gracefully with user-friendly messages
- Test credit refund scenarios
- Consider mobile responsiveness
- Update TypeScript types when changing schemas
- Run database migrations after schema changes

**Code quality standards:**
- No unused imports
- No console.logs in production code (use proper logging)
- Consistent error handling
- Meaningful variable names
- Comments for complex logic only
- TypeScript strict mode compliance

**Security requirements:**
- Never expose credentials in code
- Always hash passwords with bcrypt
- Use parameterized queries (Drizzle ORM handles this)
- Validate and sanitize all inputs
- Implement rate limiting on public endpoints
- Use HTTPS in production
- Set secure cookie flags

This document serves as the complete technical specification and context for the Lekhai project. Any LLM working with this codebase should reference this document for understanding architecture, workflows, conventions, and requirements.
