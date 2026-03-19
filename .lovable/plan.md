

# Plan: Dual Portal System

## Overview
Add a portal selection page and a supervisor dashboard. Three new files, two small edits to existing files.

## Changes

### 1. Create `src/pages/PortalSelect.tsx`
Two glassmorphism cards centered on screen (reuse `glass-card` class). Card 1: "Procurement Officer" navigates to `/chat`. Card 2: "Supervisor" navigates to `/supervisor`. Use existing ProqAI logo header, same dark radial gradient background as other pages.

### 2. Create `src/pages/SupervisorPage.tsx`
Split layout: left 40% analysis panel, right 60% request inbox.

**State**: `requests[]` array of mock data, `selectedRequest` index.

**Mock data** (5-6 requests), each containing:
- `title`, `subtitle`, `supplier`, `explanationPoints` (array of strings like "Mentioned", "Quality", "Risk", "Preferred")
- `risks`: `{ financial: number, operational: number, esg: number, geopolitical: number }` (0-100)
- `costValue`, `benefitValue` (0-100)
- `status`: 'pending' | 'approved' | 'rejected'

**Right side** (request inbox):
- List of cards using `glass-card` styling. Each shows title + subtitle + expand chevron.
- Clicking a card selects it (border highlight) and loads its data into the left panel.
- Expanded view shows explanation points as bullet list + Approve (green) / Reject (red) buttons.

**Left side** (analysis dashboard):
- **Risk Donut Chart**: Pure SVG donut (4 colored arc segments using `stroke-dasharray`/`stroke-dashoffset` on `<circle>` elements). Tooltip on hover with 1-line risk explanation.
- **Cost vs Benefit Bars**: Two horizontal bars using simple divs with rounded edges and percentage widths. Tooltip on hover.

No new libraries needed -- SVG for donut, divs for bars, existing Tooltip component for hover.

### 3. Create `src/data/supervisorMockData.ts`
Export the mock requests array to keep the page file clean.

### 4. Update `src/App.tsx`
Add routes: `/portal` for `PortalSelect`, `/supervisor` for `SupervisorPage`.

### 5. Update `src/pages/Index.tsx`
Change the CTA button to navigate to `/portal` instead of `/chat`.

## Technical Notes
- Zero new dependencies
- SVG donut chart: 4 `<circle>` elements with `stroke-dasharray` calculated from risk values
- Bars: simple `<div>` with `width: X%` and Tailwind classes
- Approve/Reject buttons update local state only (mock)
- Reuses: `glass-card`, `cta-impact`, `ProqAILogo`, `NotificationBell`, existing color palette

