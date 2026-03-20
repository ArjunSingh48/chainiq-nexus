import { Supplier, placeOrder, restrictedRegions } from '@/data/suppliers';
import { AlertTriangle, BadgeCheck, Clock3, Rocket, Star, X } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/utils';

interface Props {
  supplier: Supplier | null;
  onClose: () => void;
  quantity?: number | null;
  regulatoryEnabled?: boolean;
  requiresApproval?: boolean;
  requesterClarificationPending?: boolean;
  requesterClarificationDenied?: boolean;
  onOrderPlaced?: (supplier: Supplier, status: 'success' | 'pending') => void;
  onOrderSuccess?: (supplier: Supplier) => void;
}

const SupplierCard = ({
  supplier,
  onClose,
  quantity = null,
  regulatoryEnabled = false,
  requiresApproval = false,
  requesterClarificationPending = false,
  requesterClarificationDenied = false,
  onOrderPlaced,
  onOrderSuccess,
}: Props) => {
  const [orderResult, setOrderResult] = useState<'success' | 'pending' | null>(null);
  const [ordering, setOrdering] = useState(false);
  const [showRegulatoryWarning, setShowRegulatoryWarning] = useState(false);
  const [showApprovalWarning, setShowApprovalWarning] = useState(false);
  const [showRequesterClarificationWarning, setShowRequesterClarificationWarning] = useState(false);

  if (!supplier) return null;

  const isRestrictedRegion = restrictedRegions.includes(supplier.countryCode);
  const recommendationSignals = [
    supplier.incumbent ? { label: 'Incumbent', icon: BadgeCheck, tone: 'text-sky-200 bg-sky-500/10 border-sky-400/30' } : null,
    supplier.standardLeadTimeDays != null ? { label: `${supplier.standardLeadTimeDays}d standard`, icon: Clock3, tone: 'text-slate-100 bg-white/5 border-white/10' } : null,
    supplier.expeditedLeadTimeDays != null ? { label: `${supplier.expeditedLeadTimeDays}d expedited`, icon: Rocket, tone: 'text-emerald-200 bg-emerald-500/10 border-emerald-400/30' } : null,
    supplier.preferred ? { label: 'Preferred', icon: Star, tone: 'text-amber-200 bg-amber-500/10 border-amber-400/30' } : null,
  ].filter(Boolean) as Array<{ label: string; icon: typeof Star; tone: string }>;

  const handleOrder = async () => {
    if (regulatoryEnabled && isRestrictedRegion) {
      setShowRegulatoryWarning(true);
      return;
    }
    if (requesterClarificationDenied) {
      setShowRequesterClarificationWarning(true);
      return;
    }
    if (requesterClarificationPending) {
      setShowRequesterClarificationWarning(true);
      return;
    }
    if (requiresApproval) {
      setShowApprovalWarning(true);
      return;
    }
    setOrdering(true);
    await placeOrder();
    setOrderResult('success');
    setOrdering(false);
    onOrderPlaced?.(supplier, 'success');
    onOrderSuccess?.(supplier);
  };

  const handleApprovalConfirm = () => {
    setShowApprovalWarning(false);
    setOrderResult('pending');
    onOrderPlaced?.(supplier, 'pending');
  };

  const handleRegulatoryConfirm = async () => {
    setShowRegulatoryWarning(false);
    setOrderResult('pending');
    onOrderPlaced?.(supplier, 'pending');
  };

  const handleOrderModalClose = (open: boolean) => {
    if (!open) {
      setOrderResult(null);
    }
  };

  const statusColor = supplier.accessibility === 'restricted' ? 'text-destructive' : 'text-accent';
  const valueLabel = supplier.totalPrice != null
    ? formatCurrency(supplier.totalPrice, 'EUR')
    : supplier.unitPrice != null
      ? formatCurrency(supplier.unitPrice, 'EUR')
      : 'n/a';
  const orderValueTitle = quantity != null && supplier.unitPrice != null
    ? `${quantity} × ${formatCurrency(supplier.unitPrice, 'EUR')}`
    : undefined;

  const metricCards = [
    { label: 'ESG', value: supplier.esgScore, valueClass: 'text-accent' },
    { label: 'Quality', value: supplier.qualityScore, valueClass: 'text-secondary' },
    { label: 'Risk', value: supplier.riskScore, valueClass: 'text-destructive' },
  ];

  return (
    <>
      <div className="absolute top-4 left-4 right-4 md:left-auto md:right-4 z-[60] w-auto md:w-80 glass-card rounded-xl p-5 animate-scale-in shadow-2xl">
        <button onClick={onClose} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-4 h-4" />
        </button>
        <div className="mb-1 flex items-center gap-2 pr-6">
          <h3 className="text-lg font-bold text-foreground">{supplier.name}</h3>
          {supplier.policyCompliant === false && (
            <AlertTriangle className="h-4 w-4 text-amber-300" aria-label="Policy warning" />
          )}
        </div>
        <p className="mb-3 text-sm text-muted-foreground">{supplier.country}</p>
        <div className="mb-4 grid grid-cols-2 gap-2 text-sm">
          <div className="glass-card rounded-md p-2 text-center">
            <p className="text-xs text-muted-foreground">Status</p>
            <p className={`font-bold capitalize ${statusColor}`}>{supplier.accessibility}</p>
          </div>
          <div className="glass-card rounded-md p-2 text-center">
            <p className="text-xs text-muted-foreground">Order value</p>
            <p className="font-bold text-foreground" title={orderValueTitle}>{valueLabel}</p>
          </div>
        </div>
        <div className="mb-4 grid grid-cols-3 gap-2 text-sm">
          {metricCards.map((metric) => (
            <div key={metric.label} className="glass-card rounded-md p-2 text-center">
              <p className="text-xs text-muted-foreground">{metric.label}</p>
              <p className={`font-bold ${metric.valueClass}`}>{metric.value ?? 'n/a'}</p>
            </div>
          ))}
        </div>
        {supplier.accessibility === 'restricted' && (
          <div className="mb-3 rounded-lg border border-destructive/30 bg-destructive/15 p-2 text-center text-xs font-medium text-destructive">
            Supplier was excluded or is not currently actionable.
          </div>
        )}
        {supplier.policyCompliant === false && (
          <div className="mb-3 rounded-lg border border-amber-400/30 bg-amber-500/10 p-2 text-center text-xs font-medium text-amber-100">
            Policy warning: this supplier did not pass all checks.
          </div>
        )}
        {supplier.pricingMessage && (
          <div className="mb-3 rounded-lg border border-slate-400/20 bg-slate-500/10 p-2 text-center text-xs font-medium text-slate-200">
            {supplier.pricingMessage}
          </div>
        )}
        {recommendationSignals.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {recommendationSignals.map((signal) => {
              const Icon = signal.icon;
              return (
                <div
                  key={signal.label}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${signal.tone}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{signal.label}</span>
                </div>
              );
            })}
          </div>
        )}
        <button onClick={handleOrder} disabled={ordering || supplier.accessibility === 'restricted'} className="w-full whitespace-nowrap rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/80 disabled:opacity-50">
            {ordering ? 'Placing...' : requesterClarificationDenied ? 'Request Denied' : requesterClarificationPending ? 'Awaiting Input' : requiresApproval ? 'Send for Review' : (regulatoryEnabled && isRestrictedRegion) ? 'Send for Review' : 'Place Order'}
        </button>
      </div>

      <Dialog open={showRegulatoryWarning} onOpenChange={setShowRegulatoryWarning}>
        <DialogContent className="glass-card border-border py-8 text-center">
          <p className="mb-3 text-lg font-semibold text-foreground">Regulatory Constraint</p>
          <p className="mb-4 text-sm text-muted-foreground">
            This order would need manual review because the supplier region is flagged by the UI constraint layer.
          </p>
          <button onClick={handleRegulatoryConfirm} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80">
            Acknowledge and Escalate
          </button>
        </DialogContent>
      </Dialog>

      <Dialog open={showApprovalWarning} onOpenChange={setShowApprovalWarning}>
        <DialogContent className="glass-card border-border py-8 text-center">
          <p className="mb-3 text-lg font-semibold text-foreground">Supervisor Approval Required</p>
          <p className="mb-4 text-sm text-muted-foreground">
            This order requires supervisor approval before it can be awarded. Submit for review?
          </p>
          <button onClick={handleApprovalConfirm} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80">
            Submit for Review
          </button>
        </DialogContent>
      </Dialog>

      <Dialog open={showRequesterClarificationWarning} onOpenChange={setShowRequesterClarificationWarning}>
        <DialogContent className="glass-card border-border py-8 text-center">
          <p className="mb-3 text-lg font-semibold text-foreground">
            {requesterClarificationDenied ? 'Requester Declined' : 'Requester Decision Required'}
          </p>
          <p className="mb-4 text-sm text-muted-foreground">
            {requesterClarificationDenied
              ? 'This request cannot proceed because the requester denied the clarification. Start a new request or adjust the inputs.'
              : 'Resolve the "Needed From Requester" item in the side panel before placing the order.'}
          </p>
          <button onClick={() => setShowRequesterClarificationWarning(false)} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80">
            Understood
          </button>
        </DialogContent>
      </Dialog>

      <Dialog open={orderResult !== null} onOpenChange={handleOrderModalClose}>
        <DialogContent className="glass-card border-border py-10 text-center">
          {orderResult === 'success' ? (
            <p className="text-lg font-semibold text-foreground">Order placed successfully</p>
          ) : (
            <p className="text-lg font-semibold text-foreground">Order sent for review</p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SupplierCard;
