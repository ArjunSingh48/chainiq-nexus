export interface Supplier {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  lat: number;
  lng: number;
  rank: number;
  accessibility: 'open' | 'restricted';
  esgScore: number;
  qualityScore: number;
  riskScore: number;
  unitPrice: number;
}

export interface Notification {
  id: number;
  type: 'rejected' | 'approved' | 'pending';
  message: string;
  time: string;
}

export const suppliers: Supplier[] = [
  { id: '1', name: 'Alpine Tech GmbH', country: 'Austria', countryCode: 'AT', lat: 48.2082, lng: 16.3738, rank: 5, accessibility: 'open', esgScore: 92, qualityScore: 88, riskScore: 12, unitPrice: 245 },
  { id: '2', name: 'OzSource Pty Ltd', country: 'Australia', countryCode: 'AU', lat: -35.2809, lng: 149.1300, rank: 18, accessibility: 'open', esgScore: 78, qualityScore: 82, riskScore: 22, unitPrice: 310 },
  { id: '3', name: 'BelgiTech NV', country: 'Belgium', countryCode: 'BE', lat: 50.8503, lng: 4.3517, rank: 12, accessibility: 'open', esgScore: 85, qualityScore: 79, riskScore: 18, unitPrice: 275 },
  { id: '4', name: 'SulTech Ltda', country: 'Brazil', countryCode: 'BR', lat: -15.7975, lng: -47.8919, rank: 25, accessibility: 'restricted', esgScore: 61, qualityScore: 65, riskScore: 45, unitPrice: 180 },
  { id: '5', name: 'MapleProcure Inc', country: 'Canada', countryCode: 'CA', lat: 45.4215, lng: -75.6972, rank: 3, accessibility: 'open', esgScore: 94, qualityScore: 91, riskScore: 8, unitPrice: 260 },
  { id: '6', name: 'SwissPrecision AG', country: 'Switzerland', countryCode: 'CH', lat: 46.9480, lng: 7.4474, rank: 1, accessibility: 'open', esgScore: 97, qualityScore: 96, riskScore: 5, unitPrice: 320 },
  { id: '7', name: 'DeutschWerk GmbH', country: 'Germany', countryCode: 'DE', lat: 52.5200, lng: 13.4050, rank: 2, accessibility: 'open', esgScore: 95, qualityScore: 93, riskScore: 7, unitPrice: 290 },
  { id: '8', name: 'IberiaSupply SL', country: 'Spain', countryCode: 'ES', lat: 40.4168, lng: -3.7038, rank: 15, accessibility: 'open', esgScore: 80, qualityScore: 76, riskScore: 25, unitPrice: 220 },
  { id: '9', name: 'FrancePro SAS', country: 'France', countryCode: 'FR', lat: 48.8566, lng: 2.3522, rank: 6, accessibility: 'open', esgScore: 90, qualityScore: 87, riskScore: 14, unitPrice: 255 },
  { id: '10', name: 'TechIndia Pvt Ltd', country: 'India', countryCode: 'IN', lat: 28.6139, lng: 77.2090, rank: 22, accessibility: 'restricted', esgScore: 58, qualityScore: 62, riskScore: 48, unitPrice: 145 },
  { id: '11', name: 'ItaliaParts SpA', country: 'Italy', countryCode: 'IT', lat: 41.9028, lng: 12.4964, rank: 8, accessibility: 'open', esgScore: 88, qualityScore: 84, riskScore: 16, unitPrice: 240 },
  { id: '12', name: 'NipponSource KK', country: 'Japan', countryCode: 'JP', lat: 35.6762, lng: 139.6503, rank: 4, accessibility: 'open', esgScore: 93, qualityScore: 90, riskScore: 9, unitPrice: 285 },
  { id: '13', name: 'MexiTrade SA', country: 'Mexico', countryCode: 'MX', lat: 19.4326, lng: -99.1332, rank: 28, accessibility: 'restricted', esgScore: 55, qualityScore: 58, riskScore: 52, unitPrice: 160 },
  { id: '14', name: 'DutchLogistics BV', country: 'Netherlands', countryCode: 'NL', lat: 52.3676, lng: 4.9041, rank: 7, accessibility: 'open', esgScore: 91, qualityScore: 89, riskScore: 11, unitPrice: 270 },
  { id: '15', name: 'PolskaParts Sp.', country: 'Poland', countryCode: 'PL', lat: 52.2297, lng: 21.0122, rank: 14, accessibility: 'open', esgScore: 82, qualityScore: 77, riskScore: 20, unitPrice: 195 },
  { id: '16', name: 'LisbonTech Lda', country: 'Portugal', countryCode: 'PT', lat: 38.7223, lng: -9.1393, rank: 19, accessibility: 'open', esgScore: 77, qualityScore: 74, riskScore: 28, unitPrice: 210 },
  { id: '17', name: 'SingaSource Pte', country: 'Singapore', countryCode: 'SG', lat: 1.3521, lng: 103.8198, rank: 9, accessibility: 'open', esgScore: 89, qualityScore: 92, riskScore: 10, unitPrice: 300 },
  { id: '18', name: 'GulfProcure LLC', country: 'UAE', countryCode: 'AE', lat: 24.4539, lng: 54.3773, rank: 20, accessibility: 'restricted', esgScore: 72, qualityScore: 70, riskScore: 35, unitPrice: 230 },
  { id: '19', name: 'BritishSupply Ltd', country: 'United Kingdom', countryCode: 'GB', lat: 51.5074, lng: -0.1278, rank: 10, accessibility: 'open', esgScore: 87, qualityScore: 86, riskScore: 13, unitPrice: 265 },
  { id: '20', name: 'AmeriSource Corp', country: 'United States', countryCode: 'US', lat: 38.9072, lng: -77.0369, rank: 11, accessibility: 'open', esgScore: 86, qualityScore: 85, riskScore: 15, unitPrice: 250 },
  { id: '21', name: 'CapeTech (Pty)', country: 'South Africa', countryCode: 'ZA', lat: -25.7479, lng: 28.2293, rank: 23, accessibility: 'restricted', esgScore: 64, qualityScore: 60, riskScore: 42, unitPrice: 175 },
  { id: '22', name: 'BerlinDigital AG', country: 'Germany', countryCode: 'DE', lat: 48.1351, lng: 11.5820, rank: 13, accessibility: 'open', esgScore: 83, qualityScore: 81, riskScore: 19, unitPrice: 280 },
  { id: '23', name: 'TokyoElec Co', country: 'Japan', countryCode: 'JP', lat: 34.6937, lng: 135.5023, rank: 16, accessibility: 'open', esgScore: 81, qualityScore: 78, riskScore: 21, unitPrice: 295 },
  { id: '24', name: 'ParisVendor SARL', country: 'France', countryCode: 'FR', lat: 43.2965, lng: 5.3698, rank: 17, accessibility: 'open', esgScore: 79, qualityScore: 75, riskScore: 24, unitPrice: 235 },
  { id: '25', name: 'MumbaiTrade Pvt', country: 'India', countryCode: 'IN', lat: 19.0760, lng: 72.8777, rank: 26, accessibility: 'restricted', esgScore: 56, qualityScore: 59, riskScore: 50, unitPrice: 140 },
  { id: '26', name: 'SaoPauloInd Ltda', country: 'Brazil', countryCode: 'BR', lat: -23.5505, lng: -46.6333, rank: 27, accessibility: 'restricted', esgScore: 54, qualityScore: 57, riskScore: 53, unitPrice: 155 },
  { id: '27', name: 'ChicagoParts LLC', country: 'United States', countryCode: 'US', lat: 41.8781, lng: -87.6298, rank: 21, accessibility: 'open', esgScore: 75, qualityScore: 73, riskScore: 27, unitPrice: 225 },
  { id: '28', name: 'ZurichPrecision', country: 'Switzerland', countryCode: 'CH', lat: 47.3769, lng: 8.5417, rank: 24, accessibility: 'open', esgScore: 70, qualityScore: 71, riskScore: 30, unitPrice: 305 },
  { id: '29', name: 'DubaiLogistics', country: 'UAE', countryCode: 'AE', lat: 25.2048, lng: 55.2708, rank: 29, accessibility: 'restricted', esgScore: 52, qualityScore: 55, riskScore: 55, unitPrice: 200 },
  { id: '30', name: 'JohannesburgTech', country: 'South Africa', countryCode: 'ZA', lat: -26.2041, lng: 28.0473, rank: 30, accessibility: 'restricted', esgScore: 50, qualityScore: 53, riskScore: 58, unitPrice: 165 },
];

