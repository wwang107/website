import type { WebSocket } from 'ws';
import type { IncomingMessage } from 'http';

const GREETING = "Hi! I'm Wei's assistant. Ask me anything about him — his experience, projects, skills, or how to get in touch.";

function mockReply(input: string): string {
  const q = input.toLowerCase();
  if (/\b(hi|hey|hello|howdy)\b/.test(q))
    return "Hey there! Happy to tell you about Wei. What would you like to know?";
  if (/\b(who|about|yourself|person)\b/.test(q))
    return "Wei is a Senior Backend Engineer with 5+ years specialising in high-throughput JVM systems and distributed logistics architecture at Delivery Hero.";
  if (/\b(experience|work|job|career|company|companies)\b/.test(q))
    return "Wei has worked at Delivery Hero as a Senior Software Engineer since 2023, and before that at Zalando as a Fullstack Engineer and Autodesk as an intern. Check the Experience section for the full timeline!";
  if (/\b(project|built|made|portfolio|side)\b/.test(q))
    return "Wei built a real-time order dispatching service with Redis pipelining, a vendor notification system with SNS at-least-once delivery, and a 3D human pose estimation pipeline for his Master's thesis. See the Projects section for details!";
  if (/\b(skill|tech|stack|language|framework|tool)\b/.test(q))
    return "Wei works primarily with Kotlin, Java, Go, and TypeScript on the backend, using Quarkus and Spring Boot. On infrastructure he uses Kubernetes, Terraform, SNS/SQS, and Redis. Check the Skills section for the full breakdown.";
  if (/\b(contact|email|reach|hire|message|talk)\b/.test(q))
    return "You can reach Wei at wwang107@gmail.com or via the Contact form at the bottom of this page. He'd love to hear from you!";
  if (/\b(education|school|university|degree|study|studied)\b/.test(q))
    return "Wei has a Master's degree — his thesis was on 3D human pose estimation using multi-view computer vision. Feel free to ask more!";
  if (/\b(location|live|based|city|country)\b/.test(q))
    return "Wei is currently based in Münster, Germany.";
  return "Hmm, I'm not sure about that one. Try asking about Wei's experience, projects, skills, or how to contact him!";
}

type ServerMessage =
  | { type: 'typing' }
  | { type: 'chunk'; text: string }
  | { type: 'done' };

function send(ws: WebSocket, msg: ServerMessage) {
  if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(msg));
}

const CHUNK_DELAY_MS = 35;

function streamReply(ws: WebSocket, reply: string, timeouts: Set<ReturnType<typeof setTimeout>>) {
  send(ws, { type: 'typing' });
  const words = reply.split(' ');
  let delay = 300; // initial pause to simulate thinking
  words.forEach((word, i) => {
    const t = setTimeout(() => {
      timeouts.delete(t);
      send(ws, { type: 'chunk', text: i === 0 ? word : ' ' + word });
    }, delay);
    timeouts.add(t);
    delay += CHUNK_DELAY_MS;
  });
  const done = setTimeout(() => {
    timeouts.delete(done);
    send(ws, { type: 'done' });
  }, delay);
  timeouts.add(done);
}

// Per-session chat history (keyed by sessionId)
const sessions = new Map<string, string[]>();

export function handleConnection(ws: WebSocket, req: IncomingMessage) {
  const url = new URL(req.url ?? '/', 'http://x');
  const sessionId = url.searchParams.get('sessionId') ?? 'anonymous';

  if (!sessions.has(sessionId)) sessions.set(sessionId, []);

  const timeouts = new Set<ReturnType<typeof setTimeout>>();

  // Stream greeting on connect
  streamReply(ws, GREETING, timeouts);

  ws.on('message', (raw) => {
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
    history.push(text);

    streamReply(ws, mockReply(text), timeouts);
  });

  ws.on('close', () => {
    for (const t of timeouts) clearTimeout(t);
    timeouts.clear();
  });

  ws.on('error', () => {
    for (const t of timeouts) clearTimeout(t);
    timeouts.clear();
  });
}
