# Early User Promotion - First 3 Users Get 10 Free Credits

## Implementation Details

### Feature Overview
The first 3 users who sign up for Lekhai will automatically receive 10 free credits as a welcome bonus.

### How It Works

1. **During Signup**:
   - System counts total existing users in the database
   - If user count is ≤ 3, the new user qualifies for the bonus
   - User receives 10 credits instead of 0

2. **Credit Allocation**:
   - Credits are added to `userCredits` table during signup
   - Initial credits: 10 for first 3 users, 0 for everyone else

3. **Transaction Logging**:
   - A credit transaction record is created with:
     - Type: `PROMOTION`
     - Amount: +10 credits
     - Metadata includes:
       - Promotion type: `EARLY_USER_BONUS`
       - User number (1, 2, or 3)
       - Welcome message

### Code Changes

**File: `app/(login)/actions.ts`**

- Added `creditTransactions` import
- Modified `signUp` action to:
  - Count total users
  - Check if user qualifies (userCount ≤ 3)
  - Set initial credits to 10 for qualified users
  - Log promotional credit transaction

### Database Impact

**userCredits table:**
```sql
-- First 3 users will have:
userId | credits
-------|--------
1      | 10
2      | 10
3      | 10
4+     | 0
```

**creditTransactions table:**
```sql
-- Example promotional transaction
userId | change | reason     | metadata
-------|--------|------------|------------------
1      | +10    | PROMOTION  | {"promotion":"EARLY_USER_BONUS","userNumber":1,"description":"Welcome bonus..."}
```

### User Experience

**For First 3 Users:**
1. Sign up normally
2. Redirected to dashboard
3. See "10 credits" in credit balance
4. Can immediately generate 10 documents
5. Credit transaction shows "PROMOTION" with welcome message

**For Users 4+:**
1. Sign up normally
2. See "0 credits"
3. Need to purchase credits to generate documents

### Testing Instructions

1. **Reset Test Environment** (if needed):
   ```sql
   -- Delete all test users
   DELETE FROM credit_transactions WHERE reason = 'PROMOTION';
   DELETE FROM user_credits;
   DELETE FROM team_members;
   DELETE FROM users;
   -- Reset sequences if needed
   ```

2. **Test First User**:
   - Sign up with email: `test1@example.com`
   - Verify credit balance shows 10
   - Check credit transactions for PROMOTION entry

3. **Test Second User**:
   - Sign up with email: `test2@example.com`
   - Verify credit balance shows 10

4. **Test Third User**:
   - Sign up with email: `test3@example.com`
   - Verify credit balance shows 10

5. **Test Fourth User**:
   - Sign up with email: `test4@example.com`
   - Verify credit balance shows 0 (no bonus)

### Verification Queries

**Check user credits:**
```sql
SELECT
  u.id,
  u.email,
  uc.credits,
  u.created_at
FROM users u
LEFT JOIN user_credits uc ON u.id = uc.user_id
ORDER BY u.id;
```

**Check promotional transactions:**
```sql
SELECT
  ct.*,
  u.email
FROM credit_transactions ct
JOIN users u ON ct.user_id = u.id
WHERE ct.reason = 'PROMOTION'
ORDER BY ct.created_at;
```

### Notes

- Promotion is **automatic** - no user action required
- Counts are based on **total users**, not deleted/active users
- First 3 users are determined by **signup order** (user ID)
- Promotion is **one-time** per user during signup
- No expiration on the bonus credits

### Future Considerations

If you want to change this later:

**To increase user limit** (e.g., first 10 users):
```typescript
const isEarlyUser = userCount <= 10; // Change 3 to 10
```

**To change credit amount** (e.g., 20 credits):
```typescript
const initialCredits = isEarlyUser ? 20 : 0; // Change 10 to 20
```

**To disable promotion**:
```typescript
const initialCredits = 0; // Always 0, no promotion
```

**To extend to all users** (launch special):
```typescript
const initialCredits = 10; // All users get 10, remove isEarlyUser check
```

### Monitoring

Track promotion effectiveness:
```sql
-- How many users received the bonus?
SELECT COUNT(*) as early_users
FROM credit_transactions
WHERE reason = 'PROMOTION'
AND metadata LIKE '%EARLY_USER_BONUS%';

-- How many of those users actually used their credits?
SELECT
  ct.user_id,
  u.email,
  COUNT(CASE WHEN ct.reason = 'DOCUMENT_GENERATION' THEN 1 END) as documents_generated
FROM credit_transactions ct
JOIN users u ON ct.user_id = u.id
WHERE ct.user_id IN (
  SELECT user_id FROM credit_transactions WHERE reason = 'PROMOTION'
)
GROUP BY ct.user_id, u.email;
```

## Success Metrics

Track these to measure promotion effectiveness:
- [ ] All 3 early users signed up
- [ ] All 3 users received 10 credits
- [ ] % of early users who generated at least 1 document
- [ ] Average documents generated per early user
- [ ] Early user retention rate
