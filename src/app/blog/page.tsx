import { getAllPosts } from "@/lib/blog";
import { BlogCard } from "@/components/blog/BlogCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "Travel journals and stories from behind the lens.",
};

export default async function BlogListPage() {
  const posts = (await getAllPosts()).filter((p) => !p.draft);

  return (
    <div className="mx-auto max-w-[1500px] px-6 py-16 md:px-10 md:py-24">
      {posts.length === 0 ? (
        <div className="py-24 text-center text-muted">
          <p className="font-heading text-3xl italic">Coming soon</p>
          <p className="mt-2 text-sm">New journal entries are on their way.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-20 md:gap-28">
          {posts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
