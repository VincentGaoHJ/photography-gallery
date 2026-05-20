import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "A curated collection of editorial and portrait photography.",
};

// Placeholder gallery items — in production these come from S3.
// Organized by category for the filter UI.
const galleryCategories = [
  {
    slug: "all",
    label: "All Work",
  },
  {
    slug: "portraits",
    label: "Portraits",
    items: [
      {
        key: "portraits/portrait-1",
        url: "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800&q=80",
        category: "portraits",
        title: "Morning Light",
        width: 800,
        height: 1067,
        type: "image" as const,
      },
      {
        key: "portraits/portrait-2",
        url: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=80",
        category: "portraits",
        title: "Quiet Moment",
        width: 800,
        height: 1200,
        type: "image" as const,
      },
      {
        key: "portraits/portrait-3",
        url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
        category: "portraits",
        title: "Direct Gaze",
        width: 800,
        height: 800,
        type: "image" as const,
      },
      {
        key: "portraits/portrait-4",
        url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80",
        category: "portraits",
        title: "Soft Shadows",
        width: 800,
        height: 1200,
        type: "image" as const,
      },
      {
        key: "portraits/portrait-5",
        url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80",
        category: "portraits",
        title: "Profile Study",
        width: 800,
        height: 1000,
        type: "image" as const,
      },
    ],
  },
  {
    slug: "editorial",
    label: "Editorial",
    items: [
      {
        key: "editorial/editorial-1",
        url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80",
        category: "editorial",
        title: "Urban Stories",
        width: 800,
        height: 533,
        type: "image" as const,
      },
      {
        key: "editorial/editorial-2",
        url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80",
        category: "editorial",
        title: "Runway",
        width: 800,
        height: 1067,
        type: "image" as const,
      },
      {
        key: "editorial/editorial-3",
        url: "https://images.unsplash.com/photo-1509631177647-4d8b0e7f7fa0?w=800&q=80",
        category: "editorial",
        title: "Behind the Scenes",
        width: 800,
        height: 533,
        type: "image" as const,
      },
      {
        key: "editorial/editorial-4",
        url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80",
        category: "editorial",
        title: "Street Style",
        width: 800,
        height: 1200,
        type: "image" as const,
      },
    ],
  },
  {
    slug: "commercial",
    label: "Commercial",
    items: [
      {
        key: "commercial/commercial-1",
        url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=80",
        category: "commercial",
        title: "Brand Campaign",
        width: 800,
        height: 1000,
        type: "image" as const,
      },
      {
        key: "commercial/commercial-2",
        url: "https://images.unsplash.com/photo-1488161628813-04466f872be2?w=800&q=80",
        category: "commercial",
        title: "Product Story",
        width: 800,
        height: 1067,
        type: "image" as const,
      },
      {
        key: "commercial/commercial-3",
        url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80",
        category: "commercial",
        title: "Lifestyle",
        width: 800,
        height: 1200,
        type: "image" as const,
      },
    ],
  },
];

export default function GalleryPage() {
  const allItems = galleryCategories.flatMap(
    (cat) => cat.items || []
  );
  const categories = [
    { slug: "all", label: "All Work" },
    ...galleryCategories
      .filter((c) => c.items)
      .map((c) => ({ slug: c.slug, label: c.label })),
  ];

  return (
    <div className="min-h-screen pt-24 pb-24">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mb-16">
          <p className="text-xs tracking-[0.2em] uppercase text-muted mb-3">
            Portfolio
          </p>
          <h1 className="font-serif text-4xl md:text-6xl font-medium tracking-tight">
            Gallery
          </h1>
          <p className="mt-4 text-muted max-w-xl leading-relaxed">
            A curated selection of editorial, portrait, and commercial
            photography. Each image tells its own story.
          </p>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-3 mb-12">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={cat.slug === "all" ? "/gallery" : `/gallery?category=${cat.slug}`}
              className="px-5 py-2 text-xs tracking-widest uppercase border border-border rounded-full hover:bg-foreground hover:text-background hover:border-foreground transition-all"
            >
              {cat.label}
            </Link>
          ))}
        </div>

        {/* Gallery sections by category */}
        <div className="space-y-24">
          {galleryCategories.map((category) =>
            category.items ? (
              <section key={category.slug} id={category.slug}>
                <h2 className="font-serif text-2xl font-medium mb-8">
                  {category.label}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.items.map((item) => (
                    <a
                      key={item.key}
                      href={`/gallery/${encodeURIComponent(item.key)}`}
                      className="group relative overflow-hidden bg-neutral-100"
                      style={{
                        aspectRatio: `${item.width}/${item.height}`,
                      }}
                    >
                      <img
                        src={item.url}
                        alt={item.title || ""}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-500 flex items-end p-5">
                        <div className="translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                          <p className="text-white text-sm font-medium">
                            {item.title}
                          </p>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            ) : null
          )}
        </div>
      </div>
    </div>
  );
}