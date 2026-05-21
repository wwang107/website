import type { WebSocket } from 'ws';
import type { IncomingMessage } from 'http';
import { RateLimiterMemory, RateLimiterRes } from 'rate-limiter-flexible';
import { ragStream, type Turn } from './rag';

const GREETING = "Hi! I'm Wei's assistant. Ask me anything about him — his experience, projects, skills, or how to get in touch.";

const MAX_MESSAGE_LENGTH = 500;  // chars per message
const MAX_SESSION_MESSAGES = 50; // total user messages per session lifetime

// 20 AI calls per minute per IP before blocking for 60 s
const rateLimiter = new RateLimiterMemory({ points: 20, duration: 60, blockDuration: 60 });

type ServerMessage =
  | { type: 'typing' }
  | { type: 'chunk'; text: string }
  | { type: 'done' };

function send(ws: WebSocket, msg: ServerMessage) {
  if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(msg));
}

function getIp(req: IncomingMessage): string {
  const forwarded = req.headers['x-forwarded-for'];
  const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(',')[0];
  return raw?.trim() ?? req.socket.remoteAddress ?? 'unknown';
}

// Per-session conversation history and message counters
const sessions = new Map<string, Turn[]>();
const sessionMessageCount = new Map<string, number>();

export function handleConnection(ws: WebSocket, req: IncomingMessage) {
  const url = new URL(req.url ?? '/', 'http://x');
  const sessionId = url.searchParams.get('sessionId') ?? 'anonymous';
  const ip = getIp(req);

  if (!sessions.has(sessionId)) sessions.set(sessionId, []);
  if (!sessionMessageCount.has(sessionId)) sessionMessageCount.set(sessionId, 0);

  // Send static greeting immediately — no AI call needed
  send(ws, { type: 'chunk', text: GREETING });
  send(ws, { type: 'done' });

  ws.on('message', async (raw) => {
    let payload: { type: string; text?: string };
    try {
      payload = JSON.parse(raw.toString()) as { type: string; text?: string };
    } catch {
      return;
    }
    if (payload.type !== 'chat' || typeof payload.text !== 'string') return;

    const text = payload.text.trim();
    if (!text) return;

    // 1. Message length cap
    if (text.length > MAX_MESSAGE_LENGTH) {
      send(ws, { type: 'chunk', text: `Please keep messages under ${MAX_MESSAGE_LENGTH} characters.` });
      send(ws, { type: 'done' });
      return;
    }

    // 2. Session message cap
    const count = sessionMessageCount.get(sessionId)!;
    if (count >= MAX_SESSION_MESSAGES) {
      send(ws, { type: 'chunk', text: "You've reached the message limit for this session. Please refresh to start a new one." });
      send(ws, { type: 'done' });
      return;
    }

    // 3. Per-IP rate limit
    try {
      await rateLimiter.consume(ip);
    } catch (e) {
      if (e instanceof RateLimiterRes) {
        const retryAfter = Math.ceil(e.msBeforeNext / 1000);
        send(ws, { type: 'chunk', text: `Too many messages. Please wait ${retryAfter}s before trying again.` });
        send(ws, { type: 'done' });
        return;
      }
      throw e;
    }

    sessionMessageCount.set(sessionId, count + 1);
    const history = sessions.get(sessionId)!;
    send(ws, { type: 'typing' });

    try {
      let fullResponse = '';
      for await (const chunk of ragStream(text, history)) {
        send(ws, { type: 'chunk', text: chunk });
        fullResponse += chunk;
      }
      history.push({ role: 'user', text });
      history.push({ role: 'model', text: fullResponse });
      if (history.length > 20) history.splice(0, history.length - 20);
    } catch (err) {
      console.error('[chat] RAG error:', err);
      send(ws, { type: 'chunk', text: 'Sorry, something went wrong. Please try again.' });
    } finally {
      send(ws, { type: 'done' });
    }
  });

  ws.on('close', () => {
    // Clean up session state when connection drops to avoid unbounded memory growth
    sessions.delete(sessionId);
    sessionMessageCount.delete(sessionId);
  });
}
