const API_BASE = "http://localhost:8000";

export interface WorkflowSupplier {
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
  totalPrice: number | null;
  preferred: boolean;
  incumbent: boolean;
  policyCompliant: boolean;
  standardLeadTimeDays: number | null;
  expeditedLeadTimeDays: number | null;
  recommendationNote: string | null;
}

export interface WorkflowNotification {
  id: number;
  type: 'rejected' | 'approved' | 'pending';
  message: string;
  time: string;
}

export interface WorkflowResponse {
  status: 'needs_clarification' | 'completed';
  session_id: string;
  follow_up_question: string | null;
  parser_source: string;
  ui: {
    summary: string;
    suppliers: WorkflowSupplier[];
    notifications: WorkflowNotification[];
  };
}

export async function workflowChat(
  message: string,
  sessionId: string | null = null
): Promise<WorkflowResponse> {
  const res = await fetch(`${API_BASE}/workflow`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, session_id: sessionId }),
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}
