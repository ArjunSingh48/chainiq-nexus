

# Switch Globe to "Highlight Links" Style

## Overview
Transform the current globe from a blue marble earth to a dark "highlight links" style inspired by globe.gl's example. This uses a dark earth texture, hexagonal polygon country outlines, a semi-transparent globe, and more visible bright-colored arc lines.

## Changes

### 1. Update Globe appearance in `src/components/GlobeView.tsx`

**Dark globe with hex polygon country outlines:**
- Change `globeImageUrl` from blue marble to `//unpkg.com/three-globe/example/img/earth-night.jpg` (dark earth)
- Set `showGlobe={true}` and add `globeMaterial` with opacity ~0.7 to make the globe semi-transparent
- After the globe mounts, access the Three.js globe material via `globeRef.current.globeMaterial()` and set `material.opacity = 0.7` and `material.transparent = true`
- Load GeoJSON country data from `https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json` (TopoJSON) or `https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson` and feed it into `hexPolygonsData`
- Configure hex polygon props: `hexPolygonResolution={3}`, `hexPolygonMargin={0.7}`, `hexPolygonColor={() => 'rgba(255,255,255,0.1)'}` for subtle country outlines

**More visible arc lines:**
- Increase `arcStroke` from `1.2` to `2.5`
- Change `arcColor` to return a bright gradient array like `['#00ff88', '#00aaff']` instead of plain white
- Add `arcDashLength={0.4}`, `arcDashGap={0.2}`, `arcDashAnimateTime={1500}` for animated dashes
- Increase `arcAltitude` to `0.1` for more prominent arcs

**Background:**
- Change container background from light blue gradient to dark: `background: '#000011'`
- Update `atmosphereColor` to a cooler blue like `#3388ff`

### 2. Add state for country GeoJSON data
- Add `useState` for countries features array
- Fetch the GeoJSON on mount via `useEffect`

## Files changed

| File | Action |
|------|--------|
| `src/components/GlobeView.tsx` | Restyle to dark highlight-links globe with hex polygons, transparent globe material, and brighter arcs |

