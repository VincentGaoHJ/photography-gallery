import Link from "next/link";
import { BlogCard } from "@/components/blog/BlogCard";
import { getAllPosts } from "@/lib/blog";

export async function LatestPosts() {
  const posts = await getAllPosts();
  const recent = posts.filter((p) => !p.draft).slice(0, 3);

  if (recent.length === 0) return null;

  return (
    <section className="py-24 md:py-32 bg-surface border-t border-border">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-muted mb-3">
              Stories
            </p>
            <h2 className="font-serif text-3xl md:text-5xl font-medium tracking-tight">
              From the Journal
            </h2>
          </div>
          {posts.length > 3 && (
            <Link
              href="/blog"
              className="text-sm tracking-widest uppercase text-muted hover:text-foreground transition-colors"
            >
              Read More &rarr;
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {recent.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}