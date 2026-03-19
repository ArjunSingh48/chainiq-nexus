import type { RiskValues } from '@/components/RiskDonutChart';

export interface PolicyTraceItem {
  title: string;
  status: 'passed' | 'failed' | 'needs_approval' | 'warning';
  summary: string;
  detail: string;
  rule: string;
}

export interface EscalationItem {
  rule: string;
  trigger: string;
  escalateTo: string;
  blocking: boolean;
}

export interface ChatLogEntry {
  role: 'user' | 'ai';
  text: string;
}

export interface UserAuditData {
  request: { category: string; country: string; quantity: number; budget: string };
  interpretation: { intent: string; constraints: string; followUps: string };
  supplierDecision: {
    name: string;
    reasons: string[];
  };
  supplierComparison: Array<{ name: string; confidence: number; explanation: string }>;
  risks: RiskValues;
  costValue: number;
  benefitValue: number;
  tracking: { status: string; origin: string; destination: string; units: number; eta: string };
  policyTrace: PolicyTraceItem[];
  escalations: EscalationItem[];
  chatLog: ChatLogEntry[];
}

export const userAuditData: UserAuditData = {
  request: {
    category: 'IT Hardware — Laptops',
    country: 'Switzerland (CH)',
    quantity: 200,
    budget: 'CHF 500,000',
  },
  interpretation: {
    intent: 'Bulk laptop procurement for Q3 office refresh',
    constraints: 'Budget cap CHF 2,500/unit, ISO 14001 ESG compliance required, delivery within 6 weeks',
    followUps: 'Confirmed delivery address as Zurich HQ; clarified warranty requirement (3-year)',
  },
  supplierDecision: {
    name: 'Apple (AT)',
    reasons: [
      'Price efficiency: 12% below budget ceiling at CHF 2,190/unit',
      'Quality score: 94/100 based on historical delivery performance',
      'Low risk: Financial stability rating A+, no prior supply disruptions',
      'Preferred supplier: Listed in company\'s approved vendor registry',
    ],
  },
  supplierComparison: [
    { name: 'Apple (AT)', confidence: 94, explanation: 'Best overall score combining price, quality, and compliance' },
    { name: 'Dell (DE)', confidence: 87, explanation: 'Strong quality but 8% higher unit cost' },
    { name: 'Lenovo (CZ)', confidence: 82, explanation: 'Competitive pricing but moderate ESG risk' },
    { name: 'HP (NL)', confidence: 78, explanation: 'Reliable delivery track record, higher lead time' },
    { name: 'ASUS (TW)', confidence: 71, explanation: 'Lowest price but geopolitical risk concerns' },
  ],
  risks: { financial: 18, operational: 12, esg: 8, geopolitical: 22 },
  costValue: 68,
  benefitValue: 85,
  tracking: {
    status: 'In Transit',
    origin: 'Vienna, Austria',
    destination: 'Zurich, Switzerland',
    units: 200,
    eta: '2026-04-02',
  },
  policyTrace: [
    { title: 'Budget Threshold', status: 'passed', summary: 'Within approval limit', detail: 'CHF 500,000 is within the auto-approval ceiling for IT Hardware.', rule: 'P-101' },
    { title: 'Preferred Supplier', status: 'passed', summary: 'Vendor on approved list', detail: 'Apple (AT) is listed in the approved vendor registry for IT Hardware.', rule: 'P-202' },
    { title: 'ESG Compliance', status: 'passed', summary: 'ISO 14001 certified', detail: 'Supplier holds valid ISO 14001 environmental management certification.', rule: 'P-305' },
    { title: 'Geographical Restriction', status: 'warning', summary: 'Cross-border sourcing', detail: 'Sourcing from Austria to Switzerland triggers cross-border review.', rule: 'P-410' },
    { title: 'Competitive Bidding', status: 'needs_approval', summary: '3 quotes obtained', detail: '3 of 3 required quotes received. Lowest qualified bidder selected.', rule: 'P-150' },
  ],
  escalations: [
    { rule: 'P-410', trigger: 'Cross-border sourcing from AT to CH', escalateTo: 'Regional Procurement Lead', blocking: false },
  ],
  chatLog: [
    { role: 'user', text: 'I need 200 laptops for our Zurich office, budget around CHF 500k, need them within 6 weeks.' },
    { role: 'ai', text: 'I\'ve identified your request as IT Hardware — Laptops, 200 units for Switzerland with a budget of CHF 500,000. Running supplier analysis now.' },
    { role: 'user', text: 'We need ESG-compliant suppliers and prefer Apple if possible.' },
    { role: 'ai', text: 'Noted. I\'ve applied ESG compliance filter and prioritised Apple. 5 suppliers evaluated, Apple (AT) ranks #1 with a 94% confidence score.' },
  ],
};

