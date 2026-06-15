import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";
import { mediaUrl } from "@/lib/media";
import type { Gallery } from "@/types/gallery";

/**
 * Editorial, offset showcase of the portfolio collections — title text paired
 * with a large cover image, alternating sides, echoing the original home page's
 * asymmetric layout. Each entry links to its full gallery.
 */
export function PortfolioGrid({ galleries }: { galleries: Gallery[] }) {
  return (
    <section className="mx-auto max-w-[1500px] px-6 py-12 md:px-10 md:py-20">
      <div className="flex flex-col gap-20 md:gap-32">
        {galleries.map((g, i) => {
          const flip = i % 2 === 1;
          return (
            <article
              key={g.slug}
              className="grid grid-cols-1 items-center gap-8 md:grid-cols-12 md:gap-12"
            >
              <div
                className={clsx(
                  "md:col-span-4",
                  flip ? "md:order-2 md:pl-6" : "md:order-1 md:pr-6"
                )}
              >
                <Link href={`/gallery/${g.slug}`} className="group inline-block">
                  <h2 className="font-heading text-3xl font-medium leading-tight tracking-tight transition-colors group-hover:text-accent md:text-[2.6rem]">
                    {g.title}
                  </h2>
                  <span className="label mt-5 inline-flex items-center gap-2 text-muted transition-colors group-hover:text-accent">
                    View gallery <span aria-hidden>→</span>
                  </span>
                </Link>
              </div>

              <div
                className={clsx(
                  "md:col-span-8",
                  flip ? "md:order-1" : "md:order-2"
                )}
              >
                <Link
                  href={`/gallery/${g.slug}`}
                  className="group block overflow-hidden bg-surface"
                >
                  {g.cover && (
                    <div className="relative aspect-[3/2] w-full">
                      <Image
                        src={mediaUrl(g.cover)}
                        alt={g.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 66vw"
                        className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
                        priority={i === 0}
                      />
                    </div>
                  )}
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
