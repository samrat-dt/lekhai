# Modal Flow - Quick Reference

## Quick Overview

User fills form → Clicks submit → Sees loading modal → Gets result (success or error)

## Three Modal States

### 1️⃣ Loading Modal
**When:** Document is being generated
**What user sees:**
- Spinning loader icon
- "Generating your document..."
- "This may take a few moments"
- Cannot interact with form

**Duration:** 3-10 seconds (depends on Perplexity API response time)

### 2️⃣ Success Modal
**When:** Document generated successfully
**What user sees:**
- Green checkmark icon
- "Document generated successfully!"
- "Redirecting..."
- Cannot interact

**Duration:** 1 second, then auto-redirects to document detail page

### 3️⃣ Error Modal
**When:** Generation fails
**What user sees:**
- Red alert icon
- "Generation Failed"
- Error message explaining why (e.g., "Insufficient credits")
- Two buttons:
  - **Try Again** → Reset form state, allow retry
  - **Go to Documents** → Navigate to documents list

**Duration:** Until user takes action

## State Variables

```typescript
// Tracks which modal to show
generationStatus: 'idle' | 'loading' | 'success' | 'error'

// Stores error message from server
generationError: string | null

// Stores document ID for redirect after success
generatedDocumentId: number | null
```

## State Flow Diagram

```
START (idle)
   ↓
[User clicks submit]
   ↓
LOADING ← generates document via Perplexity API
   ↓
   ├─→ SUCCESS → waits 1 second → auto-redirect
   │
   └─→ ERROR → waits for user action
        ├─ Try Again → back to idle
        ├─ Dismiss (X) → back to idle
        └─ Go to Documents → navigate away
```

## Key Implementation Details

**File:** `app/(dashboard)/dashboard/documents/new/page.tsx`

**Lines:**
- Loading Modal: 224-237
- Success Modal: 239-252
- Error Modal: 254-298
- handleSubmit function: 137-173
- State declarations: 133-135

**Imports needed:**
```typescript
import { Loader2, CheckCircle, AlertCircle, X } from 'lucide-react';
```

## Server Integration

**Endpoint:** Server action `generateDocument` in `app/(dashboard)/dashboard/documents/actions.ts`

**Response format:**
```typescript
{
  success: true,
  documentId: 123
}

// OR

{
  success: false,
  error: "Insufficient credits. Please purchase credits to continue."
}
```

**Error types the server can return:**
- Insufficient credits
- Rate limit exceeded (10 per hour)
- API configuration missing
- LLM generation failed
- Database errors
- Authentication errors

## Form Behavior

During loading:
- ✅ Form exists but can't be interacted with (isSubmitting = true)
- ✅ Submit button is disabled
- ✅ All inputs are disabled

On error:
- ✅ Form data is preserved
- ✅ User can fix form and retry
- ✅ No need to re-enter data

On success:
- ✅ Auto-redirect happens
- ✅ Form data is not saved (not needed)
- ✅ User lands on generated document page

## Styling System

All modals use Tailwind classes:
- `fixed inset-0` → Full screen
- `bg-black/50` → Dark overlay
- `z-50` → Above everything
- `border border-border` → Design system border
- `rounded-lg` → Rounded corners
- `shadow-lg` → Drop shadow
- `max-w-sm` → Max width of modal

Icons from lucide-react:
- `Loader2` → Animated spinner
- `CheckCircle` → Success checkmark
- `AlertCircle` → Error alert
- `X` → Close button

## Testing the Flow

1. **Test Loading State:**
   - Fill form → Submit
   - See loading modal with spinner
   - Wait for generation (should show for 3-10 seconds)

2. **Test Success State:**
   - Submit form with valid data and sufficient credits
   - See success modal with checkmark
   - Wait 1 second
   - Auto-redirect to document detail page

3. **Test Error States:**
   - **No credits:** Fill form → Submit → Get error "Insufficient credits"
   - **Rate limit:** Generate 11 documents in 1 hour → Get rate limit error
   - **API error:** Check if error messages display correctly

4. **Test Error Recovery:**
   - Fill form → Submit → Get error
   - Click "Try Again" → Form resets to idle state
   - Modify form → Submit again
   - Should work without form losing data

5. **Test Navigation:**
   - Error modal → Click "Go to Documents"
   - Should navigate to `/dashboard/documents`

## Design System Colors

| Element | Color Class |
|---------|------------|
| Modal bg | `bg-background` |
| Borders | `border-border` |
| Text | `text-foreground` |
| Secondary text | `text-muted-foreground` |
| Error/Alert | `text-destructive` |
| Loading spinner | `text-foreground animate-spin` |

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Modal not showing | Check `generationStatus` state is being set correctly |
| Can't click buttons | Check z-index is 50 or higher |
| Text not readable | Check color contrast in design system |
| Modal appears behind form | Increase z-index value |
| Auto-redirect not working | Check router import and path is correct |
| Form data lost on error | Check handleSubmit preserves state |

## Performance Tips

- Modals use conditional rendering (no hidden DOM)
- Icons are SVG (no images to load)
- Animation is CSS-based (smooth 60fps)
- No external libraries needed (uses lucide-react icons only)
- Minimal state updates (3 state variables total)

## Accessibility

✓ Modal overlays have sufficient contrast
✓ Buttons are keyboard accessible
✓ Error messages are descriptive
✓ Icons have text labels
✓ Focus is manageable with keyboard navigation