export interface WeeklyRequest {
  id: string;
  employee: string;
  item: string;
  quantity: number;
  supplier: string;
  status: 'approved' | 'pending' | 'rejected';
  risks: RiskValues;
  cost: number;
  benefit: number;
  explanationPoints: string[];
}

export const weeklyRequests: WeeklyRequest[] = [
  {
    id: 'wr1', employee: 'Sarah Chen', item: 'Laptops', quantity: 200,
    supplier: 'Apple (AT)', status: 'approved',
    risks: { financial: 18, operational: 12, esg: 8, geopolitical: 22 },
    cost: 68, benefit: 85,
    explanationPoints: ['Mentioned as preferred vendor', 'High quality score (94)', 'Low financial risk', 'ISO 14001 compliant'],
  },
  {
    id: 'wr2', employee: 'Marco Rossi', item: 'Office Chairs', quantity: 150,
    supplier: 'Steelcase (US)', status: 'approved',
    risks: { financial: 22, operational: 15, esg: 5, geopolitical: 10 },
    cost: 45, benefit: 72,
    explanationPoints: ['Ergonomic certification', 'Best warranty terms', 'Sustainable manufacturing', 'Competitive bulk pricing'],
  },
  {
    id: 'wr3', employee: 'Priya Patel', item: 'Cloud Servers', quantity: 50,
    supplier: 'AWS (IE)', status: 'pending',
    risks: { financial: 30, operational: 20, esg: 12, geopolitical: 8 },
    cost: 78, benefit: 92,
    explanationPoints: ['Data residency compliant (EU)', 'Scalable infrastructure', 'High operational risk due to vendor lock-in', 'Budget threshold exceeded'],
  },
  {
    id: 'wr4', employee: 'Jan Müller', item: 'Safety Equipment', quantity: 500,
    supplier: 'Dräger (DE)', status: 'approved',
    risks: { financial: 10, operational: 8, esg: 3, geopolitical: 5 },
    cost: 32, benefit: 88,
    explanationPoints: ['Industry-leading safety certifications', 'Existing framework contract', 'Lowest risk profile', 'Fast delivery (2 weeks)'],
  },
  {
    id: 'wr5', employee: 'Lisa Wang', item: 'Marketing Software', quantity: 25,
    supplier: 'HubSpot (US)', status: 'pending',
    risks: { financial: 35, operational: 25, esg: 15, geopolitical: 18 },
    cost: 82, benefit: 70,
    explanationPoints: ['Annual license renewal', 'Data transfer concerns (US-EU)', 'High cost relative to alternatives', 'Requires supervisor approval'],
  },
  {
    id: 'wr6', employee: 'Ahmed Hassan', item: 'Raw Materials', quantity: 1000,
    supplier: 'BASF (DE)', status: 'rejected',
    risks: { financial: 40, operational: 30, esg: 20, geopolitical: 15 },
    cost: 90, benefit: 60,
    explanationPoints: ['Exceeded budget by 25%', 'High ESG risk (chemical compliance)', 'Alternative suppliers available at lower cost', 'Rejected per policy rule P-204'],
  },
  {
    id: 'wr7', employee: 'Emma Dubois', item: 'Consulting Services', quantity: 10,
    supplier: 'McKinsey (CH)', status: 'approved',
    risks: { financial: 28, operational: 10, esg: 5, geopolitical: 3 },
    cost: 75, benefit: 80,
    explanationPoints: ['Existing relationship', 'Niche expertise required', 'Competitive hourly rate', 'No alternative with equivalent capability'],
  },
];

export const weeklyMetrics = {
  total: weeklyRequests.length,
  approved: weeklyRequests.filter((r) => r.status === 'approved').length,
  pending: weeklyRequests.filter((r) => r.status === 'pending').length,
  rejected: weeklyRequests.filter((r) => r.status === 'rejected').length,
};

export const averageRisks: RiskValues = {
  financial: Math.round(weeklyRequests.reduce((s, r) => s + r.risks.financial, 0) / weeklyRequests.length),
  operational: Math.round(weeklyRequests.reduce((s, r) => s + r.risks.operational, 0) / weeklyRequests.length),
  esg: Math.round(weeklyRequests.reduce((s, r) => s + r.risks.esg, 0) / weeklyRequests.length),
  geopolitical: Math.round(weeklyRequests.reduce((s, r) => s + r.risks.geopolitical, 0) / weeklyRequests.length),
};
