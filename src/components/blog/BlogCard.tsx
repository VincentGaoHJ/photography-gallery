import Link from "next/link";
import Image from "next/image";
import type { BlogPostMeta } from "@/types/blog";

interface BlogCardProps {
  post: BlogPostMeta;
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block"
    >
      <article>
        {/* Cover image */}
        {post.coverImage ? (
          <div className="relative aspect-[16/10] overflow-hidden mb-5 bg-neutral-100">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
        ) : (
          <div className="aspect-[16/10] bg-neutral-100 mb-5 flex items-center justify-center">
            <span className="font-serif text-4xl text-neutral-300">
              {post.title.charAt(0)}
            </span>
          </div>
        )}

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-muted mb-3">
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

        {/* Title */}
        <h3 className="font-serif text-xl font-medium tracking-tight mb-2 group-hover:opacity-70 transition-opacity">
          {post.title}
        </h3>

        {/* Excerpt */}
        <p className="text-sm text-muted leading-relaxed line-clamp-2">
          {post.excerpt}
        </p>
      </article>
    </Link>
  );
}