import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";
import type { BlogPostMeta } from "@/types/blog";

interface BlogCardProps {
  post: BlogPostMeta;
}

// e.g. "2025-05-07" -> "5/7/25" (parsed by parts to avoid timezone drift)
function shortDate(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  if (!y) return date;
  return `${m}/${d}/${String(y).slice(2)}`;
}

/**
 * Editorial blog row matching the original site: cover image on the left, with
 * date / title / excerpt / "Read More" on the right. Degrades to a clean
 * text-only block when a post has no cover image yet (text-only migration).
 */
export function BlogCard({ post }: BlogCardProps) {
  const href = `/blog/${post.slug}`;
  const hasImage = Boolean(post.coverImage);

  return (
    <article className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-14">
      {hasImage && (
        <Link href={href} className="group block overflow-hidden bg-surface">
          <div className="relative aspect-[4/3] w-full">
            <Image
              src={post.coverImage as string}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
            />
          </div>
        </Link>
      )}

      <div className={clsx(!hasImage && "mx-auto max-w-2xl text-center")}>
        <p className="font-heading text-lg italic text-muted">
          {shortDate(post.date)}
        </p>

        <Link href={href} className="group">
          <h2 className="mt-2 font-heading text-4xl font-semibold leading-tight tracking-tight transition-colors group-hover:text-accent md:text-5xl">
            {post.title}
          </h2>
        </Link>

        <p className="mt-5 line-clamp-3 leading-relaxed text-foreground/80 md:text-lg">
          {post.excerpt}
        </p>

        <Link
          href={href}
          className="mt-6 inline-block font-heading text-lg italic text-accent underline decoration-1 underline-offset-4 transition-colors hover:text-accent-hover"
        >
          Read More
        </Link>
      </div>
    </article>
  );
}
