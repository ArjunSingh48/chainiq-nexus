import type { Notification, Supplier } from '@/data/suppliers';

export interface ValidationIssue {
  issue_id: string;
  severity: string;
  type: string;
  description: string;
  action_required: string;
}

export interface Escalation {
  escalation_id: string;
  rule: string;
  trigger: string;
  escalate_to: string;
  blocking: boolean;
}

export interface WorkflowRequestJson {
  request_id: string;
  category_l1: string;
  category_l2: string;
  title: string;
  request_text: string;
  country: string;
  site: string;
  currency: string;
  budget_amount: number | null;
  quantity: number | null;
  unit_of_measure: string | null;
  required_by_date: string | null;
  preferred_supplier_mentioned: string | null;
  incumbent_supplier: string | null;
  delivery_countries: string[];
  data_residency_constraint: boolean;
  esg_requirement: boolean;
}

export interface EngineOutput {
  request_id: string;
  processed_at: string;
  request_interpretation: Record<string, unknown>;
  validation: {
    completeness: string;
    issues_detected: ValidationIssue[];
  };
  supplier_shortlist: Array<Record<string, unknown>>;
  escalations: Escalation[];
  recommendation: {
    status: string;
    reason: string;
    preferred_supplier_if_resolved?: string;
    approvals_required?: Array<{ approver: string; reason: string; rule: string }>;
  };
}

export interface WorkflowResponse {
  status: 'needs_clarification' | 'completed';
  session_id: string;
  request_json_path: string;
  request: WorkflowRequestJson;
  parser_source: string;
  missing_critical_fields: Array<{ field: string; reason: string }>;
  follow_up_question: string | null;
  engine_output: EngineOutput | null;
  ui: {
    summary: string;
    suppliers: Supplier[];
    notifications: Notification[];
  };
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000';

export async function runWorkflow(message: string, sessionId?: string | null): Promise<WorkflowResponse> {
  const response = await fetch(`${API_BASE_URL}/workflow`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, session_id: sessionId ?? null }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Workflow request failed');
  }

  return response.json() as Promise<WorkflowResponse>;
}
