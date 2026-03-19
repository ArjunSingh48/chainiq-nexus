import { X } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export interface Consignment {
  id: string;
  supplierName: string;
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  startTime: number;
}

interface Props {
  consignment: Consignment | null;
  onClose: () => void;
}

const TrackingCard = ({ consignment, onClose }: Props) => {
  if (!consignment) return null;

  const elapsed = (Date.now() - consignment.startTime) / 1000;
  const progress = Math.min(((elapsed % 20) / 20) * 100, 100);

  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-[60] w-80 glass-card rounded-xl p-5 animate-scale-in shadow-2xl">
      <button onClick={onClose} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors">
        <X className="w-4 h-4" />
      </button>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">📦</span>
        <h3 className="text-sm font-bold text-foreground">Consignment Tracking</h3>
      </div>
      <p className="text-sm text-foreground mb-1">
        Order placed with <span className="font-semibold">{consignment.supplierName}</span>
      </p>
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-block w-2 h-2 rounded-full bg-accent animate-pulse" />
        <span className="text-xs font-medium text-accent">In Transit</span>
      </div>
      <div className="mb-2">
        <Progress value={progress} className="h-2" />
      </div>
      <p className="text-xs text-muted-foreground">Estimated delivery: ~2 days</p>
    </div>
  );
};

export default TrackingCard;
