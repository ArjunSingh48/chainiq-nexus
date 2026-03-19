import { useState, useRef, useEffect } from 'react';
import { Send, ChevronUp, ChevronDown } from 'lucide-react';

interface Message {
  role: 'ai' | 'user';
  text: string;
}

interface Props {
  minimized: boolean;
  onFirstMessage: (msg: string) => void;
  onConstraintMessage: (msg: string) => void;
  phase: 'chat' | 'globe' | 'constraints';
}

const ChatInterface = ({ minimized, onFirstMessage, onConstraintMessage, phase }: Props) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: 'Hello, I am ProqAI, your smart procurement assistant. HOW CAN I ASSIST YOU IN YOUR PROCUREMENT JOURNEY TODAY?' },
  ]);
  const [input, setInput] = useState('');
  const [expanded, setExpanded] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Add AI follow-up when phase changes to globe
  useEffect(() => {
    if (phase === 'globe') {
      const timer = setTimeout(() => {
        setMessages(prev => [...prev, { role: 'ai', text: 'I found suppliers matching your request. Do you have any specific requests or restrictions? (e.g., budget, region preferences)' }]);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  const handleSend = () => {
    if (!input.trim()) return;
    const msg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setInput('');

    if (phase === 'chat') {
      onFirstMessage(msg);
    } else if (phase === 'globe') {
      onConstraintMessage(msg);
    }
  };

  const lastMessage = messages[messages.length - 1];

  // Minimized bar
  if (minimized && !expanded) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 h-[60px] glass-card border-t border-border flex items-center px-4 gap-3 cursor-pointer" onClick={() => setExpanded(true)}>
        <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
        <p className="text-sm text-muted-foreground truncate flex-1 chat-mono">
          {lastMessage?.role === 'ai' ? 'ProqAI' : 'You'}: {lastMessage?.text}
        </p>
        <ChevronUp className="w-4 h-4 text-muted-foreground" />
      </div>
    );
  }

  // Expanded from minimized
  if (minimized && expanded) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 h-[50vh] glass-card border-t border-border flex flex-col animate-slide-in-right" style={{ animation: 'none', transform: 'translateY(0)' }}>
        <div className="flex items-center justify-between px-4 py-2 border-b border-border">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">ProqAI Chat</span>
          <button onClick={() => setExpanded(false)}><ChevronDown className="w-4 h-4 text-muted-foreground" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm chat-mono ${m.role === 'ai' ? 'bg-muted text-foreground' : 'bg-primary text-primary-foreground'}`}>
                {m.role === 'ai' && <span className="text-accent text-xs font-bold block mb-1">ProqAI</span>}
                {m.text}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <div className="p-3 border-t border-border flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="flex-1 bg-muted rounded-lg px-3 py-2 text-sm text-foreground chat-mono outline-none focus:ring-1 focus:ring-primary"
          />
          <button onClick={handleSend} className="p-2 bg-primary rounded-lg hover:bg-primary/80 transition-colors">
            <Send className="w-4 h-4 text-primary-foreground" />
          </button>
        </div>
      </div>
    );
  }

  // Full screen chat
  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full px-4">
        <div className="w-full space-y-4 mb-8">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              <div className={`max-w-[85%] rounded-xl px-4 py-3 text-sm chat-mono ${m.role === 'ai' ? 'bg-muted text-foreground' : 'bg-primary text-primary-foreground'}`}>
                {m.role === 'ai' && <span className="text-accent text-xs font-bold block mb-1">ProqAI</span>}
                {m.text}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>
      <div className="p-4 border-t border-border">
        <div className="max-w-2xl mx-auto flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="e.g., 500 laptops to Zurich"
            className="flex-1 bg-muted rounded-xl px-4 py-3 text-sm text-foreground chat-mono outline-none focus:ring-1 focus:ring-primary"
            autoFocus
          />
          <button onClick={handleSend} className="p-3 bg-primary rounded-xl hover:bg-primary/80 transition-colors">
            <Send className="w-5 h-5 text-primary-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
