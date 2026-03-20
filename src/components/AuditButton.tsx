import { useNavigate } from 'react-router-dom';
import { AuditData } from '@/lib/generateAuditPdf';

interface Props {
  auditData: AuditData;
  role?: 'procurement' | 'supervisor';
  onBeforeNavigate?: () => void;
}

const AuditButton = ({ auditData, role = 'procurement', onBeforeNavigate }: Props) => {
  const navigate = useNavigate();

  const handleClick = () => {
    onBeforeNavigate?.();
    if (role === 'supervisor') {
      navigate('/audit-dashboard/supervisor', { state: { auditData } });
    } else {
      navigate('/audit-dashboard/user', { state: { auditData } });
    }
  };

  return (
    <button
      onClick={handleClick}
      className="fixed right-6 bottom-6 z-50 rounded-full px-5 py-2.5 text-xs font-bold text-primary-foreground transition-all hover:scale-105 hover:shadow-[0_0_24px_rgba(236,30,36,0.4)] active:scale-95"
      style={{
        background: 'linear-gradient(135deg, hsl(358,87%,52%), hsl(358,87%,42%))',
        boxShadow: '0 4px 20px rgba(236,30,36,0.25)',
      }}
    >
      AUDIT
    </button>
  );
};

export default AuditButton;
