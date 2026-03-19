import { Supplier } from '@/data/suppliers';
import { Skeleton } from '@/components/ui/skeleton';
import type { WorkflowResponse } from '@/lib/workflow';

interface Props {
  suppliers: Supplier[];
  loading: boolean;
  onSelect: (supplier: Supplier) => void;
  workflow?: WorkflowResponse | null;
}

const flagUrl = (code: string) => `https://flagcdn.com/24x18/${code.toLowerCase()}.png`;

const formatMoney = (amount: number | null | undefined, currency: string) => {
  if (amount == null) return 'n/a';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(amount);
};

const SupplierPanel = ({ suppliers, loading, onSelect, workflow }: Props) => {
  const recommendation = workflow?.engine_output?.recommendation;
  const validation = workflow?.engine_output?.validation;
  const request = workflow?.request;

  return (
    <div className="glass-card flex h-full flex-col border-l border-white/10">
      <div className="border-b border-white/10 p-4">
        {request && (
          <div className="mt-3 space-y-3 text-sm">
            <div className="rounded-lg border border-white/10 bg-slate-900/92 p-3">
              <p className="text-xs uppercase tracking-widest text-slate-400">Request</p>
              <p className="mt-1 font-semibold text-slate-50">{request.category_l2}</p>
              <p className="text-slate-300">
                Qty {request.quantity ?? 'n/a'} · {formatMoney(request.budget_amount, request.currency)} · {request.delivery_countries.join(', ')}
              </p>
              <p className="mt-2 text-xs leading-5 text-slate-400">{request.request_text}</p>
            </div>
            {recommendation && (
              <div className="rounded-lg border border-white/10 bg-slate-900/92 p-3">
                <p className="text-xs uppercase tracking-widest text-slate-400">Recommendation</p>
                <p className="mt-1 font-semibold capitalize text-slate-50">{recommendation.status.replaceAll('_', ' ')}</p>
                <p className="mt-1 text-xs leading-5 text-slate-300">{recommendation.reason}</p>
              </div>
            )}
            {validation && validation.issues_detected.length > 0 && (
              <div className="rounded-lg border border-amber-400/40 bg-amber-500/15 p-3">
                <p className="text-xs uppercase tracking-widest text-amber-100">Validation</p>
                <p className="mt-1 text-xs leading-5 text-amber-50">{validation.issues_detected[0].description}</p>
              </div>
            )}
          </div>
        )}
        <h3 className="mt-4 text-xs font-bold uppercase tracking-widest text-slate-300">Shortlist</h3>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto p-3">
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
  );
};

export default SupplierPanel;
