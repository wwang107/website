import { useState, useEffect, useRef, useCallback } from 'react';

export interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
}

type ServerMessage =
  | { type: 'typing' }
  | { type: 'chunk'; text: string }
  | { type: 'done' };

function getSessionId(): string {
  const key = 'chat_session_id';
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(key, id);
  }
  return id;
}

function buildWsUrl(): string {
  const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
  const sessionId = getSessionId();
  return `${protocol}//${location.host}/ws?sessionId=${sessionId}`;
}

const BACKOFF_STEPS = [1000, 2000, 4000, 8000, 16000, 30000];

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingText, setStreamingText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const retryRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unmountedRef = useRef(false);

  const connect = useCallback(() => {
    if (unmountedRef.current) return;

    const ws = new WebSocket(buildWsUrl());
    wsRef.current = ws;

    ws.onopen = () => {
      retryRef.current = 0;
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      let msg: ServerMessage;
      try {
        msg = JSON.parse(event.data as string) as ServerMessage;
      } catch {
        return;
      }

      if (msg.type === 'typing') {
        setIsTyping(true);
        setStreamingText('');
      } else if (msg.type === 'chunk') {
        setIsTyping(false);
        setStreamingText(prev => prev + msg.text);
      } else if (msg.type === 'done') {
        setStreamingText(prev => {
          if (prev) {
            setMessages(m => [
              ...m,
              { id: Date.now().toString(), role: 'bot', text: prev },
            ]);
          }
          return '';
        });
        setIsTyping(false);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      if (!unmountedRef.current) scheduleReconnect();
    };

    ws.onerror = () => {
      ws.close();
    };
  }, []);

  function scheduleReconnect() {
    const delay = BACKOFF_STEPS[Math.min(retryRef.current, BACKOFF_STEPS.length - 1)];
    retryRef.current += 1;
    retryTimerRef.current = setTimeout(connect, delay);
  }

  useEffect(() => {
    unmountedRef.current = false;
    connect();
    return () => {
      unmountedRef.current = true;
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  const send = useCallback((text: string) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ type: 'chat', text }));
    setMessages(prev => [
      ...prev,
      { id: Date.now().toString(), role: 'user', text },
    ]);
  }, []);

  return { messages, streamingText, isTyping, isConnected, send };
}
