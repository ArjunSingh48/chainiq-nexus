import { FileText } from 'lucide-react';
import { generateAuditPdf, AuditData } from '@/lib/generateAuditPdf';

interface Props {
  auditData: AuditData;
}

const AuditButton = ({ auditData }: Props) => {
  const handleClick = () => {
    generateAuditPdf(auditData);
  };

  return (
    <button
      onClick={handleClick}
      className="fixed left-4 top-16 z-50 flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-md transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
      style={{ background: 'rgba(20,20,30,0.7)' }}
    >
      <FileText className="h-4 w-4 text-emerald-400" />
      Audit
    </button>
  );
};

export default AuditButton;
