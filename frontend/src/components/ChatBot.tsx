import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useChat } from '../hooks/useChat';

export default function ChatBot() {
  const chat = useChat();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [lastSeenCount, setLastSeenCount] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);

  const hasUnread = !isOpen && chat.messages.length > lastSeenCount;
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Show tooltip once per session after a short delay
  useEffect(() => {
    if (sessionStorage.getItem('chatTooltipSeen')) return;
    const show = setTimeout(() => setShowTooltip(true), 2500);
    return () => clearTimeout(show);
  }, []);

  function dismissTooltip() {
    setShowTooltip(false);
    sessionStorage.setItem('chatTooltipSeen', '1');
  }

  // Keep lastSeenCount current while panel is open
  useEffect(() => {
    if (isOpen) setLastSeenCount(chat.messages.length);
  }, [isOpen, chat.messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat.messages, chat.streamingText, chat.isTyping]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 50);
  }, [isOpen]);

  // Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  function openPanel() {
    setIsOpen(true);
    setLastSeenCount(chat.messages.length);
    dismissTooltip();
  }

  function send() {
    const text = input.trim();
    if (!text || chat.isTyping || !!chat.streamingText) return;
    chat.send(text);
    setInput('');
  }

  const isBusy = chat.isTyping || !!chat.streamingText;

  return (
    <>
      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 md:right-6 z-50 w-[min(480px,calc(100vw-2rem))] flex flex-col rounded-2xl shadow-2xl border border-[var(--paper-border)] bg-[var(--paper-card)] overflow-hidden animate-[fadeSlideUp_0.2s_ease-out]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-violet-500 text-white">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${chat.isConnected ? 'bg-green-300 animate-pulse' : 'bg-gray-300'}`}
                title={chat.isConnected ? 'Connected' : 'Reconnecting…'}
              />
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
          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[500px] min-h-60">
            {chat.messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-violet-500 text-white rounded-br-sm'
                      : 'bg-[var(--paper-alt)] text-gray-800 rounded-bl-sm'
                  }`}
                >
                  {msg.role === 'user' ? msg.text : (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc list-inside mb-1 space-y-0.5">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal list-inside mb-1 space-y-0.5">{children}</ol>,
                        li: ({ children }) => <li className="leading-snug">{children}</li>,
                        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                        code: ({ children }) => <code className="bg-black/10 bg-black/10 px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
                        a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80">{children}</a>,
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            ))}

            {/* Streaming bot reply */}
            {chat.streamingText && (
              <div className="flex justify-start">
                <div className="max-w-[80%] px-3 py-2 rounded-2xl rounded-bl-sm text-sm leading-relaxed bg-[var(--paper-alt)] text-gray-800">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc list-inside mb-1 space-y-0.5">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal list-inside mb-1 space-y-0.5">{children}</ol>,
                      li: ({ children }) => <li className="leading-snug">{children}</li>,
                      strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                      code: ({ children }) => <code className="bg-black/10 bg-black/10 px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
                      a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80">{children}</a>,
                    }}
                  >
                    {chat.streamingText}
                  </ReactMarkdown>
                  <span className="inline-block w-0.5 h-3.5 ml-0.5 bg-gray-400 align-middle animate-pulse" />
                </div>
              </div>
            )}

            {/* Typing indicator (before first chunk) */}
            {chat.isTyping && !chat.streamingText && (
              <div className="flex justify-start">
                <div className="bg-[var(--paper-alt)] px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}

            {/* Reconnecting notice */}
            {!chat.isConnected && (
              <p className="text-center text-xs text-gray-400">Reconnecting…</p>
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
              className="flex-1 px-3 py-2 rounded-xl bg-[var(--paper-alt)] border border-[var(--paper-border)] text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
            <button
              onClick={send}
              disabled={!input.trim() || isBusy}
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

      {/* Tooltip bubble */}
      {showTooltip && !isOpen && (
        <div className="fixed bottom-24 right-4 md:right-6 z-50 animate-[fadeSlideUp_0.3s_ease-out]">
          <div className="relative bg-white border border-violet-200 shadow-lg rounded-2xl px-4 py-3 max-w-[220px]">
            <button
              onClick={dismissTooltip}
              className="absolute top-2 right-2 text-gray-300 hover:text-gray-500 transition-colors"
              aria-label="Dismiss"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <p className="text-sm font-semibold text-gray-800 pr-4">👋 Ask me anything!</p>
            <p className="text-xs text-gray-500 mt-0.5">I'm Wei's AI assistant — ask about my work, skills, or projects.</p>
            {/* Arrow pointing down */}
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-r border-b border-violet-200 rotate-45" />
          </div>
        </div>
      )}

      {/* Floating button */}
      {showTooltip && !isOpen && (
        <span className="fixed bottom-5 right-4 md:right-6 z-40 w-14 h-14 rounded-full bg-violet-400 [animation:ping-slow_1.8s_ease-in-out_infinite]" />
      )}
      <button
        onClick={() => (isOpen ? setIsOpen(false) : openPanel())}
        className="fixed bottom-5 right-4 md:right-6 z-50 w-14 h-14 rounded-full bg-violet-500 hover:bg-violet-600 text-white shadow-lg shadow-violet-300 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
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
        @keyframes ping-slow {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.5); opacity: 0; }
        }
      `}</style>
    </>
  );
}
