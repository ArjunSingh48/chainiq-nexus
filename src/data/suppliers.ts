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
  trustScore: number;
}

export const suppliers: Supplier[] = [
  { id: '1', name: 'Alpine Tech GmbH', country: 'Austria', countryCode: 'AT', lat: 48.2082, lng: 16.3738, rank: 5, accessibility: 'open', esgScore: 92, trustScore: 88 },
  { id: '2', name: 'OzSource Pty Ltd', country: 'Australia', countryCode: 'AU', lat: -35.2809, lng: 149.1300, rank: 18, accessibility: 'open', esgScore: 78, trustScore: 82 },
  { id: '3', name: 'BelgiTech NV', country: 'Belgium', countryCode: 'BE', lat: 50.8503, lng: 4.3517, rank: 12, accessibility: 'open', esgScore: 85, trustScore: 79 },
  { id: '4', name: 'SulTech Ltda', country: 'Brazil', countryCode: 'BR', lat: -15.7975, lng: -47.8919, rank: 25, accessibility: 'restricted', esgScore: 61, trustScore: 65 },
  { id: '5', name: 'MapleProcure Inc', country: 'Canada', countryCode: 'CA', lat: 45.4215, lng: -75.6972, rank: 3, accessibility: 'open', esgScore: 94, trustScore: 91 },
  { id: '6', name: 'SwissPrecision AG', country: 'Switzerland', countryCode: 'CH', lat: 46.9480, lng: 7.4474, rank: 1, accessibility: 'open', esgScore: 97, trustScore: 96 },
  { id: '7', name: 'DeutschWerk GmbH', country: 'Germany', countryCode: 'DE', lat: 52.5200, lng: 13.4050, rank: 2, accessibility: 'open', esgScore: 95, trustScore: 93 },
  { id: '8', name: 'IberiaSupply SL', country: 'Spain', countryCode: 'ES', lat: 40.4168, lng: -3.7038, rank: 15, accessibility: 'open', esgScore: 80, trustScore: 76 },
  { id: '9', name: 'FrancePro SAS', country: 'France', countryCode: 'FR', lat: 48.8566, lng: 2.3522, rank: 6, accessibility: 'open', esgScore: 90, trustScore: 87 },
  { id: '10', name: 'TechIndia Pvt Ltd', country: 'India', countryCode: 'IN', lat: 28.6139, lng: 77.2090, rank: 22, accessibility: 'restricted', esgScore: 58, trustScore: 62 },
  { id: '11', name: 'ItaliaParts SpA', country: 'Italy', countryCode: 'IT', lat: 41.9028, lng: 12.4964, rank: 8, accessibility: 'open', esgScore: 88, trustScore: 84 },
  { id: '12', name: 'NipponSource KK', country: 'Japan', countryCode: 'JP', lat: 35.6762, lng: 139.6503, rank: 4, accessibility: 'open', esgScore: 93, trustScore: 90 },
  { id: '13', name: 'MexiTrade SA', country: 'Mexico', countryCode: 'MX', lat: 19.4326, lng: -99.1332, rank: 28, accessibility: 'restricted', esgScore: 55, trustScore: 58 },
  { id: '14', name: 'DutchLogistics BV', country: 'Netherlands', countryCode: 'NL', lat: 52.3676, lng: 4.9041, rank: 7, accessibility: 'open', esgScore: 91, trustScore: 89 },
  { id: '15', name: 'PolskaParts Sp.', country: 'Poland', countryCode: 'PL', lat: 52.2297, lng: 21.0122, rank: 14, accessibility: 'open', esgScore: 82, trustScore: 77 },
  { id: '16', name: 'LisbonTech Lda', country: 'Portugal', countryCode: 'PT', lat: 38.7223, lng: -9.1393, rank: 19, accessibility: 'open', esgScore: 77, trustScore: 74 },
  { id: '17', name: 'SingaSource Pte', country: 'Singapore', countryCode: 'SG', lat: 1.3521, lng: 103.8198, rank: 9, accessibility: 'open', esgScore: 89, trustScore: 92 },
  { id: '18', name: 'GulfProcure LLC', country: 'UAE', countryCode: 'AE', lat: 24.4539, lng: 54.3773, rank: 20, accessibility: 'restricted', esgScore: 72, trustScore: 70 },
  { id: '19', name: 'BritishSupply Ltd', country: 'United Kingdom', countryCode: 'GB', lat: 51.5074, lng: -0.1278, rank: 10, accessibility: 'open', esgScore: 87, trustScore: 86 },
  { id: '20', name: 'AmeriSource Corp', country: 'United States', countryCode: 'US', lat: 38.9072, lng: -77.0369, rank: 11, accessibility: 'open', esgScore: 86, trustScore: 85 },
  { id: '21', name: 'CapeTech (Pty)', country: 'South Africa', countryCode: 'ZA', lat: -25.7479, lng: 28.2293, rank: 23, accessibility: 'restricted', esgScore: 64, trustScore: 60 },
  { id: '22', name: 'BerlinDigital AG', country: 'Germany', countryCode: 'DE', lat: 48.1351, lng: 11.5820, rank: 13, accessibility: 'open', esgScore: 83, trustScore: 81 },
  { id: '23', name: 'TokyoElec Co', country: 'Japan', countryCode: 'JP', lat: 34.6937, lng: 135.5023, rank: 16, accessibility: 'open', esgScore: 81, trustScore: 78 },
  { id: '24', name: 'ParisVendor SARL', country: 'France', countryCode: 'FR', lat: 43.2965, lng: 5.3698, rank: 17, accessibility: 'open', esgScore: 79, trustScore: 75 },
  { id: '25', name: 'MumbaiTrade Pvt', country: 'India', countryCode: 'IN', lat: 19.0760, lng: 72.8777, rank: 26, accessibility: 'restricted', esgScore: 56, trustScore: 59 },
  { id: '26', name: 'SaoPauloInd Ltda', country: 'Brazil', countryCode: 'BR', lat: -23.5505, lng: -46.6333, rank: 27, accessibility: 'restricted', esgScore: 54, trustScore: 57 },
  { id: '27', name: 'ChicagoParts LLC', country: 'United States', countryCode: 'US', lat: 41.8781, lng: -87.6298, rank: 21, accessibility: 'open', esgScore: 75, trustScore: 73 },
  { id: '28', name: 'ZurichPrecision', country: 'Switzerland', countryCode: 'CH', lat: 47.3769, lng: 8.5417, rank: 24, accessibility: 'open', esgScore: 70, trustScore: 71 },
  { id: '29', name: 'DubaiLogistics', country: 'UAE', countryCode: 'AE', lat: 25.2048, lng: 55.2708, rank: 29, accessibility: 'restricted', esgScore: 52, trustScore: 55 },
  { id: '30', name: 'JohannesburgTech', country: 'South Africa', countryCode: 'ZA', lat: -26.2041, lng: 28.0473, rank: 30, accessibility: 'restricted', esgScore: 50, trustScore: 53 },
];

export const notifications = [
  { id: 1, type: 'rejected' as const, message: 'REJECTED: Supplier in conflict zone (Ukraine)', time: '2 min ago' },
  { id: 2, type: 'approved' as const, message: 'APPROVED: Order #1234 confirmed', time: '15 min ago' },
  { id: 3, type: 'pending' as const, message: 'PENDING: Budget approval required', time: '1 hour ago' },
];

export function getPointColor(supplier: Supplier, top10Ids: string[]): string {
  if (supplier.accessibility === 'restricted') return '#ef4444';
  if (top10Ids.includes(supplier.id)) return '#10b981';
  return '#3b82f6';
}

export function getTop10(list: Supplier[]): Supplier[] {
  return [...list].filter(s => s.accessibility === 'open').sort((a, b) => a.rank - b.rank).slice(0, 10);
}

// Mock API functions
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
      // Simulate some becoming restricted
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
