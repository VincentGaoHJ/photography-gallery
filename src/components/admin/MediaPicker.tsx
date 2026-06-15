"use client";

import { useEffect, useState } from "react";
import { list, uploadData, getUrl } from "aws-amplify/storage";
import { MEDIA_BASE_URL } from "@/lib/constants";

const IMG_RE = /\.(jpe?g|png|webp|gif|avif)$/i;

/** key is relative to the media/ root, e.g. "tibet/x.jpg" -> CDN url */
function publicUrl(key: string): string {
  return MEDIA_BASE_URL ? `${MEDIA_BASE_URL.replace(/\/$/, "")}/${key}` : "";
}

/**
 * Shared media library picker — browse every image already in S3 (media/*) and
 * reuse it across Work and Blog, or upload a new one. Returns the public URL +
 * the media-relative key.
 */
export function MediaPicker({
  open,
  onClose,
  onSelect,
  uploadPrefix = "uploads",
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string, key: string) => void;
  uploadPrefix?: string;
}) {
  const [keys, setKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    list({ path: "media/", options: { listAll: true } })
      .then((res) => {
        const found = res.items
          .map((i) => i.path.replace(/^media\//, ""))
          .filter((k) => k && !k.endsWith("/") && IMG_RE.test(k));
        setKeys(Array.from(new Set(found)).sort());
      })
      .catch(() => setKeys([]))
      .finally(() => setLoading(false));
  }, [open]);

  const onUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    const f = files[0];
    const key = `${uploadPrefix}/${f.name}`.replace(/\/+/g, "/");
    try {
      await uploadData({
        path: `media/${key}`,
        data: f,
        options: { contentType: f.type },
      }).result;
      const url =
        publicUrl(key) ||
        (await getUrl({ path: `media/${key}` })).url.toString();
      onSelect(url, key);
      onClose();
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[80vh] w-full max-w-3xl overflow-auto bg-background p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-heading text-xl">素材库</h3>
          <div className="flex items-center gap-3">
            <label className="cursor-pointer bg-accent px-3 py-1.5 text-sm text-white">
              {busy ? "上传中…" : "上传新图"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onUpload(e.target.files)}
              />
            </label>
            <button
              type="button"
              onClick={onClose}
              className="text-sm text-muted hover:text-accent"
            >
              关闭
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-muted">加载素材库…</p>
        ) : keys.length === 0 ? (
          <p className="text-muted">还没有素材,点「上传新图」。</p>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {keys.map((k) => (
              <button
                key={k}
                type="button"
                className="aspect-square overflow-hidden bg-surface"
                title={k}
                onClick={() => {
                  onSelect(publicUrl(k), k);
                  onClose();
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={publicUrl(k)}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
