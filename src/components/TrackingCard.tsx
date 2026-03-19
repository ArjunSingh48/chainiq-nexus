import { X, MapPin, Package, Clock, Truck } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export interface Consignment {
  id: string;
  supplierName: string;
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  originCity: string;
  originCountry: string;
  orderId: string;
  units: number;
  startTime: number;
}

interface Props {
  consignment: Consignment | null;
  onClose: () => void;
}

const TrackingCard = ({ consignment, onClose }: Props) => {
  if (!consignment) return null;

  const elapsed = (Date.now() - consignment.startTime) / 1000;
  const progress = Math.min(Math.round(((elapsed % 20) / 20) * 100), 100);

  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-[60] w-[340px] glass-card rounded-xl p-5 animate-scale-in shadow-2xl">
      <button onClick={onClose} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors">
        <X className="w-4 h-4" />
      </button>

      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Truck className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold text-foreground">Consignment Tracking</h3>
        <Badge variant="default" className="ml-auto text-[10px] px-2 py-0.5 bg-accent text-accent-foreground">
          In Transit
        </Badge>
      </div>

      {/* Shipment Info */}
      <div className="space-y-1.5 mb-4 text-xs text-foreground">
        <p>Supplier: <span className="font-semibold">{consignment.supplierName}</span></p>
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3 h-3 text-muted-foreground" />
          <span>{consignment.originCity}</span>
          <span className="text-muted-foreground mx-1">→</span>
          <span>Zurich, Switzerland</span>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
          <span>Shipment Progress</span>
          <span className="font-medium text-foreground">{progress}%</span>
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>

      {/* Details */}
      <div className="flex justify-between text-xs text-muted-foreground border-t border-border pt-3">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>~2 days</span>
        </div>
        <div className="flex items-center gap-1">
          <Package className="w-3 h-3" />
          <span>{consignment.units} laptops</span>
        </div>
        <span className="font-mono">#{consignment.orderId}</span>
      </div>
    </div>
  );
};

export default TrackingCard;
