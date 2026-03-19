import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProqAILogo from '@/components/ProqAILogo';
import { ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import { mockRequests } from '@/data/supervisorMockData';
import { DonutChart, BarChart, CursorTooltip, useCursorTooltip } from '@/components/RiskDonutChart';
import AuditButton from '@/components/AuditButton';

const statusDot: Record<string, string> = {
  approved: 'bg-accent',
  pending: 'bg-yellow-500',
  rejected: 'bg-destructive',
};

const statusLabel: Record<string, string> = {
  approved: 'text-accent',
  rejected: 'text-destructive',
};

const SupervisorPage = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState(mockRequests);
  const [selectedId, setSelectedId] = useState<string>(requests[0]?.id ?? '');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const tt = useCursorTooltip();

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
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-black/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-4">
          <button onClick={() => navigate('/portal')} className="text-muted-foreground hover:text-foreground transition-colors duration-200">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <ProqAILogo />
          <span className="text-xs uppercase tracking-wider text-muted-foreground ml-1">Supervisor Dashboard</span>
        </div>
      </header>

      <main className="flex-1 flex pt-16 h-[calc(100vh-4rem)] min-h-0">
        {/* LEFT — Analysis */}
        <aside className="w-[40%] border-r border-border/50 p-8 overflow-y-auto space-y-8">
          {selected ? (
            <>
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-1">{selected.supplier}</h2>
                <p className="text-xs text-muted-foreground">{selected.title}</p>
              </div>

              <div className="glass-card rounded-xl p-6 space-y-4 flex flex-col items-center">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider self-start">Risk Analysis</h3>
                <DonutChart risks={selected.risks} tt={tt} />
              </div>

              <div className="glass-card rounded-xl p-6 space-y-4">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Cost vs Benefit</h3>
                <BarChart
                  label="Cost Impact"
                  value={selected.costValue}
                  color="hsl(var(--primary))"
                  tooltipText={`Estimated cost impact: ${selected.costValue}% of allocated budget will be consumed by this procurement.`}
                  tt={tt}
                />
                <BarChart
                  label="Potential Benefit"
                  value={selected.benefitValue}
                  color="hsl(var(--accent))"
                  tooltipText={`Projected benefit: ${selected.benefitValue}% improvement in operational efficiency and value delivery.`}
                  tt={tt}
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
                className={`glass-card rounded-xl transition-all duration-200 cursor-pointer hover:shadow-[0_0_30px_rgba(0,0,0,0.3)] ${isSelected ? 'border-primary/40 shadow-[0_0_20px_rgba(236,30,36,0.08)]' : ''}`}
              >
                <button
                  className="w-full flex items-center justify-between p-4 text-left"
                  onClick={() => toggleExpand(req.id)}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${statusDot[req.status] ?? 'bg-muted-foreground'}`} />
                    <div>
                      <p className="text-sm font-medium text-foreground">{req.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{req.subtitle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {req.status !== 'pending' && (
                      <span className={`text-xs font-semibold uppercase tracking-wider ${statusLabel[req.status] ?? ''}`}>
                        {req.status}
                      </span>
                    )}
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3 border-t border-border/50 pt-3">
                    <p className="text-xs text-muted-foreground">
                      The AI suggested <span className="text-foreground font-medium">{req.supplier}</span> considering:
                    </p>
                    <ul className="space-y-1.5">
                      {req.explanationPoints.map((point, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          {point}
                        </li>
                      ))}
                    </ul>
                    {req.status === 'pending' && (
                      <div className="flex gap-3 pt-3">
                        <button
                          onClick={() => handleStatus(req.id, 'approved')}
                          className="px-5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider bg-accent text-accent-foreground hover:bg-accent/80 transition-colors duration-200"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatus(req.id, 'rejected')}
                          className="px-5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider bg-destructive text-destructive-foreground hover:bg-destructive/80 transition-colors duration-200"
                        >
                          Reject
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

      <AuditButton
        role="supervisor"
        auditData={{
          workflow: null, suppliers: [], top10: [], selectedSupplier: null,
          notifications: [], consignments: [], chatMessages: [], sessionId: null,
        }}
      />
      <CursorTooltip tip={tt.tip} />
    </div>
  );
};

export default SupervisorPage;
