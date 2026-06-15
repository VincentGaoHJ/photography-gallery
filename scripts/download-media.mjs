// Canonical media downloader: stage every image the site references into
// .scratch/media/<key>, ready for scripts/upload-media.mjs to push to S3.
//
// Sources: content/galleries.json (covers + items), the about/hero portrait,
// and any Squarespace CDN <img> inside content/blog/*.md (keyed blog/<slug>/<file>).
// Idempotent — skips files already downloaded. Run: `node scripts/download-media.mjs`.

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = process.cwd();
const DEST = path.join(ROOT, ".scratch", "media");
const SITE = "60eb034b5145ce35fa1057f5";

const jobs = [];
const add = (url, key) => {
  if (!url || !key) return;
  const clean = url.split("?")[0];
  if (!jobs.some((j) => j.key === key)) jobs.push({ url: clean, key });
};

// 1. galleries
const gal = JSON.parse(
  fs.readFileSync(path.join(ROOT, "content/galleries.json"), "utf8")
);
for (const g of gal.galleries) {
  if (g.cover) add(g.cover.src, g.cover.key);
  for (const it of g.items) add(it.src, it.key);
}

// 2. about / hero portrait
add(
  `https://images.squarespace-cdn.com/content/v1/${SITE}/1626021177876-4P22W5EJ2N0C72B3NZSJ/selfie.jpg`,
  "about/selfie.jpg"
);

// 3. blog content images -> blog/<slug>/<filename>
const blogDir = path.join(ROOT, "content/blog");
if (fs.existsSync(blogDir)) {
  const re = new RegExp(
    `https://images\\.squarespace-cdn\\.com/content/v1/${SITE}/[^"')\\s]+?\\.(?:jpg|jpeg|png|webp|gif)`,
    "gi"
  );
  for (const f of fs.readdirSync(blogDir).filter((f) => f.endsWith(".md"))) {
    const slug = f.replace(/\.md$/, "");
    const md = fs.readFileSync(path.join(blogDir, f), "utf8");
    for (const url of md.match(re) || []) {
      const file = url.split("/").pop().split("?")[0];
      add(url, `blog/${slug}/${file}`);
    }
  }
}

console.log(`Downloading ${jobs.length} file(s) into .scratch/media/ ...`);
let ok = 0,
  fail = 0;
for (const { url, key } of jobs) {
  const dest = path.join(DEST, key);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
    ok++;
    continue;
  }
  try {
    execFileSync(
      "curl",
      ["-sL", "--http1.1", "--retry", "5", "--retry-all-errors", "--retry-delay", "2",
       "--max-time", "180", "-A", "Mozilla/5.0", "-o", dest, url],
      { stdio: "ignore" }
    );
    if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
      ok++;
      console.log(`  OK   ${key}`);
    } else {
      fail++;
      console.log(`  FAIL ${key}`);
    }
  } catch (e) {
    fail++;
    console.log(`  FAIL ${key} — ${e.message}`);
  }
}
console.log(`Done. ok=${ok} fail=${fail}`);
if (fail) process.exit(1);
