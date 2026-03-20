import { useNavigate } from 'react-router-dom';
import ProqAILogo from '@/components/ProqAILogo';
import { ShieldCheck, MessageSquare, ArrowLeft } from 'lucide-react';

const portals = [
  {
    title: 'Procurement Officer',
    description: 'Create and manage procurement requests with AI-powered sourcing',
    icon: MessageSquare,
    path: '/chat',
  },
  {
    title: 'Supervisor',
    description: 'Review, approve and audit procurement decisions',
    icon: ShieldCheck,
    path: '/supervisor',
  },
];

const PortalSelect = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-black/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-4">
          <button onClick={() => navigate('/')} className="text-muted-foreground hover:text-foreground transition-colors duration-200">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <ProqAILogo />
          <span className="text-xs uppercase tracking-wider text-muted-foreground ml-1">Select Portal</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 px-4 sm:px-6 pt-20 sm:pt-16 pb-8">
        {portals.map((p) => (
          <button
            key={p.title}
            onClick={() => navigate(p.path)}
            className="glass-card rounded-2xl p-8 sm:p-10 w-full sm:w-80 flex flex-col items-center gap-6 text-center transition-all duration-300 hover:scale-[1.03] hover:border-primary/40 hover:shadow-[0_0_40px_rgba(236,30,36,0.1)] group cursor-pointer"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
              <p.icon className="w-7 h-7 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">{p.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{p.description}</p>
            </div>
            <span className="cta-impact text-sm mt-2">
              <span>Enter →</span>
            </span>
          </button>
        ))}
      </main>
    </div>
  );
};

export default PortalSelect;
