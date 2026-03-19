import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { WorkflowResponse } from './workflow';
import type { Supplier, Notification } from '@/data/suppliers';
import type { Consignment } from '@/components/TrackingCard';
import { formatCurrency, formatNumber } from '@/lib/utils';

export interface AuditData {
  workflow: WorkflowResponse | null;
  suppliers: Supplier[];
  top10: Supplier[];
  selectedSupplier: Supplier | null;
  notifications: Notification[];
  consignments: Consignment[];
  chatMessages: { role: string; text: string; interpretedAs?: Array<{ label: string; value: string }> }[];
  sessionId: string | null;
}

function addSectionHeader(doc: jsPDF, title: string, y: number): number {
  if (y > 260) { doc.addPage(); y = 20; }
  doc.setFontSize(13);
  doc.setTextColor(16, 185, 129);
  doc.text(title, 14, y);
  doc.setDrawColor(16, 185, 129);
  doc.line(14, y + 2, 196, y + 2);
  return y + 10;
}

function addField(doc: jsPDF, label: string, value: string, y: number): number {
  if (y > 275) { doc.addPage(); y = 20; }
  doc.setFontSize(9);
  doc.setTextColor(200, 200, 210);
  doc.text(`${label}:`, 16, y);
  doc.setTextColor(255, 255, 255);
  doc.text(value, 60, y);
  return y + 6;
}

function addWrappedText(doc: jsPDF, text: string, x: number, y: number, maxWidth: number): number {
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  const lines: string[] = doc.splitTextToSize(text, maxWidth);
  for (const line of lines) {
    if (y > 280) { doc.addPage(); ensureDarkBg(doc); y = 20; }
    doc.text(line, x, y);
    y += 5;
  }
  return y;
}

function ensureDarkBg(doc: jsPDF) {
  doc.setFillColor(20, 20, 30);
  doc.rect(0, 0, 210, 297, 'F');
}

function formatValue(value: unknown): string {
  if (value == null) return 'N/A';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) {
    return value.map((item) => formatValue(item)).join(', ');
  }
  return JSON.stringify(value);
}

function addKeyValueBlock(doc: jsPDF, title: string, entries: Array<{ label: string; value: unknown }>, y: number): number {
  if (entries.length === 0) return y;
  y = addWrappedText(doc, title, 16, y, 170);
  for (const entry of entries) {
    y = addWrappedText(doc, `${entry.label}: ${formatValue(entry.value)}`, 20, y, 166);
  }
  return y + 2;
}