export const defaultNotifications: Notification[] = [
  { id: 1, type: 'rejected', message: 'REJECTED: Supplier in conflict zone (Ukraine)', time: '2 min ago' },
  { id: 2, type: 'approved', message: 'APPROVED: Order #1234 confirmed', time: '15 min ago' },
  { id: 3, type: 'pending', message: 'PENDING: Budget approval required', time: '1 hour ago' },
];

export const restrictedRegions = ['CN', 'RU', 'KP', 'IR', 'SY'];

export function getPointColor(supplier: Supplier, top10Ids: string[]): string {
  if (supplier.accessibility === 'restricted') return '#ef4444';
  if (top10Ids.includes(supplier.id)) return '#10b981';
  return '#3b82f6';
}

export function getTop10(list: Supplier[]): Supplier[] {
  return [...list].filter(s => s.accessibility === 'open').sort((a, b) => a.rank - b.rank).slice(0, 10);
}

export function parseRequest(message: string): Promise<{ item: string; quantity: number; location: string }> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ item: 'laptops', quantity: 500, location: 'Zurich' });
    }, 800);
  });
}

export function applyConstraints(allSuppliers: Supplier[]): Promise<{ suppliers: Supplier[]; top10: Supplier[] }> {
  return new Promise(resolve => {
    setTimeout(() => {
      const updated = allSuppliers.map(s => {
        if (s.rank > 25 && s.accessibility === 'open') {
          return { ...s, accessibility: 'restricted' as const };
        }
        return s;
      });
      resolve({ suppliers: updated, top10: getTop10(updated) });
    }, 2000);
  });
}

export function placeOrder(): Promise<{ status: 'success' | 'pending' }> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ status: Math.random() > 0.5 ? 'success' : 'pending' });
    }, 1000);
  });
}
