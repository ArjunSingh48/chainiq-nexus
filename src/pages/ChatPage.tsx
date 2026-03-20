import { useCallback, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Supplier, getTop10, Notification, placeOrder } from '@/data/suppliers';
import ChatInterface from '@/components/ChatInterface';
import type { ChatSubmitResult, Message } from '@/components/ChatInterface';
import GlobeView from '@/components/GlobeView';
import SupplierPanel from '@/components/SupplierPanel';
import SupplierCard from '@/components/SupplierCard';
import ProqAILogo from '@/components/ProqAILogo';
import NotificationBell from '@/components/NotificationBell';
import TrackingCard, { Consignment } from '@/components/TrackingCard';
import AuditButton from '@/components/AuditButton';
import { runWorkflow, WorkflowResponse } from '@/lib/workflow';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import RequestHistory, { saveHistoryEntry, HistoryEntry } from '@/components/RequestHistory';
import { addSupervisorRequest } from '@/lib/supervisorStore';

type Phase = 'chat' | 'results';
type RequesterClarificationItem = { field: string; rule: string; escalate_to: string };
type RequesterClarificationDecision = { decision: 'approved' | 'denied'; field: string };

const ZURICH = { lat: 47.3769, lng: 8.5417 };

const fieldLabelMap: Record<string, string> = {
  category_l2: 'Category',
  country: 'Delivery country',
  quantity: 'Quantity',
  budget_amount: 'Budget',
  currency: 'Currency',
};

const requestCountryToUiCountry = (countryCode: string) => (countryCode === 'UAE' ? 'AE' : countryCode);


const countryDisplayName = (countryCode: string) => {
  const uiCode = requestCountryToUiCountry(countryCode);
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(uiCode) ?? countryCode;
  } catch {
    return countryCode;
  }
};

const formatCountryDisplay = (countryCode: string) => `${countryDisplayName(countryCode)} (${countryCode})`;

const SAMPLE_CATEGORIES = [
  'laptops',
  'office chairs',
  'cloud hosting',
  'cybersecurity advisory',
  'digital marketing services',
  'standing desks',
];

const SAMPLE_COUNTRIES = [
  { city: 'Zurich', country: 'Switzerland' },
  { city: 'Berlin', country: 'Germany' },
  { city: 'Dublin', country: 'Ireland' },
  { city: 'Johannesburg', country: 'South Africa' },
  { city: 'Singapore', country: 'Singapore' },
  { city: 'Toronto', country: 'Canada' },
];

const SAMPLE_BUDGETS = [18000, 45000, 120000, 275000, 640000];
const SAMPLE_QUANTITIES = [25, 80, 150, 300, 500];

const randomItem = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];

const buildChatPlaceholder = () => {
  const category = randomItem(SAMPLE_CATEGORIES);
  const destination = randomItem(SAMPLE_COUNTRIES);
  const quantity = randomItem(SAMPLE_QUANTITIES);
  const budget = randomItem(SAMPLE_BUDGETS);
  const month = String(Math.floor(Math.random() * 9) + 4).padStart(2, '0');
  const day = String(Math.floor(Math.random() * 20) + 1).padStart(2, '0');
  return `e.g., ${quantity} ${category} to ${destination.city}, ${destination.country} by 2026-${month}-${day} under ${budget} EUR`;
};

const formatMissingFields = (workflow: WorkflowResponse) => {
  return workflow.missing_critical_fields.map((item) => fieldLabelMap[item.field] ?? item.field);
};

const buildClarificationReplies = (workflow: WorkflowResponse): string[] => {
  const followUp = workflow.follow_up_question ?? workflow.ui.summary;
  // Split the follow-up into individual questions (separated by double newlines)
  const questions = followUp
    .split(/\n{2,}/)
    .map(q => q.trim())
    .filter(q => q.length > 0);

  // Handle invalid country as a separate message prepended
  const invalidCountry = workflow.missing_critical_fields.find(
    (item) => item.field === 'country' && item.reason === 'invalid' && item.attempted_value,
  );

  if (invalidCountry?.attempted_value) {
    const countryText = workflow.request.country
      ? formatCountryDisplay(workflow.request.country)
      : invalidCountry.attempted_value;
    const invalidCountryMessage =
      `I interpreted the delivery country as ${countryText}, but that country is not supported by the current policy dataset.`;
    const backendCountryMessage =
      `I interpreted the delivery country as ${invalidCountry.attempted_value}, but that country is not supported by the current policy dataset.`;

    // Remove country error from the split questions to avoid duplication
    const filtered = questions.filter(q =>
      !q.includes(backendCountryMessage) && !q.includes(invalidCountryMessage)
    );
    return [invalidCountryMessage, ...filtered];
  }

  return questions;
};

