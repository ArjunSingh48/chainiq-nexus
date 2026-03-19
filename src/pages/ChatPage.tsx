import { useCallback, useState } from 'react';
import { Supplier, getTop10, Notification } from '@/data/suppliers';
import ChatInterface from '@/components/ChatInterface';
import GlobeView from '@/components/GlobeView';
import SupplierPanel from '@/components/SupplierPanel';
import SupplierCard from '@/components/SupplierCard';
import ProqAILogo from '@/components/ProqAILogo';
import NotificationBell from '@/components/NotificationBell';
import TrackingCard, { Consignment } from '@/components/TrackingCard';
import AuditButton from '@/components/AuditButton';
import { runWorkflow, WorkflowResponse } from '@/lib/workflow';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import type { ChatSubmitResult } from '@/components/ChatInterface';

type Phase = 'chat' | 'results';

const ZURICH = { lat: 47.3769, lng: 8.5417 };

const buildInterpretedSummary = (workflow: WorkflowResponse) => {
  const request = workflow.request;
  const parts = [
    request.category_l2 || 'unknown category',
    request.quantity ? `qty ${request.quantity}` : null,
    request.budget_amount ? `${request.currency} ${request.budget_amount.toLocaleString()}` : null,
    request.delivery_countries.length > 0 ? `deliver to ${request.delivery_countries.join(', ')}` : null,
    request.required_by_date ? `needed by ${request.required_by_date}` : null,
    request.preferred_supplier_mentioned ? `preferred ${request.preferred_supplier_mentioned}` : null,
    request.data_residency_constraint ? 'data residency required' : null,
    request.esg_requirement ? 'ESG required' : null,
  ].filter(Boolean);
  return parts.join(' · ');
};

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
  const [pendingNotifications, setPendingNotifications] = useState<Notification[] | null>(null);
  const [approvalPopupApprovals, setApprovalPopupApprovals] = useState<Array<{ approver: string; reason: string; rule: string }>>([]);

  const handleSubmit = useCallback(async (message: string): Promise<ChatSubmitResult> => {
    setShowAnalysis(true);
    try {
      const result = await runWorkflow(message, sessionId);
      setSessionId(result.session_id);
      const interpretedAs = buildInterpretedSummary(result);

      if (result.status === 'needs_clarification') {
        setWorkflow(result);
        setSuppliers([]);
        setTop10([]);
        setNotifications([]);
        setSelectedSupplier(null);
        setFocusPoint(null);
        setPhase('chat');
        return {
          reply: result.follow_up_question ?? result.ui.summary,
          interpretedAs,
        };
      }

      const workflowSuppliers = result.ui.suppliers;

      setWorkflow(result);
      setSuppliers(workflowSuppliers);
      setTop10(getTop10(workflowSuppliers));
      setSelectedSupplier(null);

      const approvalEscalations = (result.engine_output?.escalations ?? []).filter(
        e => !e.blocking && e.escalate_to && e.escalate_to !== 'Requester Clarification'
      );
      const approvalDetails = result.engine_output?.recommendation?.approvals_required
        ?? approvalEscalations.map((e) => ({ approver: e.escalate_to, reason: e.trigger, rule: e.rule }));
      if (approvalDetails.length > 0) {
        setPendingNotifications(result.ui.notifications);
        setApprovalPopupApprovals(approvalDetails);
      } else {
        setNotifications(result.ui.notifications);
      }
      setFocusPoint(workflowSuppliers[0] ? { lat: workflowSuppliers[0].lat, lng: workflowSuppliers[0].lng } : null);
      setPhase('results');

      const blockingCount = result.engine_output?.escalations.filter((item) => item.blocking).length ?? 0;
      return {
        reply: `${result.ui.summary} Parsed with ${result.parser_source}. Blocking escalations: ${blockingCount}.`,
        interpretedAs,
      };
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
      orderId: `${0 + consignments.length}`,
      units: workflow?.request.quantity ?? 0,
      startTime: Date.now(),
    };
    setConsignments((prev) => [...prev, newConsignment]);
  }, [consignments.length, workflow?.request.quantity]);

  const handleArcClick = useCallback((consignment: Consignment) => {
    setSelectedConsignment(consignment);
    setSelectedSupplier(null);
  }, []);

  const handleApprovalPopupDismiss = useCallback(() => {
    if (pendingNotifications) {
      setNotifications(pendingNotifications);
      setPendingNotifications(null);
    }
    setApprovalPopupApprovals([]);
  }, [pendingNotifications]);

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
              requiresApproval={(workflow?.engine_output?.escalations ?? []).some(e => !e.blocking && e.escalate_to && e.escalate_to !== 'Requester Clarification')}
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

      {phase !== 'chat' && (
        <AuditButton
          auditData={{
            workflow,
            suppliers,
            top10,
            selectedSupplier,
            notifications,
            consignments,
            chatMessages,
            sessionId,
          }}
        />
      )}
      <Dialog open={approvalPopupApprovals.length > 0} onOpenChange={(open) => { if (!open) handleApprovalPopupDismiss(); }}>
        <DialogContent className="glass-card border-border py-8">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-secondary">Attention</p>
          <p className="mb-3 text-lg font-semibold text-foreground">This request requires approval</p>
          <p className="mb-5 text-sm text-muted-foreground">
            The engine found policy checks that did not auto-pass. Each pending approval shows the rule and the reason.
          </p>
          <div className="mb-5 space-y-3">
            {approvalPopupApprovals.map((approval) => (
              <div key={`${approval.rule}-${approval.approver}`} className="rounded-lg border border-amber-400/30 bg-amber-500/10 p-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-amber-100">{approval.approver}</p>
                <p className="mt-1 text-sm text-foreground">{approval.reason}</p>
                <p className="mt-2 text-[11px] uppercase tracking-widest text-amber-200/80">Rule {approval.rule}</p>
              </div>
            ))}
          </div>
          <button
            onClick={handleApprovalPopupDismiss}
            className="w-full rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
          >
            Understood
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatPage;
