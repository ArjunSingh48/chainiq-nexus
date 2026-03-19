

# ProqAI – Light Theme Rebrand & Feature Additions

## Overview
Rebrand from ChainIQ to ProqAI, switch to a light blue theme, rename "Trust Score" to "Confidence Score", and add Settings panel with scenario toggles + enhanced notifications.

## Changes

### 1. Theme: Dark → Light Blue
**Files**: `src/index.css`, `tailwind.config.ts`
- Swap all CSS variables to light mode values (background: light blue gradient `#e6f2ff`→`#cce7ff`, foreground: dark text, cards: white/translucent)
- Update `.glass-card` to `rgba(255,255,255,0.6)` with soft shadows
- Update muted, border, input colors for light theme consistency

### 2. Rename ChainIQ → ProqAI
**Files**: `ChainIQLogo.tsx` → rename to `ProqAILogo.tsx`, update `Index.tsx`, `ChatPage.tsx`, all imports
- Update logo text from "Chain**IQ**" to "Proq**AI**"
- Update all component references

### 3. Rename Trust Score → Confidence Score
**Files**: `suppliers.ts` (interface + data: `trustScore` → `confidenceScore`), `SupplierCard.tsx`, `SupplierPanel.tsx`

### 4. Settings Panel (New)
**File**: Create `src/components/SettingsPanel.tsx`
- Gear icon in header next to notification bell
- Dropdown with toggle switches for: Conflicts, Blockages, Restrictions, Regulatory Constraints
- When toggled ON: affected suppliers turn red, then transition to grey after delay
- Pass toggle state up to `ChatPage.tsx` to modify supplier data

### 5. Regulatory Constraint Logic
**Files**: `SupplierCard.tsx`, `ChatPage.tsx`
- When regulatory constraints toggle is ON and user clicks "Place Order" on a supplier from a restricted region (e.g., CN, RU):
  - Show warning modal: "⚠️ You may be restricted from ordering from this region due to regulatory constraints. Escalating to senior procurement officer."
  - Set order status to "Pending"

### 6. Enhanced Notifications
**File**: Update `NotificationBell.tsx`, create notification context/state in `ChatPage.tsx`
- Categorize into 3 sections: ✅ Approved, ⏳ Pending, ❌ Rejected
- Dynamically add notification entries when orders are placed
- Pass an `addNotification` callback through to `SupplierCard`

### 7. Update Globe & Panel for Light Theme
**Files**: `GlobeView.tsx`, `SupplierPanel.tsx`
- Use lighter globe image (or adjust atmosphere/background)
- Update panel background classes for light theme

## File Summary
| Action | File |
|--------|------|
| Edit | `src/index.css` – light theme variables |
| Edit | `tailwind.config.ts` – updated color tokens |
| Rename/Edit | `ChainIQLogo.tsx` → `ProqAILogo.tsx` |
| Edit | `src/data/suppliers.ts` – rename trustScore, update interface |
| Create | `src/components/SettingsPanel.tsx` |
| Edit | `src/components/NotificationBell.tsx` – categories + dynamic |
| Edit | `src/components/SupplierCard.tsx` – confidence score, regulatory logic |
| Edit | `src/components/SupplierPanel.tsx` – confidence score label |
| Edit | `src/components/GlobeView.tsx` – light theme adjustments |
| Edit | `src/pages/Index.tsx` – logo swap, settings icon |
| Edit | `src/pages/ChatPage.tsx` – settings state, notification state, regulatory logic |
| Edit | `src/components/ChatInterface.tsx` – light theme classes |
| Edit | `src/components/AnalysisOverlay.tsx` – light theme |

