

# ChainIQ – Audit-Ready Autonomous Sourcing Agent

## Overview
A futuristic procurement cockpit with a sci-fi control panel aesthetic. Users enter procurement requests via chat, view suppliers on a 3D globe, apply constraints, and simulate procurement decisions.

## Pages & Flow

### 1. Landing Page (`/`)
- Header with ChainIQ logo, navigation links (About Us, Our Approach, Our Solutions, etc.), and notification bell with badge
- Hero section: bold heading "COMMITTED TO DELIVER INNOVATIVE PROCUREMENT SOLUTIONS"
- Red CTA button "Start with ProqAI" with glow effect → navigates to `/chat`

### 2. Chat + Globe View (`/chat`)
- **Phase 1**: Full-screen terminal-style chat. AI greeting message. User types a procurement request.
- **Phase 2**: After first message, chat minimizes to a 60px bottom bar (expandable). Screen splits into:
  - **Left 60%**: Interactive 3D globe (react-globe.gl) with glowing data points for 21 countries
  - **Right 40%**: Supplier panel with skeleton loaders → populates with top 10 suppliers
- **Phase 3**: AI asks for constraints → user replies → 2-second loading overlay ("Analysing constraints…") → globe updates colors, panel populates

### 3. Globe
- Dark background (#0a0a0a), muted brown landmass
- Points colored by status: blue (default), green (top 10), red (restricted), grey (resolved)
- Every 3 seconds, one red point transitions to grey
- Click point → smooth camera zoom + glassmorphism detail card

### 4. Supplier Panel
- Scrollable list of top 10 suppliers with name, country flag, ESG score, trust score
- Click entry → globe zooms to location + detail card

### 5. Glassmorphism Detail Card
- Company name, country, rank, status, ESG/trust scores
- "Recommendation reason" button → modal with 3-4 bullet points
- "Place order" button → modal with success or pending review (random)

### 6. Notifications
- Bell icon dropdown with static notifications (rejected, approved, pending)

## Data
- ~30 mock suppliers in a separate data file with id, name, country, lat/lng, rank, accessibility, esgScore, trustScore
- Mock API functions using setTimeout for parseRequest, applyConstraints, placeOrder

## Design System
- Background: #0a0a0a, Primary red: #ec1e24, Blue: #3b82f6, Green: #10b981, Red: #ef4444, Grey: #6b7280
- Glassmorphism: rgba(20,20,30,0.7) + backdrop-blur
- Bold uppercase headings, clean sans-serif body, monospace chat
- Smooth animations throughout (fade, scale, slide, globe zoom)

## Dependencies
- react-globe.gl for 3D globe rendering

