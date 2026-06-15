export interface MediaItem {
  /** Stable path used as the S3 object key in Phase 2 (e.g. "tibet/DSC00499.jpg"). */
  key: string;
  /** Current delivery URL (Phase 1: Squarespace CDN). Resolved via lib/media.ts. */
  src: string;
  width: number | null;
  height: number | null;
  alt?: string;
  caption?: string;
  type?: "image" | "video";
}

export interface GalleryCover {
  key: string;
  src: string;
  width: number | null;
  height: number | null;
}

export interface Gallery {
  /** Route slug, e.g. "tibet" -> /gallery/tibet */
  slug: string;
  title: string;
  /** Optional human location, e.g. "Tibet, China" */
  location?: string;
  /** Original Squarespace path, kept for reference during migration. */
  sourcePath?: string;
  cover: GalleryCover | null;
  count: number;
  items: MediaItem[];
}

export interface GalleriesManifest {
  galleries: Gallery[];
}
