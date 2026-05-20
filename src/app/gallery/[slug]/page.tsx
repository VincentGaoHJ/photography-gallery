import type { Metadata } from "next";
import Link from "next/link";

// This would be fetched from S3 in production
const galleryItems: Record<string, {
  key: string;
  url: string;
  category: string;
  title: string;
  description: string;
  width: number;
  height: number;
}> = {
  "portraits/portrait-1": {
    key: "portraits/portrait-1",
    url: "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=1200&q=80",
    category: "portraits",
    title: "Morning Light",
    description:
      "A study in natural window light. The soft directional light creates depth while maintaining a gentle, ethereal quality.",
    width: 1200,
    height: 1600,
  },
  "editorial/editorial-1": {
    key: "editorial/editorial-1",
    url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=1200&q=80",
    category: "editorial",
    title: "Urban Stories",
    description:
      "An editorial series exploring the intersection of fashion and cityscapes.",
    width: 1200,
    height: 800,
  },
  "commercial/commercial-1": {
    key: "commercial/commercial-1",
    url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1200&q=80",
    category: "commercial",
    title: "Brand Campaign",
    description:
      "Commercial work for lifestyle and fashion brands.",
    width: 1200,
    height: 1500,
  },
  "portraits/portrait-2": {
    key: "portraits/portrait-2",
    url: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=1200&q=80",
    category: "portraits",
    title: "Quiet Moment",
    description:
      "Capturing the in-between moments where true personality emerges.",
    width: 1200,
    height: 1800,
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const item = galleryItems[decodedSlug];

  if (!item) {
    return { title: "Not Found" };
  }

  return {
    title: item.title,
    description: item.description,
    openGraph: {
      images: [item.url],
    },
  };
}

export default async function GalleryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const item = galleryItems[decodedSlug];

  if (!item) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-24">
        <div className="text-center">
          <h1 className="font-serif text-2xl">Image not found</h1>
          <Link
            href="/gallery"
            className="mt-4 inline-block text-sm text-muted hover:text-foreground"
          >
            &larr; Back to Gallery
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-6xl px-6">
        {/* Back link */}
        <Link
          href="/gallery"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors mb-8"
        >
          &larr; Back to Gallery
        </Link>

        {/* Image */}
        <div className="relative w-full bg-neutral-100 mb-12">
          <img
            src={item.url}
            alt={item.title}
            className="w-full h-auto max-h-[80vh] object-contain mx-auto"
          />
        </div>

        {/* Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h1 className="font-serif text-3xl md:text-4xl font-medium tracking-tight mb-2">
              {item.title}
            </h1>
            <p className="text-xs tracking-widest uppercase text-muted capitalize">
              {item.category}
            </p>
          </div>
          <div>
            <p className="text-muted leading-relaxed">{item.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}