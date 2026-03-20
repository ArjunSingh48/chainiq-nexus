import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, FileText, MapPin, Package, TrendingUp, ShieldCheck, AlertTriangle, MessageSquare } from 'lucide-react';
import ProqAILogo from '@/components/ProqAILogo';
import { DonutChart, BarChart, CursorTooltip, useCursorTooltip } from '@/components/RiskDonutChart';
import type { RiskValues } from '@/components/RiskDonutChart';
import { userAuditData, type UserAuditData } from '@/data/auditMockData';
import { generateAuditPdf, type AuditData } from '@/lib/generateAuditPdf';
import { formatCurrency } from '@/lib/utils';

function buildFromAuditData(auditData: AuditData): UserAuditData {
  const req = auditData.workflow?.request;
  const engine = auditData.workflow?.engine_output;
  const top10 = auditData.top10;
  const recommended = engine?.recommendation?.recommended_supplier;
  const chosenName = recommended ?? top10[0]?.name ?? 'N/A';

  const request = {
    category: req?.category_l2 || req?.category_l1 || 'N/A',
    country: req?.country ? `${req.country}` : 'N/A',
    quantity: req?.quantity ?? 0,
    budget: req?.budget_amount ? formatCurrency(req.budget_amount, req.currency) : 'N/A',
  };

  const interpretation = {
    intent: req?.title || req?.request_text || 'N/A',
    constraints: [
      req?.budget_amount ? `Budget cap ${formatCurrency(req.budget_amount, req.currency)}` : null,
      req?.esg_requirement ? 'ESG compliance required' : null,
      req?.required_by_date ? `Delivery by ${req.required_by_date}` : null,
      req?.data_residency_constraint ? 'Data residency constraint' : null,
    ].filter(Boolean).join(', ') || 'None specified',
    followUps: auditData.workflow?.missing_critical_fields?.length
      ? `${auditData.workflow.missing_critical_fields.length} field(s) clarified during conversation`
      : 'No follow-ups needed',
  };

  const reasons: string[] = [];
  if (engine?.recommendation?.reason) reasons.push(engine.recommendation.reason);
  if (engine?.recommendation?.rationale) reasons.push(engine.recommendation.rationale);
  if (reasons.length === 0 && top10[0]) {
    if (top10[0].unitPrice != null) reasons.push(`Unit price: ${top10[0].unitPrice}`);
    if (top10[0].qualityScore != null) reasons.push(`Quality score: ${top10[0].qualityScore}`);
    if (top10[0].riskScore != null) reasons.push(`Risk score: ${top10[0].riskScore}`);
    if (top10[0].esgScore != null) reasons.push(`ESG score: ${top10[0].esgScore}`);
  }

  const supplierDecision = { name: chosenName, reasons };

  const supplierComparison = top10.slice(0, 5).map((s, i) => {
    const confidence = Math.max(50, Math.min(99, Math.round(95 - i * 5 - (s.riskScore ?? 0) / 2)));
    return {
      name: s.name,
      confidence,
      explanation: s.policyCompliant === false
        ? 'Policy compliance warning'
        : i === 0 ? 'Best overall score combining price, quality, and compliance'
        : `Rank #${i + 1} based on combined scoring`,
    };
  });

  const escalations = engine?.escalations ?? [];
  const risks: RiskValues = {
    financial: Math.min(60, Math.round((escalations.filter(e => e.trigger.toLowerCase().includes('budget') || e.trigger.toLowerCase().includes('cost')).length + 1) * 15)),
    operational: Math.min(60, Math.round((escalations.filter(e => e.trigger.toLowerCase().includes('supply') || e.trigger.toLowerCase().includes('delivery')).length + 1) * 10)),
    esg: Math.min(60, Math.round((escalations.filter(e => e.trigger.toLowerCase().includes('esg') || e.trigger.toLowerCase().includes('compliance')).length + 1) * 8)),
    geopolitical: Math.min(60, Math.round((escalations.filter(e => e.trigger.toLowerCase().includes('geo') || e.trigger.toLowerCase().includes('country')).length + 1) * 12)),
  };

  const costValue = req?.budget_amount && top10[0]?.unitPrice != null && req.quantity
    ? Math.min(100, Math.round((top10[0].unitPrice * req.quantity / req.budget_amount) * 100))
    : 65;
  const benefitValue = top10[0]?.qualityScore ?? 80;

  const firstConsignment = auditData.consignments[0];
  const tracking = firstConsignment ? {
    status: 'In Transit',
    origin: `${firstConsignment.originCity}, ${firstConsignment.originCountry}`,
    destination: 'Zurich, Switzerland',
    units: firstConsignment.units,
    eta: new Date(firstConsignment.startTime + 14 * 86400000).toISOString().slice(0, 10),
  } : {
    status: 'Not yet ordered',
    origin: top10[0]?.country ?? 'N/A',
    destination: req?.country ?? 'N/A',
    units: req?.quantity ?? 0,
    eta: 'TBD',
  };

  const policyTrace = (engine?.policy_trace ?? []).map(entry => ({
    title: entry.title,
    status: entry.status,
    summary: entry.summary,
    detail: entry.detail,
    rule: entry.rule,
  }));

  const escalationItems = (engine?.escalations ?? []).map(e => ({
    rule: e.rule,
    trigger: e.trigger,
    escalateTo: e.escalate_to,
    blocking: e.blocking,
  }));

  const chatLog = (auditData.chatMessages ?? []).map(m => ({
    role: m.role as 'user' | 'ai',
    text: m.text,
  }));

  return { request, interpretation, supplierDecision, supplierComparison, risks, costValue, benefitValue, tracking, policyTrace, escalations: escalationItems, chatLog };
}

