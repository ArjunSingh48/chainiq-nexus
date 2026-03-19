import { useNavigate } from 'react-router-dom';
import ProqAILogo from '@/components/ProqAILogo';
import { ShieldCheck, MessageSquare, ArrowLeft } from 'lucide-react';

const portals = [
  {
    title: 'Procurement Officer',
    description: 'Create and manage procurement requests',
    icon: MessageSquare,
    path: '/chat',
  },
  {
    title: 'Supervisor',
    description: 'Review and approve procurement decisions',
    icon: ShieldCheck,
    path: '/supervisor',
  },
];

const PortalSelect = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center">
          <ProqAILogo />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center gap-8 px-4 pt-16">
        {portals.map((p) => (
          <button
            key={p.title}
            onClick={() => navigate(p.path)}
            className="glass-card rounded-xl p-10 w-80 flex flex-col items-center gap-5 text-center transition-all hover:scale-[1.03] hover:border-primary/50 group cursor-pointer"
          >
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <p.icon className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground">{p.title}</h2>
            <p className="text-sm text-muted-foreground">{p.description}</p>
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
