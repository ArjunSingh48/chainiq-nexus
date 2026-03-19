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
  const [dashAnimOffset, setDashAnimOffset] = useState(0);

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
    }
  }, []);

  useEffect(() => {
    if (focusPoint && globeRef.current) {
      globeRef.current.pointOfView({ lat: focusPoint.lat, lng: focusPoint.lng, altitude: 1.5 }, 1000);
    }
  }, [focusPoint]);

  // Animate dash offset for moving dot effect
  useEffect(() => {
    if (consignments.length === 0) return;
    const interval = setInterval(() => {
      setDashAnimOffset(prev => prev + 0.2);
    }, 30);
    return () => clearInterval(interval);
  }, [consignments.length]);

  const top10Ids = top10.map(s => s.id);

  const pointData = suppliers.map(s => ({
    ...s,
    color: getPointColor(s, top10Ids),
    size: top10Ids.includes(s.id) ? 0.6 : 0.4,
  }));

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
    <div ref={containerRef} className="w-full h-full rounded-xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #e6f2ff, #d4e8ff)' }}>
      {dimensions.width > 0 && (
        <Globe
          ref={globeRef}
          width={dimensions.width}
          height={dimensions.height}
          backgroundColor="rgba(0,0,0,0)"
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          pointsData={pointData}
          pointLat="lat"
          pointLng="lng"
          pointColor="color"
          pointRadius="size"
          pointAltitude={0.01}
          pointLabel={(d: any) => `<div style="background:rgba(255,255,255,0.85);padding:6px 10px;border-radius:6px;font-size:12px;color:#1a1a2e;box-shadow:0 2px 8px rgba(0,0,0,0.1);">${d.name}<br/><span style="color:#666">${d.country}</span></div>`}
          onPointClick={handlePointClick}
          atmosphereColor="hsl(217, 91%, 60%)"
          atmosphereAltitude={0.15}
          arcsData={arcData}
          arcStartLat="startLat"
          arcStartLng="startLng"
          arcEndLat="endLat"
          arcEndLng="endLng"
          arcColor={() => ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.5)']}
          arcAltitude={0.04}
          arcStroke={0.4}
          arcDashLength={0.15}
          arcDashGap={0.1}
          arcDashAnimateTime={4000}
          onArcClick={handleArcClick}
          arcLabel={(d: any) => `<div style="background:rgba(255,255,255,0.9);padding:6px 10px;border-radius:6px;font-size:12px;color:#1a1a2e;box-shadow:0 2px 8px rgba(0,0,0,0.15);cursor:pointer;">📦 ${d.supplierName} → Zurich</div>`}
        />
      )}
    </div>
  );
};

export default GlobeView;
