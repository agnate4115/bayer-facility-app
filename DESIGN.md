---
name: Bayer FacilityDesk
description: AI-powered facilities management platform for enterprise
colors:
  innovation-green: "#56D500"
  prussian-blue: "#00314E"
  capri-blue: "#01BEFF"
  innovation-green-hover: "#45AA00"
  prussian-blue-light: "#004A78"
  neutral-bg: "#FFFFFF"
  neutral-surface: "#F5F7FA"
  neutral-border: "#E1E8ED"
  text-primary: "oklch(0.25 0.02 250)"
  text-secondary: "oklch(0.45 0.01 250)"
  text-tertiary: "oklch(0.6 0.01 250)"
typography:
  display:
    fontFamily: "Space Grotesk, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 4vw, 2.5rem)"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Space Grotesk, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Space Grotesk, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Space Grotesk, system-ui, sans-serif"
    fontSize: "0.625rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.05em"
  mono:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "normal"
rounded:
  sm: "0.375rem"
  md: "0.5rem"
  lg: "0.75rem"
  xl: "0.875rem"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
components:
  button-primary:
    backgroundColor: "{colors.innovation-green}"
    textColor: "{colors.neutral-bg}"
    rounded: "{rounded.lg}"
    padding: "0.875rem 2rem"
    typography: "{typography.label}"
  button-primary-hover:
    backgroundColor: "{colors.innovation-green-hover}"
  button-secondary:
    backgroundColor: "{colors.prussian-blue}"
    textColor: "{colors.neutral-bg}"
    rounded: "{rounded.lg}"
    padding: "0.875rem 2rem"
  card:
    backgroundColor: "{colors.neutral-bg}"
    rounded: "{rounded.xl}"
    padding: "1.5rem"
  input:
    backgroundColor: "{colors.neutral-bg}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "0.75rem 1rem"
    height: "2.25rem"
---

# Design System: Bayer FacilityDesk

## 1. Overview

**Creative North Star: "The Corporate Command Center"**

Bayer FacilityDesk is a mission-critical tool for enterprise facility management. The design system reflects this through precision, clarity, and reliable visual hierarchies. Every interface element serves the workflow - from ticket submission to resolution tracking. This is not a consumer app trying to delight; it's a professional instrument built to help employees report issues quickly and facilities teams respond efficiently.

The system anchors on Bayer's official brand colors - Harlequin Green (#56D500) for primary actions, Prussian Blue (#00314E) for authority and headers, and Capri Blue (#01BEFF) for informational accents. Typography pairs Space Grotesk (display) with Inter (body) for a contemporary professional voice, while JetBrains Mono handles technical identifiers like ticket IDs and location codes.

This explicitly rejects: consumer social media aesthetics with playful gradients, overly decorative authentication flows with illustrations, generic white-label SaaS templates that feel mass-produced, and dark patterns that obscure critical facility information.

**Key Characteristics:**
- Enterprise-grade polish with attention to every detail
- Official Bayer brand colors used consistently and purposefully
- Mobile-first design for employees reporting issues on-site
- Accessible by default (WCAG 2.1 AA compliance)
- Fast, friction-free workflows with clear visual hierarchy

## 2. Colors: The Bayer Scientific Palette

Bayer's official brand colors carry specific meanings rooted in the company's scientific heritage and global mission.