const displayExactValue = (value: unknown) => {
  if (value === null || value === undefined || value === '') return null;
  if (Array.isArray(value)) return value.length > 0 ? value.join(', ') : null;
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  return String(value);
};

const buildInterpretedSummary = (workflow: WorkflowResponse) => {
  const request = workflow.request;
  const entries: Array<[string, unknown]> = [
    ['category', [request.category_l1, request.category_l2].filter(Boolean).join(' \u203A ') || null],
    ['country', request.country],
    ['site', request.site],
    ['currency', request.currency],
    ['budget_amount', request.budget_amount],
    ['quantity', request.quantity != null ? `${request.quantity}${request.unit_of_measure ? ' ' + request.unit_of_measure : ''}` : null],
    ['required_by_date', request.required_by_date],
    ['preferred_supplier_mentioned', request.preferred_supplier_mentioned],
    ['incumbent_supplier', request.incumbent_supplier],
    ['delivery_countries', request.delivery_countries],
  ];

  return [
    ...entries
      .map(([label, rawValue]) => ({ label, value: displayExactValue(rawValue) }))
      .filter((item): item is { label: string; value: string } => item.value !== null),
    ...(request.category_l1 === 'IT' ? [{ label: request.data_residency_constraint ? 'data residency constrained' : 'data residency unconstrained', value: '', flag: request.data_residency_constraint }] : []),
    { label: request.esg_requirement ? 'ESG required' : 'ESG not required', value: '', flag: request.esg_requirement },
  ] as Array<{ label: string; value: string; flag?: boolean }>;
};

const CHAT_STATE_KEY = 'chatPageState';

