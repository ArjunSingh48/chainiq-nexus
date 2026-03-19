import { useState, useCallback } from 'react';

export function useCursorTooltip() {
  const [tip, setTip] = useState<{ text: string; x: number; y: number } | null>(null);
  const show = useCallback((text: string, e: React.MouseEvent) => {
    setTip({ text, x: e.clientX, y: e.clientY });
  }, []);
  const move = useCallback((e: React.MouseEvent) => {
    setTip((prev) => (prev ? { ...prev, x: e.clientX, y: e.clientY } : null));
  }, []);
  const hide = useCallback(() => setTip(null), []);
  return { tip, show, move, hide };
}

export function CursorTooltip({ tip }: { tip: { text: string; x: number; y: number } | null }) {
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

export const riskColors: Record<string, string> = {
  financial: 'hsl(var(--primary))',
  operational: 'hsl(var(--secondary))',
  esg: 'hsl(var(--accent))',
  geopolitical: 'hsl(45, 93%, 58%)',
};

export const riskLabels: Record<string, string> = {
  financial: 'Financial Risk: Cost volatility and budget deviation',
  operational: 'Operational Risk: Supply chain disruptions and delays',
  esg: 'ESG Risk: Environmental and social compliance gaps',
  geopolitical: 'Geopolitical Risk: Regional instability and trade barriers',
};

export type RiskValues = { financial: number; operational: number; esg: number; geopolitical: number };

export function DonutChart({ risks, tt }: { risks: RiskValues; tt: ReturnType<typeof useCursorTooltip> }) {
  const entries = Object.entries(risks) as [keyof RiskValues, number][];
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

export function BarChart({ label, value, color, tooltipText, tt, disabled }: {
  label: string; value: number; color: string; tooltipText: string;
  tt: ReturnType<typeof useCursorTooltip>; disabled?: boolean;
}) {
  return (
    <div
      className={`space-y-1 cursor-pointer ${disabled ? 'opacity-40 pointer-events-none' : ''}`}
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
