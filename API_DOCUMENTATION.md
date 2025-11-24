# Lekhai API Documentation

Complete API reference for the Lekhai legal document generation platform.

## Base URL

```
Development: http://localhost:3000
Production: https://api.lekhai.com
```

## Authentication

All protected endpoints require a valid session cookie set after signing in.

**Session Cookie:**
- Name: `session`
- Value: JWT token
- HttpOnly: true
- Secure: true (production only)
- SameSite: lax

## Rate Limiting

All endpoints are rate limited. Response includes rate limit information:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1700850400
```

**Rate Limit Tiers:**
- **Auth endpoints** (sign-in, sign-up): 5 requests per 15 minutes per IP
- **Document generation**: 10 requests per hour per user
- **API endpoints**: 100 requests per minute per IP

## Response Format

### Success Response (2xx)
```json
{
  "success": true,
  "data": {},
  "message": "Optional message"
}
```

### Error Response (4xx, 5xx)
```json
{
  "success": false,
  "error": "Error description",
  "code": "ERROR_CODE"
}
```

---

## Authentication Endpoints

### Sign Up

Create a new user account.

**Endpoint:** `POST /sign-up`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe"
}
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (!@#$%^&*)

**Response (201):**
```json
{
  "success": true,
  "message": "Account created successfully"
}
```

**Errors:**
- `400 Bad Request` - Invalid email or password requirements not met
- `409 Conflict` - Email already registered

**Rate Limit:** 5 requests per 15 minutes per IP

---

### Sign In

Authenticate user and create session.

**Endpoint:** `POST /sign-in`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Signed in successfully"
}
```

**Errors:**
- `401 Unauthorized` - Invalid email or password
- `429 Too Many Requests` - Rate limit exceeded

**Rate Limit:** 5 requests per 15 minutes per IP

---

### Request Password Reset

Initiate password reset flow via email.

**Endpoint:** `POST /forgot-password`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset email sent if account exists"
}
```

**Note:** Returns success even if email doesn't exist (security best practice)

---

### Reset Password

Complete password reset with token from email.

**Endpoint:** `POST /reset-password`

**Request Body:**
```json
{
  "token": "32-byte-secure-token-from-email",
  "password": "NewSecurePass123!",
  "confirmPassword": "NewSecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

**Errors:**
- `400 Bad Request` - Token expired or invalid
- `422 Unprocessable Entity` - Passwords don't match

---

## User Endpoints

### Get Current User

Retrieve authenticated user information.

**Endpoint:** `GET /api/user`

**Authentication:** Required

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "owner",
    "createdAt": "2025-01-01T00:00:00Z"
  }
}
```

**Errors:**
- `401 Unauthorized` - Not authenticated

---

## Team Endpoints

### Get Team Data

Retrieve team information and members.

**Endpoint:** `GET /api/team`

**Authentication:** Required

**Response (200):**
```json
{
  "success": true,
  "data": {
    "team": {
      "id": 1,
      "name": "My Team",
      "createdAt": "2025-01-01T00:00:00Z"
    },
    "teamMembers": [
      {
        "id": 1,
        "userId": 1,
        "role": "owner",
        "user": {
          "id": 1,
          "email": "user@example.com",
          "name": "John Doe"
        }
      }
    ]
  }
}
```

**Errors:**
- `401 Unauthorized` - Not authenticated
- `404 Not Found` - Team not found

---

### Invite Team Member

Send invitation to add user to team.

**Endpoint:** `POST /api/team/invite`

**Authentication:** Required (owner role)

**Request Body:**
```json
{
  "email": "newmember@example.com",
  "role": "member"
}
```

**Roles:** `member`, `owner`

**Response (200):**
```json
{
  "success": true,
  "message": "Invitation sent to newmember@example.com"
}
```

**Errors:**
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - User doesn't have owner role
- `400 Bad Request` - Invalid email or user already in team

---

### Remove Team Member

Remove user from team.

**Endpoint:** `POST /api/team/remove`

**Authentication:** Required (owner role)

**Request Body:**
```json
{
  "memberId": 2
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Member removed from team"
}
```

**Errors:**
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - User doesn't have owner role
- `400 Bad Request` - Can't remove self or only owner

---

## Document Endpoints

### List Documents

Get all documents for authenticated user.

**Endpoint:** `GET /api/documents`

**Authentication:** Required

**Query Parameters:**
- `status` (optional): `PENDING` | `GENERATED` | `FAILED`
- `type` (optional): Document type
- `limit` (optional): Max results (default: 20)
- `offset` (optional): Pagination offset (default: 0)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "type": "PAYMENT_DEFAULT",
      "title": "Payment Default Notice",
      "status": "GENERATED",
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-01T00:05:00Z"
    }
  ],
  "total": 1
}
```

---

### Get Document

Retrieve specific document.

**Endpoint:** `GET /api/documents/[id]`

