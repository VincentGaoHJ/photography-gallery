import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getGalleryBySlug, getGallerySlugs } from "@/lib/galleries";
import { mediaUrl } from "@/lib/media";
import { GalleryLightboxGrid } from "@/components/gallery/GalleryLightboxGrid";

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;
export const dynamicParams = true;

export function generateStaticParams() {
  return getGallerySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const gallery = await getGalleryBySlug(slug);
  if (!gallery) return { title: "Not Found" };
  return {
    title: gallery.title,
    openGraph: gallery.cover ? { images: [mediaUrl(gallery.cover)] } : undefined,
  };
}

export default async function GalleryDetailPage({ params }: Props) {
  const { slug } = await params;
  const gallery = await getGalleryBySlug(slug);
  if (!gallery) notFound();

  const banner = gallery.cover ?? gallery.items[0] ?? null;

  return (
    <div>
      {/* Full-bleed banner with the collection title overlaid */}
      {banner ? (
        <section className="relative h-[58vh] min-h-[380px] w-full overflow-hidden bg-surface">
          <Image
            src={mediaUrl(banner)}
            alt={gallery.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-foreground/30" />
          <Link
            href="/"
            className="label absolute left-6 top-6 text-white/85 transition-colors hover:text-white md:left-10"
          >
            ← Work
          </Link>
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
            <h1 className="font-heading text-4xl font-medium leading-tight tracking-tight text-white drop-shadow-sm md:text-6xl">
              {gallery.title}
            </h1>
            <p className="label mt-4 text-white/80">
              {gallery.count} {gallery.count === 1 ? "photograph" : "photographs"}
            </p>
          </div>
        </section>
      ) : (
        <header className="mx-auto max-w-3xl px-6 pt-16 text-center">
          <Link href="/" className="label mb-5 inline-block text-muted hover:text-accent">
            ← Work
          </Link>
          <h1 className="font-heading text-4xl font-medium md:text-5xl">
            {gallery.title}
          </h1>
        </header>
      )}

      <div className="mx-auto max-w-[1600px] px-3 py-12 md:px-6 md:py-20">
        <GalleryLightboxGrid items={gallery.items} />
      </div>
    </div>
  );
}
