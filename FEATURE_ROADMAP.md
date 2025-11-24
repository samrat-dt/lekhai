# Lekhai Feature Implementation Roadmap

## Current Status
✅ Perplexity API Migration Complete
✅ Document Generation (9 types)
✅ Credit System with Atomic Operations
✅ Rate Limiting & Security Hardening
✅ Evaluation Framework
✅ Mobile Responsive UI

## Priority Matrix

### P0 (Critical - Launch Blockers)
Must be completed before production launch

1. **Razorpay Payment Integration** ⏱️ 3-4 hours
   - Setup Razorpay account
   - Create payment orders API
   - Implement checkout flow
   - Webhook handling
   - Credit allocation on success
   - Test with real payments

2. **Comprehensive Testing** ⏱️ 2-3 hours
   - Run all manual test flows
   - Fix any discovered bugs
   - Test all 9 document types
   - Verify credit system
   - Test rate limiting
   - Mobile responsiveness check

3. **PDF Export** ⏱️ 2-3 hours
   - Install PDF library (jsPDF or react-pdf)
   - Format documents for PDF
   - Preserve formatting
   - Add download button
   - Test on all document types

### P1 (High Priority - Core Experience)
Significantly improve user experience

4. **Document Preview with Blur** ⏱️ 1-2 hours
   - Generate preview before payment
   - Apply 40% blur overlay
   - "Unlock for 1 credit" button
   - Preview modal UI
   - Mobile-optimized

5. **AI Consistency Checker** ⏱️ 2-3 hours
   - Check name consistency across document
   - Verify date logic (no future dates for past events)
   - Amount consistency
   - Flag contradictions
   - Show warnings before generation

6. **Improved Document Formatting** ⏱️ 2 hours
   - Better heading hierarchy
   - Proper section spacing
   - Clear paragraph breaks
   - Bold/underline key sections
   - Professional appearance

7. **Urgency Tags + Category UI** ⏱️ 1 hour
   - Show urgency on document list
   - Color-coded urgency levels
   - Category filters
   - Sorting by urgency
   - Quick filters

8. **Legal Completeness Score** ⏱️ 2 hours
   - Score form before submission (0-100%)
   - Show missing critical fields
   - Suggest improvements
   - Real-time feedback
   - Integration with evaluation system

### P2 (Medium Priority - User Delight)
Nice-to-have features that improve satisfaction

9. **Version History** ⏱️ 2-3 hours
   - Save each generation as version
   - Show version timeline
   - Compare versions
   - Revert to previous
   - Database schema update

10. **90-Day Auto-Deletion** ⏱️ 2 hours
    - Add `expiresAt` field
    - Cron job or scheduled task
    - Visible countdown timer
    - Email reminder before deletion
    - Option to extend/archive

11. **Red Flag Detector** ⏱️ 1-2 hours
    - Detect missing key information
    - Warn about weak legal language
    - Suggest specific improvements
    - Context-aware warnings
    - Pre-generation validation

12. **Time Saved Tracker** ⏱️ 1 hour
    - Calculate time saved per document
    - Show cumulative savings
    - Dashboard widget
    - Gamification element
    - "You've saved X hours this month"

13. **Section Tooltips** ⏱️ 2 hours
    - Explain legal clauses
    - Hover/click tooltips
    - Plain language explanations
    - For all document types
    - Mobile-friendly

### P3 (Low Priority - Growth Features)
Features that drive growth and retention

14. **Free Trial** ⏱️ 1 hour
    - 1 free document per new user
    - Basic document only
    - Limited to simple types
    - Marketing tool

15. **Referral Program** ⏱️ 3-4 hours
    - Generate referral links
    - Track referrals
    - Award credits (1 per successful referral)
    - Referral dashboard
    - Share on WhatsApp/Email

16. **Mobile Preview Reader** ⏱️ 2 hours
    - Optimized mobile document view
    - Swipe gestures
    - Pinch to zoom
    - Better readability
    - Download from mobile

17. **Download Tracking** ⏱️ 1 hour
    - Log download events
    - Show download count
    - Analytics dashboard
    - Most popular documents

18. **Document Locker Filters** ⏱️ 1 hour
    - Filter by status
    - Filter by type
    - Search by title
    - Date range filter
    - Quick access filters

### P4 (Nice-to-Have - Enhancement)
Polishing and additional features

19. **Multi-Language Landing Pages** ⏱️ 4-6 hours
    - Hindi landing page
    - Bengali landing page
    - Tamil landing page
    - Auto-detect locale
    - Language switcher

20. **SEO Pages** ⏱️ 3-4 hours
    - One page per document type
    - Use case examples
    - How-to guides
    - Legal templates
    - Blog content

21. **WhatsApp Share Links** ⏱️ 2 hours
    - Generate shareable preview
    - Mini preview image
    - WhatsApp deep link
    - Social sharing

