import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProqAILogo from '@/components/ProqAILogo';
import NotificationBell from '@/components/NotificationBell';
import { defaultNotifications } from '@/data/suppliers';
import { Settings, Eye, EyeOff } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const navLinks = ['About Us', 'Our Approach', 'Our Solutions', 'Digitalization', 'ESG', 'Join Us', 'Contact Us', 'News'];

const CORRECT_PASSWORD = 'Abcd1234';

const Index = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (password === CORRECT_PASSWORD) {
      setOpen(false);
      setPassword('');
      setError('');
      navigate('/portal');
    } else {
      setError('Incorrect password');
    }
  };

  return (
    <div className="min-h-screen text-foreground">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-black/60 backdrop-blur-xl text-white">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <ProqAILogo />
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map(link => (
              <a key={link} href="#" className="text-xs font-medium text-white/60 transition-colors duration-200 hover:text-white">
                {link}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-1">
            <NotificationBell notifications={defaultNotifications} />
            <button className="p-2 rounded-full hover:bg-white/10 transition-colors duration-200">
              <Settings className="w-5 h-5 text-white/80" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 pt-16">
        <div className="text-center max-w-4xl mx-auto space-y-10">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] text-foreground">
            Committed to Delivering{' '}
            <span className="text-primary">Innovative</span>{' '}
            Procurement Solutions
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
            AI-powered autonomous sourcing that ensures compliance, optimizes costs, and delivers audit-ready procurement decisions in real time.
          </p>
          <button
            onClick={() => { setOpen(true); setPassword(''); setError(''); }}
            className="cta-impact text-base"
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
            className="absolute inset-0 w-full h-full object-cover opacity-70"
            src="/videos/hero-bg.mov"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(358,87%,52%,0.04)_0%,_transparent_60%)]" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>
      </main>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enter Password</DialogTitle>
            <DialogDescription>Please enter the access password to continue.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button onClick={handleSubmit} className="w-full">Continue</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
