

# Plan: Fix PDF numbering, enrich supervisor PDF, add pending tags

## Three Issues

### 1. Fix section numbering starting at "2" in PDF
**`src/lib/generateAuditPdf.ts`** — The sections start at "2. REQUEST OVERVIEW" (line 99). Renumber all sections from 1:
- `2. REQUEST OVERVIEW` → `1. REQUEST OVERVIEW`
- `3. AI INTERACTION LOG` → `2. INTERACTION LOG`
- `4. SUPPLIER ANALYSIS` → `3. SUPPLIER ANALYSIS`
- `5. INTERPRETATION & DECISION` → `4. INTERPRETATION & DECISION`
- `6. POLICY & VALIDATION TRACE` → `5. POLICY & VALIDATION TRACE`
- `7. ORDER & DELIVERY` → `6. ORDER & DELIVERY`
- `8. NOTIFICATIONS LOG` → `7. NOTIFICATIONS LOG`
- `9. FINAL SUMMARY` → `8. FINAL SUMMARY`

### 2. Create a dedicated supervisor weekly PDF generator
**Create `src/lib/generateWeeklyPdf.ts`** — New function `generateWeeklyPdf` that takes the current `requests` state (with live approve/reject status) and produces a data-rich technical report with:

1. **Header** — "ProqAI Weekly Procurement Report" with timestamp
2. **1. Executive Summary** — Total requests, approved/pending/rejected counts, total spend estimate, average benefit score
3. **2. Request Detail Table** — `autoTable` with columns: #, Employee, Item, Qty, Supplier, Status, Cost%, Benefit%, showing all requests
4. **3. Risk Analysis** — Average risk values (financial, operational, ESG, geopolitical) as fields, plus per-request risk breakdown table (#, Employee, Financial, Operational, ESG, Geopolitical)
5. **4. Cost vs Benefit Analysis** — Average cost/benefit, table per request showing cost%, benefit%, delta (benefit-cost)
6. **5. Decision Breakdown** — For each request: employee, item, supplier, status, and all explanation points
7. **6. Notifications Summary** — Counts and lists per status category
8. **7. Weekly Assessment** — Static insight text

All sections use the same dark theme styling (ensureDarkBg, green headers, white text).

**`src/pages/AuditDashboardSupervisor.tsx`** — Update `handleDownload` to call `generateWeeklyPdf(requests)` instead of `generateAuditPdf` with empty data. Pass current `requests` state so the PDF reflects any approve/reject actions taken on the dashboard.

### 3. Add "PENDING" tag on supervisor dashboard request cards
**`src/pages/AuditDashboardSupervisor.tsx`** — In the request list (line 87-92), update the status display logic: currently it only shows status text for non-pending items. Change it to show status for ALL items including pending, with pending shown as a yellow `"PENDING"` tag on the right side (matching the existing approved/rejected style but with `text-yellow-500`).

## Files

| File | Action |
|------|--------|
| `src/lib/generateAuditPdf.ts` | Edit (fix numbering 2→1 through 9→8) |
| `src/lib/generateWeeklyPdf.ts` | Create (supervisor-specific PDF with tables and data) |
| `src/pages/AuditDashboardSupervisor.tsx` | Edit (use new PDF generator, show pending tag) |

