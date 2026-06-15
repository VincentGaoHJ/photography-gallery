"use client";

import { useState } from "react";
import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { mediaUrl } from "@/lib/media";
import type { MediaItem } from "@/types/gallery";

/**
 * Masonry photo grid (handles mixed portrait/landscape) with a click-to-open
 * lightbox. Client component because the lightbox holds open/index state.
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
      <div className="gap-3 [column-fill:_balance] sm:columns-2 lg:columns-3">
        {items.map((it, i) => (
          <button
            key={it.key}
            type="button"
            onClick={() => setIndex(i)}
            className="group mb-3 block w-full cursor-zoom-in overflow-hidden bg-surface"
            aria-label={it.alt || `Open photo ${i + 1}`}
          >
            <Image
              src={mediaUrl(it)}
              alt={it.alt || ""}
              width={it.width || 1200}
              height={it.height || 800}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="h-auto w-full transition-opacity duration-500 group-hover:opacity-90"
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
