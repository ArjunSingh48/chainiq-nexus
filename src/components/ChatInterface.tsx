import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, ChevronUp, ChevronDown, Mic, Pause, RotateCcw, ShoppingCart } from 'lucide-react';

export interface Message {
  role: 'ai' | 'user';
  text: string;
  interpretedAs?: Array<{ label: string; value: string; flag?: boolean }>;
  neededFromRequester?: string;
  isError?: boolean;
  isClarification?: boolean;
  clarificationField?: string;
}

export interface ChatSubmitResult {
  reply: string | string[];
  interpretedAs?: Array<{ label: string; value: string; flag?: boolean }>;
  neededFromRequester?: string;
  isClarification?: boolean;
  clarificationFields?: Record<string, string>; // question text -> field name
  disambiguationMessage?: string;
}

interface Props {
  minimized: boolean;
  onSubmit: (msg: string, answeringField?: string | null) => Promise<ChatSubmitResult>;
  phase: 'chat' | 'results';
  loading: boolean;
  onMessagesChange?: (messages: { role: string; text: string; interpretedAs?: Array<{ label: string; value: string }> }[]) => void;
  initialMessages?: Message[];
  onQuickOrder?: () => void;
  quickOrderLabel?: string;
  chatPlaceholder?: string;
}

const PROGRESS_STEPS = [
  'Thinking...',
  'Finding details...',
  'Double-checking info...',
  'Considering next steps...',
];

const DEFAULT_MESSAGES: Message[] = [
  { role: 'ai', text: 'Describe what you need to buy. I will analyse it, run the supplier engine, and return the shortlist.' },
];

