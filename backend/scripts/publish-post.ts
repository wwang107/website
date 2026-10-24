// Usage: GCS_BUCKET=<bucket> npm run publish-post -- path/to/my-post.md
import path from 'path';
import { Storage } from '@google-cloud/storage';

const bucket = process.env.GCS_BUCKET;
const prefix = process.env.GCS_POSTS_PREFIX ?? 'posts/';
const file = process.argv[2];

if (!bucket || !file) {
  console.error('Usage: GCS_BUCKET=<bucket> npm run publish-post -- <file.md>');
  process.exit(1);
}

const dest = `${prefix}${path.basename(file)}`;
new Storage()
  .bucket(bucket)
  .upload(file, { destination: dest, contentType: 'text/markdown; charset=utf-8' })
  .then(() => console.log(`Uploaded to gs://${bucket}/${dest} (live within ~60s)`))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
