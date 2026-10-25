import path from 'path';
import { Storage } from '@google-cloud/storage';

export interface Post {
  slug: string;
  title: string;
  date: string;
  summary: string;
  image?: string;
  body: string;
}

const BUCKET = process.env.GCS_BUCKET;
const PREFIX = process.env.GCS_POSTS_PREFIX ?? 'posts/';
const CACHE_TTL_MS = 60_000;

const storage = new Storage();

function requireBucket(): string {
  if (!BUCKET) throw new Error('GCS_BUCKET is not set');
  return BUCKET;
}
let cache: { at: number; posts: Post[] } | null = null;

function parse(slug: string, raw: string): Post {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  const meta: Record<string, string> = {};
  for (const line of (match?.[1] ?? '').split(/\r?\n/)) {
    const i = line.indexOf(':');
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return {
    slug,
    title: meta.title ?? slug,
    date: meta.date ?? '',
    summary: meta.summary ?? '',
    image: meta.image || undefined,
    body: match ? match[2] : raw,
  };
}

async function readSources(): Promise<{ slug: string; raw: string }[]> {
  const [files] = await storage.bucket(requireBucket()).getFiles({ prefix: PREFIX });
  return Promise.all(
    files
      .filter((f) => f.name.endsWith('.md'))
      .map(async (f) => {
        const [buf] = await f.download();
        return { slug: path.basename(f.name, '.md'), raw: buf.toString('utf8') };
      }),
  );
}

export async function getPosts(): Promise<Post[]> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.posts;
  try {
    const posts = (await readSources())
      .map((s) => parse(s.slug, s.raw))
      .sort((a, b) => b.date.localeCompare(a.date));
    cache = { at: Date.now(), posts };
    return posts;
  } catch (err) {
    // Serve stale posts rather than failing if the bucket is briefly unreachable.
    if (cache) return cache.posts;
    throw err;
  }
}

const IMAGE_PREFIX = process.env.GCS_IMAGES_PREFIX ?? 'images/';

export const IMAGE_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
};

export function imageContentType(name: string): string | null {
  if (!/^[\w][\w.-]*$/.test(name)) return null;
  return IMAGE_TYPES[path.extname(name).toLowerCase()] ?? null;
}

/** Returns the image bytes, or null if it doesn't exist. `name` must pass imageContentType. */
export async function getImage(name: string): Promise<Buffer | null> {
  const file = storage.bucket(requireBucket()).file(`${IMAGE_PREFIX}${name}`);
  const [exists] = await file.exists();
  if (!exists) return null;
  const [buf] = await file.download();
  return buf;
}
