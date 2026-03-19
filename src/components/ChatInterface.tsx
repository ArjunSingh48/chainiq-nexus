import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, ChevronUp, ChevronDown, Mic, MicOff } from 'lucide-react';

interface Message {
  role: 'ai' | 'user';
  text: string;
  interpretedAs?: Array<{ label: string; value: string }>;
  neededFromRequester?: string;
}

export interface ChatSubmitResult {
  reply: string | string[];
  interpretedAs?: Array<{ label: string; value: string }>;
  neededFromRequester?: string;
}

interface Props {
  minimized: boolean;
  onSubmit: (msg: string) => Promise<ChatSubmitResult>;
  phase: 'chat' | 'results';
  loading: boolean;
  onMessagesChange?: (messages: { role: string; text: string; interpretedAs?: Array<{ label: string; value: string }> }[]) => void;
}

const ChatInterface = ({ minimized, onSubmit, phase, loading, onMessagesChange }: Props) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: 'Describe what you need to buy. I will analyse it, run the supplier engine, and return the shortlist.' },
  ]);
  const [input, setInput] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 460, height: 560 });
  const recognitionRef = useRef<any>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resizeStateRef = useRef<{ startX: number; startY: number; startWidth: number; startHeight: number } | null>(null);

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

  useEffect(() => {
    const handleMove = (event: MouseEvent) => {
      const resizeState = resizeStateRef.current;
      if (!resizeState) return;
      const nextWidth = Math.min(
        Math.max(resizeState.startWidth + (event.clientX - resizeState.startX), 320),
        Math.max(window.innerWidth - 32, 320),
      );
      const nextHeight = Math.min(
        Math.max(resizeState.startHeight - (event.clientY - resizeState.startY), 280),
        Math.max(window.innerHeight - 32, 280),
      );
      setWindowSize({ width: nextWidth, height: nextHeight });
    };

    const handleUp = () => {
      resizeStateRef.current = null;
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
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
        const replies = Array.isArray(result.reply) ? result.reply : [result.reply];
        for (let i = 0; i < replies.length; i += 1) {
          next.push({
            role: 'ai',
            text: replies[i],
            neededFromRequester: i === replies.length - 1 ? result.neededFromRequester : undefined,
          });
        }
        return next;
      });
    } catch (error) {
      const text = error instanceof Error ? error.message : 'Request failed.';
      setMessages((prev) => [...prev, { role: 'ai', text: `Workflow failed: ${text}` }]);
    }
  };

  const renderMessageBubble = (message: Message, index: number, compact = false) => {
    const isUser = message.role === 'user';
    const showInterpretationPopover = isUser && (!!message.interpretedAs || (loading && index === messages.length - 1));
    return (
      <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'} ${compact ? '' : 'animate-fade-in'}`}>
        <div className={`group relative max-w-[85%] ${isUser ? 'items-end' : ''}`}>
          <div className={`chat-mono whitespace-pre-wrap rounded-xl px-4 py-3 text-sm ${isUser ? 'bg-primary text-primary-foreground' : 'border border-slate-700 bg-slate-900/95 text-slate-50 shadow-lg shadow-black/20'}`}>
            {!isUser && <span className="mb-1 block text-xs font-bold text-emerald-400">ProqAI</span>}
            {message.text}
          </div>
          {showInterpretationPopover && (
            <div className="absolute -top-2 right-0 z-20 hidden max-h-[min(24rem,calc(100vh-6rem))] w-[min(26rem,calc(100vw-3rem))] overflow-y-auto -translate-y-full rounded-xl border border-sky-400/30 bg-slate-950/95 p-3 text-left shadow-2xl group-hover:block">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-300">Interpreted As</p>
              {message.interpretedAs ? (
                <div className="mt-2 space-y-2">
                  {message.interpretedAs.map((item) => (
                    <div key={item.label} className="rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs leading-5 text-slate-200">
                      <span className="mr-2 inline-block text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">{item.label}</span>
                      <span className="break-words whitespace-normal">{item.value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-2 rounded-lg border border-white/10 bg-white/5 px-2 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Status</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-300">
                  <span className="h-2 w-2 rounded-full bg-sky-300 animate-pulse" />
                  <span>Parsing request and building structured interpretation...</span>
                  </div>
                </div>
              )}
            </div>
          )}
          {!isUser && message.neededFromRequester && (
            <div className="pointer-events-none absolute left-0 top-full z-10 hidden pt-2 group-hover:block">
              <div className="text-[11px] text-slate-400">
                <span>Needed from requester:</span> <span>{message.neededFromRequester}</span>
              </div>
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
  const startResize = (event: { preventDefault: () => void; clientX: number; clientY: number }) => {
    event.preventDefault();
    resizeStateRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      startWidth: windowSize.width,
      startHeight: windowSize.height,
    };
  };
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
      <div
        className="fixed bottom-4 left-4 z-50 flex cursor-pointer items-center gap-3 rounded-2xl border border-white/15 bg-slate-950/88 px-4 py-3 shadow-2xl shadow-black/40 backdrop-blur-md transition-colors hover:bg-slate-900/92"
        style={{ width: `min(${windowSize.width}px, calc(100vw - 2rem))` }}
        onClick={() => setExpanded(true)}
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/15">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Chat</p>
          <p className="chat-mono truncate text-sm text-slate-100">
            {lastMessage?.role === 'ai' ? 'ProqAI' : 'You'}: {lastMessage?.text}
          </p>
        </div>
        <ChevronUp className="h-4 w-4 text-slate-300" />
      </div>
    );
  }

  // Expanded from minimized
  if (minimized && expanded) {
    return (
      <div
        className="fixed bottom-4 left-4 z-50 flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-950/88 shadow-2xl shadow-black/50 backdrop-blur-xl animate-slide-in-right"
        style={{
          animation: 'none',
          transform: 'translateY(0)',
          width: `min(${windowSize.width}px, calc(100vw - 2rem))`,
          height: `min(${windowSize.height}px, calc(100vh - 2rem))`,
        }}
      >
        <div
          className="flex cursor-pointer items-center justify-between border-b border-white/10 px-4 py-3"
          onClick={() => setExpanded(false)}
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-300">ProqAI Chat</span>
          <ChevronDown className="h-4 w-4 text-slate-300" />
        </div>
        <div
          className="absolute right-0 top-0 h-5 w-5 cursor-nesw-resize"
          onMouseDown={startResize}
          title="Resize chat"
        />
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
