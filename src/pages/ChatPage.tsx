import { useState, useEffect, useCallback } from 'react';
import { suppliers as initialSuppliers, Supplier, getTop10, applyConstraints, Notification } from '@/data/suppliers';
import ChatInterface from '@/components/ChatInterface';
import GlobeView from '@/components/GlobeView';
import SupplierPanel from '@/components/SupplierPanel';
import SupplierCard from '@/components/SupplierCard';
import AnalysisOverlay from '@/components/AnalysisOverlay';
import ProqAILogo from '@/components/ProqAILogo';
import NotificationBell from '@/components/NotificationBell';
import SettingsPanel, { SettingsState } from '@/components/SettingsPanel';
import TrackingCard, { Consignment } from '@/components/TrackingCard';

type Phase = 'chat' | 'globe' | 'constraints';

const ZURICH = { lat: 47.3769, lng: 8.5417 };

const ChatPage = () => {
  const [phase, setPhase] = useState<Phase>('chat');
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [top10, setTop10] = useState<Supplier[]>([]);
  const [panelLoading, setPanelLoading] = useState(true);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [focusPoint, setFocusPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<SettingsState>({
    conflicts: false,
    blockages: false,
    restrictions: false,
    regulatoryConstraints: false,
  });
  const [nextNotifId, setNextNotifId] = useState(100);
  const [consignments, setConsignments] = useState<Consignment[]>([]);
  const [selectedConsignment, setSelectedConsignment] = useState<Consignment | null>(null);

  // Red → grey transition every 3 seconds
  useEffect(() => {
    if (phase === 'chat') return;
    const interval = setInterval(() => {
      setSuppliers(prev => {
        const restricted = prev.filter(s => s.accessibility === 'restricted').sort((a, b) => b.rank - a.rank);
        if (restricted.length === 0) return prev;
        const target = restricted[0];
        return prev.map(s => s.id === target.id ? { ...s, accessibility: 'open' as const } : s);
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [phase]);

  // Settings toggles
  useEffect(() => {
    setSuppliers(prev => prev.map(s => {
      const shouldRestrict =
        (settings.conflicts && ['BR', 'ZA', 'IN', 'AE'].includes(s.countryCode)) ||
        (settings.blockages && ['MX'].includes(s.countryCode)) ||
        (settings.restrictions && s.rank > 20);
      
      if (shouldRestrict && s.accessibility === 'open') {
        return { ...s, accessibility: 'restricted' as const };
      }
      return s;
    }));
  }, [settings.conflicts, settings.blockages, settings.restrictions]);

  // Populate panel after entering globe phase
  useEffect(() => {
    if (phase === 'globe') {
      const timer = setTimeout(() => {
        setTop10(getTop10(suppliers));
        setPanelLoading(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  // Update top10 when suppliers change
  useEffect(() => {
    if (phase !== 'chat' && !panelLoading) {
      setTop10(getTop10(suppliers));
    }
  }, [suppliers, phase, panelLoading]);

  const handleFirstMessage = useCallback(() => {
    setPhase('globe');
  }, []);

  const handleConstraintMessage = useCallback(async () => {
    setShowAnalysis(true);
    const result = await applyConstraints(suppliers);
    setSuppliers(result.suppliers);
    setTop10(result.top10);
    setShowAnalysis(false);
    setPhase('constraints');
  }, [suppliers]);

  const handleSupplierSelect = useCallback((supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setFocusPoint({ lat: supplier.lat, lng: supplier.lng });
    setSelectedConsignment(null);
  }, []);

  const addNotification = useCallback((supplier: Supplier, status: 'success' | 'pending') => {
    const notif: Notification = {
      id: nextNotifId,
      type: status === 'success' ? 'approved' : 'pending',
      message: status === 'success'
        ? `APPROVED: Order to ${supplier.name} confirmed`
        : `PENDING: Order to ${supplier.name} requires review`,
      time: 'Just now',
    };
    setNextNotifId(prev => prev + 1);
    setNotifications(prev => [notif, ...prev]);
  }, [nextNotifId]);

  const handleOrderSuccess = useCallback((supplier: Supplier) => {
    const newConsignment: Consignment = {
      id: `consign-${Date.now()}`,
      supplierName: supplier.name,
      origin: { lat: supplier.lat, lng: supplier.lng },
      destination: ZURICH,
      originCity: `${supplier.country}`,
      originCountry: supplier.countryCode,
      orderId: `${1234 + consignments.length}`,
      units: 200,
      startTime: Date.now(),
    };
    setConsignments(prev => [...prev, newConsignment]);
  }, []);

  const handleArcClick = useCallback((consignment: Consignment) => {
    setSelectedConsignment(consignment);
    setSelectedSupplier(null);
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden relative" style={{ background: 'linear-gradient(135deg, #e6f2ff 0%, #cce7ff 100%)' }}>
      {phase !== 'chat' && (
        <header className="absolute top-0 left-0 right-0 z-40 bg-black border-b border-border h-12 flex items-center justify-between px-4 text-white">
          <ProqAILogo />
          <div className="flex items-center gap-1">
            <NotificationBell notifications={notifications} />
            <SettingsPanel settings={settings} onSettingsChange={setSettings} />
          </div>
        </header>
      )}

      <ChatInterface
        minimized={phase !== 'chat'}
        onFirstMessage={handleFirstMessage}
        onConstraintMessage={handleConstraintMessage}
        phase={phase}
      />

      {phase !== 'chat' && (
        <div className="absolute inset-0 pt-12 pb-[60px] flex">
          <div className="w-[60%] h-full relative">
            <GlobeView
              suppliers={suppliers}
              top10={top10}
              onPointClick={handleSupplierSelect}
              focusPoint={focusPoint}
              consignments={consignments}
              onArcClick={handleArcClick}
            />
            <SupplierCard
              supplier={selectedSupplier}
              onClose={() => setSelectedSupplier(null)}
              regulatoryEnabled={settings.regulatoryConstraints}
              onOrderPlaced={addNotification}
              onOrderSuccess={handleOrderSuccess}
            />
            <TrackingCard
              consignment={selectedConsignment}
              onClose={() => setSelectedConsignment(null)}
            />
          </div>
          <div className="w-[40%] h-full">
            <SupplierPanel suppliers={top10} loading={panelLoading} onSelect={handleSupplierSelect} />
          </div>
        </div>
      )}

      <AnalysisOverlay visible={showAnalysis} />
    </div>
  );
};

export default ChatPage;
