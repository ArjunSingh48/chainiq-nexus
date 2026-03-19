

# Plan: Replace "AI" with "System" in Dashboard Text

## Changes

### 1. `src/pages/AuditDashboardUser.tsx`
- Line 57 comment: `{/* AI Interpretation */}` → `{/* System Interpretation */}`
- Line 59 heading: `"AI Interpretation"` → `"System Interpretation"`

### 2. `src/pages/AuditDashboardSupervisor.tsx`
- Line 84: `"AI suggested {req.supplier}"` → `"System suggested {req.supplier}"`

Two files, three small text changes. No logic or layout changes.

