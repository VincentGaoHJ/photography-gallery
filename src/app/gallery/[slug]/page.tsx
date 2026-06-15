import { notFound } from "next/navigation";
import Link from "next/link";
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
    openGraph: gallery.cover
      ? { images: [mediaUrl(gallery.cover)] }
      : undefined,
  };
}

export default async function GalleryDetailPage({ params }: Props) {
  const { slug } = await params;
  const gallery = await getGalleryBySlug(slug);
  if (!gallery) notFound();

  return (
    <div className="mx-auto max-w-[1500px] px-4 pb-24 pt-12 md:px-8 md:pt-16">
      <header className="mx-auto mb-10 max-w-3xl text-center md:mb-14">
        <Link
          href="/"
          className="label mb-5 inline-block text-muted transition-colors hover:text-accent"
        >
          ← Work
        </Link>
        <h1 className="font-heading text-3xl font-medium tracking-tight md:text-5xl">
          {gallery.title}
        </h1>
        <p className="label mt-4 text-muted">
          {gallery.count} {gallery.count === 1 ? "photograph" : "photographs"}
        </p>
      </header>

      <GalleryLightboxGrid items={gallery.items} />
    </div>
  );
}
