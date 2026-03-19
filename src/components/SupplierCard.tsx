import { Supplier, placeOrder, restrictedRegions } from '@/data/suppliers';
import { X } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Props {
  supplier: Supplier | null;
  onClose: () => void;
  regulatoryEnabled?: boolean;
  requiresApproval?: boolean;
  onOrderPlaced?: (supplier: Supplier, status: 'success' | 'pending') => void;
  onOrderSuccess?: (supplier: Supplier) => void;
}

const SupplierCard = ({ supplier, onClose, regulatoryEnabled = false, requiresApproval = false, onOrderPlaced, onOrderSuccess }: Props) => {
  const [showReason, setShowReason] = useState(false);
  const [orderResult, setOrderResult] = useState<'success' | 'pending' | null>(null);
  const [ordering, setOrdering] = useState(false);
  const [showRegulatoryWarning, setShowRegulatoryWarning] = useState(false);
  const [showApprovalWarning, setShowApprovalWarning] = useState(false);

  if (!supplier) return null;

  const isRestrictedRegion = restrictedRegions.includes(supplier.countryCode);
  const recommendations = [
    supplier.recommendationNote,
    supplier.preferred ? 'Preferred supplier for this category.' : null,
    supplier.incumbent ? 'Incumbent supplier on this request.' : null,
    supplier.standardLeadTimeDays != null ? `Standard lead time: ${supplier.standardLeadTimeDays} days.` : null,
    supplier.expeditedLeadTimeDays != null ? `Expedited lead time: ${supplier.expeditedLeadTimeDays} days.` : null,
  ].filter(Boolean) as string[];

  const handleOrder = async () => {
    if (regulatoryEnabled && isRestrictedRegion) {
      setShowRegulatoryWarning(true);
      return;
    }
    if (requiresApproval) {
      setShowApprovalWarning(true);
      return;
    }
    setOrdering(true);
    const result = await placeOrder();
    setOrderResult(result.status);
    setOrdering(false);
    onOrderPlaced?.(supplier, result.status);
    if (result.status === 'success') {
      onOrderSuccess?.(supplier);
    }
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

  return (
    <>
      <div className="absolute top-4 right-4 z-[60] w-80 glass-card rounded-xl p-5 animate-scale-in shadow-2xl">
        <button onClick={onClose} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-4 h-4" />
        </button>
        <h3 className="mb-1 text-lg font-bold text-foreground">{supplier.name}</h3>
        <p className="mb-3 text-sm text-muted-foreground">{supplier.country}</p>
        <div className="mb-4 grid grid-cols-3 gap-2 text-sm">
          <div className="glass-card rounded-md p-2 text-center">
            <p className="text-xs text-muted-foreground">Rank</p>
            <p className="font-bold text-foreground">#{supplier.rank}</p>
          </div>
          <div className="glass-card rounded-md p-2 text-center">
            <p className="text-xs text-muted-foreground">Status</p>
            <p className={`font-bold capitalize ${statusColor}`}>{supplier.accessibility}</p>
          </div>
          <div className="glass-card rounded-md p-2 text-center">
            <p className="text-xs text-muted-foreground">ESG</p>
            <p className="font-bold text-accent">{supplier.esgScore ?? 'n/a'}</p>
          </div>
          <div className="glass-card rounded-md p-2 text-center">
            <p className="text-xs text-muted-foreground">Quality</p>
            <p className="font-bold text-secondary">{supplier.qualityScore ?? 'n/a'}</p>
          </div>
          <div className="glass-card rounded-md p-2 text-center">
            <p className="text-xs text-muted-foreground">Risk</p>
            <p className="font-bold text-destructive">{supplier.riskScore ?? 'n/a'}</p>
          </div>
          <div className="glass-card rounded-md p-2 text-center">
            <p className="text-xs text-muted-foreground">Unit Price</p>
            <p className="font-bold text-foreground">{supplier.unitPrice != null ? `EUR ${supplier.unitPrice}` : 'n/a'}</p>
          </div>
        </div>
        {supplier.totalPrice != null && (
          <div className="mb-3 rounded-lg border border-border bg-black/20 p-3 text-xs text-muted-foreground">
            Evaluated total: <span className="font-semibold text-foreground">EUR {supplier.totalPrice}</span>
          </div>
        )}
        {supplier.accessibility === 'restricted' && (
          <div className="mb-3 rounded-lg border border-destructive/30 bg-destructive/15 p-2 text-center text-xs font-medium text-destructive">
            Supplier was excluded or is not currently actionable.
          </div>
        )}
        <div className="flex gap-2">
          <button onClick={() => setShowReason(true)} className="flex-1 rounded-lg bg-muted px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted/70">
            Recommendation
          </button>
          <button onClick={handleOrder} disabled={ordering || supplier.accessibility === 'restricted'} className="flex-1 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/80 disabled:opacity-50">
            {ordering ? 'Placing...' : 'Place Order'}
          </button>
        </div>
      </div>

      <Dialog open={showReason} onOpenChange={setShowReason}>
        <DialogContent className="glass-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Recommendation: {supplier.name}</DialogTitle>
          </DialogHeader>
          <ul className="space-y-2">
            {recommendations.length > 0 ? recommendations.map((item, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-0.5 text-accent">+</span>
                {item}
              </li>
            )) : (
              <li className="text-sm text-muted-foreground">No additional recommendation details available.</li>
            )}
          </ul>
        </DialogContent>
      </Dialog>

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