22. **AI Document Formatter** ⏱️ 2-3 hours
    - Paste raw text
    - AI cleans and formats
    - Applies legal formatting
    - Export formatted version

23. **Legal Template Library** ⏱️ 3 hours
    - Pre-filled examples
    - Real-world scenarios
    - Fill-in-the-blanks
    - Quick start templates

24. **Email Delivery** ⏱️ 2 hours
    - Send document via email
    - PDF attachment
    - Branded email template
    - Integration with email service

25. **Document Expiry Reminders** ⏱️ 2 hours
    - Email before auto-deletion
    - 7 days, 3 days, 1 day warnings
    - Option to extend
    - Push notifications (if PWA)

26. **Team Accounts** ⏱️ 6-8 hours
    - Shared credit wallet
    - Team member invites
    - Role-based permissions
    - Team document library
    - Usage analytics

27. **Notary-Ready Formatting** ⏱️ 2 hours
    - Special formatting mode
    - Extra spacing for stamps
    - Signature blocks
    - Witness sections
    - Print-optimized

28. **E-Signature Integration** ⏱️ 4-6 hours
    - Research open-source options
    - Integrate signature canvas
    - Save signed documents
    - Verification system
    - Legal validity

## Implementation Strategy

### Phase 1: Critical Path (Week 1)
**Goal: Production-ready MVP**
- Day 1-2: Razorpay integration
- Day 3: Comprehensive testing & bug fixes
- Day 4-5: PDF export
- Day 6-7: Document preview with blur

**Deliverable: Fully functional payment system + tested app**

### Phase 2: Core Experience (Week 2-3)
**Goal: Delightful user experience**
- AI Consistency Checker
- Improved formatting
- Legal Completeness Score
- Urgency tags & better UI
- Red Flag Detector

**Deliverable: Professional, polished document generation**

### Phase 3: Retention & Growth (Week 4-5)
**Goal: User engagement and growth**
- Version history
- Auto-deletion policy
- Time saved tracker
- Free trial
- Referral program
- Section tooltips

**Deliverable: Sticky product with growth loops**

### Phase 4: Scale & Polish (Week 6+)
**Goal: Market expansion**
- Multi-language support
- SEO pages
- Advanced features
- Team accounts
- E-signature

**Deliverable: Market-ready product**

## Technical Dependencies

### Required Installations
```bash
# PDF generation
npm install jspdf @react-pdf/renderer

# Date handling
npm install date-fns

# Email (optional)
npm install @sendgrid/mail nodemailer

# Image generation (for previews)
npm install html2canvas

# Cron jobs
npm install node-cron
```

### Database Schema Updates Needed

**For version history:**
```sql
ALTER TABLE legal_documents ADD COLUMN version INTEGER DEFAULT 1;
ALTER TABLE legal_documents ADD COLUMN parent_document_id INTEGER REFERENCES legal_documents(id);
CREATE INDEX idx_parent_document ON legal_documents(parent_document_id);
```

**For auto-deletion:**
```sql
ALTER TABLE legal_documents ADD COLUMN expires_at TIMESTAMP;
CREATE INDEX idx_expires_at ON legal_documents(expires_at);
```

**For referrals:**
```sql
CREATE TABLE referrals (
  id SERIAL PRIMARY KEY,
  referrer_user_id INTEGER REFERENCES users(id),
  referred_user_id INTEGER REFERENCES users(id),
  referral_code VARCHAR(50) UNIQUE,
  status VARCHAR(20), -- 'pending', 'completed'
  credit_awarded BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**For download tracking:**
```sql
CREATE TABLE document_downloads (
  id SERIAL PRIMARY KEY,
  document_id INTEGER REFERENCES legal_documents(id),
  user_id INTEGER REFERENCES users(id),
  downloaded_at TIMESTAMP DEFAULT NOW(),
  format VARCHAR(10) -- 'txt', 'pdf'
);
```

## Testing Checklist

Before each deployment:
- [ ] All authentication flows work
- [ ] All 9 document types generate correctly
- [ ] Payment integration works (test mode)
- [ ] Credit system is atomic (no race conditions)
- [ ] Rate limiting works
- [ ] Security measures active (CSRF, sanitization)
- [ ] Mobile responsive on all pages
- [ ] PDF export works
- [ ] No console errors
- [ ] Performance is acceptable (<2s page load)

## Success Metrics

### MVP Launch Criteria
- ✅ 100% uptime for 48 hours
- ✅ All test flows pass
- ✅ Payment processing works
- ✅ Zero critical bugs
- ✅ Mobile responsive
- ✅ Security hardened

### Post-Launch Metrics
- Document generation success rate > 95%
- Average generation time < 8 seconds
- User satisfaction score > 4/5
- Credit purchase conversion > 10%
- Referral participation > 5%

## Notes

- Prioritize quality over speed
- Test thoroughly before each feature release
- Get user feedback early and often
- Monitor error rates and API usage
- Keep documentation updated
- Maintain security standards throughout