export function generateAuditPdf(data: AuditData): void {
  const doc = new jsPDF();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const req = data.workflow?.request;
  const engine = data.workflow?.engine_output;

  ensureDarkBg(doc);

  doc.setFillColor(16, 185, 129);
  doc.rect(0, 0, 210, 32, 'F');
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text('ProqAI Audit Report', 14, 16);
  doc.setFontSize(10);
  doc.text('Procurement Decision Transparency Document', 14, 24);
  doc.setFontSize(8);
  doc.setTextColor(220, 220, 220);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 130, 16);
  if (data.sessionId) {
    doc.text(`Session: ${data.sessionId.slice(0, 16)}...`, 130, 22);
  }

  let y = 42;

  y = addSectionHeader(doc, '1. REQUEST OVERVIEW', y);
  if (req) {
    y = addField(doc, 'Category', req.category_l2 || 'N/A', y);
    y = addField(doc, 'Country', req.country || 'N/A', y);
    y = addField(doc, 'Quantity', req.quantity?.toString() ?? 'N/A', y);
    y = addField(doc, 'Budget', req.budget_amount ? formatCurrency(req.budget_amount, req.currency) : 'N/A', y);
    y = addField(doc, 'Required by', req.required_by_date ?? 'N/A', y);
    y = addField(doc, 'Preferred supplier', req.preferred_supplier_mentioned ?? 'N/A', y);
    y = addField(doc, 'Delivery countries', req.delivery_countries.join(', ') || 'N/A', y);
  } else {
    y = addField(doc, 'Status', 'No workflow data available', y);
  }
  if (data.workflow?.missing_critical_fields?.length) {
    y = addWrappedText(doc, 'Missing Critical Fields', 16, y + 2, 170);
    for (const item of data.workflow.missing_critical_fields) {
      y = addWrappedText(doc, `- ${item.field} (${item.reason})${item.attempted_value ? ` attempted: ${item.attempted_value}` : ''}`, 20, y, 166);
    }
  }
  y += 4;

  y = addSectionHeader(doc, '2. INTERACTION LOG', y);
  if (data.chatMessages.length > 0) {
    for (const msg of data.chatMessages) {
      const prefix = msg.role === 'user' ? 'USER' : 'AI';
      doc.setFontSize(8);
      doc.setTextColor(16, 185, 129);
      if (y > 275) { doc.addPage(); ensureDarkBg(doc); y = 20; }
      doc.text(`[${prefix}]`, 16, y);
      doc.setTextColor(255, 255, 255);
      const lines: string[] = doc.splitTextToSize(msg.text, 160);
      for (const line of lines) {
        if (y > 280) { doc.addPage(); ensureDarkBg(doc); y = 20; }
        doc.text(line, 30, y);
        y += 4.5;
      }
      if (msg.interpretedAs?.length) {
        y = addWrappedText(doc, 'Interpreted As', 30, y, 160);
        for (const item of msg.interpretedAs) {
          y = addWrappedText(doc, `${item.label}: ${item.value}`, 34, y, 156);
        }
      }
      y += 2;
    }
  } else {
    y = addField(doc, 'Log', 'No messages recorded', y);
  }
  y += 4;

  if (y > 220) { doc.addPage(); ensureDarkBg(doc); y = 20; }
  y = addSectionHeader(doc, '3. SUPPLIER ANALYSIS', y);
  y = addField(doc, 'Total Evaluated', data.suppliers.length.toString(), y);
  y = addField(doc, 'Shortlisted', data.top10.length.toString(), y);
  y += 2;

  if (data.top10.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [['#', 'Supplier', 'Country', 'Price', 'ESG', 'Quality', 'Risk', 'Policy']],
      body: data.top10.map((s, i) => [
        (i + 1).toString(),
        s.name,
        s.country,
        s.unitPrice != null ? formatNumber(s.unitPrice, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'N/A',
        s.esgScore != null ? formatNumber(s.esgScore) : 'N/A',
        s.qualityScore != null ? formatNumber(s.qualityScore) : 'N/A',
        s.riskScore != null ? formatNumber(s.riskScore) : 'N/A',
        s.policyCompliant === false ? 'warning' : 'pass',
      ]),
      theme: 'grid',
      styles: {
        fontSize: 7,
        textColor: [255, 255, 255] as [number, number, number],
        fillColor: [30, 30, 45] as [number, number, number],
        lineColor: [60, 60, 80] as [number, number, number],
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: [16, 185, 129] as [number, number, number],
        textColor: [255, 255, 255] as [number, number, number],
        fontStyle: 'bold',
      },
      alternateRowStyles: { fillColor: [25, 25, 40] as [number, number, number] },
    });
    y = (doc as any).lastAutoTable.finalY + 8;
  }

  if (y > 220) { doc.addPage(); ensureDarkBg(doc); y = 20; }
  y = addSectionHeader(doc, '4. INTERPRETATION & DECISION', y);
  y = addField(doc, 'Selected', data.selectedSupplier?.name ?? 'None', y);
  if (engine?.recommendation) {
    y = addField(doc, 'Status', engine.recommendation.status, y);
    y = addWrappedText(doc, `Reason: ${engine.recommendation.reason ?? engine.recommendation.rationale ?? 'N/A'}`, 16, y, 170);
    if (engine.recommendation.approvals_required?.length) {
      y = addWrappedText(doc, 'Approvals Required', 16, y + 2, 170);
      for (const approval of engine.recommendation.approvals_required) {
        y = addWrappedText(doc, `${approval.approver}: ${approval.reason} (${approval.rule})`, 20, y, 166);
      }
    }
    if (engine.recommendation.clarifications_needed?.length) {
      y = addWrappedText(doc, 'Clarifications Needed', 16, y + 2, 170);
      for (const item of engine.recommendation.clarifications_needed) {
        y = addWrappedText(doc, `${item.field}: ${item.rule} -> ${item.escalate_to}`, 20, y, 166);
      }
    }
  }
  if (engine?.request_interpretation) {
    y = addKeyValueBlock(
      doc,
      'Request Interpretation',
      Object.entries(engine.request_interpretation).map(([label, value]) => ({ label, value })),
      y + 4
    );
  }

  if (y > 220) { doc.addPage(); ensureDarkBg(doc); y = 20; }
  y = addSectionHeader(doc, '5. POLICY & VALIDATION TRACE', y);
  if (engine?.validation) {
    y = addField(doc, 'Completeness', engine.validation.completeness, y);
    y = addField(doc, 'Issues Found', engine.validation.issues_detected.length.toString(), y);
    for (const issue of engine.validation.issues_detected) {
      y = addWrappedText(doc, `[${issue.severity}] ${issue.type}: ${issue.description}`, 18, y, 168);
      y = addWrappedText(doc, `Action: ${issue.action_required}`, 22, y, 164);
    }
  }
  if (engine?.policy_evaluation) {
    y = addKeyValueBlock(doc, 'Policy Evaluation', [
      { label: 'Approval rule', value: engine.policy_evaluation.approval_threshold.rule_applied },
      { label: 'Basis', value: engine.policy_evaluation.approval_threshold.basis },
      { label: 'Quotes required', value: engine.policy_evaluation.approval_threshold.quotes_required },
      { label: 'Approvers', value: engine.policy_evaluation.approval_threshold.approvers },
      { label: 'Deviation approval', value: engine.policy_evaluation.approval_threshold.deviation_approval },
      { label: 'Eligible suppliers', value: engine.policy_evaluation.eligible_supplier_count },
      { label: 'Category rules', value: engine.policy_evaluation.category_rules_applied },
      { label: 'Geography rules', value: engine.policy_evaluation.geography_rules_applied },
      { label: 'Preferred supplier check', value: engine.policy_evaluation.preferred_supplier },
    ], y + 2);
  }
  if (engine?.policy_trace?.length) {
    y = addWrappedText(doc, 'Policy Trace', 16, y + 2, 170);
    for (const entry of engine.policy_trace) {
      y = addWrappedText(doc, `[${entry.status}] ${entry.title}`, 20, y, 166);
      y = addWrappedText(doc, `${entry.summary}`, 24, y, 162);
      y = addWrappedText(doc, `${entry.detail}`, 24, y, 162);
      y = addWrappedText(doc, `Rule ${entry.rule}${entry.approver ? ` -> ${entry.approver}` : ''}${entry.blocking ? ' (blocking)' : ''}`, 24, y, 162);
    }
  }
  if (engine?.escalations?.length) {
    y = addWrappedText(doc, 'Escalations', 16, y + 2, 170);
    for (const esc of engine.escalations) {
      y = addWrappedText(doc, `${esc.rule}: ${esc.trigger}`, 20, y, 166);
      y = addWrappedText(doc, `Escalate to ${esc.escalate_to} | blocking: ${esc.blocking ? 'yes' : 'no'}`, 24, y, 162);
    }
  }
  if (engine?.audit_trail) {
    y = addKeyValueBlock(
      doc,
      'Audit Trail',
      Object.entries(engine.audit_trail).map(([label, value]) => ({ label, value })),
      y + 2
    );
  }
  y += 4;

  if (y > 240) { doc.addPage(); ensureDarkBg(doc); y = 20; }
  y = addSectionHeader(doc, '6. ORDER & DELIVERY', y);
  if (data.consignments.length > 0) {
    for (const c of data.consignments) {
      y = addField(doc, 'Supplier', c.supplierName, y);
      y = addField(doc, 'Order ID', c.orderId, y);
      y = addField(doc, 'Units', c.units.toString(), y);
      y = addField(doc, 'Route', `${c.originCity} -> Zurich`, y);
      y += 3;
    }
  } else {
    y = addField(doc, 'Orders', 'No orders placed yet', y);
  }
  y += 4;

  if (y > 240) { doc.addPage(); ensureDarkBg(doc); y = 20; }
  y = addSectionHeader(doc, '8. NOTIFICATIONS LOG', y);
  const approved = data.notifications.filter(n => n.type === 'approved');
  const pending = data.notifications.filter(n => n.type === 'pending');
  const rejected = data.notifications.filter(n => n.type === 'rejected');
  y = addField(doc, 'Approved', approved.length.toString(), y);
  for (const n of approved) { y = addWrappedText(doc, `+ ${n.message}`, 18, y, 168); }
  y = addField(doc, 'Pending', pending.length.toString(), y);
  for (const n of pending) { y = addWrappedText(doc, `~ ${n.message}`, 18, y, 168); }
  y = addField(doc, 'Rejected', rejected.length.toString(), y);
  for (const n of rejected) { y = addWrappedText(doc, `x ${n.message}`, 18, y, 168); }
  y += 4;

  if (y > 250) { doc.addPage(); ensureDarkBg(doc); y = 20; }
  y = addSectionHeader(doc, '9. FINAL SUMMARY', y);
  y = addField(doc, 'Total Suppliers', data.suppliers.length.toString(), y);
  y = addField(doc, 'Orders Placed', data.consignments.length.toString(), y);
  y = addField(doc, 'Workflow Status', data.workflow?.status ?? 'N/A', y);
  if (engine?.recommendation?.reason || engine?.recommendation?.rationale) {
    y = addWrappedText(doc, `Key Justification: ${engine.recommendation.reason ?? engine.recommendation.rationale}`, 16, y + 2, 170);
  }

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 140);
    doc.text(`ProqAI Audit Report - Page ${i} of ${pageCount}`, 14, 290);
    doc.text('Confidential', 175, 290);
  }

  doc.save(`ProqAI_Audit_Report_${timestamp}.pdf`);
}
