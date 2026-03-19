

# Changes Plan

## 1. Add `riskScore` and `unitPrice` to Supplier data, rename `confidenceScore` to `qualityScore`

**File: `src/data/suppliers.ts`**
- Rename `confidenceScore` field to `qualityScore` in the interface
- Add `riskScore: number` and `unitPrice: number` fields to the interface
- Update all 30 supplier entries with the renamed field and new mock values

## 2. Update SupplierPanel to show new fields

**File: `src/components/SupplierPanel.tsx`**
- Change "Confidence" label to "Quality"
- Add "Risk" and "Price" displays in the stats row

## 3. Update SupplierCard to show new fields

**File: `src/components/SupplierCard.tsx`**
- Rename "Confidence" to "Quality" in the detail card
- Add "Risk" and "Unit Price" grid items (expand grid to 3 columns or add more rows)

## 4. Make logo bigger

**File: `src/components/ProqAILogo.tsx`**
- Change `h-8` to `h-12` for a larger logo

## 5. Add background video to Index page

**File: `src/pages/Index.tsx`**
- Copy the uploaded video to `public/videos/hero-bg.mov`
- Add a `<video>` element behind the main content with `autoPlay`, `muted`, `loop`, `playsInline`, and `opacity: 0.8`
- Position it as an absolute fill behind the content (in the existing `-z-10` background div)

## Files changed

| File | Action |
|------|--------|
| `src/data/suppliers.ts` | Rename field, add `riskScore` + `unitPrice` to interface and all entries |
| `src/components/SupplierPanel.tsx` | Update labels and add new score displays |
| `src/components/SupplierCard.tsx` | Update labels and add new grid items |
| `src/components/ProqAILogo.tsx` | Increase logo size |
| `src/pages/Index.tsx` | Add background video at 80% opacity |
| `public/videos/hero-bg.mov` | Copy uploaded video here |

