// Usage: GCS_BUCKET=<bucket> npm run publish-post -- my-post.md [diagram.png ...]
// .md files go to posts/, images go to images/ (reference them as /api/post-images/<name>).
import path from 'path';
import { Storage } from '@google-cloud/storage';

const bucket = process.env.GCS_BUCKET;
const postPrefix = process.env.GCS_POSTS_PREFIX ?? 'posts/';
const imagePrefix = process.env.GCS_IMAGES_PREFIX ?? 'images/';
const files = process.argv.slice(2);

const IMAGE_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
};

if (!bucket || files.length === 0) {
  console.error('Usage: GCS_BUCKET=<bucket> npm run publish-post -- <file.md|image> [...]');
  process.exit(1);
}

async function main() {
  const b = new Storage().bucket(bucket!);
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    const isPost = ext === '.md';
    const contentType = isPost ? 'text/markdown; charset=utf-8' : IMAGE_TYPES[ext];
    if (!contentType) throw new Error(`Unsupported file type: ${file}`);
    const dest = `${isPost ? postPrefix : imagePrefix}${path.basename(file)}`;
    await b.upload(file, { destination: dest, contentType });
    console.log(`Uploaded to gs://${bucket}/${dest}`);
  }
  console.log('Live within ~60s for posts, ~1h for replaced images (browser cache).');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
