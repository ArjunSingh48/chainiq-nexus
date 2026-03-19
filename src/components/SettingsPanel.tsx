import { useState } from 'react';
import { Settings } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

export interface SettingsState {
  conflicts: boolean;
  blockages: boolean;
  restrictions: boolean;
  regulatoryConstraints: boolean;
}

interface Props {
  settings: SettingsState;
  onSettingsChange: (settings: SettingsState) => void;
}

const toggleItems: { key: keyof SettingsState; label: string; description: string }[] = [
  { key: 'conflicts', label: 'Conflicts', description: 'Flag suppliers in conflict zones' },
  { key: 'blockages', label: 'Blockages', description: 'Apply trade blockage rules' },
  { key: 'restrictions', label: 'Restrictions', description: 'Enable supplier restrictions' },
  { key: 'regulatoryConstraints', label: 'Regulatory Constraints', description: 'Enforce regional compliance' },
];

const SettingsPanel = ({ settings, onSettingsChange }: Props) => {
  const [open, setOpen] = useState(false);

  const handleToggle = (key: keyof SettingsState) => {
    onSettingsChange({ ...settings, [key]: !settings[key] });
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="p-2 rounded-full hover:bg-muted transition-colors text-white">
        <Settings className="w-5 h-5" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-12 w-80 glass-card rounded-lg z-50 p-4 space-y-3 animate-fade-in">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Scenario Settings</p>
            {toggleItems.map(item => (
              <div key={item.key} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
                <Switch
                  checked={settings[item.key]}
                  onCheckedChange={() => handleToggle(item.key)}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default SettingsPanel;
