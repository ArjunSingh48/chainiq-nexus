const AnalysisOverlay = ({ visible }: { visible: boolean }) => {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-[100] bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center gap-6 animate-fade-in">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 border-2 border-primary/30 rounded-full animate-spin-slow" />
        <div className="absolute inset-2 border-2 border-secondary/40 rounded-full animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '2s' }} />
        <div className="absolute inset-4 border-2 border-accent/50 rounded-full animate-spin-slow" style={{ animationDuration: '1.5s' }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-primary animate-pulse-glow" />
        </div>
      </div>
      <div className="text-center space-y-2">
        <p className="text-lg font-semibold uppercase tracking-widest text-foreground">Analysing constraints…</p>
        <p className="text-sm text-muted-foreground">Ranking suppliers…</p>
      </div>
    </div>
  );
};

export default AnalysisOverlay;
