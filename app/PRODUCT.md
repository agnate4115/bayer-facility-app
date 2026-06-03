# Product

## Register

**Product UI** - Enterprise facilities management tool. Design serves the workflow; clarity and efficiency over visual flourish.

## Purpose

FacilityDesk is an AI-powered QR-based facilities ticketing and management platform for Bayer's offices across South Asia. Employees scan location-specific QR codes to submit maintenance complaints in plain English. The system uses Azure OpenAI to categorize, prioritize, route tickets, and detect duplicates automatically.

## Users

**Primary:** Bayer employees (500+ across Thane, Mumbai, other offices) reporting facility issues during work hours, typically on mobile devices in-situ at the problem location.

**Secondary:** Facility managers and maintenance staff accessing the admin dashboard to track, assign, and resolve tickets on desktop workstations.

## Core Workflow

1. Employee scans QR code at problem location
2. Describes issue in plain English (with optional photos)
3. AI structures, categorizes, assigns priority, routes to correct team
4. Ticket tracked through 7-stage lifecycle (submitted → acknowledged → assigned → in_progress → on_hold → resolved → closed)
5. Feedback collected after resolution

## Brand

**Bayer official colors (non-negotiable):**
- Harlequin Green `#56D500` - primary actions, success, innovation
- Prussian Blue `#00314E` - headers, navigation, professionalism
- Capri Blue `#01BEFF` - accents, links, information

**Personality:** Professional, trustworthy, efficient. Enterprise-grade tool for a global pharmaceutical/life-sciences company. Clean, uncluttered, accessible.

**Voice:** Direct, helpful, informative. No marketing fluff.

## Anti-References

- ❌ Dark-mode-first SaaS dashboards (too casual for Bayer corporate)
- ❌ Gradient-heavy, glassmorphism-laden "AI tool" aesthetics
- ❌ Consumer app brightness and playfulness (this is enterprise software)
- ❌ Dense data tables without breathing room

## References

- Microsoft Azure Portal - clean, professional, accessible enterprise UI
- ServiceNow - clear ticketing workflows, status visibility
- Bayer's own corporate identity - professional, science-driven, trustworthy

## Accessibility

- WCAG 2.1 AA minimum (government/enterprise requirement)
- High contrast ratios (4.5:1 for body text)
- Full keyboard navigation
- Screen reader support for all workflows
- Touch targets ≥44px for mobile QR scanning use case
- Reduced motion support

## Technical Context

- **Framework:** React 19 + Vite 7 + React Router 7
- **Styling:** Tailwind CSS 3.4 + shadcn/ui components
- **Icons:** Lucide React
- **Motion:** Framer Motion (already installed)
- **Backend:** FastAPI (Python) with PostgreSQL, Azure OpenAI, AWS S3

## Strategic Design Principles

1. **Mobile-first for employees, desktop-optimized for admins** - QR scanning happens on phones; ticket management happens at desks
2. **Status visibility above all** - employees need to know their ticket's progress at a glance
3. **Minimize cognitive load** - plain English input, clear categories, obvious next actions
4. **Trust through transparency** - show AI reasoning, allow override of duplicate detection
5. **Bayer brand fidelity** - official colors, professional aesthetic, no deviation from corporate identity
