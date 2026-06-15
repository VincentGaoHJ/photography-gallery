import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getPostBySlug, getPostSlugs } from "@/lib/blog";
import { MarkdownRenderer } from "@/components/blog/MarkdownRenderer";
import { MEDIA_BASE_URL } from "@/lib/constants";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = true;
export const revalidate = 60;

export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Not Found" };
  return { title: post.title, description: post.excerpt };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  // Migrated posts store pre-cleaned HTML; future posts may be Markdown.
  const isHtml = post.content.trimStart().startsWith("<");
  // Once media lives on S3, rewrite the post's Squarespace CDN image URLs to the
  // S3 key scheme (blog/<slug>/<filename>); otherwise keep the original CDN URL.
  const html = MEDIA_BASE_URL
    ? post.content.replace(
        /https:\/\/images\.squarespace-cdn\.com\/content\/v1\/[^"')\s]+?\/([^"'/)\s]+\.(?:jpg|jpeg|png|webp|gif))/gi,
        (_m, file) => `${MEDIA_BASE_URL.replace(/\/$/, "")}/blog/${slug}/${file}`,
      )
    : post.content;
  const dateLabel = new Date(post.date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });

  return (
    <article className="mx-auto max-w-3xl px-6 py-14 md:py-20">
      <p className="text-sm tracking-wide text-muted">
        {dateLabel} <span className="mx-1.5">—</span> Written By {post.author}
      </p>

      <h1 className="mt-5 font-heading text-5xl font-semibold leading-[1.08] tracking-tight md:text-6xl">
        {post.title}
      </h1>

      <div className="article-body mt-12">
        {isHtml ? (
          <div dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <MarkdownRenderer content={post.content} />
        )}
      </div>

      <footer className="mt-20 border-t border-border pt-8">
        <Link
          href="/blog"
          className="label text-muted transition-colors hover:text-accent"
        >
          ← All posts
        </Link>
      </footer>
    </article>
  );
}
