# MASTER LLM CONTEXT DOCUMENT - LEKHAI PROJECT

## PROJECT OVERVIEW

### Project Identity
- Name: Lekhai (meaning "writing" or "document" in Hindi)
- Purpose: AI-powered legal document generation platform for India
- Target Market: Indian citizens requiring legal documentation
- Business Model: Credit-based document generation system
- Technology Stack: Next.js 15, React 19, PostgreSQL, OpenRouter AI, Stripe

### Core Value Proposition
Lekhai provides accessible, affordable legal document generation for common use cases in India. Users can generate professionally drafted legal documents through a simple form-based interface powered by AI, without requiring legal expertise or expensive lawyer consultations.

### Unique Selling Points
1. FREE AI tier using OpenRouter (nousresearch/hermes-3-llama-3.1-405b:free model)
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
- OpenRouter AI for LLM document generation
- Stripe for payment processing
- Upstash Redis for rate limiting (optional)
- Vercel/Railway for hosting

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
  /auth                 # Authentication utilities
  /db                   # Database schema and queries
  /payments             # Stripe integration
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

#### Supported Document Categories
1. Affidavits (6 types)
2. Letters and NOCs (7 types)
3. Agreements and Receipts (5 types)
4. Payment Disputes (2 types)
5. Property and Tenancy (5 types)
6. Employment (1 type)
7. Consumer Rights (1 type)
8. Personal Disputes (1 type)

#### Implemented Document Types (Forms Complete)
1. LOST_DOCUMENT_AFFIDAVIT
2. NAME_CORRECTION_AFFIDAVIT
3. ADDRESS_PROOF_AFFIDAVIT
4. BANK_REQUEST_LETTER
5. RENT_RECEIPT
6. PAYMENT_DEFAULT
7. WORK_COMPLETION_DELAY
8. FNF_NOT_PAID
9. RENT_DEFAULT

#### Document Type Definitions
Each document type includes:
- Unique identifier (uppercase snake_case)
- Human-readable title
- Brief description
- Category classification
- Urgency level (high, medium, low)

Example:
```typescript
{
  id: 'PAYMENT_DEFAULT',
  title: 'Payment Default Notice',
  description: 'Money not returned by friend, freelancer, contractor, or tenant',
  category: 'payment',
  urgency: 'high'
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
   - Sanitized inputs sent to OpenRouter API
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
1. **PURCHASE**: User buys credits via Stripe
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
- Stripe payment details (if applicable)
- Associated document ID (if applicable)
- Timestamp

### Payment Integration (Stripe)

#### Stripe Configuration
- Test mode for development
- Live mode for production
- Webhook endpoint: /api/webhooks/stripe
- Supported events: checkout.session.completed

#### Pricing Structure
Defined in lib/payments/stripe.ts:
```typescript
Example pricing tiers:
- 10 credits: ₹99
- 50 credits: ₹399
- 100 credits: ₹699
```

#### Payment Flow
1. User clicks "Buy Credits" on pricing page
2. Stripe Checkout session created
3. User redirected to Stripe payment page
4. User completes payment
5. Stripe webhook fires checkout.session.completed
6. Server verifies webhook signature
7. Credits added to user account
8. Transaction recorded in database
9. User redirected back to dashboard

### AI Integration (OpenRouter)

#### API Configuration
- Base URL: https://openrouter.ai/api/v1
- Model: nousresearch/hermes-3-llama-3.1-405b:free
- Authentication: Bearer token in Authorization header
- Custom headers:
  - HTTP-Referer: Process.env.BASE_URL
  - X-Title: "Lekhai - Legal Document Generator"

#### Request Structure
```typescript
{
  model: "nousresearch/hermes-3-llama-3.1-405b:free",
  messages: [
    {
      role: "system",
      content: getSystemPrompt(documentType)
    },
    {
      role: "user",
      content: getUserPrompt(documentType, sanitizedPayload)
    }
  ],
  max_tokens: 4096,
  temperature: 0.7
}
```

#### System Prompts
Tailored for each document type with instructions for:
- Legal formatting standards
- Indian legal language conventions
- Required sections and clauses
- Date format (DD/MM/YYYY)
- Currency format (₹)
- Professional tone

#### User Prompts
Dynamically generated from form inputs, containing:
- Party details (names, addresses, contacts)
- Transaction/dispute specifics
- Dates and amounts
- Additional context

#### Response Handling
- Extract content from choices[0].message.content
- Validate non-empty response
- Store in database as generated_content
- Display to user with formatting preserved

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
  - "Buy Now" button
- Stripe Checkout integration

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

#### Credit Purchase Flow
1. User clicks "Buy Credits" from dashboard or pricing page
2. Selects credit package
3. Clicks "Buy Now"
4. Stripe Checkout session created
5. Redirected to Stripe payment page
6. Enters payment details
7. Completes payment
8. Stripe webhook fires
9. Credits added to account
10. User redirected back to dashboard
11. Success message shown
12. New balance reflected

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

**OpenRouter AI**
```
OPENROUTER_API_KEY=sk-or-v1-[key]
```
Get from: https://openrouter.ai/keys

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

**Stripe (Optional)**
```
STRIPE_SECRET_KEY=sk_test_[key]  # Test mode
STRIPE_SECRET_KEY=sk_live_[key]  # Live mode
STRIPE_WEBHOOK_SECRET=whsec_[secret]
```

**Redis (Optional - for rate limiting)**
```
UPSTASH_REDIS_REST_URL=https://[id].upstash.io
UPSTASH_REDIS_REST_TOKEN=[token]
```

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
6. No email notifications
7. No document expiry
8. No bulk operations

#### Technical Debt
1. Missing integration tests
2. No CI/CD pipeline
3. Manual database migrations
4. No automated backups
5. Limited error monitoring
6. No performance benchmarks

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
- Verify OPENROUTER_API_KEY is valid
- Check API rate limits
- Verify network connectivity
- Check payload size

**Stripe Webhook Not Firing**
- Verify webhook URL is public
- Check webhook secret matches
- Test webhook locally with Stripe CLI
- Check webhook signature validation

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
