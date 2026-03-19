import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { WorkflowResponse } from './workflow';
import type { Supplier, Notification } from '@/data/suppliers';
import type { Consignment } from '@/components/TrackingCard';

export interface AuditData {
  workflow: WorkflowResponse | null;
  suppliers: Supplier[];
  top10: Supplier[];
  selectedSupplier: Supplier | null;
  notifications: Notification[];
  consignments: Consignment[];
  chatMessages: { role: string; text: string }[];
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
    if (y > 280) { doc.addPage(); y = 20; }
    doc.text(line, x, y);
    y += 5;
  }
  return y;
}

function ensureDarkBg(doc: jsPDF) {
  doc.setFillColor(20, 20, 30);
  doc.rect(0, 0, 210, 297, 'F');
}

export function generateAuditPdf(data: AuditData): void {
  const doc = new jsPDF();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const req = data.workflow?.request;
  const engine = data.workflow?.engine_output;

  ensureDarkBg(doc);

  // 1. HEADER
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

  // 2. REQUEST OVERVIEW
  y = addSectionHeader(doc, '2. REQUEST OVERVIEW', y);
  if (req) {
    y = addField(doc, 'Category', req.category_l2 || 'N/A', y);
    y = addField(doc, 'Country', req.country || 'N/A', y);
    y = addField(doc, 'Quantity', req.quantity?.toString() ?? 'N/A', y);
    y = addField(doc, 'Budget', req.budget_amount ? `${req.budget_amount.toLocaleString()} ${req.currency}` : 'N/A', y);
    y = addField(doc, 'Required by', req.required_by_date ?? 'N/A', y);
  } else {
    y = addField(doc, 'Status', 'No workflow data available', y);
  }
  y += 4;

  // 3. AI INTERACTION LOG
  y = addSectionHeader(doc, '3. AI INTERACTION LOG', y);
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
      y += 2;
    }
  } else {
    y = addField(doc, 'Log', 'No messages recorded', y);
  }
  y += 4;

  // 4. SUPPLIER ANALYSIS
  if (y > 220) { doc.addPage(); ensureDarkBg(doc); y = 20; }
  y = addSectionHeader(doc, '4. SUPPLIER ANALYSIS', y);
  y = addField(doc, 'Total Evaluated', data.suppliers.length.toString(), y);
  y = addField(doc, 'Shortlisted', data.top10.length.toString(), y);
  y += 2;

  if (data.top10.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [['#', 'Supplier', 'Country', 'Price', 'ESG', 'Quality', 'Risk', 'Rank']],
      body: data.top10.map((s, i) => [
        (i + 1).toString(),
        s.name,
        s.country,
        s.unitPrice?.toFixed(2) ?? 'N/A',
        s.esgScore?.toString() ?? 'N/A',
        s.qualityScore?.toString() ?? 'N/A',
        s.riskScore?.toString() ?? 'N/A',
        s.rank.toString(),
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

  // 5. DECISION SUMMARY
  if (y > 240) { doc.addPage(); ensureDarkBg(doc); y = 20; }
  y = addSectionHeader(doc, '5. DECISION SUMMARY', y);
  y = addField(doc, 'Selected', data.selectedSupplier?.name ?? 'None', y);
  if (engine?.recommendation) {
    y = addField(doc, 'Status', engine.recommendation.status, y);
    y = addWrappedText(doc, `Reason: ${engine.recommendation.reason}`, 16, y, 170);
  }
  y += 4;

  // 6. COMPLIANCE & VALIDATION
  if (y > 240) { doc.addPage(); ensureDarkBg(doc); y = 20; }
  y = addSectionHeader(doc, '6. COMPLIANCE & VALIDATION', y);
  if (engine?.validation) {
    y = addField(doc, 'Completeness', engine.validation.completeness, y);
    const issues = engine.validation.issues_detected;
    y = addField(doc, 'Issues Found', issues.length.toString(), y);
    for (const issue of issues.slice(0, 5)) {
      y = addWrappedText(doc, `[${issue.severity}] ${issue.description}`, 18, y, 168);
    }
  }
  if (engine?.escalations) {
    const blocking = engine.escalations.filter(e => e.blocking);
    const nonBlocking = engine.escalations.filter(e => !e.blocking);
    y += 2;
    y = addField(doc, 'Blocking', blocking.length.toString(), y);
    y = addField(doc, 'Non-blocking', nonBlocking.length.toString(), y);
    for (const esc of blocking) {
      y = addWrappedText(doc, `! ${esc.rule}: ${esc.trigger}`, 18, y, 168);
    }
  }
  if (engine?.policy_trace?.length) {
    y += 2;
    y = addField(doc, 'Policy Checks', engine.policy_trace.length.toString(), y);
    for (const entry of engine.policy_trace.slice(0, 8)) {
      y = addWrappedText(doc, `[${entry.status}] ${entry.title}: ${entry.detail}`, 18, y, 168);
    }
  }
  y += 4;

  // 7. ORDER & DELIVERY
  if (y > 240) { doc.addPage(); ensureDarkBg(doc); y = 20; }
  y = addSectionHeader(doc, '7. ORDER & DELIVERY', y);
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

  // 8. NOTIFICATIONS LOG
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

  // 9. FINAL SUMMARY
  if (y > 250) { doc.addPage(); ensureDarkBg(doc); y = 20; }
  y = addSectionHeader(doc, '9. FINAL SUMMARY', y);
  y = addField(doc, 'Total Suppliers', data.suppliers.length.toString(), y);
  y = addField(doc, 'Orders Placed', data.consignments.length.toString(), y);
  if (engine?.recommendation?.reason) {
    y = addWrappedText(doc, `Key Justification: ${engine.recommendation.reason}`, 16, y + 2, 170);
  }

  // Footer on every page
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
