import { Supplier } from '@/data/suppliers';
import { Skeleton } from '@/components/ui/skeleton';
import type { PolicyTraceEntry, WorkflowResponse } from '@/lib/workflow';
import { AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface Props {
  suppliers: Supplier[];
  loading: boolean;
  onSelect: (supplier: Supplier) => void;
  workflow?: WorkflowResponse | null;
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

const SupplierPanel = ({ suppliers, loading, onSelect, workflow }: Props) => {
  const recommendation = workflow?.engine_output?.recommendation;
  const validation = workflow?.engine_output?.validation;
  const policyTrace = workflow?.engine_output?.policy_trace ?? [];
  const request = workflow?.request;
  const clarificationItems = recommendation?.clarifications_needed ?? [];

  const passedCount = policyTrace.filter((entry) => entry.status === 'passed').length;
  const failedCount = policyTrace.filter((entry) => entry.status === 'failed').length;
  const approvalCount = policyTrace.filter((entry) => entry.status === 'needs_approval').length;

  return (
    <div className="glass-card flex h-full min-h-0 flex-col border-l border-white/10">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="border-b border-white/10 p-4 pb-2">
        {request && (
          <div className="space-y-3 text-sm">
            <div className="rounded-lg border border-white/10 bg-slate-900/92 p-3">
              <p className="text-xs uppercase tracking-widest text-slate-400 float-right inline">Request</p>
              <p className="mt-1 font-semibold text-slate-50">{request.category_l2}</p>
              <p className="text-slate-300">
                Qty {request.quantity ?? 'n/a'} · {formatMoney(request.budget_amount, request.currency)} ·{' '}
                {request.delivery_countries.map((cc) => (
                  <span key={cc} className="mr-1 inline-flex items-center gap-1">
                    {cc}
                    <img src={flagUrl(cc)} alt={cc} className="inline h-4 w-5 rounded-sm object-cover" />
                  </span>
                ))}
              </p>
            </div>
            {recommendation && (
              <div className="rounded-lg border border-white/10 bg-slate-900/92 p-3">
                <p className="text-xs uppercase tracking-widest text-slate-400 float-right inline">Recommendation</p>
                <p className="mt-1 font-semibold capitalize text-slate-50">{recommendation.status.split('_').join(' ')}</p>
                <p className="mt-1 text-xs leading-5 text-slate-300">{recommendation.reason ?? recommendation.rationale}</p>
                {clarificationItems.length > 0 && (
                  <div className="mt-3 rounded-lg border border-sky-400/30 bg-sky-500/10 p-3">
                    {clarificationItems.length === 1 ? (
                      <p className="text-xs leading-5 text-sky-100">
                        <span className="mr-2 uppercase tracking-widest text-sky-200">Needed From Requester</span>
                        <span className="ml-2 uppercase tracking-widest text-sky-200/80 float-right">Rule {clarificationItems[0].rule}</span><br></br>
                        <span className="font-medium text-slate-100">{clarificationItems[0].field}</span>
                      </p>
                    ) : (
                      <>
                        <p className="text-xs uppercase tracking-widest text-sky-200">Needed From Requester</p>
                        <div className="mt-2 space-y-2">
                          {clarificationItems.map((item) => (
                            <div key={`${item.rule}-${item.field}`} className="rounded-md border border-white/10 bg-white/5 px-2 py-2">
                              <p className="text-xs font-medium text-slate-100">{item.field}</p>
                              <p className="mt-1 text-[11px] uppercase tracking-widest text-sky-200/80">Rule {item.rule}</p>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
            {validation && validation.issues_detected.length > 0 && (
              <div className="rounded-lg border border-amber-400/40 bg-amber-500/15 p-3">
                <p className="text-xs uppercase tracking-widest text-amber-100">Validation</p>
                <p className="mt-1 text-xs leading-5 text-amber-50">{validation.issues_detected[0].description}</p>
              </div>
            )}
            {policyTrace.length > 0 && (
              <div className="rounded-lg border border-white/10 bg-slate-900/92 p-3">
                <p className="text-xs uppercase tracking-widest text-slate-400 float-right inline">Policy Trace</p>
                <p className="mt-1 text-xs text-slate-300">
                  Passed {passedCount} · Needs approval {approvalCount} · Failed {failedCount}
                </p>
                <div className="mt-3 max-h-64 space-y-2 overflow-y-auto pr-1">
                  {policyTrace.map((entry) => (
                    <div key={entry.id} className={`rounded-lg border p-3 ${traceToneMap[entry.status]}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-widest">{entry.title}</p>
                          <p className="mt-1 text-sm font-medium">{entry.summary}</p>
                        </div>
                        <span className="rounded-full border border-current/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest">
                          {traceLabelMap[entry.status]}
                        </span>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-current/90">{entry.detail}</p>
                      <p className="mt-2 text-[11px] uppercase tracking-widest text-current/70">
                        Rule {entry.rule}{entry.approver ? ` · ${entry.approver}` : ''}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
          <h3 className="mt-3 text-xs font-bold uppercase tracking-widest text-slate-300">Shortlist</h3>
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
              className="group w-full rounded-lg border border-white/10 bg-slate-900/92 p-3 text-left transition-all duration-200 hover:scale-[1.02] hover:border-slate-500 hover:bg-slate-900"
            >
              <div className="mb-1 flex items-center gap-2">
                <span className="text-xs font-bold text-primary">#{i + 1}</span>
                <img src={flagUrl(s.countryCode)} alt={s.country} className="h-4 w-5 rounded-sm object-cover" />
                <span className="text-sm font-semibold text-slate-50 transition-colors group-hover:text-primary">{s.name}</span>
                {s.policyCompliant === false && (
                  <AlertTriangle className="h-4 w-4 text-amber-300" aria-label="Policy warning" />
                )}
                {s.confidencePct != null && (
                  <span className={`ml-auto shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold tabular-nums ${
                    s.confidencePct >= 80
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : s.confidencePct >= 50
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-red-500/20 text-red-300'
                  }`}>
                    {s.confidencePct}%
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-300">
                <span>ESG: <span className="font-medium text-accent">{s.esgScore ?? 'n/a'}</span></span>
                <span>Quality: <span className="font-medium text-secondary">{s.qualityScore ?? 'n/a'}</span></span>
                <span>Risk: <span className="font-medium text-destructive">{s.riskScore ?? 'n/a'}</span></span>
                <span>Price: <span className="font-medium text-slate-100">{formatMoney(s.unitPrice, workflow?.request.currency ?? 'EUR')}</span></span>
              </div>
            </button>
          ))
        )}
        </div>
      </div>
    </div>
  );
};

export default SupplierPanel;
