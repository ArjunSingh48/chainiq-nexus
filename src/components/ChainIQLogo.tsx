const ChainIQLogo = ({ className = '' }: { className?: string }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <div className="relative w-8 h-8">
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" rx="6" fill="hsl(var(--primary))" />
        <path d="M8 16L14 10L20 16L14 22Z" fill="white" opacity="0.9" />
        <path d="M14 16L20 10L26 16L20 22Z" fill="white" opacity="0.6" />
      </svg>
    </div>
    <span className="text-xl font-bold tracking-wider text-foreground">
      Chain<span className="text-primary">IQ</span>
    </span>
  </div>
);

export default ChainIQLogo;
