import type { WebSocket } from 'ws';
import type { IncomingMessage } from 'http';
import { ragStream, type Turn } from './rag';

const GREETING = "Hi! I'm Wei's assistant. Ask me anything about him — his experience, projects, skills, or how to get in touch.";

type ServerMessage =
  | { type: 'typing' }
  | { type: 'chunk'; text: string }
  | { type: 'done' };

function send(ws: WebSocket, msg: ServerMessage) {
  if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(msg));
}

// Per-session conversation history (user + model turns)
const sessions = new Map<string, Turn[]>();

export function handleConnection(ws: WebSocket, req: IncomingMessage) {
  const url = new URL(req.url ?? '/', 'http://x');
  const sessionId = url.searchParams.get('sessionId') ?? 'anonymous';

  if (!sessions.has(sessionId)) sessions.set(sessionId, []);

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

    const history = sessions.get(sessionId)!;
    send(ws, { type: 'typing' });

    try {
      let fullResponse = '';
      for await (const chunk of ragStream(text, history)) {
        send(ws, { type: 'chunk', text: chunk });
        fullResponse += chunk;
      }
      // Append to history after the full response is assembled
      history.push({ role: 'user', text });
      history.push({ role: 'model', text: fullResponse });
      // Keep the last 10 turns (20 entries) to avoid unbounded growth
      if (history.length > 20) history.splice(0, history.length - 20);
    } catch (err) {
      console.error('[chat] RAG error:', err);
      send(ws, { type: 'chunk', text: 'Sorry, something went wrong. Please try again.' });
    } finally {
      send(ws, { type: 'done' });
    }
  });
}
