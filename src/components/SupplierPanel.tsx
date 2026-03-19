import { Supplier } from '@/data/suppliers';
import { Skeleton } from '@/components/ui/skeleton';

interface Props {
  suppliers: Supplier[];
  loading: boolean;
  onSelect: (supplier: Supplier) => void;
}

const flagUrl = (code: string) => `https://flagcdn.com/24x18/${code.toLowerCase()}.png`;

const SupplierPanel = ({ suppliers, loading, onSelect }: Props) => {
  return (
    <div className="h-full flex flex-col glass-card border-l border-border">
      <div className="p-4 border-b border-border">
        <h2 className="text-sm font-bold uppercase tracking-widest text-foreground">Top 10 Suppliers</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="glass-card rounded-lg p-3 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <div className="flex gap-4">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))
        ) : (
          suppliers.map((s, i) => (
            <button
              key={s.id}
              onClick={() => onSelect(s)}
              className="w-full text-left glass-card rounded-lg p-3 hover:bg-muted/30 transition-all duration-200 hover:scale-[1.02] group"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-primary">#{i + 1}</span>
                <img src={flagUrl(s.countryCode)} alt={s.country} className="w-5 h-4 object-cover rounded-sm" />
                <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{s.name}</span>
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span>ESG: <span className="text-accent font-medium">{s.esgScore}</span></span>
                <span>Quality: <span className="text-secondary font-medium">{s.qualityScore}</span></span>
                <span>Risk: <span className="text-destructive font-medium">{s.riskScore}</span></span>
                <span>Price: <span className="text-foreground font-medium">${s.unitPrice}</span></span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default SupplierPanel;
