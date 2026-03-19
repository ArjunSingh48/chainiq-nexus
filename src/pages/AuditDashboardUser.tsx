import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, MapPin, Package, TrendingUp } from 'lucide-react';
import ProqAILogo from '@/components/ProqAILogo';
import { DonutChart, BarChart, CursorTooltip, useCursorTooltip, riskColors } from '@/components/RiskDonutChart';
import { userAuditData } from '@/data/auditMockData';
import { generateAuditPdf } from '@/lib/generateAuditPdf';

const AuditDashboardUser = () => {
  const navigate = useNavigate();
  const tt = useCursorTooltip();
  const d = userAuditData;

  const handleDownload = () => {
    generateAuditPdf({
      workflow: null, suppliers: [], top10: [], selectedSupplier: null,
      notifications: [], consignments: [], chatMessages: [], sessionId: null,
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/chat')} className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <ProqAILogo />
            <span className="text-xs uppercase tracking-wider text-muted-foreground ml-2">Your Procurement Insights</span>
          </div>
          <button onClick={handleDownload} className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-xs font-semibold uppercase tracking-wider text-foreground hover:bg-muted transition-colors">
            <FileText className="w-4 h-4 text-accent" />
            Download PDF
          </button>
        </div>
      </header>

      <main className="flex-1 pt-24 pb-16 px-4 max-w-4xl mx-auto w-full space-y-8">
        {/* Overview */}
        <section className="glass-card rounded-xl p-6">
          <p className="text-sm text-muted-foreground leading-relaxed">
            This request was processed using ProqAI's intelligent sourcing system. Suppliers were evaluated based on cost, quality, risk, and ESG factors to determine the most optimal outcome. Below is a complete transparency breakdown of the decision.
          </p>
        </section>

        {/* Request Summary */}
        <section className="glass-card rounded-xl p-6 space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">Request Summary</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Category: <span className="text-foreground">{d.request.category}</span></li>
            <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Country: <span className="text-foreground">{d.request.country}</span></li>
            <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Quantity: <span className="text-foreground">{d.request.quantity}</span></li>
            <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Budget: <span className="text-foreground">{d.request.budget}</span></li>
          </ul>
        </section>

        {/* AI Interpretation */}
        <section className="glass-card rounded-xl p-6 space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">AI Interpretation</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2"><span className="text-secondary mt-0.5">•</span> Intent detected: <span className="text-foreground">{d.interpretation.intent}</span></li>
            <li className="flex items-start gap-2"><span className="text-secondary mt-0.5">•</span> Constraints applied: <span className="text-foreground">{d.interpretation.constraints}</span></li>
            <li className="flex items-start gap-2"><span className="text-secondary mt-0.5">•</span> Follow-ups resolved: <span className="text-foreground">{d.interpretation.followUps}</span></li>
          </ul>
        </section>

        {/* Supplier Decision */}
        <section className="glass-card rounded-xl p-6 space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">Supplier Decision — Why {d.supplierDecision.name}?</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {d.supplierDecision.reasons.map((reason, i) => (
              <li key={i} className="flex items-start gap-2"><span className="text-accent mt-0.5">•</span> <span className="text-foreground">{reason}</span></li>
            ))}
          </ul>
        </section>

        {/* Supplier Comparison */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">Supplier Comparison</h2>
          <div className="grid gap-3">
            {d.supplierComparison.map((s, i) => (
              <div key={s.name} className="glass-card rounded-lg p-4 flex items-center gap-4">
                <span className="text-xs font-bold text-muted-foreground w-6">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.explanation}</p>
                </div>
                <div className="w-32 flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${s.confidence}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-accent">{s.confidence}%</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Risk & Impact */}
        <section className="glass-card rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">Risk & Impact</h2>
          <DonutChart risks={d.risks} tt={tt} />
          <p className="text-xs text-muted-foreground">Geopolitical factors carry the highest weight due to cross-border sourcing from Austria.</p>
        </section>

        {/* Cost vs Benefit */}
        <section className="glass-card rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">Cost vs Benefit</h2>
          <BarChart label="Cost Impact" value={d.costValue} color="hsl(var(--primary))" tooltipText={`${d.costValue}% of allocated budget consumed`} tt={tt} />
          <BarChart label="Potential Benefit" value={d.benefitValue} color="hsl(var(--accent))" tooltipText={`${d.benefitValue}% projected efficiency improvement`} tt={tt} />
          <p className="text-xs text-muted-foreground">Strong benefit-to-cost ratio indicates an efficient procurement decision.</p>
        </section>

        {/* Order Tracking */}
        <section className="glass-card rounded-xl p-6 space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground flex items-center gap-2">
            <Package className="w-4 h-4 text-accent" /> Order Tracking
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="text-foreground font-medium">{d.tracking.status}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">ETA</p>
              <p className="text-foreground font-medium">{d.tracking.eta}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Origin</p>
              <p className="text-foreground font-medium flex items-center gap-1"><MapPin className="w-3 h-3" />{d.tracking.origin}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Destination</p>
              <p className="text-foreground font-medium flex items-center gap-1"><MapPin className="w-3 h-3" />{d.tracking.destination}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Units</p>
              <p className="text-foreground font-medium">{d.tracking.units}</p>
            </div>
          </div>
        </section>

        {/* Final Insight */}
        <section className="rounded-xl border border-accent/30 bg-accent/5 p-6">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-accent mt-0.5 shrink-0" />
            <p className="text-sm text-foreground leading-relaxed">
              This decision balances cost, reliability, and compliance, ensuring efficient procurement execution. The selected supplier meets all policy requirements while offering the best value proposition.
            </p>
          </div>
        </section>
      </main>
      <CursorTooltip tip={tt.tip} />
    </div>
  );
};

export default AuditDashboardUser;
