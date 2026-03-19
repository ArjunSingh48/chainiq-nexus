import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, ChevronUp, ChevronDown, Mic, MicOff } from 'lucide-react';

interface Message {
  role: 'ai' | 'user';
  text: string;
  interpretedAs?: string;
}

export interface ChatSubmitResult {
  reply: string;
  interpretedAs?: string;
}

interface Props {
  minimized: boolean;
  onSubmit: (msg: string) => Promise<ChatSubmitResult>;
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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    onMessagesChange?.(messages);
  }, [messages, onMessagesChange]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!loading) {
      inputRef.current?.focus();
    }
  }, [loading, minimized, expanded]);

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
    if (loading || !input.trim()) return;
    const msg = input.trim();
    setMessages((prev) => [...prev, { role: 'user', text: msg }]);
    setInput('');

    try {
      const result = await onSubmit(msg);
      setMessages((prev) => {
        const next = [...prev];
        for (let index = next.length - 1; index >= 0; index -= 1) {
          if (next[index].role === 'user' && next[index].text === msg && !next[index].interpretedAs) {
            next[index] = { ...next[index], interpretedAs: result.interpretedAs };
            break;
          }
        }
        next.push({ role: 'ai', text: result.reply });
        return next;
      });
    } catch (error) {
      const text = error instanceof Error ? error.message : 'Request failed.';
      setMessages((prev) => [...prev, { role: 'ai', text: `Workflow failed: ${text}` }]);
    }
  };

  const renderMessageBubble = (message: Message, index: number, compact = false) => {
    const isUser = message.role === 'user';
    return (
      <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'} ${compact ? '' : 'animate-fade-in'}`}>
        <div className={`group relative max-w-[85%] ${isUser ? 'items-end' : ''}`}>
          <div className={`chat-mono whitespace-pre-wrap rounded-xl px-4 py-3 text-sm ${isUser ? 'bg-primary text-primary-foreground' : 'border border-slate-700 bg-slate-900/95 text-slate-50 shadow-lg shadow-black/20'}`}>
            {!isUser && <span className="mb-1 block text-xs font-bold text-emerald-400">ProqAI</span>}
            {message.text}
          </div>
          {isUser && message.interpretedAs && (
            <div className="pointer-events-none absolute -top-2 right-0 z-20 hidden w-72 -translate-y-full rounded-xl border border-sky-400/30 bg-slate-950/95 p-3 text-left shadow-2xl group-hover:block">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-300">Interpreted As</p>
              <p className="mt-2 text-xs leading-5 text-slate-200">{message.interpretedAs}</p>
            </div>
          )}
        </div>
      </div>
    );
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
  const typingBubble = (
    <div className="flex justify-start animate-fade-in">
      <div className="max-w-[85%] rounded-xl border border-slate-700 bg-slate-900/95 px-4 py-3 text-slate-50 shadow-lg shadow-black/20">
        <span className="mb-2 block text-xs font-bold text-emerald-400">ProqAI</span>
        <div className="flex w-fit items-center gap-1.5 rounded-full bg-slate-800/90 px-3 py-2">
          <span className="h-2 w-2 rounded-full bg-slate-300 animate-typing-dot" />
          <span className="h-2 w-2 rounded-full bg-slate-300 animate-typing-dot [animation-delay:0.2s]" />
          <span className="h-2 w-2 rounded-full bg-slate-300 animate-typing-dot [animation-delay:0.4s]" />
        </div>
      </div>
    </div>
  );

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
          {messages.map((m, i) => renderMessageBubble(m, i, true))}
          {loading && typingBubble}
          <div ref={bottomRef} />
        </div>
        <div className="flex gap-2 border-t border-white/10 p-3">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && void handleSend()}
            placeholder="Type your message..."
            className="chat-mono flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none placeholder:text-slate-400 focus:ring-1 focus:ring-primary"
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
          {messages.map((m, i) => renderMessageBubble(m, i))}
          {loading && typingBubble}
          <div ref={bottomRef} />
        </div>
      </div>
      <div className="border-t border-white/10 bg-slate-950/80 p-4 backdrop-blur">
        <div className="max-w-2xl mx-auto flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && void handleSend()}
            placeholder={phase === 'chat' ? 'e.g., 500 laptops to Zurich by 2026-04-01 under 200000 EUR' : 'Refine the request or add a new constraint'}
            className="chat-mono flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-50 outline-none placeholder:text-slate-400 focus:ring-1 focus:ring-primary"
            autoFocus
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
