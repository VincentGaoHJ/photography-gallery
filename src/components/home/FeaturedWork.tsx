import Link from "next/link";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";

// Placeholder images for the homepage featured section.
// In production, these would come from S3.
const featuredItems = [
  {
    key: "featured-1",
    url: "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800&q=80",
    category: "portraits",
    title: "Portrait Study",
    width: 800,
    height: 1067,
    type: "image" as const,
  },
  {
    key: "featured-2",
    url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80",
    category: "editorial",
    title: "Editorial",
    width: 800,
    height: 533,
    type: "image" as const,
  },
  {
    key: "featured-3",
    url: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=80",
    category: "portraits",
    title: "Natural Light",
    width: 800,
    height: 1200,
    type: "image" as const,
  },
  {
    key: "featured-4",
    url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=80",
    category: "commercial",
    title: "Commercial",
    width: 800,
    height: 1000,
    type: "image" as const,
  },
  {
    key: "featured-5",
    url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80",
    category: "editorial",
    title: "Fashion",
    width: 800,
    height: 1067,
    type: "image" as const,
  },
  {
    key: "featured-6",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
    category: "portraits",
    title: "Character Study",
    width: 800,
    height: 800,
    type: "image" as const,
  },
];

export function FeaturedWork() {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-muted mb-3">
              Portfolio
            </p>
            <h2 className="font-serif text-3xl md:text-5xl font-medium tracking-tight">
              Selected Work
            </h2>
          </div>
          <Link
            href="/gallery"
            className="text-sm tracking-widest uppercase text-muted hover:text-foreground transition-colors"
          >
            View All &rarr;
          </Link>
        </div>
      </div>

      {/* Full-width grid */}
      <div className="mx-auto max-w-7xl px-6">
        <GalleryGrid items={featuredItems} />
      </div>
    </section>
  );
}