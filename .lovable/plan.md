

# Enhanced Consignment Tracking System

## Overview
Refine the existing tracking arc and card to be more minimal/professional, and add richer shipment details (origin city, order ID, units, structured sections).

## Changes

### 1. GlobeView.tsx — Thinner, flatter arc
- Reduce `arcAltitude` from `0.15` to `0.04` (nearly flat line)
- Reduce `arcStroke` from `0.8` to `0.4`
- Lower arc color opacity for subtle glow: `rgba(255,255,255,0.7)` / `rgba(255,255,255,0.3)`
- Slow down animation: `arcDashAnimateTime` from `2000` to `4000`
- Smaller dash: `arcDashLength: 0.15`, `arcDashGap: 0.1`

### 2. Consignment interface — Add origin metadata
- Add `originCity` and `originCountry` fields to the `Consignment` interface in `TrackingCard.tsx`
- Add mock `orderId` and `units` fields

### 3. TrackingCard.tsx — Richer, structured content
Redesign card with sections:
- **Shipment Info**: Status badge ("In Transit"), Supplier name, Origin city/country, Destination (Zurich, Switzerland)
- **Progress**: "Shipment Progress: X% completed" with progress bar
- **Delivery Estimate**: "Estimated Delivery: ~2 days"
- **Order Details**: "Units: 200 laptops", "Order ID: #XXXX" (mock)

### 4. ChatPage.tsx — Pass origin metadata
- When creating a consignment in `handleOrderSuccess`, include `originCity: supplier.country`, `originCountry: supplier.countryCode`, mock `orderId` and `units`

## Files
| File | Action |
|------|--------|
| `src/components/TrackingCard.tsx` | Update interface + redesign card |
| `src/components/GlobeView.tsx` | Tune arc styling for minimal look |
| `src/pages/ChatPage.tsx` | Pass additional metadata to consignment |

