export interface SupervisorRequest {
  id: string;
  title: string;
  subtitle: string;
  supplier: string;
  explanationPoints: string[];
  risks: {
    financial: number;
    operational: number;
    esg: number;
    geopolitical: number;
  };
  costValue: number;
  benefitValue: number;
  status: 'pending' | 'approved' | 'rejected';
}

export const mockRequests: SupervisorRequest[] = [
  {
    id: '1',
    title: 'Employee 1 requested 200 laptops',
    subtitle: 'AI suggested Apple (AT)',
    supplier: 'Apple (AT)',
    explanationPoints: [
      'Mentioned → User explicitly requested supplier',
      'Quality → High quality score (92/100)',
      'Risk → Low risk score (12/100)',
      'Preferred → Preferred supplier in catalog',
    ],
    risks: { financial: 25, operational: 15, esg: 10, geopolitical: 8 },
    costValue: 72,
    benefitValue: 88,
    status: 'pending',
  },
  {
    id: '2',
    title: 'Employee 3 requested 500 office chairs',
    subtitle: 'AI suggested Steelcase (DE)',
    supplier: 'Steelcase (DE)',
    explanationPoints: [
      'Quality → Ergonomic certification score (95/100)',
      'Risk → Established supply chain (8/100)',
      'Cost → Competitive bulk pricing',
      'ESG → Carbon-neutral manufacturing',
    ],
    risks: { financial: 18, operational: 22, esg: 5, geopolitical: 12 },
    costValue: 58,
    benefitValue: 91,
    status: 'pending',
  },
  {
    id: '3',
    title: 'Employee 5 requested 1000 safety helmets',
    subtitle: 'AI suggested 3M (US)',
    supplier: '3M (US)',
    explanationPoints: [
      'Compliance → Meets OSHA standards',
      'Quality → Industry-leading protection rating',
      'Risk → Reliable delivery history (6/100)',
      'Preferred → Long-term contract supplier',
    ],
    risks: { financial: 30, operational: 10, esg: 20, geopolitical: 35 },
    costValue: 45,
    benefitValue: 82,
    status: 'pending',
  },
  {
    id: '4',
    title: 'Employee 2 requested 50 monitors',
    subtitle: 'AI suggested Dell (IE)',
    supplier: 'Dell (IE)',
    explanationPoints: [
      'Mentioned → User preferred Dell brand',
      'Quality → 4K resolution, high color accuracy',
      'Cost → Volume discount available',
      'Risk → Short lead time (5 days)',
    ],
    risks: { financial: 40, operational: 18, esg: 15, geopolitical: 20 },
    costValue: 65,
    benefitValue: 75,
    status: 'pending',
  },
  {
    id: '5',
    title: 'Employee 7 requested 300 USB-C docks',
    subtitle: 'AI suggested Lenovo (CN)',
    supplier: 'Lenovo (CN)',
    explanationPoints: [
      'Cost → Lowest unit price in category',
      'Quality → Compatible with all fleet devices',
      'Risk → Moderate geopolitical exposure',
      'ESG → Recycled materials packaging',
    ],
    risks: { financial: 20, operational: 25, esg: 30, geopolitical: 55 },
    costValue: 35,
    benefitValue: 68,
    status: 'pending',
  },
];
