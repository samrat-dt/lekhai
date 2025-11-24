# Lekhāi — Design Language Handbook

## 1. Brand Essence

**Core Idea:** "Precision with empathy."

Lekhāi drafts complex legal documents but doesn't feel robotic or elitist. Design language balances authority with approachability.

**Personality Traits:**
- Direct
- Reliable
- Indian-context smart
- Calm
- No ornamentation

**Tone Anchors:**
- "We clarify."
- "We reduce risk."
- "We make legal simple."

---

## 2. Visual Identity

### 2.1 Color System

**Primary Colors:**
```
Courtroom Black: #0B0E11  — authority
Stamp Red:       #C53030  — Indian legal ecosystem cue
Ivory Paper:     #F8F5EF  — neutrality, paper-like
```

**Secondary Colors:**
```
Ash Grey:        #A8A9AD  — structure
Peacock Blue:    #03658C  — subtle Indian identity
```

**Rules:**
- Never use bright gradients
- No neon colors
- Use red sparingly — only for warnings or legal risk cues

---

## 3. Typography

Legal drafting is about readability and hierarchy. No playful fonts.

**Primary Typefaces:**
- **UI:** Inter or Source Sans (crisp, neutral)
- **Documents:** IBM Plex Serif (legal credibility)

**Rules:**
- Font size never below 14px
- Avoid italics unless indicating amendments or citations
- Use weight, not color, for emphasis

---

## 4. Iconography

**Style:** Monoline, 1.5px stroke, minimal contrast

**Shape Language:** Round-edged rectangles, squares, vertical strokes

**Allowed Icon Metaphors:**
- Pen
- Page stack
- Shield (compliance)
- Temple-style pillars (judiciary) – subtle, not cliché
- Checkmark (validation)

**Not Allowed:**
- Gavel icons
- Cartoon seals
- Clip-art style scales

---

## 5. Layout Principles

### 5.1 Grid
- 12-column grid, wide gutter spacing
- White space generous: legal content must breathe

### 5.2 Components
- **Document Canvas:** Off-white background, faint vertical ruler
- **Sidebar:** Section index, amendments, validation notices
- **Top Navigation:** Minimal: Draft | Review | Export | Settings
- **Form Builder UI:** Multi-step with always-visible progress tracker

---

## 6. Interaction Language

### 6.1 Tone of Microcopy
- Direct, minimal
- Avoid legal jargon unless required
- No "AI magic" vibes
- Use Indian legal clarity: "PAN", "Aadhaar", "Stamp Duty", "Notarisation"

**Examples:**
- "Fill required details to personalise your agreement."
- "Missing PAN for Party A."
- "Draft updated. Review the highlighted risks."

### 6.2 System Behaviour
- Autosave every 3 seconds
- Versioning shown as "Revision #12 – Today, 3:42 PM"
- Risk alerts use red but silent — no animations, no sound
- Validation always contextual: only show errors in sections where relevant

---

## 7. Motion Principles

- Movement ≤ 200ms, ease-out
- No bounce animations
- Highlight transitions for:
  - Clause expansion
  - Risk detection highlight
  - Auto-inserted text flashes (pulse once, fade)

**Philosophy:** "Guidance, not flair."

---

## 8. Voice & Tone

### Voice (Permanent)
- Neutral
- Non-judgmental
- Non-salesy
- Expert, not lecturing

### Tone (Contextual)
- **Drafting:** Calm
- **Errors:** Direct
- **Legal Risks:** Serious but not fear-mongering
- **Success:** Understated ("Draft ready.")

**Rules:**
- No emojis
- No exclamation marks except for critical alerts

---

## 9. Cultural & Contextual India Layer

This is what gives Lekhāi a moat vs global templates.

**Localization:**
- Date formats default: DD/MM/YYYY
- Currency: ₹ with correct number formatting
- Show relevant Indian acts subtly, e.g. "(As per IT Act, 2000)"

**Cultural Constraints:**
- No saffron/green dominance (avoid political cues)
- No religious motifs
- No bureaucratic tropes like Ashoka emblem

---

## 10. Accessibility & Inclusivity

- WCAG AA minimum
- Contrast ratio for document text: 7:1
- Keep Hindi/English mixed-script handling smooth
- Keyboard-first navigation for lawyers who type fast
- Screen reader friendly outputs
