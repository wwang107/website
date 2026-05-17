import { useState, useEffect, useRef } from 'react';

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
}

const GREETING = "Hi! I'm Wei's assistant. Ask me anything about him — his experience, projects, skills, or how to get in touch.";

function mockReply(input: string): string {
  const q = input.toLowerCase();
  if (/\b(hi|hey|hello|howdy)\b/.test(q)) {
    return "Hey there! Happy to tell you about Wei. What would you like to know?";
  }
  if (/\b(who|about|yourself|person)\b/.test(q)) {
    return "Wei is a software engineer passionate about building scalable web applications and great user experiences. He loves turning ideas into polished products.";
  }
  if (/\b(experience|work|job|career|company|companies)\b/.test(q)) {
    return "Wei has worked across the full stack — from building backend APIs to crafting frontend UIs. Check out the Experience section on this page for the full timeline!";
  }
  if (/\b(project|built|made|portfolio|side)\b/.test(q)) {
    return "Wei has built a variety of projects — scroll up to the Projects section to see them all, with descriptions and links.";
  }
  if (/\b(skill|tech|stack|language|framework|tool)\b/.test(q)) {
    return "Wei works with TypeScript, React, Node.js, and more. The Skills section above has a full breakdown by category.";
  }
  if (/\b(contact|email|reach|hire|message|talk)\b/.test(q)) {
    return "You can reach Wei via the Contact form at the bottom of this page, or drop him an email directly — he'd love to hear from you!";
  }
  if (/\b(education|school|university|degree|study|studied)\b/.test(q)) {
    return "Wei has a strong computer science background. Feel free to reach out if you'd like to know more!";
  }
  if (/\b(location|live|based|city|country)\b/.test(q)) {
    return "Wei is currently based in the US. Check his profile at the top for the latest location details.";
  }
  return "Hmm, I'm not sure about that one. Try asking about Wei's experience, projects, skills, or how to contact him!";
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [lastSeenCount, setLastSeenCount] = useState(0);
  const hasUnread = !isOpen && messages.length > lastSeenCount;
  const greetedRef = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Send greeting once when panel is first opened
  useEffect(() => {
    if (isOpen && !greetedRef.current) {
      greetedRef.current = true;
      setIsTyping(true);
      const t = setTimeout(() => {
        setIsTyping(false);
        setMessages([{ id: 'greeting', role: 'bot', text: GREETING }]);
      }, 700);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // While panel is open, keep lastSeenCount in sync so closing never shows stale badge
  useEffect(() => {
    if (isOpen) setLastSeenCount(messages.length);
  }, [isOpen, messages]);

  function openPanel() {
    setIsOpen(true);
    setLastSeenCount(messages.length);
  }

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  function send() {
    const text = input.trim();
    if (!text || isTyping) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setTimeout(() => {
      const reply = mockReply(text);
      setIsTyping(false);
      setMessages(prev => [...prev, { id: Date.now().toString() + 'b', role: 'bot', text: reply }]);
    }, 650);
  }

  return (
    <>
      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 md:right-6 z-50 w-[min(360px,calc(100vw-2rem))] flex flex-col rounded-2xl shadow-2xl border border-[var(--paper-border)] bg-[var(--paper-card)] overflow-hidden animate-[fadeSlideUp_0.2s_ease-out]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-violet-500 text-white">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
              <span className="font-semibold text-sm">Chat with Wei's bot</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-violet-600 rounded-lg p-1 transition-colors"
              aria-label="Close chat"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-80 min-h-40">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-violet-500 text-white rounded-br-sm'
                      : 'bg-[var(--paper-alt)] text-gray-800 dark:text-gray-200 rounded-bl-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-[var(--paper-alt)] px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <div className="px-3 py-3 border-t border-[var(--paper-border)] flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask me anything…"
              className="flex-1 px-3 py-2 rounded-xl bg-[var(--paper-alt)] border border-[var(--paper-border)] text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
            <button
              onClick={send}
              disabled={!input.trim() || isTyping}
              className="px-3 py-2 bg-violet-500 hover:bg-violet-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
              aria-label="Send"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => (isOpen ? setIsOpen(false) : openPanel())}
        className="fixed bottom-5 right-4 md:right-6 z-50 w-14 h-14 rounded-full bg-violet-500 hover:bg-violet-600 text-white shadow-lg shadow-violet-300 dark:shadow-violet-900 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
          </svg>
        )}
        {hasUnread && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white" />
        )}
      </button>

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
