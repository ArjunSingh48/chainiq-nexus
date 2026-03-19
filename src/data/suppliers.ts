export interface Supplier {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  lat: number;
  lng: number;
  rank: number;
  accessibility: 'open' | 'restricted';
  esgScore: number | null;
  qualityScore: number | null;
  riskScore: number | null;
  unitPrice: number | null;
  totalPrice?: number | null;
  preferred?: boolean;
  incumbent?: boolean;
  policyCompliant?: boolean;
  standardLeadTimeDays?: number | null;
  expeditedLeadTimeDays?: number | null;
  recommendationNote?: string | null;
  confidencePct?: number | null;
}

export interface Notification {
  id: number;
  type: 'rejected' | 'approved' | 'pending';
  message: string;
  time: string;
}

export const defaultNotifications: Notification[] = [];

export const restrictedRegions = ['CN', 'RU', 'KP', 'IR', 'SY'];

export function getPointColor(supplier: Supplier, top10Ids: string[]): string {
  if (supplier.accessibility === 'restricted') return '#ef4444';
  if (top10Ids.includes(supplier.id)) return '#10b981';
  return '#3b82f6';
}

export function getTop10(list: Supplier[]): Supplier[] {
  return [...list]
    .filter((supplier) => supplier.accessibility === 'open')
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 10);
}

export function placeOrder(): Promise<{ status: 'success' | 'pending' }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ status: Math.random() > 0.5 ? 'success' : 'pending' });
    }, 1000);
  });
}
