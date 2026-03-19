

# Plan: Audit Document Generation System

## Overview
Add an "AUDIT" button fixed above the chatbot bar that collects all session data and generates a downloadable PDF audit report using jsPDF + jspdf-autotable.

## Changes

### 1. Install jsPDF dependency
Add `jspdf` and `jspdf-autotable` packages.

### 2. Create `src/lib/generateAuditPdf.ts`
A standalone function that accepts an `AuditData` object and produces a downloadable PDF.

**AuditData interface** aggregates:
- `workflow: WorkflowResponse | null` (request details, engine output, recommendation, escalations, validation)
- `suppliers: Supplier[]` (all suppliers)
- `top10: Supplier[]` (shortlisted)
- `selectedSupplier: Supplier | null`
- `notifications: Notification[]`
- `consignments: Consignment[]`
- `chatMessages: { role: string; text: string }[]`
- `sessionId: string | null`

**PDF sections** (generated with jsPDF):
1. **Header** — "ProqAI Audit Report", subtitle, timestamp, session ID
2. **Request Overview** — category, country, quantity, budget, currency from `workflow.request`
3. **AI Interaction Log** — chat messages listed chronologically
4. **Supplier Analysis** — total count + table of top 10 (Name, Price, ESG, Quality, Risk, Rank) using jspdf-autotable
5. **Decision Summary** — selected supplier name, recommendation status + reason from `engine_output.recommendation`
6. **Compliance & Validation** — validation issues, escalations (blocking/non-blocking), policy compliance flags
7. **Order & Delivery** — consignment details (supplier, origin, destination, units, order ID)
8. **Notifications Log** — grouped by approved/pending/rejected
9. **Final Summary** — total suppliers, key justification

Style: clean enterprise look, dark header bar, section headers with lines, consistent fonts. Auto page breaks handled by jsPDF.

### 3. Create `src/components/AuditButton.tsx`
- Glassmorphism button labeled "AUDIT" with `FileText` icon
- Positioned fixed, right side, `bottom-[76px]` (above the 60px chatbot bar)
- On click: builds `AuditData` from props, calls `generateAuditPdf()`, triggers download
- Hover: scale + glow effect

### 4. Update `src/pages/ChatPage.tsx`
- Import `AuditButton`
- Render it when `phase !== 'chat'` (only visible after results are shown)
- Pass all required state: `workflow`, `suppliers`, `top10`, `selectedSupplier`, `notifications`, `consignments`, `sessionId`
- Also need to expose chat messages from `ChatInterface` — add a `messagesRef` (useRef) or lift messages state up to ChatPage so the audit can access the conversation log

### 5. Expose chat messages
- Add a `onMessagesChange` callback prop to `ChatInterface` that fires whenever messages update
- Store messages in ChatPage state: `chatMessages`
- Pass to AuditButton

## Technical Details

- **jsPDF** for PDF creation — lightweight, no server needed
- **jspdf-autotable** plugin for the supplier table
- Download triggered via `doc.save('ProqAI_Audit_Report_<timestamp>.pdf')`
- All data comes from existing React state — no API calls needed
- Button only shows in results phase to ensure there's data to report