### Primary
- **Innovation Green** (#56D500 / oklch(81% 0.25 127)): Bayer's signature innovation color. Used for primary CTAs, success states, and forward-moving actions. Represents life science, sustainability, and growth. This is the "yes" color - submit ticket, confirm action, proceed. Never exceeds 15% of any screen; its brightness is the point.

### Secondary  
- **Prussian Blue** (#00314E / oklch(20% 0.04 240)): Science, reliability, authority. The foundation color for headers, navigation, and brand lockups. Represents Bayer's pharmaceutical and scientific heritage. Deep enough to carry white text with excellent contrast.

### Tertiary
- **Capri Blue** (#01BEFF / oklch(73% 0.15 223)): Brightness and approachability. Used for informational badges (location codes, ticket IDs), hover states on secondary elements, and non-critical accents. The "sky" color - optimistic but not action-critical.

### Neutral
- **Pure White** (#FFFFFF): Primary background for cards, modals, inputs, and content surfaces.
- **Cool Gray Surface** (#F5F7FA / oklch(97% 0.005 250)): Page backgrounds, subtle containers. Just enough tint to separate from white without feeling colored.
- **Structural Border** (#E1E8ED / oklch(91% 0.005 230)): Dividers, input strokes, card edges. Visible but unobtrusive.
- **Primary Ink** (oklch(0.25 0.02 250)): Body text, headings. Hits 4.5:1 against white for WCAG AA compliance.
- **Secondary Ink** (oklch(0.45 0.01 250)): Supporting text, labels, metadata. Lighter but still legible.
- **Tertiary Ink** (oklch(0.6 0.01 250)): Placeholder text, disabled states, very low-priority information.

### Named Rules
**The Innovation Green Rule.** Primary green appears on ≤15% of any screen. Its rarity signals importance. When everything is green, nothing is.

**The Contrast-First Rule.** Every text color must hit ≥4.5:1 against its background (≥3:1 for large text ≥18px). Placeholder text uses the same standard as body text - no muted gray that fails readability. If a color is even close to the threshold, bump it darker.

## 3. Typography

**Display Font:** Space Grotesk (with system-ui fallback)  
**Body Font:** Inter (with system-ui, sans-serif fallback)  
**Mono Font:** JetBrains Mono (monospace fallback)

**Character:** Space Grotesk provides contemporary geometric authority for headings and UI labels - clear, confident, slightly technical without being cold. Inter handles body text with excellent readability at small sizes, critical for mobile-first facility reporting. JetBrains Mono distinguishes technical identifiers (ticket IDs like "BYR-THN-2026-003847", location codes like "BAYER-THN-03-CAFE") from prose, making them instantly scannable.

### Hierarchy
- **Display** (600 weight, clamp(1.75rem, 4vw, 2.5rem), 1.2 leading, -0.02em tracking): Hero headings, page titles. Used sparingly - once per page maximum. Space Grotesk's geometric forms shine at this scale.
- **Headline** (600 weight, 1.5rem / 24px, 1.3 leading, -0.02em tracking): Section headings, modal titles. The primary hierarchical step below display.
- **Title** (600 weight, 1rem / 16px, 1.4 leading, -0.01em tracking): Card titles, form section labels, list item headings. The most common heading level.
- **Body** (400 weight, 0.875rem / 14px, 1.5 leading, normal tracking): All prose, descriptions, form hints. Readable at mobile scale. Inter's designed for this.
- **Label** (600 weight, 0.625rem / 10px, 1.4 leading, 0.05em wide tracking, all-caps): Form labels, badges, metadata tags. Uppercase + tracking creates distinct "shout" voice for UI controls. Space Grotesk.
- **Mono** (500 weight, 0.8125rem / 13px, 1.5 leading): Ticket IDs, location codes, timestamps, technical identifiers. JetBrains Mono.

### Named Rules
**The Mono Identity Rule.** Technical identifiers (ticket IDs, location codes, API keys) always use JetBrains Mono. Never Inter. This visual distinction lets users scan for machine-readable content instantly.

**The Uppercase Restraint Rule.** Uppercase text appears only on labels (form field labels, badges, buttons with tracking). Never for body copy or headings longer than 4 words. Reading all-caps prose is exhausting; we respect employee time.

## 4. Elevation

Cards and modals use subtle shadows to create depth without decoration. Shadows are structural - they clarify what's interactive, what's floating above the base layer, what demands attention. The system uses three shadow levels: resting, elevated, and floating.

### Shadow Vocabulary
- **Resting Shadow** (`0 1px 2px 0 rgb(0 0 0 / 0.05)`): Default for cards, inputs at rest. Barely visible - just enough to lift the element from the background without calling attention to itself.
- **Elevated Shadow** (`0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -1px rgb(0 0 0 / 0.06)`): Hover state for interactive cards, buttons. Stronger but still restrained. Signals "this responds to you."
- **Floating Shadow** (`0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05)`): Modals, dropdowns, popovers. Clear separation from the page. The "this is above everything else" shadow.

### Named Rules
**The Layered Purpose Rule.** Shadows are not decoration. Resting shadow = surface. Elevated shadow = interactive. Floating shadow = modal/overlay. Every shadow level has a functional meaning.

**The Dark Mode Inversion Rule.** In dark mode, elevation is conveyed through *lighter* background tones, not stronger shadows. A floating modal gets a brighter surface color, not a deeper shadow.

## 5. Components

### Buttons
- **Shape:** Rounded (0.75rem / 12px)
- **Primary:** Innovation Green background (#56D500), white text, uppercase Space Grotesk labels (10px, 600 weight, 0.05em tracking), padding 0.875rem × 2rem (14px × 32px). The main action on any screen.
- **Hover / Focus:** Darkens to #45AA00 (hover), gains elevated shadow, 200ms ease-out transition. Focus ring: 3px Innovation Green at 50% opacity outside the button edge.
- **Secondary:** Prussian Blue background (#00314E), white text, same shape/padding as primary. For alternate actions or navigation.
- **Ghost:** No background, Capri Blue text on hover. For tertiary actions that shouldn't compete with primary/secondary.
- **Disabled:** 50% opacity, no hover, cursor not-allowed.

**The Button Clarity Rule.** Button labels are verb + object ("Submit Report", "View Ticket", "Cancel Request"), never vague affirmations ("OK", "Yes", "Continue"). The label describes what will happen.

### Chips / Badges
- **Style:** Small pill-shaped containers (rounded-md, 0.5rem). Background color varies by semantic role: Innovation Green 15% opacity for success/active, Capri Blue 15% opacity for informational, amber 15% opacity for warnings, red 15% opacity for critical.
- **Typography:** Space Grotesk label style (10px, 600 weight, uppercase, wide tracking).
- **State:** Chips are read-only status indicators in this system. Not interactive filters.

### Cards / Containers
- **Corner Style:** Rounded XL (0.875rem / 14px). Softer than buttons to feel like content, not controls.
- **Background:** Pure white (#FFFFFF) on Cool Gray Surface page backgrounds.
- **Shadow Strategy:** Resting shadow by default (subtle lift). No hover shadow unless the entire card is clickable.
- **Border:** 1px Structural Border (#E1E8ED) in addition to shadow. The border clarifies edges on low-contrast displays.
- **Internal Padding:** 1.5rem (24px) on all sides. Generous but not wasteful.

### Inputs / Fields
- **Style:** 1px Structural Border (#E1E8ED), white background, rounded-md (0.5rem). Height 2.25rem (36px) for comfortable touch targets on mobile.
- **Focus:** Border changes to Innovation Green, 3px ring at 50% opacity outside the input. The ring doesn't shift layout (it's painted outside).
- **Error:** Border changes to red, 3px red ring at 20% opacity. Error message appears below in red body text.
- **Disabled:** 50% opacity, cursor not-allowed, no interaction.
- **Typography:** Inter body (14px, 400 weight) for entered text. Text-secondary (oklch(0.45...)) for placeholder. Placeholders must still hit 4.5:1 contrast.

### Navigation
- **Style:** Prussian Blue background in the admin sidebar. White text for primary nav items.
- **Active State:** Innovation Green left border (4px), Innovation Green text color.
- **Hover State:** Lighter Prussian Blue background (#004A78), smooth 200ms transition.
- **Mobile:** Top navbar with Bayer logo + "FacilityDesk" lockup. Minimal - employees need screen space for reporting issues.

### Microsoft Sign-In Button (Signature Component)
The employee login flow uses a single OAuth button styled to match Microsoft's own design language (white background, gray border, Microsoft logo grid, gray text) rather than forcing it into Bayer green. This reduces friction - employees recognize the Microsoft SSO pattern instantly.

- **Style:** White background (#FFFFFF), 1px gray border (#D1D5DB), rounded-lg (0.75rem).
- **Logo:** Microsoft's 4-color grid (red #F25022, cyan #00A4EF, green #7FBA00, yellow #FFB900) as inline SVG, 21×21px.
- **Typography:** Inter body (16px, 500 weight), gray text (#5E5E5E), "Sign in with Microsoft" label.
- **Hover:** Subtle gray background (#F9FAFB), slight shadow lift. No color shift - maintains Microsoft's neutral aesthetic.
- **Loading State:** Spinner replaces logo, "Signing in..." text, button disabled (50% opacity).
- **Size:** Full-width on mobile (max-width 400px), height 3.5rem (56px) for easy thumb tap.

## 6. Do's and Don'ts

### Do:
- **Do** use Innovation Green (#56D500) for primary actions, but limit it to ≤15% of any screen. Its brightness is its power; overuse dilutes that.
- **Do** pair Space Grotesk (headings/labels) with Inter (body) consistently. The typographic contrast creates clear hierarchy.
- **Do** use JetBrains Mono for all ticket IDs, location codes, and technical identifiers. This visual distinction makes machine-readable content instantly scannable.
- **Do** ensure every text color hits ≥4.5:1 contrast against its background. Test placeholder text too - muted gray that fails contrast is not acceptable.
- **Do** use uppercase text only for labels (form field labels, badges, buttons). Never for body copy or long headings.
- **Do** write button labels as verb + object ("Submit Report", "View Ticket"). The label should describe what will happen, not just affirm generically.
- **Do** use rounded corners (0.75rem on buttons, 0.875rem on cards) to soften the interface while maintaining professional clarity.
- **Do** design mobile-first. Most employees authenticate and report issues on their phones while standing near the facility problem.

### Don't:
- **Don't** use consumer social media aesthetics with playful gradients, illustrations, or casual voice. This is an enterprise tool for serious facility issues.
- **Don't** add decorative elements to the authentication flow (mascots, hero images, marketing copy). Employees want to get through login quickly and get to work.
- **Don't** use generic white-label SaaS login templates. The interface must feel like Bayer through official colors, logo lockup, and professional polish.
- **Don't** create dark patterns or confusing multi-step login flows. Authentication is one-click Microsoft SSO - keep it that way.
- **Don't** use all-caps body copy or long all-caps headings. Reading uppercase prose exhausts users. Reserve uppercase for labels (≤4 words).
- **Don't** exceed three font families (Space Grotesk + Inter + JetBrains Mono). More than three reads as indecision.
- **Don't** use side-stripe borders (colored border-left or border-right >1px) on cards or alerts. It's a lazy design reflex. Use full borders, background tints, or icons instead.
- **Don't** use muted gray text that fails 4.5:1 contrast just because it "looks elegant." Readability wins every time.
- **Don't** use nested cards. One level of card containment is clear; two levels is confusing.
