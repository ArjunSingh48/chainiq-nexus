import { useNavigate } from 'react-router-dom';
import ChainIQLogo from '@/components/ChainIQLogo';
import NotificationBell from '@/components/NotificationBell';

const navLinks = ['About Us', 'Our Approach', 'Our Solutions', 'Digitalization', 'ESG', 'Join Us', 'Contact Us', 'News'];

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <ChainIQLogo />
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map(link => (
              <a key={link} href="#" className="text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
                {link}
              </a>
            ))}
          </nav>
          <NotificationBell />
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-col items-center justify-center min-h-screen px-4 pt-16">
        <div className="text-center max-w-4xl mx-auto space-y-8">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold uppercase tracking-tight leading-tight text-foreground">
            Committed to Deliver{' '}
            <span className="text-primary">Innovative</span>{' '}
            Procurement Solutions
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            AI-powered autonomous sourcing that ensures compliance, optimizes costs, and delivers audit-ready procurement decisions in real time.
          </p>
          <button
            onClick={() => navigate('/chat')}
            className="cta-impact text-lg"
          >
            <span>Start with ProqAI →</span>
          </button>
        </div>

        {/* Decorative grid */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(358,87%,52%,0.05)_0%,_transparent_70%)]" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>
      </main>
    </div>
  );
};

export default Index;
