import { useState } from 'react';
import { Bell, XCircle, CheckCircle, Clock } from 'lucide-react';
import { notifications } from '@/data/suppliers';

const iconMap = {
  rejected: <XCircle className="w-4 h-4 text-destructive" />,
  approved: <CheckCircle className="w-4 h-4 text-accent" />,
  pending: <Clock className="w-4 h-4 text-secondary" />,
};

const NotificationBell = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative p-2 rounded-full hover:bg-muted transition-colors">
        <Bell className="w-5 h-5 text-foreground" />
        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-12 w-80 glass-card rounded-lg z-50 p-3 space-y-2 animate-fade-in">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2">Notifications</p>
            {notifications.map(n => (
              <div key={n.id} className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
                {iconMap[n.type]}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground leading-tight">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{n.time}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
