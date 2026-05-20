import { getAllPosts } from "@/lib/blog";
import { BlogCard } from "@/components/blog/BlogCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Stories, techniques, and reflections from behind the lens.",
};

export default async function BlogListPage() {
  const posts = await getAllPosts();
  const published = posts.filter((p) => !p.draft);

  return (
    <div className="min-h-screen pt-24 pb-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16">
          <p className="text-xs tracking-[0.2em] uppercase text-muted mb-3">
            Stories
          </p>
          <h1 className="font-serif text-4xl md:text-6xl font-medium tracking-tight">
            Journal
          </h1>
          <p className="mt-4 text-muted max-w-xl leading-relaxed">
            Thoughts on photography, behind-the-scenes stories, and
            technical insights from my work.
          </p>
        </div>

        {published.length === 0 ? (
          <div className="py-24 text-center text-muted">
            <p className="font-serif text-2xl mb-2">Coming Soon</p>
            <p className="text-sm">Journal posts are on their way.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {published.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}