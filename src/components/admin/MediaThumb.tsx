"use client";

import { useEffect, useState } from "react";
import { getUrl } from "aws-amplify/storage";
import { mediaUrl } from "@/lib/media";

/**
 * Admin thumbnail that works regardless of NEXT_PUBLIC_MEDIA_BASE_URL: prefers
 * the public CDN URL when configured, otherwise falls back to an authenticated
 * presigned S3 URL (getUrl) — the same trick the gallery editor uses. Without
 * this, an unset media base renders blank tiles in the library/picker.
 */
export function MediaThumb({ k, className }: { k: string; className?: string }) {
  const direct = mediaUrl({ key: k, src: "" }); // CDN URL when env is set, else ""
  const [url, setUrl] = useState(direct);

  useEffect(() => {
    if (direct) {
      setUrl(direct);
      return;
    }
    let active = true;
    getUrl({ path: `media/${k}` })
      .then((r) => active && setUrl(r.url.toString()))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [k, direct]);

  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt="" loading="lazy" className={className} />
  ) : (
    <div className={className} />
  );
}
