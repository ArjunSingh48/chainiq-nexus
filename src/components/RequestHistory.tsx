import { useState, useEffect } from 'react';
import { Clock, ChevronRight, X } from 'lucide-react';

export interface HistoryEntry {
  id: string;
  timestamp: number;
  requestText: string;
  category: string;
  status: 'completed' | 'needs_clarification';
  supplierCount: number;
  topSupplier: string | null;
}

const HISTORY_KEY = 'proqai_request_history';

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = sessionStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveHistoryEntry(entry: HistoryEntry) {
  const history = loadHistory();
  const exists = history.some((h) => h.id === entry.id);
  if (!exists) {
    history.unshift(entry);
    if (history.length > 20) history.pop();
    try {
      sessionStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch {}
  }
}

interface Props {
  onSelect: (entry: HistoryEntry) => void;
}

const RequestHistory = ({ onSelect }: Props) => {
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setHistory(loadHistory());
  }, [open]);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-xl border border-white/15 bg-slate-950/88 px-3 py-2 text-xs text-slate-300 shadow-lg backdrop-blur-md transition-colors hover:bg-slate-900/92"
      >
        <Clock className="h-4 w-4" />
        History
      </button>
    );
  }

  return (
    <div className="fixed top-0 right-0 z-50 h-full w-80 border-l border-white/10 bg-slate-950/95 backdrop-blur-xl shadow-2xl animate-slide-in-right flex flex-col">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <span className="text-xs font-semibold text-slate-300">Request History</span>
        <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-200 transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {history.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-8">No previous requests yet.</p>
        ) : (
          history.map((entry) => (
            <button
              key={entry.id}
              onClick={() => { onSelect(entry); setOpen(false); }}
              className="w-full rounded-lg border border-white/10 bg-slate-900/80 p-3 text-left transition-all hover:border-slate-500 hover:bg-slate-900 group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-400">{new Date(entry.timestamp).toLocaleString()}</p>
                  <p className="mt-1 text-sm text-slate-100 truncate">{entry.category || 'Uncategorized'}</p>
                  <p className="mt-0.5 text-xs text-slate-400 truncate">{entry.requestText}</p>
                </div>
                <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-slate-500 group-hover:text-slate-300 transition-colors" />
              </div>
              <div className="mt-2 flex items-center gap-3 text-[11px]">
                <span className={`rounded-full px-2 py-0.5 ${entry.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                  {entry.status === 'completed' ? 'Completed' : 'Clarification'}
                </span>
                {entry.topSupplier && (
                  <span className="text-slate-500 truncate">Top: {entry.topSupplier}</span>
                )}
                <span className="text-slate-500">{entry.supplierCount} suppliers</span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default RequestHistory;
