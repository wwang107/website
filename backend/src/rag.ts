import fs from 'fs';
import path from 'path';
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const ai = genkit({
  plugins: [googleAI()], // reads GEMINI_API_KEY from env
});

// ---------------------------------------------------------------------------
// Index — loaded from pre-built JSON (see scripts/embed.ts)
// ---------------------------------------------------------------------------

type IndexedChunk = { text: string; embedding: number[] };
let index: IndexedChunk[] = [];

export function buildIndex(): void {
  const indexPath =
    process.env.RESUME_INDEX_PATH ?? path.resolve(__dirname, '../data/resume-index.json');

  if (!fs.existsSync(indexPath)) {
    console.warn(
      `[rag] resume-index.json not found at ${indexPath}.\n` +
      `      Run: GEMINI_API_KEY=<key> npx tsx scripts/embed.ts <resume.pdf>`
    );
    return;
  }

  const raw = JSON.parse(fs.readFileSync(indexPath, 'utf-8')) as IndexedChunk[];
  index = raw;
  console.log(`[rag] loaded ${index.length} chunks from ${indexPath}`);
}

// ---------------------------------------------------------------------------
// Retrieval
// ---------------------------------------------------------------------------

function cosine(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

async function retrieve(query: string, topK = 4): Promise<string[]> {
  if (index.length === 0) return [];
  const embeddings = await ai.embed({ embedder: googleAI.embedder('gemini-embedding-001'), content: query, options: { outputDimensionality: 768 } });
  const queryEmbedding = embeddings[0].embedding;
  return [...index]
    .map((c) => ({ text: c.text, score: cosine(queryEmbedding, c.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((c) => c.text);
}

// ---------------------------------------------------------------------------
// RAG generation stream
// ---------------------------------------------------------------------------

export type Turn = { role: 'user' | 'model'; text: string };

export async function* ragStream(userMessage: string, history: Turn[]): AsyncGenerator<string> {
  const context = await retrieve(userMessage);

  const system =
    context.length > 0
      ? `You are Wei Wang's personal assistant on his portfolio website. Answer questions about Wei based only on the resume excerpts below. Be concise and conversational. If something isn't covered, say you don't have that detail.

Resume excerpts:
${context.join('\n\n---\n\n')}`
      : `You are Wei Wang's personal assistant on his portfolio website. The resume index hasn't been loaded yet — let the user know to check back shortly.`;

  const { stream } = ai.generateStream({
    model: googleAI.model('gemini-2.5-flash-lite'),
    system,
    messages: [
      ...history.map((h) => ({
        role: h.role,
        content: [{ text: h.text }],
      })),
      { role: 'user' as const, content: [{ text: userMessage }] },
    ],
  });

  for await (const chunk of stream) {
    if (chunk.text) yield chunk.text;
  }
}
