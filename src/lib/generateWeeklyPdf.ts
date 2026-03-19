import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { WeeklyRequest } from '@/data/auditMockData';
import { averageRisks } from '@/data/auditMockData';

function ensureDarkBg(doc: jsPDF) {
  doc.setFillColor(20, 20, 30);
  doc.rect(0, 0, 210, 297, 'F');
}

function addSectionHeader(doc: jsPDF, title: string, y: number): number {
  if (y > 260) { doc.addPage(); ensureDarkBg(doc); y = 20; }
  doc.setFontSize(13);
  doc.setTextColor(16, 185, 129);
  doc.text(title, 14, y);
  doc.setDrawColor(16, 185, 129);
  doc.line(14, y + 2, 196, y + 2);
  return y + 10;
}

function addField(doc: jsPDF, label: string, value: string, y: number): number {
  if (y > 275) { doc.addPage(); ensureDarkBg(doc); y = 20; }
  doc.setFontSize(9);
  doc.setTextColor(200, 200, 210);
  doc.text(`${label}:`, 16, y);
  doc.setTextColor(255, 255, 255);
  doc.text(value, 70, y);
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

const tableStyles = {
  theme: 'grid' as const,
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
    fontStyle: 'bold' as const,
  },
  alternateRowStyles: { fillColor: [25, 25, 40] as [number, number, number] },
};

