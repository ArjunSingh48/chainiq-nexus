import logoImg from '@/assets/proqai-logo.png';

const ProqAILogo = ({ className = '' }: { className?: string }) => (
  <div className={`flex items-center ${className}`}>
    <img src={logoImg} alt="ProqAI" className="h-12 w-auto" />
  </div>
);

export default ProqAILogo;
