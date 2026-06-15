// One-time seed: parse the downloaded Squarespace HTML into content/galleries.json.
//
// Reads the raw page HTML saved under .scratch/squarespace/ (gitignored) and
// extracts the 3 portfolio collections plus every photo (CDN url, dimensions,
// alt). This is a migration aid; the ongoing workflow is scripts/media-add
// (Phase 2). Run: `node scripts/seed-manifest.mjs`.

import fs from "node:fs";
import path from "node:path";

const SITE_ID = "60eb034b5145ce35fa1057f5";
const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, ".scratch", "squarespace");

const read = (f) => fs.readFileSync(path.join(SRC_DIR, f), "utf8");

// Original Squarespace slug -> clean route slug + gallery HTML file.
const COLLECTIONS = [
  { orig: "tibet", slug: "tibet", file: "tibet.html" },
  { orig: "beijing", slug: "beijing", file: "beijing.html" },
  {
    orig: "the-heart-of-the-hengduan-mountain-range-genyen-sichuan",
    slug: "genyen",
    file: "genyen.html",
  },
];

function parseImgTag(tag) {
  const src = (tag.match(/data-src="([^"]+)"/) || [])[1];
  if (!src) return null;
  const dim = tag.match(/data-image-dimensions="(\d+)x(\d+)"/) || [];
  const alt = (tag.match(/\salt="([^"]*)"/) || [])[1] || "";
  return {
    src: src.split("?")[0],
    width: dim[1] ? +dim[1] : null,
    height: dim[2] ? +dim[2] : null,
    alt: alt.trim(),
  };
}

// Collection tiles + cover from the home portfolio grid.
function parseHomeTiles(html) {
  const tiles = {};
  const re = /<a class="grid-item" href="\/home\/([^"]+)">([\s\S]*?)<\/a>/g;
  let m;
  while ((m = re.exec(html))) {
    const cover = parseImgTag(m[2]);
    const title =
      (m[2].match(/<h3 class="portfolio-title">([^<]+)<\/h3>/) || [])[1] || "";
    tiles[m[1]] = { title: decodeEntities(title.trim()), cover };
  }
  return tiles;
}

// Every gallery photo on a collection page (deduped, in document order).
function parseGalleryImages(html, slug) {
  const items = [];
  const seenUrl = new Set();
  const seenKey = new Set();
  const re = /<img\b[^>]*>/g;
  let m;
  while ((m = re.exec(html))) {
    const img = parseImgTag(m[0]);
    if (!img) continue;
    if (!img.src.includes(`/content/v1/${SITE_ID}/`)) continue;
    if (!img.width || !img.height) continue; // skip logos/icons
    if (seenUrl.has(img.src)) continue;
    seenUrl.add(img.src);

    let file = decodeURIComponent(img.src.split("/").pop());
    let key = `${slug}/${file}`;
    let n = 2;
    while (seenKey.has(key)) key = `${slug}/${file.replace(/(\.\w+)$/, `-${n++}$1`)}`;
    seenKey.add(key);

    items.push({
      key,
      src: img.src,
      width: img.width,
      height: img.height,
      alt: decodeEntities(img.alt),
    });
  }
  return items;
}

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&rsquo;|&#8217;/g, "’")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

const tiles = parseHomeTiles(read("home.html"));
const galleries = COLLECTIONS.map(({ orig, slug, file }) => {
  const tile = tiles[orig] || {};
  const items = parseGalleryImages(read(file), slug);
  const cover = tile.cover
    ? {
        key: `${slug}/cover-${decodeURIComponent(tile.cover.src.split("/").pop())}`,
        src: tile.cover.src,
        width: tile.cover.width,
        height: tile.cover.height,
      }
    : items[0] || null;
  return {
    slug,
    title: tile.title || slug,
    sourcePath: `/home/${orig}`,
    cover,
    count: items.length,
    items,
  };
});

const outPath = path.join(ROOT, "content", "galleries.json");
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify({ galleries }, null, 2) + "\n");

console.log(`Wrote ${path.relative(ROOT, outPath)}`);
for (const g of galleries) console.log(`  ${g.slug}: ${g.count} photos — "${g.title}"`);
