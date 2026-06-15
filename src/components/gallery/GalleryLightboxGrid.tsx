"use client";

import { useState } from "react";
import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { mediaUrl } from "@/lib/media";
import type { MediaItem } from "@/types/gallery";

/**
 * Masonry photo grid (handles mixed portrait/landscape) with click-to-open
 * lightbox, matching the original site's `gallery-masonry` layout.
 */
export function GalleryLightboxGrid({ items }: { items: MediaItem[] }) {
  const [index, setIndex] = useState(-1);

  const slides = items.map((it) => ({
    src: mediaUrl(it),
    width: it.width ?? undefined,
    height: it.height ?? undefined,
    alt: it.alt,
  }));

  return (
    <>
      <div className="columns-1 gap-4 [column-fill:_balance] sm:columns-2 sm:gap-5 lg:columns-3">
        {items.map((it, i) => (
          <button
            key={it.key}
            type="button"
            onClick={() => setIndex(i)}
            className="group mb-4 block w-full cursor-zoom-in overflow-hidden break-inside-avoid bg-surface sm:mb-5"
            aria-label={it.alt || `Open photo ${i + 1}`}
          >
            <Image
              src={mediaUrl(it)}
              alt={it.alt || ""}
              width={it.width || 1200}
              height={it.height || 800}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="h-auto w-full transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
          </button>
        ))}
      </div>

      <Lightbox
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
        slides={slides}
        controller={{ closeOnBackdropClick: true }}
      />
    </>
  );
}
