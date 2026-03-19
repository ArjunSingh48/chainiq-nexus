const AnalysisOverlay = ({ visible }: { visible: boolean }) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-background/90 backdrop-blur-sm animate-fade-in">
      <div className="relative h-24 w-24">
        <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-spin-slow" />
        <div className="absolute inset-2 rounded-full border-2 border-secondary/40 animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '2s' }} />
        <div className="absolute inset-4 rounded-full border-2 border-accent/50 animate-spin-slow" style={{ animationDuration: '1.5s' }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-3 w-3 rounded-full bg-primary animate-pulse-glow" />
        </div>
      </div>
      <div className="space-y-2 text-center">
        <p className="text-lg font-semibold uppercase tracking-widest text-foreground">Analyzing Request...</p>
        <p className="text-sm text-muted-foreground">Parsing chat with Kimi K2 and running supplier analysis...</p>
      </div>
    </div>
  );
};

export default AnalysisOverlay;
