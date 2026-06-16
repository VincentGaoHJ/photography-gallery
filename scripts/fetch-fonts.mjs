// One-time: download the woff2 files for our fonts into src/app/fonts/ so the
// build self-hosts them (no Google Fonts fetch at build — works offline / in CN).
// Run: node scripts/fetch-fonts.mjs

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const OUT = path.join(process.cwd(), "src/app/fonts");
fs.mkdirSync(OUT, { recursive: true });

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

const FAMILIES = [
  { q: "Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500", prefix: "cormorant" },
  { q: "EB+Garamond:ital,wght@0,400..600;1,400..600", prefix: "ebgaramond" },
  { q: "Poppins:ital,wght@0,400;0,500;0,600", prefix: "poppins" },
];

function curlText(url) {
  return execFileSync(
    "curl",
    ["-sL", "--http1.1", "--retry", "5", "--retry-all-errors", "--retry-delay", "2",
     "--max-time", "60", "-A", UA, url],
    { encoding: "utf8" }
  );
}
function curlFile(url, out) {
  execFileSync(
    "curl",
    ["-sL", "--http1.1", "--retry", "5", "--retry-all-errors", "--retry-delay", "2",
     "--max-time", "120", "-A", UA, "-o", out, url],
    { stdio: "ignore" }
  );
}

const manifest = [];
for (const fam of FAMILIES) {
  const css = curlText(`https://fonts.googleapis.com/css2?family=${fam.q}&display=swap`);
  const re = /\/\*\s*([\w-]+)\s*\*\/\s*@font-face\s*\{([^}]*)\}/g;
  let m;
  while ((m = re.exec(css))) {
    const subset = m[1];
    const block = m[2];
    if (subset !== "latin") continue; // latin only — keeps it small
    const style = (block.match(/font-style:\s*(\w+)/) || [])[1] || "normal";
    const weight = ((block.match(/font-weight:\s*([\d ]+)/) || [])[1] || "400").trim();
    const url = (block.match(/src:\s*url\(([^)]+)\)\s*format\('woff2'\)/) || [])[1];
    if (!url) continue;
    const file = `${fam.prefix}-${weight.replace(/\s+/g, "-")}-${style}.woff2`;
    curlFile(url, path.join(OUT, file));
    manifest.push({ file, weight, style, prefix: fam.prefix });
    console.log("✓", file, `(weight ${weight}, ${style})`);
  }
}

fs.writeFileSync(path.join(OUT, "manifest.json"), JSON.stringify(manifest, null, 2));
console.log(`\nDone — ${manifest.length} files in src/app/fonts/`);
