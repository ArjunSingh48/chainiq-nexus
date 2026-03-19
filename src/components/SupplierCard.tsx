import { Supplier, placeOrder, restrictedRegions } from '@/data/suppliers';
import { X } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Props {
  supplier: Supplier | null;
  onClose: () => void;
  regulatoryEnabled?: boolean;
  onOrderPlaced?: (supplier: Supplier, status: 'success' | 'pending') => void;
}

const recommendations = [
  'Strong price competitiveness across product categories',
  'Average lead time 30% below industry standard',
  'Full ESG compliance with ISO 14001 certification',
  'Consistent on-time delivery (98.5% record)',
];

const SupplierCard = ({ supplier, onClose, regulatoryEnabled = false, onOrderPlaced }: Props) => {
  const [showReason, setShowReason] = useState(false);
  const [orderResult, setOrderResult] = useState<'success' | 'pending' | null>(null);
  const [ordering, setOrdering] = useState(false);
  const [showRegulatoryWarning, setShowRegulatoryWarning] = useState(false);

  if (!supplier) return null;

  const isRestrictedRegion = restrictedRegions.includes(supplier.countryCode);

  const handleOrder = async () => {
    if (regulatoryEnabled && isRestrictedRegion) {
      setShowRegulatoryWarning(true);
      return;
    }
    setOrdering(true);
    const result = await placeOrder();
    setOrderResult(result.status);
    setOrdering(false);
    onOrderPlaced?.(supplier, result.status);
  };

  const handleRegulatoryConfirm = async () => {
    setShowRegulatoryWarning(false);
    setOrderResult('pending');
    onOrderPlaced?.(supplier, 'pending');
  };

  const statusColor = supplier.accessibility === 'restricted' ? 'text-destructive' : 'text-accent';

  return (
    <>
      <div className="absolute top-4 right-4 z-[60] w-80 glass-card rounded-xl p-5 animate-scale-in shadow-2xl">
        <button onClick={onClose} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-4 h-4" />
        </button>
        <h3 className="text-lg font-bold text-foreground mb-1">{supplier.name}</h3>
        <p className="text-sm text-muted-foreground mb-3">{supplier.country}</p>
        <div className="grid grid-cols-2 gap-2 text-sm mb-4">
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
            <p className="font-bold text-accent">{supplier.esgScore}</p>
          </div>
          <div className="glass-card rounded-md p-2 text-center">
            <p className="text-xs text-muted-foreground">Confidence</p>
            <p className="font-bold text-secondary">{supplier.confidenceScore}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowReason(true)} className="flex-1 text-xs py-2 px-3 rounded-lg bg-muted hover:bg-muted/70 text-foreground transition-colors font-medium">
            Recommendation
          </button>
          <button onClick={handleOrder} disabled={ordering} className="flex-1 text-xs py-2 px-3 rounded-lg bg-primary hover:bg-primary/80 text-primary-foreground transition-colors font-medium disabled:opacity-50">
            {ordering ? 'Placing…' : 'Place Order'}
          </button>
        </div>
      </div>

      <Dialog open={showReason} onOpenChange={setShowReason}>
        <DialogContent className="glass-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Recommendation: {supplier.name}</DialogTitle>
          </DialogHeader>
          <ul className="space-y-2">
            {recommendations.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-accent mt-0.5">✓</span>
                {r}
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>

      <Dialog open={showRegulatoryWarning} onOpenChange={setShowRegulatoryWarning}>
        <DialogContent className="glass-card border-border text-center py-8">
          <p className="text-4xl mb-3">⚠️</p>
          <p className="text-lg font-semibold text-foreground mb-2">Regulatory Constraint</p>
          <p className="text-sm text-muted-foreground mb-4">
            You may be restricted from ordering from this region due to regulatory constraints. Escalating to senior procurement officer.
          </p>
          <button onClick={handleRegulatoryConfirm} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/80 transition-colors">
            Acknowledge & Escalate
          </button>
        </DialogContent>
      </Dialog>

      <Dialog open={orderResult !== null} onOpenChange={() => setOrderResult(null)}>
        <DialogContent className="glass-card border-border text-center py-10">
          {orderResult === 'success' ? (
            <>
              <p className="text-4xl mb-3">✅</p>
              <p className="text-lg font-semibold text-foreground">Order placed successfully</p>
            </>
          ) : (
            <>
              <p className="text-4xl mb-3">⚠️</p>
              <p className="text-lg font-semibold text-foreground">Order sent for review</p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SupplierCard;