**Authentication:** Required

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "type": "PAYMENT_DEFAULT",
    "title": "Payment Default Notice",
    "status": "GENERATED",
    "generatedContent": "Full document text in markdown format...",
    "inputPayload": { "name": "John", "amount": 5000 },
    "createdAt": "2025-01-01T00:00:00Z"
  }
}
```

**Errors:**
- `401 Unauthorized` - Not authenticated
- `404 Not Found` - Document not found
- `403 Forbidden` - User doesn't own document

---

### Generate Document

Create and generate a legal document.

**Endpoint:** `POST /dashboard/documents/generate`

**Authentication:** Required

**Request Body:**
```json
{
  "type": "PAYMENT_DEFAULT",
  "title": "Optional custom title",
  "payload": {
    "senderName": "John Doe",
    "senderAddress": "123 Main St, City, State 12345",
    "recipientName": "Jane Smith",
    "recipientAddress": "456 Oak Ave, City, State 54321",
    "amountOwed": 5000,
    "purpose": "Loan repayment"
  }
}
```

**Document Types:**
- `PAYMENT_DEFAULT` - Payment default notice
- `WORK_COMPLETION_DELAY` - Work completion delay notice
- `FNF_NOT_PAID` - F&F settlement notice
- `RENT_DEFAULT` - Rent default notice
- `LOST_DOCUMENT_AFFIDAVIT` - Lost document affidavit
- `NAME_CORRECTION_AFFIDAVIT` - Name correction affidavit
- `ADDRESS_PROOF_AFFIDAVIT` - Address proof affidavit
- `BANK_REQUEST_LETTER` - Bank request letter
- `RENT_RECEIPT` - Rent receipt

**Response (201):**
```json
{
  "success": true,
  "documentId": 1,
  "message": "Document generated successfully"
}
```

**Errors:**
- `400 Bad Request` - Invalid payload or document type
- `402 Payment Required` - Insufficient credits
- `429 Too Many Requests` - Rate limit (10/hour per user)
- `401 Unauthorized` - Not authenticated

**Rate Limit:** 10 requests per hour per user

---

### Delete Document

Remove a document.

**Endpoint:** `DELETE /api/documents/[id]`

**Authentication:** Required

**Response (200):**
```json
{
  "success": true,
  "message": "Document deleted"
}
```

**Errors:**
- `401 Unauthorized` - Not authenticated
- `404 Not Found` - Document not found
- `403 Forbidden` - User doesn't own document

---

## Payment Endpoints

### Create Payment Order

Create Razorpay order for credit purchase.

**Endpoint:** `POST /api/razorpay/create-order`

**Authentication:** Required

**Request Body:**
```json
{
  "credits": 10,
  "amount": 250
}
```

**Valid Credit Packages:**
- 10 credits: ₹250
- 50 credits: ₹990
- 100 credits: ₹1790
- 200 credits: ₹2990

**Response (200):**
```json
{
  "success": true,
  "orderId": "order_abc123xyz",
  "amount": 25000,
  "currency": "INR",
  "customerId": "cust_user123"
}
```

**Errors:**
- `400 Bad Request` - Invalid credit package
- `401 Unauthorized` - Not authenticated

---

### Payment Webhook

Razorpay webhook for payment notifications.

**Endpoint:** `POST /api/razorpay/webhook`

**Headers:**
```
X-Razorpay-Signature: [HMAC-SHA256 signature]
```

**Request Body:**
```json
{
  "event": "payment.captured",
  "payload": {
    "payment": {
      "entity": "payment",
      "id": "pay_abc123xyz",
      "amount": 25000,
      "currency": "INR",
      "status": "captured",
      "notes": {
        "userId": "1",
        "credits": "10"
      }
    }
  }
}
```

**Supported Events:**
- `payment.authorized` - Payment authorized
- `payment.captured` - Payment successfully captured
- `payment.failed` - Payment failed

**Response (200):**
```json
{
  "success": true
}
```

**Errors:**
- `400 Bad Request` - Invalid signature
- `409 Conflict` - Order already processed

---

## GDPR Endpoints

### Export User Data

Export all user data as JSON.

**Endpoint:** `POST /api/gdpr/export`

**Authentication:** Required

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {...},
    "documents": [...],
    "creditTransactions": [...],
    "activityLogs": [...],
    "exportedAt": "2025-01-01T00:00:00Z"
  }
}
```

---

### Delete User Data

Permanently delete all user data (irreversible).

**Endpoint:** `POST /api/gdpr/delete`

**Authentication:** Required

**Request Body:**
```json
{
  "password": "CurrentPassword123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "All data deleted permanently"
}
```

**Errors:**
- `401 Unauthorized` - Invalid password
- `400 Bad Request` - Password required

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Not authenticated or invalid token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `BAD_REQUEST` | 400 | Invalid request parameters |
| `PAYMENT_REQUIRED` | 402 | Insufficient credits |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `CONFLICT` | 409 | Resource already exists |
| `INVALID_SIGNATURE` | 400 | Webhook signature verification failed |
| `SERVER_ERROR` | 500 | Internal server error |

---

## Webhook Events

### Payment Events

```json
{
  "event": "payment.captured",
  "payload": {
    "payment": {
      "id": "pay_xyz123",
      "amount": 25000,
      "status": "captured"
    }
  }
}
```

### Document Generation Events (Future)

```json
{
  "event": "document.generated",
  "payload": {
    "documentId": 1,
    "type": "PAYMENT_DEFAULT",
    "status": "GENERATED"
  }
}
```

---

## Best Practices

### 1. Authentication
- Store session cookie securely
- Refresh session before expiry (24 hours)
- Clear session on logout

### 2. Rate Limiting
- Implement exponential backoff for retries
- Cache responses where appropriate
- Use `Retry-After` header for 429 responses

### 3. Error Handling
- Always check `success` field
- Handle specific error codes
- Log errors for debugging

### 4. Security
- Never send sensitive data in URLs
- Always use HTTPS in production
- Validate all inputs client-side before submission
- Don't expose internal error details to users

### 5. Pagination
- Default limit: 20 items
- Max limit: 100 items
- Use `offset` for pagination

---

## Changelog

### v1.0.0 (Current)
- Initial API release
- User authentication (sign-up, sign-in, password reset)
- Document generation (9 document types)
- Team management
- Payment integration (Razorpay)
- GDPR compliance endpoints
- Rate limiting
- Error tracking (Sentry)

---

## Support

For API support, contact: api@lekhai.com

## Status Page

Real-time API status: https://status.lekhai.com
