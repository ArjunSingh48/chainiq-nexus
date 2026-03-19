import { useNavigate } from 'react-router-dom';
import ProqAILogo from '@/components/ProqAILogo';
import NotificationBell from '@/components/NotificationBell';
import { defaultNotifications } from '@/data/suppliers';
import { Settings } from 'lucide-react';

const navLinks = ['About Us', 'Our Approach', 'Our Solutions', 'Digitalization', 'ESG', 'Join Us', 'Contact Us', 'News'];

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen text-foreground">
      <header className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-border text-white">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <ProqAILogo />
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map(link => (
              <a key={link} href="#" className="text-xs font-medium uppercase tracking-wider text-white/70 hover:text-white transition-colors">
                {link}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-1">
            <NotificationBell notifications={defaultNotifications} />
            <button className="p-2 rounded-full hover:bg-muted transition-colors">
              <Settings className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </header>

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

        <div className="absolute inset-0 -z-10 overflow-hidden">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-80"
            src="/videos/hero-bg.mov"
          />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(358,87%,52%,0.05)_0%,_transparent_70%)]" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>
      </main>
    </div>
  );
};

export default Index;
