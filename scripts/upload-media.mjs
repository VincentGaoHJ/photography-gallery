// Upload local media (.scratch/media/<key>) to S3 under the same keys.
//
// The keys match content/galleries.json (e.g. "tibet/DSC00499.jpg"), so the
// frontend resolver (lib/media.ts) builds `${NEXT_PUBLIC_MEDIA_BASE_URL}/${key}`.
//
// Env (put in .env.local, not committed):
//   S3_BUCKET=gaohaojun-media
//   S3_REGION=ap-southeast-1
//   S3_ACCESS_KEY_ID=...        (optional — falls back to the default AWS chain)
//   S3_SECRET_ACCESS_KEY=...
//   S3_MEDIA_PREFIX=            (optional key prefix, e.g. "media/")
//
// Usage:  node scripts/upload-media.mjs          (skips files already on S3)
//         node scripts/upload-media.mjs --force  (re-uploads everything)

import fs from "node:fs";
import path from "node:path";
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";

const ROOT = process.cwd();
const SRC = path.join(ROOT, ".scratch", "media");
const BUCKET = process.env.S3_BUCKET;
const REGION = process.env.S3_REGION || "ap-southeast-1";
const PREFIX = process.env.S3_MEDIA_PREFIX || "";
const FORCE = process.argv.includes("--force");

if (!BUCKET) {
  console.error("✗ Set S3_BUCKET (and S3_REGION + credentials) first. See .env.local.");
  process.exit(1);
}
if (!fs.existsSync(SRC)) {
  console.error(`✗ No staged media at ${path.relative(ROOT, SRC)} — run scripts/download-media first.`);
  process.exit(1);
}

const CONTENT_TYPE = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".webm": "video/webm",
};

const client = new S3Client({
  region: REGION,
  ...(process.env.S3_ACCESS_KEY_ID
    ? {
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID,
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
        },
      }
    : {}),
});

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(abs));
    else if (entry.isFile()) out.push(abs);
  }
  return out;
}

async function existsOnS3(key) {
  try {
    await client.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    return true;
  } catch {
    return false;
  }
}

const files = walk(SRC);
let uploaded = 0,
  skipped = 0,
  failed = 0;

console.log(`Uploading ${files.length} file(s) to s3://${BUCKET}/${PREFIX} (${REGION})\n`);

for (const abs of files) {
  const rel = path.relative(SRC, abs).split(path.sep).join("/");
  const key = PREFIX + rel;
  const ext = path.extname(abs).toLowerCase();
  try {
    if (!FORCE && (await existsOnS3(key))) {
      skipped++;
      console.log(`  skip   ${key}`);
      continue;
    }
    await client.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: fs.createReadStream(abs),
        ContentType: CONTENT_TYPE[ext] || "application/octet-stream",
        CacheControl: "public, max-age=31536000, immutable",
      })
    );
    uploaded++;
    console.log(`  upload ${key}`);
  } catch (err) {
    failed++;
    console.error(`  FAIL   ${key} — ${err.name || err.message}`);
  }
}

console.log(`\nDone. uploaded=${uploaded} skipped=${skipped} failed=${failed}`);
if (failed) process.exit(1);
