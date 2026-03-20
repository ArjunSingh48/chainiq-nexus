import { useState } from 'react';
import { Supplier } from '@/data/suppliers';
import { Skeleton } from '@/components/ui/skeleton';
import type { PolicyTraceEntry, WorkflowResponse } from '@/lib/workflow';
import { AlertTriangle, Star } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Dialog, DialogContent } from '@/components/ui/dialog';

type ClarificationItem = {
  field: string;
  rule: string;
  escalate_to: string;
};
type ClarificationDecision = {
  decision: 'approved' | 'denied';
  field: string;
};

interface Props {
  suppliers: Supplier[];
  loading: boolean;
  onSelect: (supplier: Supplier) => void;
  workflow?: WorkflowResponse | null;
  clarificationDecisions?: Record<string, ClarificationDecision>;
  onClarificationDecision?: (item: ClarificationItem, decision: 'approved' | 'denied') => void;
}

const flagUrl = (code: string) => `https://flagcdn.com/24x18/${code.toLowerCase()}.png`;

const formatMoney = (amount: number | null | undefined, currency: string) => {
  if (amount == null) return 'n/a';
  return formatCurrency(amount, currency);
};

const traceToneMap: Record<PolicyTraceEntry['status'], string> = {
  passed: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100',
  failed: 'border-red-400/30 bg-red-500/10 text-red-100',
  needs_approval: 'border-amber-400/30 bg-amber-500/10 text-amber-100',
  warning: 'border-orange-400/30 bg-orange-500/10 text-orange-100',
};

const traceLabelMap: Record<PolicyTraceEntry['status'], string> = {
  passed: 'Passed',
  failed: 'Failed',
  needs_approval: 'Needs approval',
  warning: 'Warning',
};