function saveChatState(state: Record<string, unknown>) {
  try { sessionStorage.setItem(CHAT_STATE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
}

function loadChatState(): Record<string, unknown> | null {
  try {
    const raw = sessionStorage.getItem(CHAT_STATE_KEY);
    if (raw) { sessionStorage.removeItem(CHAT_STATE_KEY); return JSON.parse(raw); }
  } catch { /* ignore */ }
  return null;
}

const ChatPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const restored = location.state?.fromAudit ? loadChatState() : null;

  const [phase, setPhase] = useState<Phase>((restored?.phase as Phase) ?? 'chat');
  const [sessionId, setSessionId] = useState<string | null>((restored?.sessionId as string) ?? null);
  const [workflow, setWorkflow] = useState<WorkflowResponse | null>((restored?.workflow as WorkflowResponse) ?? null);
  const [suppliers, setSuppliers] = useState<Supplier[]>((restored?.suppliers as Supplier[]) ?? []);
  const [top10, setTop10] = useState<Supplier[]>((restored?.top10 as Supplier[]) ?? []);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [focusPoint, setFocusPoint] = useState<{ lat: number; lng: number } | null>((restored?.focusPoint as { lat: number; lng: number }) ?? null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>((restored?.notifications as Notification[]) ?? []);
  const [nextNotifId, setNextNotifId] = useState((restored?.nextNotifId as number) ?? 100);
  const [consignments, setConsignments] = useState<Consignment[]>((restored?.consignments as Consignment[]) ?? []);
  const [selectedConsignment, setSelectedConsignment] = useState<Consignment | null>(null);
  const [chatMessages, setChatMessages] = useState<{ role: string; text: string; interpretedAs?: Array<{ label: string; value: string }> }[]>((restored?.chatMessages as any[]) ?? []);
  const [pendingNotifications, setPendingNotifications] = useState<Notification[] | null>(null);
  const [approvalPopupApprovals, setApprovalPopupApprovals] = useState<Array<{ approver: string; reason: string; rule: string }>>([]);
  const [clarificationDecisions, setClarificationDecisions] = useState<Record<string, RequesterClarificationDecision>>((restored?.clarificationDecisions as Record<string, RequesterClarificationDecision>) ?? {});
  const [chatPlaceholder] = useState(() => buildChatPlaceholder());

  const handleSubmit = useCallback(async (message: string, answeringField?: string | null): Promise<ChatSubmitResult> => {
    setShowAnalysis(true);
    try {
      const result = await runWorkflow(message, sessionId, answeringField);
      setSessionId(result.session_id);
      setClarificationDecisions({});
      const interpretedAs = buildInterpretedSummary(result);

      if (result.status === 'needs_clarification') {
        const missingLabels = formatMissingFields(result);
        setWorkflow(result);
        setSuppliers([]);
        setTop10([]);
        setNotifications([]);
        setSelectedSupplier(null);
        setFocusPoint(null);
        setPhase('chat');
        saveHistoryEntry({
          id: result.session_id,
          timestamp: Date.now(),
          requestText: message,
          category: result.request.category_l2 || result.request.category_l1 || '',
          status: 'needs_clarification',
          supplierCount: 0,
          topSupplier: null,
        });
        const clarificationFields: Record<string, string> = {};
        if (result.follow_up_questions) {
          for (const q of result.follow_up_questions) {
            clarificationFields[q.question] = q.field;
          }
        }
        return {
          reply: buildClarificationReplies(result),
          interpretedAs,
          neededFromRequester: missingLabels.length > 0 ? missingLabels.join(', ') : undefined,
          isClarification: true,
          clarificationFields,
          disambiguationMessage: result.disambiguation_message,
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
        addSupervisorRequest({
          id: result.session_id,
          title: `${result.request.category_l2 || 'Request'} - Qty ${result.request.quantity ?? 'n/a'}`,
          subtitle: `AI suggested ${workflowSuppliers[0]?.name ?? 'N/A'}`,
          supplier: workflowSuppliers[0]?.name ?? 'N/A',
          explanationPoints: approvalDetails.map((a) => `${a.approver}: ${a.reason} (${a.rule})`),
          risks: {
            financial: workflowSuppliers[0]?.riskScore ?? 20,
            operational: 15,
            esg: 100 - (workflowSuppliers[0]?.esgScore ?? 50),
            geopolitical: workflowSuppliers[0]?.accessibility === 'restricted' ? 60 : 10,
          },
          costValue: result.request.budget_amount ? Math.min(Math.round((result.request.budget_amount / 500000) * 100), 100) : 50,
          benefitValue: workflowSuppliers[0]?.qualityScore ?? 70,
          status: 'pending',
        });
      } else {
        setNotifications(result.ui.notifications);
      }
      setFocusPoint(workflowSuppliers[0] ? { lat: workflowSuppliers[0].lat, lng: workflowSuppliers[0].lng } : null);
      setPhase('results');

      saveHistoryEntry({
        id: result.session_id,
        timestamp: Date.now(),
        requestText: message,
        category: result.request.category_l2 || result.request.category_l1 || '',
        status: 'completed',
        supplierCount: workflowSuppliers.length,
        topSupplier: workflowSuppliers[0]?.name ?? null,
      });

      const blockingCount = result.engine_output?.escalations.filter((item) => item.blocking).length ?? 0;
      return {
        reply: `${result.ui.summary} ${blockingCount} blocking escalation${blockingCount==1?"":"s"}`,
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
        ? `Order to ${supplier.name} confirmed`
        : `Order to ${supplier.name} requires review`,
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

  const handleClarificationDecision = useCallback((item: RequesterClarificationItem, decision: 'approved' | 'denied') => {
    setClarificationDecisions((prev) => ({
      ...prev,
      [item.rule]: {
        decision,
        field: item.field,
      },
    }));
    setNextNotifId((prev) => {
      const notifId = prev;
      setNotifications((current) => [
        {
          id: notifId,
          type: decision === 'approved' ? 'approved' : 'rejected',
          message: `${decision === 'approved' ? 'Requester approved' : 'Requester denied'}: ${item.field}`,
          time: 'Just now',
        },
        ...current,
      ]);
      return prev + 1;
    });
  }, []);

  const persistState = useCallback(() => {
    saveChatState({
      phase, sessionId, workflow, suppliers, top10, focusPoint,
      notifications, nextNotifId, consignments, chatMessages, clarificationDecisions,
    });
  }, [phase, sessionId, workflow, suppliers, top10, focusPoint, notifications, nextNotifId, consignments, chatMessages, clarificationDecisions]);

  const clarificationItems = workflow?.engine_output?.recommendation?.clarifications_needed ?? [];
  const unresolvedClarifications = clarificationItems.filter((item) => !clarificationDecisions[item.rule]);
  const deniedClarifications = clarificationItems.filter((item) => clarificationDecisions[item.rule]?.decision === 'denied');
  const requesterClarificationPending = unresolvedClarifications.length > 0;
  const requesterClarificationDenied = deniedClarifications.length > 0;

  const requiresApproval = (workflow?.engine_output?.escalations ?? []).some(e => !e.blocking && e.escalate_to && e.escalate_to !== 'Requester Clarification');

  const handleQuickOrder = useCallback(async () => {
    const supplier = top10[0];
    if (!supplier || supplier.accessibility === 'restricted') return;
    if (requesterClarificationDenied || requesterClarificationPending || requiresApproval) {
      setSelectedSupplier(supplier);
      setFocusPoint({ lat: supplier.lat, lng: supplier.lng });
      return;
    }
    await placeOrder();
    addNotification(supplier, 'success');
    handleOrderSuccess(supplier);
  }, [top10, requesterClarificationDenied, requesterClarificationPending, requiresApproval, addNotification, handleOrderSuccess]);

  return (
    <div
      className="relative h-screen w-screen overflow-hidden bg-[radial-gradient(circle_at_top,#19324f_0%,#07111d_42%,#02060b_100%)]"
    >
      {phase === 'chat' && (
        <>
          <button onClick={() => navigate('/portal')} className="absolute left-4 top-4 z-50 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <RequestHistory onSelect={(_entry: HistoryEntry) => {
            // Pre-fill the chat with the previous request text — user can re-submit
          }} />
        </>
      )}

      {phase !== 'chat' && (
        <header className="absolute left-0 right-0 top-0 z-40 flex h-12 items-center justify-between border-b border-border bg-black/70 px-4 text-white backdrop-blur">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/portal')} className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <ProqAILogo />
          </div>
          <NotificationBell notifications={notifications} />
        </header>
      )}

      <ChatInterface
        minimized={phase !== 'chat'}
        onSubmit={handleSubmit}
        phase={phase}
        loading={showAnalysis}
        chatPlaceholder={chatPlaceholder}
        onMessagesChange={setChatMessages}
        initialMessages={restored?.chatMessages ? (restored.chatMessages as Message[]) : undefined}
        onQuickOrder={phase === 'results' && top10[0] ? handleQuickOrder : undefined}
        quickOrderLabel={top10[0] ? `Order from ${top10[0].name}` : undefined}
      />

      {phase !== 'chat' && (
        <div className="absolute inset-0 flex flex-col md:flex-row min-h-0 pt-12">
          <div className="relative h-[40vh] md:h-full min-h-0 w-full md:w-[55%]">
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
              quantity={workflow?.request.quantity ?? null}
              onOrderPlaced={addNotification}
              onOrderSuccess={handleOrderSuccess}
              requesterClarificationPending={requesterClarificationPending}
              requesterClarificationDenied={requesterClarificationDenied}
              requiresApproval={requiresApproval}
            />
            <TrackingCard
              consignment={selectedConsignment}
              onClose={() => setSelectedConsignment(null)}
            />
          </div>
          <div className="h-[60vh] md:h-full min-h-0 w-full md:w-[45%]">
            <SupplierPanel
              suppliers={top10}
              loading={showAnalysis}
              onSelect={handleSupplierSelect}
              workflow={workflow}
              clarificationDecisions={clarificationDecisions}
              onClarificationDecision={handleClarificationDecision}
            />
          </div>
        </div>
      )}

      {phase !== 'chat' && (
        <AuditButton
          role="procurement"
          onBeforeNavigate={persistState}
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
          <p className="mb-1 text-xs font-semibold text-secondary">Attention</p>
          <p className="mb-3 text-lg font-semibold text-foreground">This request requires approval</p>
          <p className="mb-5 text-sm text-muted-foreground">
            The engine found policy checks that did not auto-pass. Each pending approval shows the rule and the reason.
          </p>
          <div className="mb-5 space-y-3">
            {approvalPopupApprovals.map((approval) => (
              <div key={`${approval.rule}-${approval.approver}`} className="rounded-lg border border-amber-400/30 bg-amber-500/10 p-3">
                <p className="text-xs font-semibold tracking-widest text-amber-100">To be approved by: {approval.approver}</p>
                <p className="mt-1 text-sm text-foreground">{approval.reason}</p>
                <p className="mt-2 text-[11px] tracking-widest text-amber-200/80">Rule {approval.rule}</p>
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
