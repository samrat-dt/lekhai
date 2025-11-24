# Comprehensive CTA Guide - Lekhai

**Last Updated:** 2025-11-24
**Purpose:** Complete reference for all Call-to-Action flows, API endpoints, metric tracking, and database operations

---

## 📋 TABLE OF CONTENTS

1. [User CTAs](#user-ctas)
2. [Document CTAs](#document-ctas)
3. [Payment CTAs](#payment-ctas)
4. [Team CTAs](#team-ctas)
5. [Admin CTAs](#admin-ctas)
6. [API Endpoints Reference](#api-endpoints-reference)
7. [Metric Tracking Map](#metric-tracking-map)
8. [Database Operations Reference](#database-operations-reference)

---

## 🎯 USER CTAs

### CTA 1: Sign Up
**User Journey:** Anonymous → Registered User
**Flow Location:** `app/(login)/sign-up/page.tsx`
**Trigger:** User clicks "Sign up" button on landing page

**Actions Executed:**
1. Form validation via `signUpSchema` (Zod)
2. Password strength check:
   - Minimum 8 characters
   - 1 uppercase, 1 lowercase, 1 number, 1 special char
3. Email uniqueness verification
4. Bcrypt password hashing
5. User record creation
6. Team auto-creation (`${email}'s Team`)
7. 10 free credits allocation (PROMOTION reason)
8. Session cookie set (24-hour expiry)
9. Activity logged: `SIGN_UP`
10. Redirect to `/dashboard`

**Server Action:** `signUp()` in `app/(login)/actions.ts:120`

**Database Operations:**
```
INSERT users (email, passwordHash, role)
INSERT teams (name)
INSERT teamMembers (userId, teamId, role='owner')
INSERT userCredits (userId, credits=10)
INSERT creditTransactions (reason='PROMOTION', change=10)
INSERT activityLogs (action='SIGN_UP')
```

**Success Metrics:**
- Track: `SIGN_UP` activity
- Update: User count, new users (7/30/90 day cohorts)

---

### CTA 2: Sign In
**User Journey:** Registered User → Authenticated Session
**Flow Location:** `app/(login)/sign-in/page.tsx`
**Trigger:** User clicks "Sign in" on login page

**Actions Executed:**
1. Email validation format
2. Password hash comparison (bcryptjs)
3. User found check
4. Session token creation (jose JWT)
5. Secure cookie storage (httpOnly, secure, lax)
6. Activity logged: `SIGN_IN`
7. Redirect to `/dashboard`

**Server Action:** `signIn()` in `app/(login)/actions.ts:69`

**Database Operations:**
```
SELECT users WHERE email = ?
INSERT activityLogs (action='SIGN_IN', userId, ipAddress)
```

**Success Metrics:**
- Track: `SIGN_IN` activity + timestamp
- Dashboard: Daily active users (DAU)

---

### CTA 3: Password Reset Request
**User Journey:** Forgot Password → Email Sent
**Flow Location:** `app/(login)/forgot-password/page.tsx`
**Trigger:** User clicks "Forgot password?" link

**Actions Executed:**
1. Email existence check
2. 32-byte secure token generation (crypto.randomBytes)
3. Token expiration set (24 hours)
4. Token stored in database
5. Reset email sent via Resend
6. Generic success message (don't reveal if email exists)

**Server Action:** `requestPasswordReset()` in `app/(login)/actions.ts:536`

**Database Operations:**
```
SELECT users WHERE email = ?
INSERT passwordResetTokens (token, expiresAt)
SEND EMAIL (password reset link)
```

**Email Content:**
- Template: `passwordResetEmailTemplate()` in `lib/email/templates.ts:60`
- Contains: Reset link with 24-hour validity
- Redirect: `/reset-password?token=[TOKEN]`

---

### CTA 4: Password Reset Complete
**User Journey:** Reset Link Clicked → New Password Set
**Flow Location:** `app/(login)/reset-password/page.tsx`
**Trigger:** User submits new password form

**Actions Executed:**
1. Token validation (exists, not expired, not used)
2. Password strength validation
3. New bcrypt hash generation
4. User password update
5. Token marked as used (usedAt timestamp)
6. Activity logged: `UPDATE_PASSWORD`
7. Redirect to `/sign-in` with success message

**Server Action:** `resetPassword()` in `app/(login)/actions.ts:596`

**Database Operations:**
```
SELECT passwordResetTokens WHERE token = ?
UPDATE users SET passwordHash = ? WHERE id = ?
UPDATE passwordResetTokens SET usedAt = NOW() WHERE id = ?
INSERT activityLogs (action='UPDATE_PASSWORD')
```

---

### CTA 5: Update Account
**User Journey:** Authenticated User → Profile Updated
**Flow Location:** `app/(dashboard)/dashboard/settings/page.tsx`
**Trigger:** User updates name/email in settings

**Actions Executed:**
1. Authentication verification
2. Email uniqueness check (if changed)
3. Name validation (1-100 characters)
4. User record update
5. Activity logged: `UPDATE_ACCOUNT`

**Server Action:** `updateAccount()` in `app/(login)/actions.ts:372`

**Database Operations:**
```
UPDATE users SET name = ?, email = ? WHERE id = ?
INSERT activityLogs (action='UPDATE_ACCOUNT')
```

---

### CTA 6: Delete Account (GDPR)
**User Journey:** Authenticated User → Account Permanently Deleted
**Flow Location:** `app/(dashboard)/dashboard/settings/page.tsx`
**Trigger:** User confirms "Delete Account" with password

**Actions Executed:**
1. Password verification
2. Activity logged: `DELETE_ACCOUNT`
3. Soft delete (deletedAt timestamp + email modified)
4. Team member removed from all teams
5. Session cleared
6. Redirect to `/sign-in`

**Server Action:** `deleteAccount()` in `app/(login)/actions.ts:321`

**Database Operations:**
```
UPDATE users SET deletedAt = NOW(), email = CONCAT(email, '-', id, '-deleted') WHERE id = ?
DELETE FROM teamMembers WHERE userId = ?
DELETE SESSION COOKIE
INSERT activityLogs (action='DELETE_ACCOUNT')
```

**Success Metrics:**
- Track: `DELETE_ACCOUNT` activity
- Update: User churn calculation (deleted account removal)

---

## 📄 DOCUMENT CTAs

### CTA 7: Create Document
**User Journey:** Authenticated User → Document Generated
**Flow Location:** `app/(dashboard)/dashboard/documents/new/page.tsx`
**Trigger:** User selects document type and submits form

**Actions Executed:**
1. User authentication check
2. Credit availability check (minimum 1)
3. Rate limit check (10 documents/hour per user)
4. Input sanitization (prompt injection prevention)
5. Document record creation with PENDING status
6. Atomic credit deduction (PostgreSQL transaction)
7. Perplexity API call with sanitized inputs
8. AI generation (sonar-large-32k model, temperature 0.2)
9. Document status updated to GENERATED
10. Credit transaction logged
11. Activity logged: `DOCUMENT_GENERATED`
12. Redirect to `/dashboard/documents/[id]`

**Server Action:** `generateDocument()` in `app/(dashboard)/dashboard/documents/actions.ts:235`

**Database Operations:**
```
SELECT userCredits WHERE userId = ? [FOR UPDATE]
INSERT legalDocuments (userId, type, title, inputPayload, status='PENDING')
UPDATE userCredits SET credits = credits - 1 WHERE userId = ?
UPDATE legalDocuments SET generatedContent = ?, status = 'GENERATED' WHERE id = ?
INSERT creditTransactions (reason='DOCUMENT_GENERATION', change=-1, documentId=?)
INSERT activityLogs (action='DOCUMENT_GENERATED')
```

**Failure Handling:**
- If credit insufficient: Reject, no deduction
- If rate limited: Reject, no deduction
- If AI generation fails: Refund credit, mark as FAILED, log `DOCUMENT_GENERATION_FAILED`

**Success Metrics:**
- Track: `DOCUMENT_GENERATED` activity
- Measure: Generation success rate, average time, by document type
- Update: Total documents, revenue (credit consumption)

---

### CTA 8: View Document
**User Journey:** Authenticated User → View Generated Legal Document
**Flow Location:** `app/(dashboard)/dashboard/documents/[id]/page.tsx`
**Trigger:** User clicks on document in list

**Database Operations:**
```
SELECT legalDocuments WHERE id = ? AND userId = ?
```

**Output:**
- Display: Markdown-formatted legal document
- Metadata: Type, creation date, status
- Actions: Copy to clipboard, download as .txt, delete

---

### CTA 9: Delete Document
**User Journey:** Authenticated User → Document Removed
**Flow Location:** `app/(dashboard)/dashboard/documents/[id]/page.tsx`
**Trigger:** User clicks delete button

**Actions Executed:**
1. Ownership verification
2. Soft delete (deletedAt timestamp)
3. No credit refund (already consumed)

**Database Operations:**
```
UPDATE legalDocuments SET deletedAt = NOW() WHERE id = ? AND userId = ?
```

---

## 💳 PAYMENT CTAs

### CTA 10: Purchase Credits
**User Journey:** Authenticated User → Credit Package Selected → Payment Completed
**Flow Location:** `app/(dashboard)/dashboard/pricing/page.tsx`
**Trigger:** User clicks "Buy Now" on credit package

**Credit Packages:**
| Credits | Price | Per Credit | Discount |
|---------|-------|-----------|----------|
| 10 | ₹250 | ₹25.00 | — |
| 50 | ₹990 | ₹19.80 | 10% |
| 100 | ₹1790 | ₹17.90 | 20% |
| 200 | ₹2990 | ₹14.95 | 25% |

**Actions Executed:**
1. User authentication check
2. Package selection validation
3. Razorpay Order creation
4. Order ID + credits stored in Razorpay metadata
5. Razorpay Checkout modal opens (client-side)
6. User selects payment method (UPI/Cards/Wallets/NetBanking)
7. Payment processed by Razorpay
8. Webhook callback fires

**API Endpoint:** `POST /api/razorpay/create-order`
**Request Body:**
```json
{
  "packageId": "pkg_50",
  "amount": 99000,
  "currency": "INR",
  "credits": 50
}
```

**Response:**
```json
{
  "id": "order_...",
  "amount": 99000,
  "currency": "INR",
  "status": "created"
}
```

**Server Action:** `createOrder()` in `lib/payments/razorpay.ts:45`

**Database Operations:**
```
INSERT INTO creditOrders (userId, packageId, orderId, status='pending')
SELECT FROM users WHERE id = ? (for verification)
```

---

### CTA 11: Payment Webhook
**Webhook Source:** Razorpay `payment.captured` event
**Endpoint:** `POST /api/razorpay/webhook`
**Trigger:** Razorpay sends payment confirmation

**Actions Executed:**
1. Signature verification (HMAC-SHA256)
2. Payment status check (captured)
3. Order ID extraction from webhook payload
4. Credits lookup from order metadata
5. Atomic credit update
6. Transaction logged with Razorpay payment intent ID
7. Activity logged: `CREDIT_PURCHASED`
8. Return 200 OK (idempotent)

**Webhook Payload Processing:**
```
event.type = 'payment.captured'
event.payload.payment.entity:
  - id (payment ID)
  - order_id (matches our order)
  - amount (verification)
  - status (captured)
```

**API Endpoint:** `app/api/razorpay/webhook/route.ts`

**Database Operations:**
```
SELECT creditOrders WHERE razorpayOrderId = ?
UPDATE userCredits SET credits = credits + ?, updatedAt = NOW() WHERE userId = ?
INSERT creditTransactions (
  userId, change=positive, reason='PURCHASE',
  stripePaymentIntentId=paymentId, metadata={orderId, razorpayId}
)
INSERT activityLogs (action='CREDIT_PURCHASED')
UPDATE creditOrders SET status='completed', webhookProcessedAt=NOW()
```

**Idempotency:**
- Check: If creditOrders.status = 'completed', skip processing
- Prevent: Duplicate credit additions from multiple webhook calls

**Success Metrics:**
- Track: `CREDIT_PURCHASED` activity
- Measure: Revenue, conversion rate, avg order value
- Monitor: Payment failure rate, webhook delays

---

## 👥 TEAM CTAs

### CTA 12: Create Team
**Implicit CTA:** Auto-triggered on user sign-up
**Manual:** User in settings can create new team

**Actions Executed:**
1. Team name validation
2. Team record creation
3. User added as team owner
4. Activity logged: `CREATE_TEAM`

**Database Operations:**
```
INSERT teams (name)
INSERT teamMembers (userId, teamId, role='owner')
INSERT activityLogs (action='CREATE_TEAM')
```

---

### CTA 13: Invite Team Member
**User Journey:** Team Owner → Invite Sent via Email
**Flow Location:** `app/(dashboard)/dashboard/settings/team/page.tsx`
**Trigger:** Owner enters email and role, clicks invite

**Actions Executed:**
1. Owner role verification
2. Duplicate member check
3. Pending invitation check
4. Invitation record creation
5. Invitation email sent
6. Activity logged: `INVITE_TEAM_MEMBER`

**Server Action:** `inviteTeamMember()` in `app/(login)/actions.ts:451`

**Database Operations:**
```
SELECT teamMembers WHERE userId = ? AND teamId = ? (verify owner)
SELECT teamMembers WHERE email = ? AND teamId = ? (duplicate check)
SELECT invitations WHERE email = ? AND teamId = ? AND status='pending' (pending check)
INSERT invitations (teamId, email, role, invitedBy, status='pending')
SEND EMAIL (invitation link with inviteId)
INSERT activityLogs (action='INVITE_TEAM_MEMBER')
```

**Email Content:**
- Template: `invitationEmailTemplate()` in `lib/email/templates.ts:30`
- Contains: Team name, inviter name, accept link
- Link: `/sign-up?inviteId=[INVITATION_ID]`

---

### CTA 14: Accept Team Invitation
**User Journey:** Invited User Clicks Email Link → Joins Team
**Flow Location:** `app/(login)/sign-up/page.tsx?inviteId=...`
**Trigger:** User completes sign-up with valid inviteId

**Actions Executed:**
1. Invitation validation (exists, email matches, status=pending)
2. User account creation
3. Team member record created with invited role
4. Invitation marked accepted
5. Activity logged: `ACCEPT_INVITATION`

**Server Action:** `signUp()` with inviteId in `app/(login)/actions.ts:159`

**Database Operations:**
```
SELECT invitations WHERE id = ? AND email = ? AND status = 'pending'
INSERT users
INSERT teamMembers (userId, teamId, role=invitation.role)
UPDATE invitations SET status='accepted' WHERE id = ?
INSERT activityLogs (action='ACCEPT_INVITATION')
```

**Success Metrics:**
- Track: `INVITE_TEAM_MEMBER`, `ACCEPT_INVITATION` activities
- Measure: Team growth, invitation acceptance rate

---

### CTA 15: Remove Team Member
**User Journey:** Team Owner → Team Member Removed
**Flow Location:** `app/(dashboard)/dashboard/settings/team/page.tsx`
**Trigger:** Owner clicks remove on team member

**Actions Executed:**
1. Owner role verification
2. Self-removal prevention
3. Team membership verification
4. Team member record deleted
5. Activity logged: `REMOVE_TEAM_MEMBER`

**Server Action:** `removeTeamMember()` in `app/(login)/actions.ts:391`

**Database Operations:**
```
SELECT teamMembers WHERE userId = ? AND teamId = ? (verify owner)
SELECT teamMembers WHERE id = ? AND teamId = ? (verify target member)
DELETE FROM teamMembers WHERE id = ? AND teamId = ?
INSERT activityLogs (action='REMOVE_TEAM_MEMBER')
```

**Success Metrics:**
- Track: `REMOVE_TEAM_MEMBER` activity

---

## 🔐 ADMIN CTAs

### CTA 16: View System Metrics (Admin Only)
**User Journey:** Admin → Dashboard with Full System Metrics
**Flow Location:** Admin dashboard (endpoint-only)
**Trigger:** Admin user navigates to `/admin/metrics` or API call

**API Endpoint:** `GET /api/analytics?days=30`

**Authorization:**
```
1. Check: User authenticated
2. Check: user.role = 'admin'
3. Return: Forbidden (403) if not admin
```

**Response Structure:**
```json
{
  "users": {
    "totalUsers": 150,
    "activeUsers": 95,
    "newUsersLast30Days": 12,
    "churnRate": 2.5
  },
  "documents": {
    "totalGenerated": 487,
    "generatedLast30Days": 145,
    "failureRate": 1.3,
    "averageTimeToGenerate": 2,
    "byType": {
      "PAYMENT_DEFAULT": 87,
      "RENT_RECEIPT": 45,
      ...
    }
  },
  "credits": {
    "totalCreditsPurchased": 8450,
    "totalCreditsConsumed": 5230,
    "averageCreditsPerUser": 56.33,
    "revenueLast30Days": 24500
  },
  "activity": {
    "signUpCount": 12,
    "signInCount": 2145,
    "signOutCount": 1890,
    "passwordUpdateCount": 8,
    "accountDeleteCount": 1,
    "gdprExportCount": 0,
    "gdprDeletionCount": 0
  },
  "timestamp": "2025-11-24T21:47:00Z"
}
```

**Query Parameters:**
- `days=7` - Last 7 days metrics
- `days=30` - Last 30 days (default)
- `days=90` - Last 90 days

**Caching:**
- HTTP Cache-Control: `public, s-maxage=300, stale-while-revalidate=600`
- Fresh for 5 minutes, stale for additional 10 minutes

**Database Operations:**
```
getSystemMetrics(days) calls:
├── getUserMetrics(days)
│   ├── COUNT users WHERE deletedAt IS NULL
│   ├── COUNT users WHERE deletedAt IS NULL AND createdAt > (now - days)
│   ├── COUNT activityLogs WHERE timestamp > (now - days) [DISTINCT USERS]
│   └── Calculate churn rate
├── getDocumentMetrics(days)
│   ├── COUNT legalDocuments
│   ├── COUNT legalDocuments WHERE createdAt > (now - days)
│   ├── COUNT legalDocuments WHERE createdAt > (now - days) AND status='FAILED'
│   └── GROUP BY type, COUNT
├── getCreditMetrics(days)
│   ├── SUM creditTransactions WHERE reason='PURCHASE'
│   ├── SUM creditTransactions WHERE change > 0
│   ├── AVG creditTransactions / COUNT users
│   └── SUM creditTransactions WHERE createdAt > (now - days) AND reason='PURCHASE'
└── getActivityMetrics()
    ├── COUNT activityLogs WHERE action='SIGN_UP'
    ├── COUNT activityLogs WHERE action='SIGN_IN'
    ├── COUNT activityLogs WHERE action='GDPR_DATA_EXPORT'
    └── [All 16 activity types]
```

**Success Metrics:**
- No activity logged (read-only)
- Monitor: API response time, cache hit rate

---

### CTA 17: GDPR Data Export (User Initiated)
**User Journey:** Authenticated User → Full Data Export JSON
**Flow Location:** `app/(dashboard)/dashboard/settings/privacy/page.tsx`
**Trigger:** User clicks "Export My Data"

**Actions Executed:**
1. User authentication
2. Data compilation from all related tables
3. JSON file generated with:
   - User profile (name, email, created date)
   - All documents (content, metadata, generation time)
   - All credit transactions (date, amount, reason)
   - Activity log (all user actions with timestamps)
   - Statistics summary
4. File download initiated
5. Activity logged: `GDPR_DATA_EXPORT`

**Database Operations:**
```
SELECT users WHERE id = ?
SELECT legalDocuments WHERE userId = ?
SELECT creditTransactions WHERE userId = ?
SELECT activityLogs WHERE userId = ?
INSERT activityLogs (action='GDPR_DATA_EXPORT')
```

**Success Metrics:**
- Track: `GDPR_DATA_EXPORT` activity

---

### CTA 18: GDPR Data Deletion (User Initiated)
**User Journey:** Authenticated User → All Data Permanently Deleted
**Flow Location:** `app/(dashboard)/dashboard/settings/privacy/page.tsx`
**Trigger:** User confirms "Delete All My Data" with password

**Actions Executed:**
1. Password verification
2. Activity logged: `GDPR_DATA_DELETION_REQUEST` (before deletion)
3. All user data deleted:
   - Documents
   - Credit transactions
   - Team memberships
   - Activity logs (anonymized)
   - User account (soft delete)
4. Session cleared
5. Redirect to `/sign-in`

**Database Operations:**
```
[Transaction Start]
DELETE FROM legalDocuments WHERE userId = ?
DELETE FROM creditTransactions WHERE userId = ?
DELETE FROM teamMembers WHERE userId = ?
UPDATE activityLogs SET userId = NULL WHERE userId = ? (anonymize)
UPDATE users SET deletedAt = NOW(), email = CONCAT(email, '-', id, '-deleted') WHERE id = ?
[Transaction Commit]
DELETE SESSION COOKIE
INSERT activityLogs (action='GDPR_DATA_DELETION_REQUEST', userId=NULL) -- logged before deletion
```

**Success Metrics:**
- Track: `GDPR_DATA_DELETION_REQUEST` activity (logged before deletion)
- Monitor: Data deletion request frequency

---

## 📡 API ENDPOINTS REFERENCE

### Authentication Endpoints

#### POST `/api/auth/sign-up`
**Not exposed** - Uses Server Action
**Server Action:** `signUp()` in `app/(login)/actions.ts:120`

#### POST `/api/auth/sign-in`
**Not exposed** - Uses Server Action
**Server Action:** `signIn()` in `app/(login)/actions.ts:69`

#### POST `/api/auth/sign-out`
**Not exposed** - Uses Server Action
**Server Action:** `signOut()` in `app/(login)/actions.ts:250`

---

### User Endpoints

#### GET `/api/user`
**Purpose:** Fetch current authenticated user
**Auth:** Required (JWT in cookie)
**Response:**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "owner",
  "createdAt": "2025-11-24T...",
  "updatedAt": "2025-11-24T..."
}
```

---

### Team Endpoints

#### GET `/api/team`
**Purpose:** Fetch current user's team with members
**Auth:** Required (JWT in cookie)
**Response:**
```json
{
  "team": {
    "id": 5,
    "name": "John's Team",
    "createdAt": "2025-11-24T..."
  },
  "members": [
    {
      "id": 12,
      "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com"
      },
      "role": "owner",
      "joinedAt": "2025-11-24T..."
    }
  ]
}
```

---

### Payment Endpoints

#### POST `/api/razorpay/create-order`
**Purpose:** Create payment order for credit purchase
**Auth:** Required (JWT in cookie)
**Request Body:**
```json
{
  "packageId": "pkg_50",
  "amount": 99000,
  "currency": "INR",
  "credits": 50
}
```
**Response:**
```json
{
  "id": "order_...",
  "amount": 99000,
  "currency": "INR",
  "status": "created"
}
```
**File:** `app/api/razorpay/create-order/route.ts`

#### POST `/api/razorpay/webhook`
**Purpose:** Handle Razorpay payment callbacks
**Auth:** None (signature verified)
**Verification:** HMAC-SHA256 signature validation
**Signature Header:** `X-Razorpay-Signature`
**Expected Events:** `payment.captured`, `payment.failed`
**File:** `app/api/razorpay/webhook/route.ts`

---

### Analytics Endpoints

#### GET `/api/analytics`
**Purpose:** Get comprehensive system metrics (admin only)
**Auth:** Required (JWT in cookie + admin role)
**Query Parameters:**
- `days=7|30|90` (default: 30)

**Response:** See [CTA 16: View System Metrics](#cta-16-view-system-metrics-admin-only)

**File:** `app/api/analytics/route.ts`

---

### Document Endpoints (Missing - Recommended)

#### GET `/api/documents`
**Status:** ⚠️ NOT IMPLEMENTED
**Purpose:** List user documents with pagination
**Auth:** Required
**Query Parameters:**
- `limit=20` (default)
- `offset=0` (default)
- `status=GENERATED|PENDING|FAILED` (optional)
- `type=PAYMENT_DEFAULT|...` (optional)

**Recommended Response:**
```json
{
  "documents": [...],
  "total": 45,
  "limit": 20,
  "offset": 0
}
```

#### GET `/api/documents/[id]`
**Status:** ⚠️ NOT IMPLEMENTED (Use Server Action)
**Purpose:** Fetch single document
**Auth:** Required

#### POST `/api/documents`
**Status:** ⚠️ NOT IMPLEMENTED (Uses Server Action instead)
**Purpose:** Create/generate document
**Auth:** Required

#### DELETE `/api/documents/[id]`
**Status:** ⚠️ NOT IMPLEMENTED
**Purpose:** Delete document
**Auth:** Required

---

### Credit Endpoints (Missing - Recommended)

#### GET `/api/credits`
**Status:** ⚠️ NOT IMPLEMENTED
**Purpose:** Get user credit balance
**Auth:** Required

**Recommended Response:**
```json
{
  "userId": 1,
  "credits": 45,
  "lastUpdated": "2025-11-24T...",
  "recentTransactions": [
    {
      "date": "2025-11-24T...",
      "change": -1,
      "reason": "DOCUMENT_GENERATION",
      "documentType": "PAYMENT_DEFAULT"
    }
  ]
}
```

#### GET `/api/credits/history`
**Status:** ⚠️ NOT IMPLEMENTED
**Purpose:** Get detailed credit transaction history
**Auth:** Required
**Query Parameters:**
- `limit=50` (default)
- `offset=0` (default)
- `reason=PURCHASE|DOCUMENT_GENERATION|REFUND` (optional)

---

## 📊 METRIC TRACKING MAP

### User Metrics (Activity Logs)

| Metric | Event | Location | Database |
|--------|-------|----------|----------|
| New Signups | `SIGN_UP` | `signUp()` action | activityLogs |
| Active Users | `SIGN_IN` | `signIn()` action | activityLogs |
| Churn Rate | `DELETE_ACCOUNT` | `deleteAccount()` action | activityLogs |
| Session Count | `SIGN_OUT` | `signOut()` action | activityLogs |
| Password Updates | `UPDATE_PASSWORD` | `resetPassword()`, `updatePassword()` actions | activityLogs |

### Document Metrics

| Metric | Event | Location | Database |
|--------|-------|----------|----------|
| Total Generated | `DOCUMENT_GENERATED` | `generateDocument()` action | activityLogs + legalDocuments |
| Success Rate | `DOCUMENT_GENERATED` vs `DOCUMENT_GENERATION_FAILED` | Document generation flow | activityLogs |
| Failure Rate | `DOCUMENT_GENERATION_FAILED` | Error handler in generation | activityLogs |
| By Type | Grouped by `legalDocuments.type` | Analytics function | legalDocuments |
| Generation Time | Timestamp delta | Missing implementation | ⚠️ N/A |

### Credit Metrics

| Metric | Event | Location | Database |
|--------|-------|----------|----------|
| Purchases | `CREDIT_PURCHASED` | Razorpay webhook | activityLogs + creditTransactions |
| Consumption | `DOCUMENT_GENERATION` | Document generation | creditTransactions |
| Refunds | `CREDIT_REFUNDED` | Generation failure | creditTransactions |
| Revenue | Sum of credit purchases | Analytics function | creditTransactions |
| Avg/User | Average credits per user | Analytics function | Calculated |

### Team Metrics

| Metric | Event | Location | Database |
|--------|-------|----------|----------|
| Teams Created | `CREATE_TEAM` | User signup | activityLogs |
| Invitations Sent | `INVITE_TEAM_MEMBER` | Invite action | activityLogs |
| Invitations Accepted | `ACCEPT_INVITATION` | Sign-up with invite | activityLogs |
| Member Removals | `REMOVE_TEAM_MEMBER` | Remove action | activityLogs |

### Compliance Metrics

| Metric | Event | Location | Database |
|--------|-------|----------|----------|
| Data Exports | `GDPR_DATA_EXPORT` | GDPR export action | activityLogs |
| Data Deletions | `GDPR_DATA_DELETION_REQUEST` | GDPR delete action | activityLogs |

### Missing Metrics ⚠️

- **Generation Time:** No timestamp captured at start/end of generation
- **API Performance:** No endpoint response time tracking
- **Error Details:** Generic error logging, no categorization
- **Feature Usage:** Which form fields are commonly filled vs skipped
- **Session Duration:** User session length not tracked
- **Rate Limit Hits:** Rate limiting blocks not logged

---

## 🗄️ DATABASE OPERATIONS REFERENCE

### User Management

**Create User**
```sql
INSERT INTO users (email, passwordHash, role)
VALUES (?, ?, 'owner')
```
Location: `signUp()` in `app/(login)/actions.ts:145`

**Update User**
```sql
UPDATE users
SET name = ?, email = ?
WHERE id = ?
```
Location: `updateAccount()` in `app/(login)/actions.ts:378`

**Get User**
```sql
SELECT * FROM users
WHERE id = ? AND deletedAt IS NULL
```
Location: `getUser()` in `lib/db/queries.ts`

**Soft Delete User**
```sql
UPDATE users
SET deletedAt = NOW(),
    email = CONCAT(email, '-', id, '-deleted')
WHERE id = ?
```
Location: `deleteAccount()` in `app/(login)/actions.ts:343`

---

### Team Management

**Create Team**
```sql
INSERT INTO teams (name)
VALUES (?)
```
Location: `signUp()` in `app/(login)/actions.ts:198`

**Get Team with Members**
```sql
SELECT teams.*,
       team_members.id, team_members.role,
       users.id, users.name, users.email
FROM teams
LEFT JOIN teamMembers ON teams.id = teamMembers.teamId
LEFT JOIN users ON teamMembers.userId = users.id
WHERE teams.id = ?
```
Location: `getTeamForUser()` in `lib/db/queries.ts`

**Add Team Member**
```sql
INSERT INTO teamMembers (userId, teamId, role)
VALUES (?, ?, ?)
```
Location: `signUp()` with invitation in `app/(login)/actions.ts:229`

**Remove Team Member**
```sql
DELETE FROM teamMembers
WHERE id = ? AND teamId = ?
```
Location: `removeTeamMember()` in `app/(login)/actions.ts:427`

---

### Credit System

**Initialize Credits**
```sql
INSERT INTO userCredits (userId, credits)
VALUES (?, 10)
```
Location: `signUp()` in `app/(login)/actions.ts:231`

**Deduct Credit (Atomic)**
```sql
UPDATE userCredits
SET credits = credits - 1,
    updatedAt = NOW()
WHERE userId = ? AND credits >= 1
RETURNING credits
```
Location: `generateDocument()` in `app/(dashboard)/dashboard/documents/actions.ts:280`

**Refund Credit**
```sql
UPDATE userCredits
SET credits = credits + 1,
    updatedAt = NOW()
WHERE userId = ?
```
Location: Document generation error handling in `app/(dashboard)/dashboard/documents/actions.ts`

**Get Balance**
```sql
SELECT credits FROM userCredits
WHERE userId = ?
```
Location: `generateDocument()` check

**Log Transaction**
```sql
INSERT INTO creditTransactions
(userId, change, reason, metadata, documentId, createdAt)
VALUES (?, ?, ?, ?, ?, NOW())
```
Location: `generateDocument()`, `verifyPayment()` in `lib/payments/razorpay.ts`

---

### Document Management

**Create Document**
```sql
INSERT INTO legalDocuments
(userId, type, title, inputPayload, status)
VALUES (?, ?, ?, ?, 'PENDING')
```
Location: `generateDocument()` in `app/(dashboard)/dashboard/documents/actions.ts:271`

**Update Document**
```sql
UPDATE legalDocuments
SET generatedContent = ?, status = 'GENERATED', updatedAt = NOW()
WHERE id = ?
```
Location: After AI generation in `generateDocument()`

**Get User Documents**
```sql
SELECT * FROM legalDocuments
WHERE userId = ? AND deletedAt IS NULL
ORDER BY createdAt DESC
```
⚠️ Missing: No pagination, not exposed via API

**Soft Delete Document**
```sql
UPDATE legalDocuments
SET deletedAt = NOW()
WHERE id = ? AND userId = ?
```
Location: `deleteDocument()` action (⚠️ not fully implemented)

---

### Activity Logging

**Log Activity**
```sql
INSERT INTO activityLogs
(teamId, userId, action, timestamp, ipAddress)
VALUES (?, ?, ?, NOW(), ?)
```
Location: `trackEvent()` in `lib/analytics.ts:299`

**Get User Activity**
```sql
SELECT * FROM activityLogs
WHERE userId = ?
ORDER BY timestamp DESC
LIMIT 10
```
Location: `getActivityLogs()` in `lib/db/queries.ts:56`
⚠️ Hard-coded limit, should be parameterized

---

### Password Reset

**Create Reset Token**
```sql
INSERT INTO passwordResetTokens
(userId, token, expiresAt)
VALUES (?, ?, ?)
```
Location: `requestPasswordReset()` in `app/(login)/actions.ts:565`

**Verify & Use Token**
```sql
SELECT * FROM passwordResetTokens
WHERE token = ? AND expiresAt > NOW() AND usedAt IS NULL
```
Location: `resetPassword()` in `app/(login)/actions.ts:602`

**Mark Token as Used**
```sql
UPDATE passwordResetTokens
SET usedAt = NOW()
WHERE id = ?
```
Location: `resetPassword()` after password update

---

### Analytics Queries

**Count Total Users**
```sql
SELECT COUNT(*) FROM users
WHERE deletedAt IS NULL
```

**Count New Users (30 days)**
```sql
SELECT COUNT(*) FROM users
WHERE deletedAt IS NULL
AND createdAt > NOW() - INTERVAL '30 days'
```

**Sum Revenue (30 days)**
```sql
SELECT SUM(change) FROM creditTransactions
WHERE reason = 'PURCHASE'
AND createdAt > NOW() - INTERVAL '30 days'
```

**Group Documents by Type**
```sql
SELECT type, COUNT(*) as count
FROM legalDocuments
WHERE createdAt > NOW() - INTERVAL '30 days'
GROUP BY type
```

---

## 🔄 TRANSACTION INTEGRITY

### Atomic Operations

**Credit Deduction** (App-level atomicity):
```typescript
// 1. Check balance
const result = await db.update(userCredits)
  .set({ credits: sql`${userCredits.credits} - 1` })
  .where(and(
    eq(userCredits.userId, user.id),
    sql`${userCredits.credits} >= 1`
  ))
  .returning();

// If deduction fails, amount wasn't available
if (result.length === 0) {
  return { error: 'Insufficient credits' };
}

// 2. Proceed with generation
// 3. If generation fails, refund (no automatic rollback)
```

Location: `generateDocument()` in `app/(dashboard)/dashboard/documents/actions.ts`

**Payment Verification** (Database transaction):
```typescript
// Razorpay webhook receives payment confirmation
// Signature verified, then atomic update:
const updatedCredits = await db.update(userCredits)
  .set({ credits: sql`${userCredits.credits} + ${credits}` })
  .where(eq(userCredits.userId, userId))
  .returning();

// Log transaction
await db.insert(creditTransactions).values({...});
```

Location: `verifyPayment()` in `lib/payments/razorpay.ts:81`

---

## 📈 FUTURE ENHANCEMENTS

### Recommended API Additions

1. **GET `/api/documents`** - List documents with filtering/pagination
2. **GET `/api/credits`** - Show balance and recent transactions
3. **GET `/api/credits/history`** - Full transaction history
4. **PUT `/api/user`** - Update profile
5. **POST `/api/team`** - Create new team
6. **DELETE `/api/documents/[id]`** - Delete via API

### Recommended Metric Additions

1. **Document Generation Time** - Track AI response time
2. **Session Duration** - How long users stay logged in
3. **Error Categories** - Categorize failures (API, LLM, rate limit)
4. **Feature Adoption** - Which document types are popular
5. **Form Completion Rate** - What % of fields are filled vs required

### Recommended Tracking Enhancements

1. **Session Events** - Track session start/end
2. **API Performance** - Response time per endpoint
3. **Error Breakdown** - Root cause of failures
4. **Rate Limit Events** - When users hit rate limits
5. **Webhook Performance** - Payment webhook processing time

---

**Document Status:** Complete reference for all CTAs and database operations
**Last Verified:** 2025-11-24
**Maintenance:** Update when adding new CTAs or API endpoints
