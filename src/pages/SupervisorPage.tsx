import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ProqAILogo from '@/components/ProqAILogo';
import { ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import { mockRequests, type SupervisorRequest } from '@/data/supervisorMockData';

function useCursorTooltip() {
  const [tip, setTip] = useState<{ text: string; x: number; y: number } | null>(null);
  const show = useCallback((text: string, e: React.MouseEvent) => {
    setTip({ text, x: e.clientX, y: e.clientY });
  }, []);
  const move = useCallback((e: React.MouseEvent) => {
    setTip((prev) => prev ? { ...prev, x: e.clientX, y: e.clientY } : null);
  }, []);
  const hide = useCallback(() => setTip(null), []);
  return { tip, show, move, hide };
}

function CursorTooltip({ tip }: { tip: { text: string; x: number; y: number } | null }) {
  if (!tip) return null;
  return (
    <div
      className="pointer-events-none fixed z-[200] max-w-xs rounded-md border border-border bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md animate-in fade-in-0"
      style={{ left: tip.x + 12, top: tip.y - 8 }}
    >
      {tip.text}
    </div>
  );
}

const riskColors = {
  financial: 'hsl(358, 87%, 52%)',
  operational: 'hsl(217, 91%, 60%)',
  esg: 'hsl(160, 84%, 39%)',
  geopolitical: 'hsl(45, 93%, 58%)',
};

const riskLabels: Record<string, string> = {
  financial: 'Financial Risk: Cost volatility and budget deviation',
  operational: 'Operational Risk: Supply chain disruptions and delays',
  esg: 'ESG Risk: Environmental and social compliance gaps',
  geopolitical: 'Geopolitical Risk: Regional instability and trade barriers',
};

function DonutChart({ risks, tt }: { risks: SupervisorRequest['risks']; tt: ReturnType<typeof useCursorTooltip> }) {
  const entries = Object.entries(risks) as [keyof typeof risks, number][];
  const total = entries.reduce((s, [, v]) => s + v, 0) || 1;
  const r = 60;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="flex items-center gap-6">
      <svg width="160" height="160" viewBox="0 0 160 160">
        {entries.map(([key, value]) => {
          const dash = (value / total) * circumference;
          const currentOffset = offset;
          offset += dash;
          return (
            <circle
              key={key}
              cx="80" cy="80" r={r}
              fill="none"
              stroke={riskColors[key]}
              strokeWidth="20"
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-currentOffset}
              className="transition-all duration-300 cursor-pointer hover:opacity-80"
              onMouseEnter={(e) => tt.show(riskLabels[key], e)}
              onMouseMove={tt.move}
              onMouseLeave={tt.hide}
            />
          );
        })}
      </svg>
      <div className="flex flex-col gap-2">
        {entries.map(([key, value]) => (
          <div key={key} className="flex items-center gap-2 text-xs">
            <span className="w-3 h-3 rounded-full" style={{ background: riskColors[key] }} />
            <span className="text-muted-foreground capitalize">{key}: {value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarChart({ label, value, color, tooltipText, tt }: { label: string; value: number; color: string; tooltipText: string; tt: ReturnType<typeof useCursorTooltip> }) {
  return (
    <div
      className="space-y-1 cursor-pointer"
      onMouseEnter={(e) => tt.show(tooltipText, e)}
      onMouseMove={tt.move}
      onMouseLeave={tt.hide}
    >
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-3 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
    </div>
  );
}

const SupervisorPage = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState(mockRequests);
  const [selectedId, setSelectedId] = useState<string>(requests[0]?.id ?? '');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const selected = requests.find((r) => r.id === selectedId);

  const handleStatus = (id: string, status: 'approved' | 'rejected') => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
    setSelectedId(id);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
          <button onClick={() => navigate('/portal')} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <ProqAILogo />
          <span className="text-xs uppercase tracking-wider text-muted-foreground ml-2">Supervisor Dashboard</span>
        </div>
      </header>

      <main className="flex-1 flex pt-16 h-[calc(100vh-4rem)]">
        {/* LEFT — Analysis */}
        <aside className="w-[40%] border-r border-border p-6 overflow-y-auto space-y-8">
          {selected ? (
            <>
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-1">{selected.supplier}</h2>
                <p className="text-xs text-muted-foreground">{selected.title}</p>
              </div>

              <div className="glass-card rounded-lg p-5 space-y-3">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Risk Analysis</h3>
                <DonutChart risks={selected.risks} />
              </div>

              <div className="glass-card rounded-lg p-5 space-y-4">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Cost vs Benefit</h3>
                <BarChart
                  label="Cost Impact"
                  value={selected.costValue}
                  color="hsl(358, 87%, 52%)"
                  tooltip={`Estimated cost impact: ${selected.costValue}% of allocated budget will be consumed by this procurement.`}
                />
                <BarChart
                  label="Potential Benefit"
                  value={selected.benefitValue}
                  color="hsl(160, 84%, 39%)"
                  tooltip={`Projected benefit: ${selected.benefitValue}% improvement in operational efficiency and value delivery.`}
                />
              </div>
            </>
          ) : (
            <p className="text-muted-foreground text-sm">Select a request to view analysis.</p>
          )}
        </aside>

        {/* RIGHT — Request Inbox */}
        <section className="w-[60%] p-6 overflow-y-auto space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Request Inbox</h2>
          {requests.map((req) => {
            const isExpanded = expandedId === req.id;
            const isSelected = selectedId === req.id;
            return (
              <div
                key={req.id}
                className={`glass-card rounded-lg transition-all cursor-pointer ${isSelected ? 'border-primary/50' : ''}`}
              >
                <button
                  className="w-full flex items-center justify-between p-4 text-left"
                  onClick={() => toggleExpand(req.id)}
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{req.title}</p>
                    <p className="text-xs text-muted-foreground">{req.subtitle}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {req.status !== 'pending' && (
                      <span className={`text-xs font-semibold uppercase ${req.status === 'approved' ? 'text-accent' : 'text-destructive'}`}>
                        {req.status}
                      </span>
                    )}
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                    <p className="text-xs text-muted-foreground">
                      The AI suggested <span className="text-foreground font-medium">{req.supplier}</span> considering:
                    </p>
                    <ul className="space-y-1">
                      {req.explanationPoints.map((point, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          {point}
                        </li>
                      ))}
                    </ul>
                    {req.status === 'pending' && (
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={() => handleStatus(req.id, 'approved')}
                          className="px-4 py-1.5 rounded-md text-xs font-semibold bg-accent text-accent-foreground hover:bg-accent/80 transition-colors"
                        >
                          Approve Decision
                        </button>
                        <button
                          onClick={() => handleStatus(req.id, 'rejected')}
                          className="px-4 py-1.5 rounded-md text-xs font-semibold bg-destructive text-destructive-foreground hover:bg-destructive/80 transition-colors"
                        >
                          Reject Decision
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </section>
      </main>
    </div>
  );
};

export default SupervisorPage;
