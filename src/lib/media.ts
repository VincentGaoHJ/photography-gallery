import { MEDIA_BASE_URL } from "./constants";
import type { MediaItem } from "@/types/gallery";

/**
 * Resolve a media item to its delivery URL.
 *
 * Phase 1: returns the original Squarespace CDN URL stored in the manifest.
 * Phase 2: once photos are uploaded to S3 and NEXT_PUBLIC_MEDIA_BASE_URL points
 * at the S3/CloudFront origin, returns `${base}/${key}` instead — no component
 * changes required.
 */
export function mediaUrl(item: Pick<MediaItem, "key" | "src">): string {
  if (MEDIA_BASE_URL) {
    return `${MEDIA_BASE_URL.replace(/\/$/, "")}/${item.key}`;
  }
  return item.src ?? "";
}
