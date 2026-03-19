import { useCallback, useState } from 'react';
import { Supplier, getTop10, Notification } from '@/data/suppliers';
import ChatInterface from '@/components/ChatInterface';
import GlobeView from '@/components/GlobeView';
import SupplierPanel from '@/components/SupplierPanel';
import SupplierCard from '@/components/SupplierCard';
import AnalysisOverlay from '@/components/AnalysisOverlay';
import ProqAILogo from '@/components/ProqAILogo';
import NotificationBell from '@/components/NotificationBell';
import TrackingCard, { Consignment } from '@/components/TrackingCard';
import AuditButton from '@/components/AuditButton';
import { runWorkflow, WorkflowResponse } from '@/lib/workflow';

type Phase = 'chat' | 'results';

const ZURICH = { lat: 47.3769, lng: 8.5417 };

const ChatPage = () => {
  const [phase, setPhase] = useState<Phase>('chat');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [workflow, setWorkflow] = useState<WorkflowResponse | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [top10, setTop10] = useState<Supplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [focusPoint, setFocusPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [nextNotifId, setNextNotifId] = useState(100);
  const [consignments, setConsignments] = useState<Consignment[]>([]);
  const [selectedConsignment, setSelectedConsignment] = useState<Consignment | null>(null);
  const [chatMessages, setChatMessages] = useState<{ role: string; text: string }[]>([]);

  const handleSubmit = useCallback(async (message: string) => {
    setShowAnalysis(true);
    try {
      const result = await runWorkflow(message, sessionId);
      setSessionId(result.session_id);

      if (result.status === 'needs_clarification') {
        setWorkflow(result);
        setSuppliers([]);
        setTop10([]);
        setNotifications([]);
        setSelectedSupplier(null);
        setFocusPoint(null);
        setPhase('chat');
        return result.follow_up_question ?? result.ui.summary;
      }

      const workflowSuppliers = result.ui.suppliers;

      setWorkflow(result);
      setSuppliers(workflowSuppliers);
      setTop10(getTop10(workflowSuppliers));
      setNotifications(result.ui.notifications);
      setSelectedSupplier(workflowSuppliers[0] ?? null);
      setFocusPoint(workflowSuppliers[0] ? { lat: workflowSuppliers[0].lat, lng: workflowSuppliers[0].lng } : null);
      setPhase('results');

      const blockingCount = result.engine_output?.escalations.filter((item) => item.blocking).length ?? 0;
      return `${result.ui.summary} Parsed with ${result.parser_source}. Blocking escalations: ${blockingCount}.`;
    } finally {
      setShowAnalysis(false);
    }
  }, [sessionId]);

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
    setNextNotifId((prev) => prev + 1);
    setNotifications((prev) => [notif, ...prev]);
  }, [nextNotifId]);

  const handleOrderSuccess = useCallback((supplier: Supplier) => {
    const newConsignment: Consignment = {
      id: `consign-${Date.now()}`,
      supplierName: supplier.name,
      origin: { lat: supplier.lat, lng: supplier.lng },
      destination: ZURICH,
      originCity: supplier.country,
      originCountry: supplier.countryCode,
      orderId: `${1234 + consignments.length}`,
      units: workflow?.request.quantity ?? 0,
      startTime: Date.now(),
    };
    setConsignments((prev) => [...prev, newConsignment]);
  }, [consignments.length, workflow?.request.quantity]);

  const handleArcClick = useCallback((consignment: Consignment) => {
    setSelectedConsignment(consignment);
    setSelectedSupplier(null);
  }, []);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[radial-gradient(circle_at_top,#19324f_0%,#07111d_42%,#02060b_100%)]">
      {phase !== 'chat' && (
        <header className="absolute left-0 right-0 top-0 z-40 flex h-12 items-center justify-between border-b border-border bg-black/70 px-4 text-white backdrop-blur">
          <ProqAILogo />
          <NotificationBell notifications={notifications} />
        </header>
      )}

      <ChatInterface
        minimized={phase !== 'chat'}
        onSubmit={handleSubmit}
        phase={phase}
        loading={showAnalysis}
        onMessagesChange={setChatMessages}
      />

      {phase !== 'chat' && (
        <div className="absolute inset-0 flex pb-[60px] pt-12">
          <div className="relative h-full w-[60%]">
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
              onOrderPlaced={addNotification}
              onOrderSuccess={handleOrderSuccess}
            />
            <TrackingCard
              consignment={selectedConsignment}
              onClose={() => setSelectedConsignment(null)}
            />
          </div>
          <div className="h-full w-[40%]">
            <SupplierPanel suppliers={top10} loading={showAnalysis} onSelect={handleSupplierSelect} workflow={workflow} />
          </div>
        </div>
      )}

      <AnalysisOverlay visible={showAnalysis} />
    </div>
  );
};

export default ChatPage;