export function generateWeeklyPdf(requests: WeeklyRequest[]): void {
  const doc = new jsPDF();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  const approved = requests.filter((r) => r.status === 'approved');
  const pending = requests.filter((r) => r.status === 'pending');
  const rejected = requests.filter((r) => r.status === 'rejected');
  const avgCost = Math.round(requests.reduce((s, r) => s + r.cost, 0) / requests.length);
  const avgBenefit = Math.round(requests.reduce((s, r) => s + r.benefit, 0) / requests.length);

  // Header
  ensureDarkBg(doc);
  doc.setFillColor(16, 185, 129);
  doc.rect(0, 0, 210, 32, 'F');
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text('ProqAI Weekly Procurement Report', 14, 16);
  doc.setFontSize(10);
  doc.text('Supervisor Dashboard — Technical Summary', 14, 24);
  doc.setFontSize(8);
  doc.setTextColor(220, 220, 220);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 130, 16);
  doc.text(`Period: Weekly`, 130, 22);

  let y = 42;

  // 1. Executive Summary
  y = addSectionHeader(doc, '1. EXECUTIVE SUMMARY', y);
  y = addField(doc, 'Total Requests', requests.length.toString(), y);
  y = addField(doc, 'Approved', approved.length.toString(), y);
  y = addField(doc, 'Pending Review', pending.length.toString(), y);
  y = addField(doc, 'Rejected', rejected.length.toString(), y);
  y = addField(doc, 'Avg Cost Impact', `${avgCost}%`, y);
  y = addField(doc, 'Avg Benefit Score', `${avgBenefit}%`, y);
  y = addField(doc, 'Approval Rate', `${requests.length > 0 ? Math.round((approved.length / requests.length) * 100) : 0}%`, y);
  y += 4;

  // 2. Request Detail Table
  y = addSectionHeader(doc, '2. REQUEST DETAIL TABLE', y);
  autoTable(doc, {
    startY: y,
    head: [['#', 'Employee', 'Item', 'Qty', 'Supplier', 'Status', 'Cost%', 'Benefit%']],
    body: requests.map((r, i) => [
      (i + 1).toString(),
      r.employee,
      r.item,
      r.quantity.toString(),
      r.supplier,
      r.status.toUpperCase(),
      `${r.cost}%`,
      `${r.benefit}%`,
    ]),
    ...tableStyles,
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  // 3. Risk Analysis
  if (y > 220) { doc.addPage(); ensureDarkBg(doc); y = 20; }
  y = addSectionHeader(doc, '3. RISK ANALYSIS', y);
  y = addField(doc, 'Avg Financial Risk', `${averageRisks.financial}%`, y);
  y = addField(doc, 'Avg Operational Risk', `${averageRisks.operational}%`, y);
  y = addField(doc, 'Avg ESG Risk', `${averageRisks.esg}%`, y);
  y = addField(doc, 'Avg Geopolitical Risk', `${averageRisks.geopolitical}%`, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [['#', 'Employee', 'Financial', 'Operational', 'ESG', 'Geopolitical']],
    body: requests.map((r, i) => [
      (i + 1).toString(),
      r.employee,
      `${r.risks.financial}%`,
      `${r.risks.operational}%`,
      `${r.risks.esg}%`,
      `${r.risks.geopolitical}%`,
    ]),
    ...tableStyles,
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  // 4. Cost vs Benefit Analysis
  if (y > 220) { doc.addPage(); ensureDarkBg(doc); y = 20; }
  y = addSectionHeader(doc, '4. COST VS BENEFIT ANALYSIS', y);
  y = addField(doc, 'Average Cost Impact', `${avgCost}%`, y);
  y = addField(doc, 'Average Benefit', `${avgBenefit}%`, y);
  y = addField(doc, 'Net Delta (Benefit - Cost)', `${avgBenefit - avgCost > 0 ? '+' : ''}${avgBenefit - avgCost}%`, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [['#', 'Employee', 'Item', 'Cost%', 'Benefit%', 'Delta']],
    body: requests.map((r, i) => [
      (i + 1).toString(),
      r.employee,
      r.item,
      `${r.cost}%`,
      `${r.benefit}%`,
      `${r.benefit - r.cost > 0 ? '+' : ''}${r.benefit - r.cost}%`,
    ]),
    ...tableStyles,
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  // 5. Decision Breakdown
  if (y > 220) { doc.addPage(); ensureDarkBg(doc); y = 20; }
  y = addSectionHeader(doc, '5. DECISION BREAKDOWN', y);
  for (const req of requests) {
    if (y > 240) { doc.addPage(); ensureDarkBg(doc); y = 20; }
    doc.setFontSize(10);
    doc.setTextColor(16, 185, 129);
    doc.text(`${req.employee} — ${req.item}`, 16, y);
    y += 6;
    y = addField(doc, 'Supplier', req.supplier, y);
    y = addField(doc, 'Status', req.status.toUpperCase(), y);
    y = addField(doc, 'Quantity', req.quantity.toString(), y);
    for (const point of req.explanationPoints) {
      y = addWrappedText(doc, `• ${point}`, 18, y, 168);
    }
    y += 4;
  }

  // 6. Notifications Summary
  if (y > 240) { doc.addPage(); ensureDarkBg(doc); y = 20; }
  y = addSectionHeader(doc, '6. NOTIFICATIONS SUMMARY', y);
  y = addField(doc, 'Approved Count', approved.length.toString(), y);
  for (const r of approved) { y = addWrappedText(doc, `✓ ${r.employee} — ${r.item} (${r.supplier})`, 18, y, 168); }
  y = addField(doc, 'Pending Count', pending.length.toString(), y);
  for (const r of pending) { y = addWrappedText(doc, `◌ ${r.employee} — ${r.item} (${r.supplier})`, 18, y, 168); }
  y = addField(doc, 'Rejected Count', rejected.length.toString(), y);
  for (const r of rejected) { y = addWrappedText(doc, `✗ ${r.employee} — ${r.item} (${r.supplier})`, 18, y, 168); }
  y += 4;

  // 7. Weekly Assessment
  if (y > 250) { doc.addPage(); ensureDarkBg(doc); y = 20; }
  y = addSectionHeader(doc, '7. WEEKLY ASSESSMENT', y);
  y = addWrappedText(doc, 'The majority of procurement decisions this week optimized for reliability and supplier trust, with minimal compliance issues. Cost efficiency improved 8% compared to the previous period.', 16, y, 170);
  y += 4;
  y = addWrappedText(doc, `Benefit outweighs cost on average (delta: +${avgBenefit - avgCost}%), indicating efficient procurement decisions this week. ${pending.length} request(s) remain pending supervisor review.`, 16, y, 170);

  // Page numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 140);
    doc.text(`ProqAI Weekly Report — Page ${i} of ${pageCount}`, 14, 290);
    doc.text('Confidential', 175, 290);
  }

  doc.save(`ProqAI_Weekly_Report_${timestamp}.pdf`);
}
