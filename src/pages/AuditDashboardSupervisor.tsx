import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, ChevronDown, ChevronUp, TrendingUp, CheckCircle2, Clock, XCircle } from 'lucide-react';
import ProqAILogo from '@/components/ProqAILogo';
import { BarChart, CursorTooltip, useCursorTooltip, riskColors } from '@/components/RiskDonutChart';
import { weeklyRequests, weeklyMetrics, averageRisks } from '@/data/auditMockData';
import { generateWeeklyPdf } from '@/lib/generateWeeklyPdf';

const statusDot: Record<string, string> = {
  approved: 'bg-accent',
  pending: 'bg-yellow-500',
  rejected: 'bg-destructive',
};

const AuditDashboardSupervisor = () => {
  const navigate = useNavigate();
  const tt = useCursorTooltip();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [requests, setRequests] = useState(weeklyRequests);

  const handleDownload = () => {
    generateAuditPdf({
      workflow: null, suppliers: [], top10: [], selectedSupplier: null,
      notifications: [], consignments: [], chatMessages: [], sessionId: null,
    });
  };

  const handleStatus = (id: string, status: 'approved' | 'rejected') => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  const metrics = [
    { label: 'Total Requests', value: weeklyMetrics.total, icon: FileText, color: 'text-foreground' },
    { label: 'Approved', value: weeklyMetrics.approved, icon: CheckCircle2, color: 'text-accent' },
    { label: 'Pending', value: weeklyMetrics.pending, icon: Clock, color: 'text-yellow-500' },
    { label: 'Rejected', value: weeklyMetrics.rejected, icon: XCircle, color: 'text-destructive' },
  ];

  const avgCost = Math.round(requests.reduce((s, r) => s + r.cost, 0) / requests.length);
  const avgBenefit = Math.round(requests.reduce((s, r) => s + r.benefit, 0) / requests.length);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-black/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/supervisor')} className="text-muted-foreground hover:text-foreground transition-colors duration-200">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <ProqAILogo />
            <span className="text-xs uppercase tracking-wider text-muted-foreground ml-1">Weekly Procurement Overview</span>
          </div>
          <button onClick={handleDownload} className="flex items-center gap-2 rounded-lg border border-border/60 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-foreground hover:bg-muted/50 transition-colors duration-200">
            <FileText className="w-4 h-4 text-accent" />
            Download Weekly Report
          </button>
        </div>
      </header>

      <main className="flex-1 pt-24 pb-16 px-6 max-w-5xl mx-auto w-full space-y-8">
        {/* Summary Metrics */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((m) => (
            <div key={m.label} className="glass-card rounded-2xl p-6 flex flex-col items-center gap-3 text-center transition-all duration-200 hover:shadow-[0_0_30px_rgba(0,0,0,0.3)]">
              <m.icon className={`w-6 h-6 ${m.color}`} />
              <p className="text-3xl font-bold text-foreground tabular-nums">{m.value}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{m.label}</p>
            </div>
          ))}
        </section>

        {/* Request List */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">All Requests This Week</h2>
          {requests.map((req) => {
            const isExpanded = expandedId === req.id;
            return (
              <div key={req.id} className="glass-card rounded-xl transition-all duration-200 hover:shadow-[0_0_20px_rgba(0,0,0,0.2)]">
                <button className="w-full flex items-center justify-between p-4 text-left" onClick={() => setExpandedId(isExpanded ? null : req.id)}>
                  <div className="flex items-center gap-3">
                    <span className={`w-2.5 h-2.5 rounded-full ${statusDot[req.status]}`} />
                    <div>
                      <p className="text-sm font-medium text-foreground">{req.employee} requested {req.quantity} {req.item}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">System suggested {req.supplier}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {req.status !== 'pending' && (
                      <span className={`text-xs font-semibold uppercase tracking-wider ${req.status === 'approved' ? 'text-accent' : 'text-destructive'}`}>
                        {req.status}
                      </span>
                    )}
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </button>
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3 border-t border-border/50 pt-3">
                    <ul className="space-y-1.5">
                      {req.explanationPoints.map((point, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>{point}
                        </li>
                      ))}
                    </ul>
                    {req.status === 'pending' && (
                      <div className="flex gap-3 pt-3">
                        <button onClick={() => handleStatus(req.id, 'approved')} className="px-5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider bg-accent text-accent-foreground hover:bg-accent/80 transition-colors duration-200">Approve</button>
                        <button onClick={() => handleStatus(req.id, 'rejected')} className="px-5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider bg-destructive text-destructive-foreground hover:bg-destructive/80 transition-colors duration-200">Reject</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </section>

        {/* Global Insight */}
        <section className="rounded-2xl border border-secondary/30 bg-secondary/5 p-7">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-secondary mt-0.5 shrink-0" />
            <p className="text-sm text-foreground leading-relaxed">
              This week's procurement activity shows a strong preference for low-risk, high-quality suppliers, with most decisions staying within budget constraints. Two requests remain pending supervisor review.
            </p>
          </div>
        </section>

        {/* Risk Distribution */}
        <section className="glass-card rounded-2xl p-7 space-y-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">Average Risk Distribution</h2>
          {(Object.entries(averageRisks) as [string, number][]).map(([key, value]) => (
            <BarChart key={key} label={key.charAt(0).toUpperCase() + key.slice(1)} value={value} color={riskColors[key]} tooltipText={`Average ${key} risk across all requests: ${value}%`} tt={tt} />
          ))}
        </section>

        {/* Cost vs Value Trend */}
        <section className="glass-card rounded-2xl p-7 space-y-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">Cost vs Value Trend</h2>
          <BarChart label="Average Cost Impact" value={avgCost} color="hsl(var(--primary))" tooltipText={`Average cost impact across all requests: ${avgCost}%`} tt={tt} />
          <BarChart label="Average Benefit" value={avgBenefit} color="hsl(var(--accent))" tooltipText={`Average projected benefit: ${avgBenefit}%`} tt={tt} />
          <p className="text-xs text-muted-foreground">Benefit outweighs cost on average, indicating efficient procurement decisions this week.</p>
        </section>

        {/* Notifications Overview */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">Notifications Overview</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Approved', status: 'approved' as const, icon: CheckCircle2, color: 'text-accent', border: 'border-accent/20' },
              { label: 'Pending', status: 'pending' as const, icon: Clock, color: 'text-yellow-500', border: 'border-yellow-500/20' },
              { label: 'Rejected', status: 'rejected' as const, icon: XCircle, color: 'text-destructive', border: 'border-destructive/20' },
            ].map((col) => {
              const items = requests.filter((r) => r.status === col.status);
              return (
                <div key={col.label} className={`glass-card rounded-2xl p-5 border ${col.border}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <col.icon className={`w-4 h-4 ${col.color}`} />
                    <span className="text-xs font-semibold uppercase tracking-wider text-foreground">{col.label} ({items.length})</span>
                  </div>
                  <ul className="space-y-1.5">
                    {items.map((r) => (
                      <li key={r.id} className="text-xs text-muted-foreground">{r.employee} — {r.item}</li>
                    ))}
                    {items.length === 0 && <li className="text-xs text-muted-foreground italic">None</li>}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* Weekly Insight */}
        <section className="rounded-2xl border border-accent/30 bg-accent/5 p-7">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-accent mt-0.5 shrink-0" />
            <p className="text-sm text-foreground leading-relaxed">
              The majority of procurement decisions this week optimized for reliability and supplier trust, with minimal compliance issues. Cost efficiency improved 8% compared to the previous period.
            </p>
          </div>
        </section>
      </main>
      <CursorTooltip tip={tt.tip} />
    </div>
  );
};

export default AuditDashboardSupervisor;
