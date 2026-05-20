import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { BlogPostMeta, BlogPost } from "@/types/blog";

const BLOG_DIR = path.join(process.cwd(), "content/blog");

export async function getAllPosts(): Promise<BlogPostMeta[]> {
  // Ensure directory exists
  if (!fs.existsSync(BLOG_DIR)) {
    return [];
  }

  const files = fs.readdirSync(BLOG_DIR);
  const posts: BlogPostMeta[] = [];

  for (const file of files) {
    if (!file.endsWith(".md") && !file.endsWith(".mdx")) continue;

    const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf-8");
    const { data } = matter(raw);

    const slug = file.replace(/\.mdx?$/, "");

    posts.push({
      slug,
      title: data.title || "Untitled",
      date: data.date
        ? new Date(data.date).toISOString().split("T")[0]
        : "1970-01-01",
      excerpt: data.excerpt || "",
      coverImage: data.coverImage || undefined,
      author: data.author || "Anonymous",
      tags: data.tags || [],
      readingTime: data.readingTime || estimateReadingTime(raw),
      draft: data.draft === true,
    });
  }

  // Sort by date, newest first
  posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return posts;
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const mdPath = path.join(BLOG_DIR, `${slug}.md`);
  const mdxPath = path.join(BLOG_DIR, `${slug}.mdx`);

  const filePath = fs.existsSync(mdPath)
    ? mdPath
    : fs.existsSync(mdxPath)
    ? mdxPath
    : null;

  if (!filePath) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  return {
    slug,
    title: data.title || "Untitled",
    date: data.date
      ? new Date(data.date).toISOString().split("T")[0]
      : "1970-01-01",
    excerpt: data.excerpt || "",
    coverImage: data.coverImage || undefined,
    author: data.author || "Anonymous",
    tags: data.tags || [],
    readingTime: data.readingTime || estimateReadingTime(raw),
    draft: data.draft === true,
    content,
  };
}

function estimateReadingTime(text: string): number {
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}