const SupplierPanel = ({ suppliers, loading, onSelect, workflow, clarificationDecisions = {}, onClarificationDecision }: Props) => {
  const [selectedClarification, setSelectedClarification] = useState<ClarificationItem | null>(null);
  const recommendation = workflow?.engine_output?.recommendation;
  const validation = workflow?.engine_output?.validation;
  const policyTrace = workflow?.engine_output?.policy_trace ?? [];
  const request = workflow?.request;
  const clarificationItems = recommendation?.clarifications_needed ?? [];
  const pendingClarifications = clarificationItems.filter((item) => !clarificationDecisions[item.rule]);
  const approvedClarifications = clarificationItems.filter((item) => clarificationDecisions[item.rule]?.decision === 'approved');
  const deniedClarifications = clarificationItems.filter((item) => clarificationDecisions[item.rule]?.decision === 'denied');
  const nonRequesterApprovals = (workflow?.engine_output?.escalations ?? []).filter(
    (item) => !item.blocking && item.escalate_to && item.escalate_to !== 'Requester Clarification',
  );
  const effectiveRecommendationStatus = deniedClarifications.length > 0
    ? 'request_denied'
    : pendingClarifications.length > 0
      ? recommendation?.status
      : recommendation?.status === 'needs_clarification'
        ? (nonRequesterApprovals.length > 0 ? 'pending_approval' : 'ready_to_award')
        : recommendation?.status;
  const effectiveRecommendationReason = deniedClarifications.length > 0
    ? 'Requester denied the clarification required to continue sourcing.'
    : pendingClarifications.length > 0
      ? recommendation?.reason
      : recommendation?.status === 'needs_clarification'
        ? approvedClarifications.length === 1
          ? 'Requester approved the clarification. The request can continue.'
          : 'Requester approved all required clarifications. The request can continue.'
        : recommendation?.reason ?? recommendation?.rationale;

  const passedCount = policyTrace.filter((entry) => entry.status === 'passed').length;
  const failedCount = policyTrace.filter((entry) => entry.status === 'failed').length;
  const approvalCount = policyTrace.filter((entry) => entry.status === 'needs_approval').length;

  return (
    <div className="flex h-full min-h-0 flex-col border-l border-white/10 bg-slate-950/88 shadow-2xl shadow-black/20">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="border-b border-white/10 p-4 pb-2">
        {request && (
          <div className="space-y-3 text-sm">
            <div className="rounded-lg border border-white/10 bg-slate-900/92 p-3">
              <p className="float-right inline text-xs text-slate-400">Request</p>
              <p className="mt-1 font-semibold text-slate-50">{request.category_l2}</p>
              <p className="text-slate-300">
                Qty {request.quantity ?? 'n/a'} · {formatMoney(request.budget_amount, request.currency)} ·{' '}
                {request.delivery_countries.map((cc) => (
                  <span key={cc} className="mr-1 inline-flex items-center gap-1">
                    {cc}
                    <img src={flagUrl(cc)} alt={cc} className="inline h-4 w-5 rounded-sm object-cover saturate-[.75]" />
                  </span>
                ))}
              </p>
            </div>
            {recommendation && (
              <div className="rounded-lg border border-white/10 bg-slate-900/92 p-3">
                <p className="float-right inline text-xs text-slate-400">Recommendation</p>
                  <p className="mt-1 font-semibold capitalize text-slate-50">{effectiveRecommendationStatus?.split('_').join(' ')}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-300">{effectiveRecommendationReason}</p>
                  {clarificationItems.length > 0 && (
                    <div className="mt-3 rounded-lg border border-sky-400/30 bg-sky-500/10 p-3">
                      <p className="text-xs font-medium text-sky-200">Needed from requester</p>
                      <div className="mt-2 space-y-2">
                        {clarificationItems.map((item) => {
                          const decision = clarificationDecisions[item.rule];
                          const isPending = !decision;
                          const tone = isPending
                            ? 'border-white/10 bg-white/5'
                            : decision.decision === 'approved'
                              ? 'border-emerald-400/30 bg-emerald-500/10'
                              : 'border-red-400/30 bg-red-500/10';

                          return (
                            <button
                              key={`${item.rule}-${item.field}`}
                              type="button"
                              onClick={() => isPending && setSelectedClarification(item)}
                              className={`w-full rounded-md border px-2 py-2 text-left transition-colors ${tone} ${isPending ? 'hover:bg-white/10' : 'cursor-default'}`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <p className="text-xs font-medium text-slate-100">{item.field}</p>
                                <span className="shrink-0 text-[10px] text-sky-200/80">
                                  {decision ? decision.decision : 'Review'}
                                </span>
                              </div>
                              <p className="mt-1 text-[11px] text-sky-200/80">Rule {item.rule}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
            )}
            {validation && validation.issues_detected.length > 0 && (
              <div className="rounded-lg border border-amber-400/40 bg-amber-500/15 p-3">
                <p className="text-xs font-medium text-amber-100">Validation</p>
                <p className="mt-1 text-xs leading-5 text-amber-50">{validation.issues_detected[0].description}</p>
              </div>
            )}
            {policyTrace.length > 0 && (
              <div className="rounded-lg border border-white/10 bg-slate-900/92 p-3">
                <p className="float-right inline text-xs text-slate-400">Policy trace</p>
                <p className="mt-1 text-xs text-slate-300">
                  Passed {passedCount} · Needs approval {approvalCount} · Failed {failedCount}
                </p>
                <div className="mt-3 max-h-64 space-y-2 overflow-y-auto pr-1">
                  {policyTrace.map((entry) => (
                    <div key={entry.id} className={`rounded-lg border p-3 ${traceToneMap[entry.status]}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold">{entry.title}</p>
                          <p className="mt-1 text-sm font-medium">{entry.summary}</p>
                        </div>
                        <span className="rounded-full border border-current/30 px-2 py-0.5 text-[10px] font-semibold">
                          {traceLabelMap[entry.status]}
                        </span>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-current/90">{entry.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
          <h3 className="mt-3 text-xs font-bold tracking-[0.18em] text-slate-300">SHORTLIST</h3>
        </div>
        <div className="space-y-2 p-3">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-white/10 bg-slate-900/92 p-3 space-y-2">
              <Skeleton className="h-4 w-3/4 bg-slate-700" />
              <div className="flex gap-4">
                <Skeleton className="h-3 w-16 bg-slate-700" />
                <Skeleton className="h-3 w-16 bg-slate-700" />
              </div>
            </div>
          ))
        ) : (
          suppliers.map((s, i) => (
            <button
              key={s.id}
              onClick={() => onSelect(s)}
              className="group w-full rounded-lg border border-white/10 bg-slate-900/92 p-3 text-left [contain:paint] transition-colors duration-150 hover:border-slate-500 hover:bg-slate-900/98"
            >
              <div className="mb-1 flex items-center gap-2">
                <span className="text-xs font-bold text-primary">#{i + 1}</span>
                <img src={flagUrl(s.countryCode)} alt={s.country} className="h-4 w-5 rounded-sm object-cover saturate-[.75]" />
                <span className="text-sm font-semibold text-slate-50 group-hover:text-primary">{s.name}</span>
                {s.policyCompliant === false && (
                  <AlertTriangle className="h-4 w-4 text-amber-300" aria-label="Policy warning" />
                )}
                {(s.preferred || s.confidencePct != null) && (
                  <div className="ml-auto flex shrink-0 items-center gap-1.5">
                    {s.preferred && (
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-amber-400/30 bg-amber-500/10 text-amber-200">
                        <Star className="h-3 w-3 fill-current" />
                      </span>
                    )}
                    {s.confidencePct != null && (
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold tabular-nums ${
                        s.confidencePct >= 80
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : s.confidencePct >= 50
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-red-500/20 text-red-300'
                      }`}>
                        {s.confidencePct.toFixed(1)}%
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="mt-2 text-xs text-slate-300">
                Unit price: <span className="font-medium text-slate-100">{formatMoney(s.unitPrice, workflow?.request.currency ?? '')}</span>
              </div>
            </button>
          ))
        )}
        </div>
      </div>
      <Dialog open={selectedClarification !== null} onOpenChange={(open) => !open && setSelectedClarification(null)}>
        <DialogContent className="glass-card border-border py-8">
          {selectedClarification && (
            <>
              <p className="mb-1 text-xs font-semibold text-secondary">Requester decision</p>
              <p className="mb-3 text-lg font-semibold text-foreground">Resolve clarification</p>
              <div className="rounded-lg border border-sky-400/30 bg-sky-500/10 p-3">
                <p className="text-sm text-slate-100">{selectedClarification.field}</p>
                <p className="mt-2 text-[11px] text-sky-200/80">Rule {selectedClarification.rule}</p>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Approving accepts the exception and lets the request continue. Denying keeps the request blocked.
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onClarificationDecision?.(selectedClarification, 'denied');
                    setSelectedClarification(null);
                  }}
                  className="flex-1 rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/80"
                >
                  Deny
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClarificationDecision?.(selectedClarification, 'approved');
                    setSelectedClarification(null);
                  }}
                  className="flex-1 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/80"
                >
                  Approve
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupplierPanel;
