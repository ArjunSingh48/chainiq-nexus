import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, ChevronUp, ChevronDown, Mic, MicOff } from 'lucide-react';

interface Message {
  role: 'ai' | 'user';
  text: string;
}

interface Props {
  minimized: boolean;
  onSubmit: (msg: string) => Promise<string>;
  phase: 'chat' | 'results';
  loading: boolean;
  onMessagesChange?: (messages: { role: string; text: string }[]) => void;
}

const ChatInterface = ({ minimized, onSubmit, phase, loading, onMessagesChange }: Props) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: 'Describe what you need to buy. I will analyze it, run the supplier engine, and return the shortlist.' },
  ]);
  const [input, setInput] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    onMessagesChange?.(messages);
  }, [messages, onMessagesChange]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => (prev ? prev + ' ' + transcript : transcript));
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isListening]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const msg = input.trim();
    setMessages((prev) => [...prev, { role: 'user', text: msg }]);
    setInput('');

    try {
      const reply = await onSubmit(msg);
      setMessages((prev) => [...prev, { role: 'ai', text: reply }]);
    } catch (error) {
      const text = error instanceof Error ? error.message : 'Request failed.';
      setMessages((prev) => [...prev, { role: 'ai', text: `Workflow failed: ${text}` }]);
    }
  };

  const micButton = (size: 'sm' | 'lg') => (
    <button
      onClick={toggleListening}
      className={`relative rounded-${size === 'lg' ? 'xl' : 'lg'} transition-colors ${
        isListening
          ? 'bg-destructive text-destructive-foreground'
          : 'bg-muted text-muted-foreground hover:bg-muted/80'
      } ${size === 'lg' ? 'p-3' : 'p-2'}`}
      disabled={loading}
      type="button"
    >
      {isListening ? <MicOff className={size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} /> : <Mic className={size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />}
      {isListening && (
        <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-destructive animate-pulse" />
      )}
    </button>
  );

  const lastMessage = messages[messages.length - 1];

  // Minimized bar
  if (minimized && !expanded) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 flex h-[60px] cursor-pointer items-center gap-3 border-t border-white/10 bg-slate-950/95 px-4" onClick={() => setExpanded(true)}>
        <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
        <p className="chat-mono flex-1 truncate text-sm text-slate-100">
          {lastMessage?.role === 'ai' ? 'ProqAI' : 'You'}: {lastMessage?.text}
        </p>
        <ChevronUp className="h-4 w-4 text-slate-300" />
      </div>
    );
  }

  // Expanded from minimized
  if (minimized && expanded) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 flex h-[50vh] flex-col border-t border-white/10 bg-slate-950/96 animate-slide-in-right" style={{ animation: 'none', transform: 'translateY(0)' }}>
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-300">ProqAI Chat</span>
          <button onClick={() => setExpanded(false)}><ChevronDown className="h-4 w-4 text-slate-300" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`chat-mono whitespace-pre-wrap max-w-[80%] rounded-lg px-3 py-2 text-sm ${m.role === 'ai' ? 'border border-slate-700 bg-slate-900 text-slate-50' : 'bg-primary text-primary-foreground'}`}>
                {m.role === 'ai' && <span className="mb-1 block text-xs font-bold text-emerald-400">ProqAI</span>}
                {m.text}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <div className="flex gap-2 border-t border-white/10 p-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && void handleSend()}
            placeholder="Type your message..."
            className="chat-mono flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none placeholder:text-slate-400 focus:ring-1 focus:ring-primary"
            disabled={loading}
          />
          {micButton('sm')}
          <button onClick={() => void handleSend()} className="p-2 bg-primary rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50" disabled={loading}>
            <Send className="w-4 h-4 text-primary-foreground" />
          </button>
        </div>
      </div>
    );
  }

  // Full screen chat
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[radial-gradient(circle_at_top,#16304c_0%,#08111d_48%,#02060b_100%)]">
      <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full px-4">
        <div className="w-full space-y-4 mb-8">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              <div className={`chat-mono whitespace-pre-wrap max-w-[85%] rounded-xl px-4 py-3 text-sm ${m.role === 'ai' ? 'border border-slate-700 bg-slate-900/95 text-slate-50 shadow-lg shadow-black/20' : 'bg-primary text-primary-foreground'}`}>
                {m.role === 'ai' && <span className="mb-1 block text-xs font-bold text-emerald-400">ProqAI</span>}
                {m.text}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>
      <div className="border-t border-white/10 bg-slate-950/80 p-4 backdrop-blur">
        <div className="max-w-2xl mx-auto flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && void handleSend()}
            placeholder={phase === 'chat' ? 'e.g., 500 laptops to Zurich by 2026-04-01 under 200000 EUR' : 'Refine the request or add a new constraint'}
            className="chat-mono flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-50 outline-none placeholder:text-slate-400 focus:ring-1 focus:ring-primary"
            autoFocus
            disabled={loading}
          />
          {micButton('lg')}
          <button onClick={() => void handleSend()} className="p-3 bg-primary rounded-xl hover:bg-primary/80 transition-colors disabled:opacity-50" disabled={loading}>
            <Send className="w-5 h-5 text-primary-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
