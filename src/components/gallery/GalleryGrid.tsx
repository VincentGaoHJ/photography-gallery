import Image from "next/image";
import type { GalleryItem } from "@/types/gallery";
import clsx from "clsx";

interface GalleryGridProps {
  items: GalleryItem[];
  columns?: 2 | 3 | 4;
}

export function GalleryGrid({ items, columns = 3 }: GalleryGridProps) {
  const colClass = clsx(
    "grid gap-4",
    columns === 2 && "grid-cols-1 sm:grid-cols-2",
    columns === 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    columns === 4 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
  );

  return (
    <div className={colClass}>
      {items.map((item) => (
        <a
          key={item.key}
          href={`/gallery/${encodeURIComponent(item.key)}`}
          className="group relative overflow-hidden bg-neutral-100"
          style={{
            aspectRatio: item.width && item.height
              ? `${item.width}/${item.height}`
              : "3/4",
          }}
        >
          <Image
            src={item.url}
            alt={item.title || item.key}
            fill
            sizes={
              columns === 2
                ? "(max-width: 640px) 100vw, 50vw"
                : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            }
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-500 flex items-end p-5">
            <div className="translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
              <p className="text-white text-sm font-medium">
                {item.title || "Untitled"}
              </p>
              <p className="text-white/60 text-xs capitalize mt-0.5">
                {item.category}
              </p>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}