const ChatInterface = ({ minimized, onSubmit, phase, loading, onMessagesChange, initialMessages, onQuickOrder, quickOrderLabel, chatPlaceholder }: Props) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages ?? DEFAULT_MESSAGES);
  const [input, setInput] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 460, height: 560 });
  const [progressStep, setProgressStep] = useState(0);
  const [lastFailedMsg, setLastFailedMsg] = useState<string | null>(null);
  const [voiceLevels, setVoiceLevels] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0]);
  const [activeClarification, setActiveClarification] = useState<{ question: string; field: string } | null>(null);
  const recognitionRef = useRef<any>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resizeStateRef = useRef<{ startX: number; startY: number; startWidth: number; startHeight: number } | null>(null);
  const voiceDecayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    onMessagesChange?.(messages);
  }, [messages, onMessagesChange]);

  useEffect(() => {
    if (loading) {
      setProgressStep(0);
      progressTimerRef.current = setInterval(() => {
        setProgressStep((prev) => Math.min(prev + 1, PROGRESS_STEPS.length - 1));
      }, 1850);
    } else {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [loading]);

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

  const stopVoiceBars = useCallback(() => {
    if (voiceDecayRef.current) clearInterval(voiceDecayRef.current);
    voiceDecayRef.current = null;
    setVoiceLevels([0, 0, 0, 0, 0, 0, 0, 0]);
  }, []);

  const startVoiceBars = useCallback(() => {
    // Gentle idle animation while listening but no speech detected
    voiceDecayRef.current = setInterval(() => {
      setVoiceLevels((prev) =>
        prev.map((v) => Math.max(v * 0.7, 0.1 + Math.random() * 0.12))
      );
    }, 120);
  }, []);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      stopVoiceBars();
    };
  }, [stopVoiceBars]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      stopVoiceBars();
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

    recognition.onend = () => { setIsListening(false); stopVoiceBars(); };
    recognition.onerror = () => { setIsListening(false); stopVoiceBars(); };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    startVoiceBars();
  }, [isListening, startVoiceBars, stopVoiceBars]);

  const handleSend = async () => {
    if (loading || !input.trim()) return;
    const msg = input.trim();
    // If user didn't click a specific question, infer it if there's only one
    const currentClarifications = messages.filter(m => m.isClarification);
    const answeredClarification = activeClarification ?? (currentClarifications.length === 1 ? { question: currentClarifications[0].text, field: currentClarifications[0].clarificationField ?? 'unknown' } : null);
    const answeredQuestion = answeredClarification?.question ?? null;
    const answeringField = answeredClarification?.field ?? null;
    setActiveClarification(null);
    setMessages((prev) => [...prev, { role: 'user', text: msg }]);
    setInput('');

    try {
      const result = await onSubmit(msg, answeringField);
      setLastFailedMsg(null);
      setMessages((prev) => {
        // Convert old clarification messages to regular messages (no longer clickable)
        const next = prev.map(m => m.isClarification ? { ...m, isClarification: false } : m);

        // Attach interpretedAs to the user message
        for (let index = next.length - 1; index >= 0; index -= 1) {
          if (next[index].role === 'user' && next[index].text === msg && !next[index].interpretedAs) {
            next[index] = { ...next[index], interpretedAs: result.interpretedAs };
            break;
          }
        }

        const replies = Array.isArray(result.reply) ? result.reply : [result.reply];

        if (result.isClarification) {
          // The backend returns questions only for still-missing fields — this is authoritative.
          const newQuestionTexts = new Set(replies);

          // Remove old AI messages whose text duplicates a question being re-asked,
          // but only when it wouldn't cause loss of conversation context (skip during disambiguation)
          if (!result.disambiguationMessage) {
            const matchesNewQuestion = (text: string) =>
              newQuestionTexts.has(text) || newQuestionTexts.has(text.replace(/^I didn't catch that\.\s*/, ''));
            const deduped = next.filter(m =>
              !(m.role === 'ai' && !m.isClarification && matchesNewQuestion(m.text))
            );
            next.length = 0;
            next.push(...deduped);
          }

          // Add disambiguation message as a regular (non-clickable) AI message if present
          if (result.disambiguationMessage) {
            next.push({ role: 'ai', text: result.disambiguationMessage });
          }

          // Add new clickable clarification messages
          const fieldMap = result.clarificationFields ?? {};
          for (const reply of replies) {
            const didntCatch = answeredQuestion && reply === answeredQuestion;
            next.push({
              role: 'ai',
              text: didntCatch ? `I didn't catch that. ${reply}` : reply,
              isClarification: true,
              clarificationField: fieldMap[reply],
            });
          }
        } else {
          // Normal response (completed or error)
          for (let i = 0; i < replies.length; i += 1) {
            next.push({
              role: 'ai',
              text: replies[i],
              neededFromRequester: i === replies.length - 1 ? result.neededFromRequester : undefined,
            });
          }
        }
        return next;
      });
    } catch (error) {
      const text = error instanceof Error ? error.message : 'Request failed.';
      setLastFailedMsg(msg);
      setMessages((prev) => [...prev, { role: 'ai', text: `Workflow failed: ${text}`, isError: true } as Message]);
    }
  };

  const handleClarificationClick = (question: string, field?: string) => {
    if (loading) return;
    setActiveClarification({ question, field: field ?? 'unknown' });
    setInput('');
    inputRef.current?.focus();
  };

  const renderMessageBubble = (message: Message, index: number, compact = false, prevMessage?: Message) => {
    const isUser = message.role === 'user';
    const showInterpretationPopover = isUser && !!message.interpretedAs;
    const isConsecutiveAi = !isUser && prevMessage && prevMessage.role === 'ai';
    const showLabel = !isUser && !isConsecutiveAi;
    return (
      <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'} ${isConsecutiveAi ? '!mt-1' : ''} ${compact ? '' : 'animate-fade-in'}`}>
        <div className={`group relative max-w-[85%] ${isUser ? 'items-end' : ''}`}>
          {message.isClarification ? (
            <button
              onClick={() => handleClarificationClick(message.text, message.clarificationField)}
              disabled={loading}
              className={`chat-mono w-full text-left whitespace-pre-wrap rounded-xl px-4 py-3 text-sm border transition-colors ${
                activeClarification?.question === message.text
                  ? 'border-primary bg-primary/10 text-slate-50 shadow-lg shadow-primary/10'
                  : 'border-slate-700 bg-slate-900/95 text-slate-50 shadow-lg shadow-black/20 hover:border-slate-500 hover:bg-slate-800/95'
              } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {showLabel && <span className="mb-1 block text-xs font-bold text-emerald-400">ProqAI</span>}
              {message.text}
            </button>
          ) : (
          <div className={`chat-mono whitespace-pre-wrap rounded-xl px-4 py-3 text-sm ${isUser ? 'bg-primary text-primary-foreground' : 'border border-slate-700 bg-slate-900/95 text-slate-50 shadow-lg shadow-black/20'}`}>
            {showLabel && <span className="mb-1 block text-xs font-bold text-emerald-400">ProqAI</span>}
            {message.text}
          </div>
          )}
          {showInterpretationPopover && (
            <div className="pointer-events-none absolute bottom-full right-0 z-20 mb-2 opacity-0 transition-opacity duration-150 group-hover:pointer-events-auto group-hover:opacity-100">
              <div className="flex flex-col gap-1.5 rounded-lg border border-white/10 bg-slate-950/95 px-3 py-2.5 shadow-lg backdrop-blur-sm min-w-48">
                {message.interpretedAs!.map((item) =>
                  item.flag !== undefined ? (
                    <div key={item.label} className={`rounded-md px-2 py-1 text-[11px] leading-4 text-center ${item.flag ? 'bg-emerald-500/10 text-slate-500' : 'bg-white/5 text-slate-500'}`}>
                      {item.label}
                    </div>
                  ) : (
                    <div key={item.label} className="flex items-baseline justify-between gap-3 rounded-md bg-white/5 px-2 py-1 text-[11px] leading-4 text-slate-300">
                      <span className="shrink-0 font-medium text-slate-500">{item.label.replace(/_/g, ' ')}</span>
                      <span className="text-right break-words">{item.value}</span>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
          {!isUser && message.isError && lastFailedMsg && (
            <button
              onClick={handleRetry}
              className="mt-2 flex items-center gap-1.5 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-200 transition-colors hover:bg-red-500/20"
            >
              <RotateCcw className="h-3 w-3" />
              Retry
            </button>
          )}
          {!isUser && onQuickOrder && phase === 'results' && index === messages.length - 1 && !message.isError && (
            <button
              onClick={onQuickOrder}
              className="mt-2 flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground transition-colors hover:bg-accent/80"
            >
              <ShoppingCart className="h-3 w-3" />
              {quickOrderLabel || 'Order Now'}
            </button>
          )}
        </div>
      </div>
    );
  };

  const micButton = (size: 'sm' | 'lg') => {
    const sz = size === 'lg' ? 'p-3' : 'p-2';
    const iconSz = size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
    const radius = size === 'lg' ? 'rounded-xl' : 'rounded-lg';
    return (
      <button
        onClick={toggleListening}
        className={`relative overflow-hidden ${radius} transition-colors ${
          isListening
            ? 'bg-destructive text-destructive-foreground'
            : 'bg-muted text-muted-foreground hover:bg-muted/80'
        } ${sz}`}
        disabled={loading}
        type="button"
        title={isListening ? 'Stop listening' : 'Click to speak'}
      >
        {isListening && (
          <div className="absolute inset-0 flex items-end justify-center gap-px px-1 pb-1 opacity-40">
            {voiceLevels.map((level, i) => (
              <span
                key={i}
                className="flex-1 rounded-full bg-white transition-[height] duration-75"
                style={{ height: `${Math.max(15, level * 100)}%` }}
              />
            ))}
          </div>
        )}
        <span className="relative z-10">
          {isListening ? <Pause className={iconSz} /> : <Mic className={iconSz} />}
        </span>
        {isListening && (
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-destructive animate-pulse z-10" />
        )}
      </button>
    );
  };

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
  const handleRetry = async () => {
    if (!lastFailedMsg || loading) return;
    const msg = lastFailedMsg;
    setMessages((prev) => prev.filter((m) => !m.isError));
    setLastFailedMsg(null);
    setMessages((prev) => [...prev, { role: 'user', text: msg }]);
    try {
      const result = await onSubmit(msg);
      setMessages((prev) => {
        const next = [...prev];
        const replies = Array.isArray(result.reply) ? result.reply : [result.reply];
        for (let i = 0; i < replies.length; i += 1) {
          next.push({ role: 'ai', text: replies[i], neededFromRequester: i === replies.length - 1 ? result.neededFromRequester : undefined });
        }
        return next;
      });
    } catch (error) {
      const text = error instanceof Error ? error.message : 'Request failed.';
      setLastFailedMsg(msg);
      setMessages((prev) => [...prev, { role: 'ai', text: `Workflow failed: ${text}`, isError: true } as Message]);
    }
  };

  const typingBubble = (
    <div className="flex justify-start animate-fade-in">
      <div className="max-w-[85%] rounded-xl border border-slate-700 bg-slate-900/95 px-4 py-3 text-slate-50 shadow-lg shadow-black/20">
        <span className="mb-2 block text-xs font-bold text-emerald-400">ProqAI</span>
        <div className="space-y-2">
          {PROGRESS_STEPS.map((step, i) => (
            <div key={step} className={`flex items-center gap-2 text-xs transition-all duration-500 ${i <= progressStep ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
              {i < progressStep ? (
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
              ) : i === progressStep ? (
                <span className="h-2 w-2 rounded-full bg-sky-300 animate-pulse" />
              ) : (
                <span className="h-2 w-2 rounded-full bg-slate-600" />
              )}
              <span className={i < progressStep ? 'text-emerald-300' : i === progressStep ? 'text-sky-200' : 'text-slate-500'}>{step}</span>
            </div>
          ))}
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
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold tracking-[0.18em] text-slate-400">CHAT</p>
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
          <span className="text-xs font-semibold text-slate-300">ProqAI Chat</span>
          <ChevronDown className="h-4 w-4 text-slate-300" />
        </div>
        <div
          className="absolute right-0 top-0 h-5 w-5 cursor-nesw-resize"
          onMouseDown={startResize}
          title="Resize chat"
        />
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="flex flex-col gap-3 px-4 py-4">
            {messages.map((m, i) => renderMessageBubble(m, i, true, messages[i - 1]))}
            {loading && typingBubble}
            <div ref={bottomRef} />
          </div>
        </div>
        <div className="flex gap-2 border-t border-white/10 p-3">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && void handleSend()}
            placeholder={activeClarification ? `Answer: ${activeClarification.question}` : 'Type your message...'}
            className={`chat-mono flex-1 rounded-lg border bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none placeholder:text-slate-400 focus:ring-1 focus:ring-primary ${isListening ? 'border-red-500/50' : 'border-slate-700'}`}
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
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-2xl mx-auto w-full px-4 flex flex-col min-h-full justify-end">
          <div className="w-full space-y-4 py-8">
            {messages.map((m, i) => renderMessageBubble(m, i, false, messages[i - 1]))}
            {loading && typingBubble}
            <div ref={bottomRef} />
          </div>
        </div>
      </div>
      <div className="flex-shrink-0 border-t border-white/10 bg-slate-950/80 p-4 backdrop-blur">
        <div className="max-w-2xl mx-auto flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && void handleSend()}
            placeholder={activeClarification ? `Answer: ${activeClarification.question}` : phase === 'chat' ? (chatPlaceholder ?? 'Type your message...') : 'Refine the request or add a new constraint'}
            className={`chat-mono flex-1 rounded-xl border bg-slate-900 px-4 py-3 text-sm text-slate-50 outline-none placeholder:text-slate-400 focus:ring-1 focus:ring-primary ${isListening ? 'border-red-500/50' : 'border-slate-700'}`}
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
