import seed from "../../content/galleries.json";
import type { Gallery, GalleriesManifest } from "@/types/gallery";
import { MEDIA_BASE_URL } from "./constants";

const seedManifest = seed as GalleriesManifest;

/**
 * Fixed slugs for static generation (managed galleries). Reads the committed
 * seed so `generateStaticParams` stays synchronous and deploy-stable.
 */
export function getGallerySlugs(): string[] {
  return seedManifest.galleries.map((g) => g.slug);
}

/**
 * Live galleries. Prefers the S3-hosted manifest (edited via /admin) and falls
 * back to the committed seed when S3 isn't configured/reachable (local dev,
 * first deploy). Read at request time with ISR so /admin edits appear without a
 * code push.
 */
export async function getGalleries(): Promise<Gallery[]> {
  if (MEDIA_BASE_URL) {
    try {
      const res = await fetch(
        `${MEDIA_BASE_URL.replace(/\/$/, "")}/galleries.json`,
        { next: { revalidate: 60 } }
      );
      if (res.ok) {
        const data = (await res.json()) as GalleriesManifest;
        if (data?.galleries?.length) return data.galleries;
      }
    } catch {
      // fall through to the committed seed
    }
  }
  return seedManifest.galleries;
}

export async function getGalleryBySlug(
  slug: string
): Promise<Gallery | undefined> {
  const galleries = await getGalleries();
  return galleries.find((g) => g.slug === slug);
}
