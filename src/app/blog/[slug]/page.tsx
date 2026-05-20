import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getPostBySlug, getAllPosts } from "@/lib/blog";
import { MarkdownRenderer } from "@/components/blog/MarkdownRenderer";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts
    .filter((p) => !p.draft)
    .map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return { title: "Not Found" };
  }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: post.coverImage
      ? {
          images: [post.coverImage],
        }
      : undefined,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  return (
    <article className="min-h-screen pt-24 pb-24">
      <div className="mx-auto max-w-3xl px-6">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors mb-10"
        >
          &larr; Back to Journal
        </Link>

        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-3 text-xs text-muted mb-4">
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
            <span aria-hidden="true">&middot;</span>
            <span>{post.readingTime} min read</span>
          </div>

          <h1 className="font-serif text-3xl md:text-5xl font-medium tracking-tight leading-tight mb-4">
            {post.title}
          </h1>

          <p className="text-muted text-lg leading-relaxed">{post.excerpt}</p>

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-xs bg-neutral-100 rounded-full text-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Cover image */}
        {post.coverImage && (
          <div className="relative aspect-[16/9] overflow-hidden bg-neutral-100 mb-12">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Content */}
        <div className="prose prose-neutral prose-lg max-w-none prose-headings:font-serif prose-headings:font-medium prose-headings:tracking-tight prose-a:text-accent prose-a:no-underline hover:prose-a:underline prose-img:rounded-none">
          <MarkdownRenderer content={post.content} />
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-sm text-muted">Published by {post.author}</p>
            <Link
              href="/blog"
              className="text-sm tracking-widest uppercase text-muted hover:text-foreground transition-colors"
            >
              All Posts &rarr;
            </Link>
          </div>
        </footer>
      </div>
    </article>
  );
}