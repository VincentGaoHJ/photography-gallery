// One-time seed: convert the original Squarespace blog posts to clean,
// alignment-preserving HTML for pixel-faithful rendering.
//
// Stores content/blog/<slug>.md with frontmatter + an HTML body that keeps:
//   - per-block text alignment (centered day headings, right-aligned taglines)
//   - pull quotes (<blockquote><cite>) with attribution
//   - the inline image (figure + caption) and an Osaka map embed
// Squarespace wrapper divs / styles / scripts are stripped. Images reference the
// original CDN for now (migrate to S3 in Phase 2). Run: `node scripts/seed-blog.mjs`.

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const blog = JSON.parse(
  fs.readFileSync(path.join(ROOT, ".scratch/squarespace/json/blog.json"), "utf8")
);

function decodeEntities(s) {
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&hellip;/g, "…")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–");
}

// inner HTML -> plain text (drop tags, decode, collapse)
function textOnly(html) {
  return decodeEntities(html.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
}

const OSAKA_MAP =
  '<figure class="post-map"><iframe src="https://www.google.com/maps?q=Umekita%2C%20Kita%20Ward%2C%20Osaka&z=13&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Osaka"></iframe></figure>';

function cleanArticleHtml(body) {
  let s = body;
  const blocks = [];
  const tok = (html) => {
    blocks.push(html);
    return `\n[[[BLOCK${blocks.length - 1}]]]\n`;
  };

  // 0. strip comments / scripts / styles
  s = s.replace(/<!--[\s\S]*?-->/g, "");
  s = s.replace(/<(style|script|noscript)\b[\s\S]*?<\/\1>/gi, "");

  // 1. quote blocks -> tokenized clean <blockquote>
  s = s.replace(
    /<figure\b[^>]*>\s*<blockquote\b[^>]*>([\s\S]*?)<\/blockquote>\s*(?:<figcaption\b[^>]*>([\s\S]*?)<\/figcaption>)?[\s\S]*?<\/figure>/gi,
    (_, quote, cap) => {
      const text = textOnly(quote);
      const src = cap ? textOnly(cap) : "";
      return tok(
        `<blockquote><p>${text}</p>${src ? `<cite>${src}</cite>` : ""}</blockquote>`
      );
    }
  );

  // 2. remaining figures containing <img> -> tokenized clean figure + caption
  s = s.replace(/<figure\b[^>]*>([\s\S]*?)<\/figure>/gi, (_, inner) => {
    const img = inner.match(/<img\b[^>]*\bsrc="([^"]+)"/i);
    if (!img) return "";
    const src = img[1].split("?")[0];
    const title = (inner.match(/image-title[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/i) || [])[1];
    const sub = (inner.match(/image-subtitle[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/i) || [])[1];
    const t = title ? textOnly(title) : "";
    const su = sub ? textOnly(sub) : "";
    const caption = [t, su].filter(Boolean).join(" — ");
    return tok(
      `<figure class="post-figure"><img src="${src}" alt="${t}" loading="lazy" />${
        caption ? `<figcaption>${caption}</figcaption>` : ""
      }</figure>`
    );
  });

  // 3. map block -> Osaka embed, placed right before the "地点：" paragraph
  if (/地点：/.test(s)) {
    s = s.replace(/(<p[^>]*>\s*地点：)/, tok(OSAKA_MAP) + "$1");
  }

  // 3b. Squarespace code block wrapping a link -> right-aligned paragraph
  s = s.replace(
    /<pre\b([^>]*)>\s*<code\b[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/gi,
    (_, attrs, inner) => {
      const a = /text-align:\s*(center|right)/i.exec(attrs);
      return `<p${a ? ` style="text-align:${a[1]}"` : ""}>${inner}</p>`;
    }
  );

  // 4. headings & paragraphs: keep only center/right text-align
  s = s.replace(/<(h[1-6]|p)\b([^>]*)>/gi, (_, tag, attrs) => {
    const a = /text-align:\s*(center|right)/i.exec(attrs);
    return a ? `<${tag} style="text-align:${a[1]}">` : `<${tag}>`;
  });

  // 5. links: keep href only
  s = s.replace(/<a\b[^>]*?href="([^"]+)"[^>]*>/gi, '<a href="$1">');

  // 6. strip attributes from remaining inline / list / quote tags
  s = s.replace(/<(strong|em|b|i|ul|ol|li|blockquote|cite|br|hr)\b[^>]*>/gi, "<$1>");

  // 7. unwrap leftover wrappers
  s = s.replace(/<\/?(div|span)\b[^>]*>/gi, "");
  s = s.replace(/<\/?(figure|figcaption)\b[^>]*>/gi, ""); // any stray, real ones are tokenized

  // 8. collapse <br> runs, drop empty paragraphs, decode, normalise whitespace
  s = s.replace(/(?:<br\s*\/?>\s*){2,}/gi, "<br>");
  s = s.replace(/<p[^>]*>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, "");
  s = decodeEntities(s);
  s = s.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();

  // 9. restore tokenized blocks
  s = s.replace(/\[\[\[BLOCK(\d+)\]\]\]/g, (_, i) => blocks[+i]);
  s = s.replace(/\n{3,}/g, "\n\n").trim();
  return s;
}

const OUT = path.join(ROOT, "content/blog");
fs.mkdirSync(OUT, { recursive: true });

for (const item of blog.items || []) {
  const slug = item.urlId;
  const title = item.title || slug;
  const date = new Date(item.publishOn).toISOString().split("T")[0];
  const html = cleanArticleHtml(item.body || "");
  let excerpt = textOnly(item.excerpt || "");
  if (!excerpt) excerpt = textOnly(html).slice(0, 160);
  excerpt = excerpt.slice(0, 180);
  const tags = Array.isArray(item.tags) ? item.tags : [];

  const frontmatter = [
    "---",
    `title: ${JSON.stringify(title)}`,
    `date: ${JSON.stringify(date)}`,
    `excerpt: ${JSON.stringify(excerpt)}`,
    `author: "Vincent Gao"`,
    `tags: [${tags.map((t) => JSON.stringify(t)).join(", ")}]`,
    `draft: ${html.length < 50}`,
    "---",
    "",
  ].join("\n");

  fs.writeFileSync(path.join(OUT, `${slug}.md`), frontmatter + html + "\n");
  console.log(`Wrote content/blog/${slug}.md — ${html.length} chars HTML, date ${date}`);
}
