import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { BlogPostMeta, BlogPost } from "@/types/blog";
import { MEDIA_BASE_URL } from "./constants";

const BLOG_DIR = path.join(process.cwd(), "content/blog");
const S3_BLOG = MEDIA_BASE_URL
  ? `${MEDIA_BASE_URL.replace(/\/$/, "")}/blog`
  : "";

function estimateReadingTime(text: string): number {
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function normalizeMeta(
  p: Partial<BlogPostMeta> & { slug: string }
): BlogPostMeta {
  return {
    slug: p.slug,
    title: p.title || "Untitled",
    date: p.date
      ? new Date(p.date).toISOString().split("T")[0]
      : "1970-01-01",
    excerpt: p.excerpt || "",
    coverImage: p.coverImage || undefined,
    author: p.author || "Vincent Gao",
    tags: p.tags || [],
    readingTime: p.readingTime || 1,
    draft: p.draft === true,
  };
}

// ---- S3-backed (preferred once /admin has published) ----
async function fetchS3Index(): Promise<BlogPostMeta[] | null> {
  if (!S3_BLOG) return null;
  try {
    const res = await fetch(`${S3_BLOG}/index.json`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const posts = Array.isArray(data) ? data : data?.posts;
    if (!Array.isArray(posts)) return null;
    return posts.map((p) => normalizeMeta(p));
  } catch {
    return null;
  }
}

async function fetchS3Body(slug: string): Promise<string | null> {
  if (!S3_BLOG) return null;
  try {
    const res = await fetch(`${S3_BLOG}/posts/${encodeURIComponent(slug)}.html`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

// ---- git seed (fallback for local dev / before first publish) ----
function gitAllPosts(): BlogPostMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  const posts: BlogPostMeta[] = [];
  for (const file of fs.readdirSync(BLOG_DIR)) {
    if (!file.endsWith(".md") && !file.endsWith(".mdx")) continue;
    const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf-8");
    const { data } = matter(raw);
    posts.push(
      normalizeMeta({
        ...data,
        slug: file.replace(/\.mdx?$/, ""),
        readingTime: estimateReadingTime(raw),
      })
    );
  }
  return posts;
}

function gitPost(slug: string): BlogPost | null {
  const md = path.join(BLOG_DIR, `${slug}.md`);
  const mdx = path.join(BLOG_DIR, `${slug}.mdx`);
  const fp = fs.existsSync(md) ? md : fs.existsSync(mdx) ? mdx : null;
  if (!fp) return null;
  const raw = fs.readFileSync(fp, "utf-8");
  const { data, content } = matter(raw);
  return {
    ...normalizeMeta({ ...data, slug, readingTime: estimateReadingTime(raw) }),
    content,
  };
}

// ---- public API ----
export async function getAllPosts(): Promise<BlogPostMeta[]> {
  const posts = (await fetchS3Index()) ?? gitAllPosts();
  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const idx = await fetchS3Index();
  if (idx) {
    const meta = idx.find((p) => p.slug === slug);
    if (!meta) return null;
    // body from S3 if published there, else fall back to the git seed body
    const body = (await fetchS3Body(slug)) ?? gitPost(slug)?.content ?? "";
    return { ...meta, content: body };
  }
  return gitPost(slug);
}

// Fixed slugs for static generation (git seed); new S3 posts render via ISR.
export function getPostSlugs(): string[] {
  return gitAllPosts().map((p) => p.slug);
}