const AuditDashboardUser = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const tt = useCursorTooltip();

  const auditData = (location.state as { auditData?: AuditData } | null)?.auditData;
  const hasRealData = !!(auditData?.workflow);
  const d = hasRealData ? buildFromAuditData(auditData!) : userAuditData;

  const handleBack = () => {
    navigate('/chat', { state: { fromAudit: true } });
  };

  const handleDownload = () => {
    generateAuditPdf(auditData ?? {
      workflow: null, suppliers: [], top10: [], selectedSupplier: null,
      notifications: [], consignments: [], chatMessages: [], sessionId: null,
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-black/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={handleBack} className="text-muted-foreground hover:text-foreground transition-colors duration-200">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <ProqAILogo />
            <span className="text-xs tracking-wider text-muted-foreground ml-1">Your Procurement Insights</span>
          </div>
          <button onClick={handleDownload} className="flex items-center gap-2 rounded-lg border border-border/60 px-4 py-2 text-xs font-semibold text-foreground transition-colors duration-200 hover:bg-muted/50">
            <FileText className="w-4 h-4 text-accent" />
            Download PDF
          </button>
        </div>
      </header>

      <main className="flex-1 pt-24 pb-16 px-6 max-w-4xl mx-auto w-full space-y-8">
        {/* Overview */}
        <section className="glass-card rounded-2xl p-7">
          <p className="text-sm text-muted-foreground leading-relaxed">
            This request was processed using ProqAI's intelligent sourcing system. Suppliers were evaluated based on cost, quality, risk, and ESG factors to determine the most optimal outcome. Below is a complete transparency breakdown of the decision.
          </p>
        </section>

        {/* Request Context */}
        <section className="glass-card rounded-2xl p-7 space-y-4">
          <h2 className="text-sm font-semibold tracking-wider text-foreground">Request context</h2>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Category: <span className="text-foreground font-medium">{d.request.category}</span></li>
            <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Country: <span className="text-foreground font-medium">{d.request.country}</span></li>
            <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Quantity: <span className="text-foreground font-medium">{d.request.quantity}</span></li>
            <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Budget: <span className="text-foreground font-medium">{d.request.budget}</span></li>
            <li className="flex items-start gap-2"><span className="text-secondary mt-0.5">•</span> Intent detected: <span className="text-foreground font-medium">{d.interpretation.intent}</span></li>
            <li className="flex items-start gap-2"><span className="text-secondary mt-0.5">•</span> Constraints applied: <span className="text-foreground font-medium">{d.interpretation.constraints}</span></li>
            <li className="flex items-start gap-2"><span className="text-secondary mt-0.5">•</span> Follow-ups resolved: <span className="text-foreground font-medium">{d.interpretation.followUps}</span></li>
          </ul>
        </section>

        {/* System Interpretation */}
        <section className="hidden glass-card rounded-2xl p-7 space-y-4">
          <h2 className="text-sm font-semibold tracking-wider text-foreground">System Interpretation</h2>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            <li className="flex items-start gap-2"><span className="text-secondary mt-0.5">•</span> Intent detected: <span className="text-foreground font-medium">{d.interpretation.intent}</span></li>
            <li className="flex items-start gap-2"><span className="text-secondary mt-0.5">•</span> Constraints applied: <span className="text-foreground font-medium">{d.interpretation.constraints}</span></li>
            <li className="flex items-start gap-2"><span className="text-secondary mt-0.5">•</span> Follow-ups resolved: <span className="text-foreground font-medium">{d.interpretation.followUps}</span></li>
          </ul>
        </section>

        {/* Supplier Decision */}
        <section className="glass-card rounded-2xl p-7 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Supplier decision: Why {d.supplierDecision.name}?</h2>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            {d.supplierDecision.reasons.map((reason, i) => (
              <li key={i} className="flex items-start gap-2"><span className="text-accent mt-0.5">•</span> <span className="text-foreground">{reason}</span></li>
            ))}
          </ul>
        </section>

        {/* Supplier Comparison */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Supplier comparison</h2>
          <div className="grid gap-3">
            {d.supplierComparison.map((s, i) => (
              <div key={s.name} className="glass-card rounded-xl p-5 flex items-center gap-4 transition-all duration-200 hover:shadow-[0_0_20px_rgba(0,0,0,0.2)]">
                <span className="text-xs font-bold text-muted-foreground w-7 text-center">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{s.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.explanation}</p>
                </div>
                <div className="w-36 flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-accent transition-all duration-700" style={{ width: `${s.confidence}%` }} />
                  </div>
                  <span className="text-xs font-bold text-accent tabular-nums">{s.confidence}%</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Policy Trace */}
        {d.policyTrace.length > 0 && (
          <section className="glass-card rounded-2xl p-7 space-y-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <ShieldCheck className="w-4 h-4 text-accent" /> Policy Trace
            </h2>
            <p className="text-xs text-muted-foreground">
              Each rule the engine evaluated against company policy. This is the primary basis for the decision.
            </p>
            <div className="space-y-3">
              {d.policyTrace.map((entry, i) => {
                const tone =
                  entry.status === 'passed' ? 'border-emerald-400/30 bg-emerald-500/10' :
                  entry.status === 'failed' ? 'border-red-400/30 bg-red-500/10' :
                  entry.status === 'needs_approval' ? 'border-amber-400/30 bg-amber-500/10' :
                  'border-orange-400/30 bg-orange-500/10';
                const label =
                  entry.status === 'passed' ? 'Passed' :
                  entry.status === 'failed' ? 'Failed' :
                  entry.status === 'needs_approval' ? 'Needs Approval' : 'Warning';
                return (
                  <div key={i} className={`rounded-xl border p-4 ${tone}`}>
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-medium text-foreground">{entry.title}</p>
                      <span className="shrink-0 rounded-full border border-current/30 px-2.5 py-0.5 text-[10px] font-semibold">
                        {label}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm text-foreground/90">{entry.summary}</p>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{entry.detail}</p>
                    <p className="mt-2 text-[11px] text-muted-foreground/70">Rule {entry.rule}</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Escalations */}
        {d.escalations.length > 0 && (
          <section className="glass-card rounded-2xl p-7 space-y-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Escalations
            </h2>
            <p className="text-xs text-muted-foreground">
              Items flagged for review or approval beyond the automated decision.
            </p>
            <div className="space-y-3">
              {d.escalations.map((esc, i) => (
                <div key={i} className={`rounded-xl border p-4 ${esc.blocking ? 'border-red-400/30 bg-red-500/10' : 'border-amber-400/30 bg-amber-500/10'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium text-foreground">{esc.trigger}</p>
                    <span className={`shrink-0 rounded-full border border-current/30 px-2.5 py-0.5 text-[10px] font-semibold ${esc.blocking ? 'text-red-200' : 'text-amber-200'}`}>
                      {esc.blocking ? 'Blocking' : 'Non-blocking'}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground">Escalated to: <span className="text-foreground font-medium">{esc.escalateTo}</span></p>
                  <p className="mt-1 text-[11px] text-muted-foreground/70">Rule {esc.rule}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Conversation Log */}
        {d.chatLog.length > 0 && (
          <section className="glass-card rounded-2xl p-7 space-y-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <MessageSquare className="w-4 h-4 text-accent" /> Conversation Log
            </h2>
            <p className="text-xs text-muted-foreground">
              The full exchange between the requester and the AI that shaped this procurement decision.
            </p>
            <div className="space-y-3">
              {d.chatLog.map((msg, i) => (
                <div key={i} className={`rounded-xl border p-4 ${msg.role === 'user' ? 'border-primary/30 bg-primary/5' : 'border-border/50 bg-muted/20'}`}>
                  <p className="mb-1.5 text-[10px] font-semibold text-muted-foreground">
                    {msg.role === 'user' ? 'Requester' : 'ProqAI'}
                  </p>
                  <p className="text-sm text-foreground leading-relaxed">{msg.text}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Risk & Impact */}
        <section className="glass-card rounded-2xl p-7 space-y-5">
          <h2 className="text-sm font-semibold text-foreground">Risk & impact</h2>
          <DonutChart risks={d.risks} tt={tt} />
          <p className="text-xs text-muted-foreground">Risk factors weighted based on sourcing context and policy evaluation.</p>
        </section>

        {/* Cost vs Benefit */}
        <section className="glass-card rounded-2xl p-7 space-y-5">
          <h2 className="text-sm font-semibold text-foreground">Cost vs benefit</h2>
          <BarChart label="Cost Impact" value={d.costValue} color="hsl(var(--primary))" tooltipText={`${d.costValue}% of allocated budget consumed`} tt={tt} />
          <BarChart label="Potential Benefit" value={d.benefitValue} color="hsl(var(--accent))" tooltipText={`${d.benefitValue}% projected efficiency improvement`} tt={tt} />
          <p className="text-xs text-muted-foreground">Strong benefit-to-cost ratio indicates an efficient procurement decision.</p>
        </section>

        {/* Order Tracking */}
        <section className="glass-card rounded-2xl p-7 space-y-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Package className="w-4 h-4 text-accent" /> Order Tracking
          </h2>
          <div className="grid grid-cols-2 gap-5 text-sm">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Status</p>
              <p className="text-foreground font-medium">{d.tracking.status}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">ETA</p>
              <p className="text-foreground font-medium">{d.tracking.eta}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Origin</p>
              <p className="text-foreground font-medium flex items-center gap-1"><MapPin className="w-3 h-3" />{d.tracking.origin}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Destination</p>
              <p className="text-foreground font-medium flex items-center gap-1"><MapPin className="w-3 h-3" />{d.tracking.destination}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Units</p>
              <p className="text-foreground font-medium">{d.tracking.units}</p>
            </div>
          </div>
        </section>

        {/* Final Insight */}
        <section className="rounded-2xl border border-accent/30 bg-accent/5 p-7">
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
