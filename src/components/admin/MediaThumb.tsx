"use client";

import { mediaUrl } from "@/lib/media";

/**
 * Admin thumbnail via the public CDN URL (CloudFront), which the browser can
 * reach from China. We deliberately do NOT fall back to a presigned getUrl here
 * — that's a direct S3 call and would hang behind the GFW.
 */
export function MediaThumb({ k, className }: { k: string; className?: string }) {
  const url = mediaUrl({ key: k, src: "" });
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt="" loading="lazy" className={className} />
  ) : (
    <div className={className} />
  );
}
