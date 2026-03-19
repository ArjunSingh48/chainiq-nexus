

# Plan: Role-Based Audit Intelligence Dashboard + Back Buttons + Supervisor Polish

## Overview
Create two new audit dashboard pages (procurement officer and supervisor views), add back buttons to all non-landing pages, and polish the supervisor screen layout. Seven files changed/created total.

## Changes

### 1. Back buttons (from approved plan)

**`src/pages/PortalSelect.tsx`** — Add `ArrowLeft` button in header navigating to `/`.

**`src/pages/ChatPage.tsx`** — Add `ArrowLeft` button in the results-phase header (line 238) before `ProqAILogo`, navigating to `/portal`. In chat phase, add a fixed top-left back button to `/portal`.

### 2. Supervisor page polish

**`src/pages/SupervisorPage.tsx`** — Add `min-h-0` to the flex container. Add `p-8` padding and vertical centering for the donut chart card. Add subtle `hover:scale-[1.01]` to inbox cards. Add a colored dot (amber for pending, green for approved, red for rejected) before the title in each card.

### 3. Create `src/data/auditMockData.ts`

Export mock data for both dashboards:
- `userAuditData` — single request summary (category, country, quantity, budget, AI interpretation, supplier decision reasons, top 5 supplier comparisons with confidence scores, risk values, cost/benefit, order tracking status)
- `weeklyAuditData` — array of 6-8 weekly requests with employee, item, quantity, supplier, status, risk, cost, benefit fields. Also export computed summary metrics (total, approved, pending, rejected counts) and average risk values.

### 4. Create `src/pages/AuditDashboardUser.tsx`

Procurement officer's individual audit view. Sections rendered top-to-bottom in a scrollable layout:

1. **Header** — "Your Procurement Insights" + "Download PDF" button (right)
2. **Overview Card** — 2-3 sentence glassmorphism card explaining the AI sourcing process
3. **Request Summary** — bullet list (Category, Country, Quantity, Budget) from mock data
4. **AI Interpretation** — bullet list (Intent detected, Constraints applied, Follow-ups resolved)
5. **Supplier Decision** — selected supplier name + bullet reasons (Price, Quality, Risk, Preferred)
6. **Supplier Comparison** — 3-5 glass cards showing supplier name, confidence score bar, 1-line explanation
7. **Risk & Impact** — reuse `DonutChart` component (extract from SupervisorPage into a shared component or inline duplicate)
8. **Cost vs Benefit** — reuse `BarChart` component
9. **Order Tracking** — status, origin/destination, units, ETA in a glass card
10. **Final Insight** — highlighted card with summary sentence

"Download PDF" calls existing `generateAuditPdf` with the mock data mapped to `AuditData`.

Back button navigates to `/chat`.

### 5. Create `src/pages/AuditDashboardSupervisor.tsx`

Supervisor's weekly overview. Scrollable layout:

1. **Header** — "Weekly Procurement Overview" + "Download Weekly Report" button
2. **Summary Metrics** — 4 glass cards in a row (Total, Approved, Pending, Rejected) with counts
3. **Request List** — reuse the same expandable card pattern from SupervisorPage (explanation points, approve/reject buttons)
4. **Global Insight** — highlighted glass card with weekly analysis sentence
5. **Risk Distribution** — 4 horizontal bars showing average risk across all requests (reuse BarChart)
6. **Cost vs Value Trend** — two bars showing average cost and benefit
7. **Notifications Overview** — 3-column grid (Approved, Pending, Rejected) with counts and item names
8. **Weekly Insight** — highlighted takeaway card

"Download Weekly Report" generates a PDF using `generateAuditPdf` with aggregated mock data.

Back button navigates to `/supervisor`.

### 6. Extract shared chart components

**Create `src/components/RiskDonutChart.tsx`** — extract `DonutChart`, `BarChart`, `useCursorTooltip`, `CursorTooltip`, and risk color/label constants from SupervisorPage into a shared file. Update SupervisorPage to import from there. Both audit dashboards also import from here.

### 7. Update `src/App.tsx`

Add two new routes:
- `/audit-dashboard/user` → `AuditDashboardUser`
- `/audit-dashboard/supervisor` → `AuditDashboardSupervisor`

### 8. Update `src/components/AuditButton.tsx`

Accept an optional `role` prop (`'procurement' | 'supervisor'`). On click, navigate to `/audit-dashboard/user` or `/audit-dashboard/supervisor` based on role. In ChatPage pass `role="procurement"`. In SupervisorPage, add an AuditButton with `role="supervisor"`.

## Files Summary

| File | Action |
|------|--------|
| `src/components/RiskDonutChart.tsx` | Create (extracted shared charts) |
| `src/data/auditMockData.ts` | Create (mock data for both dashboards) |
| `src/pages/AuditDashboardUser.tsx` | Create |
| `src/pages/AuditDashboardSupervisor.tsx` | Create |
| `src/pages/SupervisorPage.tsx` | Edit (polish + import shared charts) |
| `src/pages/PortalSelect.tsx` | Edit (add back button) |
| `src/pages/ChatPage.tsx` | Edit (add back button) |
| `src/components/AuditButton.tsx` | Edit (role-based navigation) |
| `src/App.tsx` | Edit (add 2 routes) |

## Technical Notes
- Zero new dependencies — reuses jsPDF, existing glass-card/cta-impact classes, Tailwind
- Charts are shared SVG donut + CSS bars — no charting library
- All data is mock — no API calls
- PDF export reuses existing `generateAuditPdf` function
- Back buttons use `ArrowLeft` from lucide-react + `useNavigate`

