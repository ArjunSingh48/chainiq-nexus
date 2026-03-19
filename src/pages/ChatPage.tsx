import { useState, useEffect, useCallback } from 'react';
import { suppliers as initialSuppliers, Supplier, getTop10, applyConstraints } from '@/data/suppliers';
import ChatInterface from '@/components/ChatInterface';
import GlobeView from '@/components/GlobeView';
import SupplierPanel from '@/components/SupplierPanel';
import SupplierCard from '@/components/SupplierCard';
import AnalysisOverlay from '@/components/AnalysisOverlay';
import ChainIQLogo from '@/components/ChainIQLogo';
import NotificationBell from '@/components/NotificationBell';

type Phase = 'chat' | 'globe' | 'constraints';

const ChatPage = () => {
  const [phase, setPhase] = useState<Phase>('chat');
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [top10, setTop10] = useState<Supplier[]>([]);
  const [panelLoading, setPanelLoading] = useState(true);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [focusPoint, setFocusPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

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
  }, []);

  return (
    <div className="h-screen w-screen bg-background overflow-hidden relative">
      {/* Header for globe view */}
      {phase !== 'chat' && (
        <header className="absolute top-0 left-0 right-0 z-40 glass-card border-b border-border h-12 flex items-center justify-between px-4">
          <ChainIQLogo />
          <NotificationBell />
        </header>
      )}

      {/* Chat */}
      <ChatInterface
        minimized={phase !== 'chat'}
        onFirstMessage={handleFirstMessage}
        onConstraintMessage={handleConstraintMessage}
        phase={phase}
      />

      {/* Globe + Panel */}
      {phase !== 'chat' && (
        <div className="absolute inset-0 pt-12 pb-[60px] flex">
          <div className="w-[60%] h-full relative">
            <GlobeView
              suppliers={suppliers}
              top10={top10}
              onPointClick={handleSupplierSelect}
              focusPoint={focusPoint}
            />
            <SupplierCard supplier={selectedSupplier} onClose={() => setSelectedSupplier(null)} />
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
