/**
 * Offline embedding script — run once locally whenever the resume changes.
 *
 * Usage:
 *   GEMINI_API_KEY=<key> npx tsx scripts/embed.ts [path/to/resume.pdf]
 *
 * Output: data/resume-index.json  (chunks + precomputed embeddings)
 */
import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import dotenv from 'dotenv';

dotenv.config();

const ai = genkit({ plugins: [googleAI()] });

// ---------------------------------------------------------------------------
// PDF loading & chunking
// ---------------------------------------------------------------------------

async function loadPdf(filePath: string): Promise<string> {
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  return data.text;
}

function chunkText(text: string, maxChars = 400, overlapLines = 2): string[] {
  // pdf-parse emits single newlines between lines — split there first
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let start = 0;

  while (start < lines.length) {
    const buf: string[] = [];
    let chars = 0;
    let end = start;

    while (end < lines.length && chars + lines[end].length < maxChars) {
      buf.push(lines[end]);
      chars += lines[end].length + 1;
      end++;
    }

    // Always include at least one line to avoid infinite loop
    if (buf.length === 0) {
      buf.push(lines[end]);
      end++;
    }

    const chunk = buf.join(' ').trim();
    if (chunk.length >= 40) chunks.push(chunk);

    // Slide forward, keeping overlapLines for context continuity
    start = Math.max(start + 1, end - overlapLines);
  }

  return chunks;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const pdfPath = process.argv[2] ?? path.resolve(__dirname, '../resume.pdf');

  if (!fs.existsSync(pdfPath)) {
    console.error(`PDF not found: ${pdfPath}`);
    process.exit(1);
  }

  console.log(`Loading PDF: ${pdfPath}`);
  const text = await loadPdf(pdfPath);
  const chunks = chunkText(text);
  console.log(`${chunks.length} chunks extracted. Embedding…`);

  const results: { text: string; embedding: number[] }[] = [];

  for (let i = 0; i < chunks.length; i++) {
    process.stdout.write(`  [${i + 1}/${chunks.length}] embedding chunk…\r`);
    const embeddings = await ai.embed({ embedder: googleAI.embedder('gemini-embedding-001'), content: chunks[i], options: { outputDimensionality: 768 } });
    results.push({ text: chunks[i], embedding: embeddings[0].embedding });
  }

  const outPath = path.resolve(__dirname, '../data/resume-index.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`\nWrote ${results.length} embeddings to ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
