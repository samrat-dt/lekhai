# Document Generation Flow - Testing Guide

## Overview
This guide documents the complete document generation workflow with improved error handling, loading states, and user feedback modals.

## Implementation Summary

### State Management
Three new state variables manage the generation lifecycle:
```typescript
const [generationStatus, setGenerationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
const [generationError, setGenerationError] = useState<string | null>(null);
const [generatedDocumentId, setGeneratedDocumentId] = useState<number | null>(null);
```

### User Flow

#### 1. Form Submission
- User fills out the document form and clicks submit
- `handleSubmit` function is triggered
- Status changes to `'loading'` immediately

#### 2. Loading State
- Full-screen modal overlay appears with 50% black background
- Animated spinner icon (Loader2) displays
- Text: "Generating your document..."
- Sub-text: "This may take a few moments"
- User cannot interact with the form during this time

#### 3. Success Path
- Document generation completes successfully
- Status changes to `'success'`
- Success modal displays with:
  - CheckCircle icon
  - "Document generated successfully!" message
  - "Redirecting..." sub-text
- Auto-redirect occurs after 1 second to `/dashboard/documents/{documentId}`

#### 4. Error Path
- Document generation fails
- Status changes to `'error'`
- Error modal displays with:
  - AlertCircle icon in red (destructive color)
  - "Generation Failed" heading
  - Error message from server (e.g., insufficient credits, rate limit exceeded)
  - X button to dismiss modal
- Two action buttons:
  - **Try Again** - Resets status to 'idle', allows user to retry without losing form data
  - **Go to Documents** - Navigates to `/dashboard/documents`

## Testing Checklist

### Visual Elements
- [ ] Loading modal appears with correct styling
- [ ] Loading spinner animates smoothly
- [ ] Success modal displays with checkmark icon
- [ ] Error modal displays with alert icon
- [ ] Modals have proper z-index (z-50) and appear above other content
- [ ] Semi-transparent overlay (bg-black/50) covers entire screen

### User Interactions
- [ ] Form is disabled during loading (isSubmitting state)
- [ ] Loading modal prevents form interaction
- [ ] Error modal close button (X) works correctly
- [ ] "Try Again" button resets state and keeps form data
- [ ] "Go to Documents" button navigates correctly
- [ ] Success modal auto-redirects after 1 second

### Error Handling
- [ ] Insufficient credits error displays correctly
- [ ] Rate limit exceeded error displays correctly
- [ ] Network error messages display correctly
- [ ] LLM generation errors display correctly
- [ ] User receives meaningful error messages

### Document Types to Test
All 9 implemented document types should be tested:
1. [ ] Lost Document Affidavit
2. [ ] Name Correction Affidavit
3. [ ] Address Proof Affidavit
4. [ ] Bank Request Letter
5. [ ] Rent Receipt
6. [ ] Payment Default Notice
7. [ ] Work Completion Delay Notice
8. [ ] F&F Settlement Notice
9. [ ] Rent Default Notice

### Responsive Design
- [ ] Modals display correctly on mobile devices
- [ ] Text is readable on all screen sizes
- [ ] Buttons are clickable and properly sized
- [ ] Icons scale appropriately

### State Transitions
- [ ] Correct state after successful generation
- [ ] Correct state after failed generation
- [ ] Correct state after dismissing error
- [ ] Form maintains data when trying again after error

## File Structure

**Modified Files:**
- `app/(dashboard)/dashboard/documents/new/page.tsx` - Added modal UI components and state management

**Key Imports:**
```typescript
import { Loader2, CheckCircle, AlertCircle, X } from 'lucide-react';
```

**Modal Components:**
1. **Loading Modal** (lines 224-237)
   - Displays when `generationStatus === 'loading'`
   - Shows animated spinner and status text

2. **Success Modal** (lines 239-252)
   - Displays when `generationStatus === 'success'`
   - Auto-redirects via router.push() after 1 second

3. **Error Modal** (lines 254-298)
   - Displays when `generationStatus === 'error'`
   - Shows error message with action buttons

## Integration Points

### Server-Side (`app/(dashboard)/dashboard/documents/actions.ts`)
The `generateDocument` server action:
1. Validates user authentication
2. Checks rate limits
3. Sanitizes payload for LLM
4. Deducts credits atomically
5. Generates document via Perplexity API
6. Returns success/error response

### Client-Side (`handleSubmit` function)
1. Sets loading state
2. Calls generateDocument server action
3. Handles success response with document ID
4. Sets appropriate state and error message on failure
5. Manages auto-redirect timing

## Error Messages

Common error scenarios and messages users will see:

| Scenario | Message | Action |
|----------|---------|--------|
| Insufficient Credits | "Insufficient credits. Please purchase credits to continue." | Try Again or Go to Documents |
| Rate Limit Exceeded | "Rate limit exceeded. You can generate more documents at [time]. Limit: 10/hour." | Try Again or Go to Documents |
| API Configuration | "PERPLEXITY_API_KEY is not configured" | Try Again or Go to Documents |
| Generation Timeout | "Perplexity API error: [error details]" | Try Again or Go to Documents |
| Network Error | Error message from exception | Try Again or Go to Documents |

## Design System Integration

**Colors:**
- Primary action: `bg-primary hover:bg-accent`
- Destructive/Error: `text-destructive`, `border-destructive/30`
- Muted text: `text-muted-foreground`
- Foreground: `text-foreground`

**Spacing:**
- Modal padding: `p-8`
- Gap between elements: `gap-4`
- Border radius: Default (lg variant)

**Typography:**
- Modal title: `font-semibold`
- Primary text: `font-medium`
- Secondary text: `text-sm`

## Performance Considerations

1. **Modal Rendering:** Conditional rendering prevents unnecessary DOM elements
2. **Auto-Redirect:** 1-second delay gives UX feedback before navigation
3. **State Reset:** Error modal can reset without page reload for quick retries
4. **Icon Animation:** Uses CSS animation (animate-spin) for smooth performance

## Accessibility

- Modal overlays are clearly visible with sufficient contrast
- Buttons are keyboard accessible
- Error messages are descriptive for screen readers
- Icons have semantic meaning with text labels

## Future Enhancements

1. Toast notifications for quick feedback
2. Progress indicator for long-running operations
3. Estimated time remaining during generation
4. Background generation with notification
5. Generation history with retry capability
