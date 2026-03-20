import { useEffect, useRef, useState, useCallback } from 'react';
import Globe from 'react-globe.gl';
import { Supplier, getPointColor } from '@/data/suppliers';
import { Consignment } from '@/components/TrackingCard';

interface Props {
  suppliers: Supplier[];
  top10: Supplier[];
  onPointClick: (supplier: Supplier) => void;
  focusPoint: { lat: number; lng: number } | null;
  consignments: Consignment[];
  onArcClick: (consignment: Consignment) => void;
}

const GlobeView = ({ suppliers, top10, onPointClick, focusPoint, consignments, onArcClick }: Props) => {
  const globeRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [countries, setCountries] = useState<any[]>([]);

  // Fetch GeoJSON for hex polygons
  useEffect(() => {
    fetch('https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
      .then(res => res.json())
      .then(data => setCountries(data.features))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    if (globeRef.current) {
      const controls = globeRef.current.controls();
      if (controls) {
        controls.autoRotate = false;
        controls.enableZoom = true;
      }
      // Make globe semi-transparent
      try {
        const scene = globeRef.current.scene();
        if (scene) {
          scene.traverse((obj: any) => {
            if (obj.isMesh && obj.material && obj.material.map) {
              obj.material.opacity = 0.7;
              obj.material.transparent = true;
            }
          });
        }
      } catch (e) {
        // globeMaterial not available in this version
      }
    }
  }, [dimensions]);

  useEffect(() => {
    if (focusPoint && globeRef.current) {
      globeRef.current.pointOfView({ lat: focusPoint.lat, lng: focusPoint.lng, altitude: 1.5 }, 1000);
    }
  }, [focusPoint]);

  const top10Ids = top10.map(s => s.id);
  const topSupplierId = top10[0]?.id;

  const pointData = suppliers.map(s => ({
    ...s,
    color: getPointColor(s, top10Ids),
    size: s.id === topSupplierId ? 0.9 : top10Ids.includes(s.id) ? 0.6 : 0.4,
  }));

  const ringsData = topSupplierId
    ? suppliers.filter(s => s.id === topSupplierId).map(s => ({ lat: s.lat, lng: s.lng, maxR: 3, propagationSpeed: 2, repeatPeriod: 800 }))
    : [];

  const arcData = consignments.map(c => ({
    ...c,
    startLat: c.origin.lat,
    startLng: c.origin.lng,
    endLat: c.destination.lat,
    endLng: c.destination.lng,
  }));

  const handlePointClick = useCallback((point: any) => {
    const supplier = suppliers.find(s => s.id === point.id);
    if (supplier) onPointClick(supplier);
  }, [suppliers, onPointClick]);

  const handleArcClick = useCallback((arc: any) => {
    const consignment = consignments.find(c => c.id === arc.id);
    if (consignment) onArcClick(consignment);
  }, [consignments, onArcClick]);

  return (
    <div ref={containerRef} className="w-full h-full overflow-hidden" style={{ background: '#000011' }}>
      {dimensions.width > 0 && (
        <Globe
          ref={globeRef}
          width={dimensions.width}
          height={dimensions.height}
          backgroundColor="rgba(0,0,0,0)"
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
          pointsData={pointData}
          pointLat="lat"
          pointLng="lng"
          pointColor="color"
          pointRadius="size"
          pointAltitude={0.01}
          pointLabel={(d: any) => {
            const isTop1 = d.id === topSupplierId;
            const isTop10 = top10Ids.includes(d.id);
            const isRestricted = d.accessibility === 'restricted';
            const badge = isTop1 ? '<span style="background:#10b981;color:#fff;padding:1px 6px;border-radius:4px;font-size:10px;margin-left:6px;">Recommended</span>'
              : isRestricted ? '<span style="background:#ef4444;color:#fff;padding:1px 6px;border-radius:4px;font-size:10px;margin-left:6px;">Restricted</span>'
              : isTop10 ? '<span style="background:#3b82f6;color:#fff;padding:1px 6px;border-radius:4px;font-size:10px;margin-left:6px;">Shortlisted</span>'
              : '';
            return `<div style="background:rgba(0,0,0,0.85);padding:8px 12px;border-radius:8px;font-size:12px;color:#fff;box-shadow:0 2px 12px rgba(0,0,0,0.4);border:1px solid ${isTop1 ? '#10b981' : isRestricted ? '#ef4444' : 'rgba(255,255,255,0.1)'};">${d.name}${badge}<br/><span style="color:#aaa">${d.country}</span>${d.rank ? `<br/><span style="color:#888;font-size:10px;">Rank #${d.rank}</span>` : ''}</div>`;
          }}
          onPointClick={handlePointClick}
          atmosphereColor="#3388ff"
          atmosphereAltitude={0.15}
          hexPolygonsData={countries}
          hexPolygonResolution={3}
          hexPolygonMargin={0.7}
          hexPolygonColor={() => 'rgba(255,255,255,0.1)'}
          ringsData={ringsData}
          ringColor={() => (t: number) => `rgba(16, 185, 129, ${1 - t})`}
          ringMaxRadius="maxR"
          ringPropagationSpeed="propagationSpeed"
          ringRepeatPeriod="repeatPeriod"
          arcsData={arcData}
          arcStartLat="startLat"
          arcStartLng="startLng"
          arcEndLat="endLat"
          arcEndLng="endLng"
          arcColor={() => ['#00ff88', '#00aaff']}
          arcAltitude={0.1}
          arcStroke={1.2}
          arcDashLength={0.4}
          arcDashGap={0.2}
          arcDashAnimateTime={1500}
          onArcClick={handleArcClick}
          arcLabel={(d: any) => `<div style="background:rgba(0,0,0,0.85);padding:6px 10px;border-radius:6px;font-size:12px;color:#00ff88;box-shadow:0 2px 8px rgba(0,255,136,0.2);cursor:pointer;">📦 ${d.supplierName} → Zurich</div>`}
        />
      )}
    </div>
  );
};

export default GlobeView;
