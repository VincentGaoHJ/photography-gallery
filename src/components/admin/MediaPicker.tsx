"use client";

import { useEffect, useState } from "react";
import { list } from "aws-amplify/storage";
import { mediaUrl } from "@/lib/media";
import { uploadToLibrary } from "./mediaUpload";

const IMG_RE = /\.(jpe?g|png|webp|gif|avif)$/i;

/**
 * Shared media library picker — browse every image in the S3 pool and reuse it
 * across Work and Blog, or upload a new one (uploads go to media/library/ and
 * are deduped). Returns the public URL + the media-relative key.
 */
export function MediaPicker({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string, key: string) => void;
}) {
  const [keys, setKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState("");

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
    try {
      const { url, key } = await uploadToLibrary(files[0]);
      setKeys((ks) => Array.from(new Set([key, ...ks])));
      onSelect(url, key);
      onClose();
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  const shown = q
    ? keys.filter((k) => k.toLowerCase().includes(q.toLowerCase()))
    : keys;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[80vh] w-full max-w-3xl overflow-auto bg-background p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <h3 className="font-heading text-xl">素材库</h3>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜索文件名…"
            className="min-w-40 flex-1 border border-border bg-background px-3 py-1.5 text-sm"
          />
          <label className="cursor-pointer whitespace-nowrap bg-accent px-3 py-1.5 text-sm text-white">
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

        {loading ? (
          <p className="text-muted">加载素材库…</p>
        ) : shown.length === 0 ? (
          <p className="text-muted">
            {keys.length === 0 ? "还没有素材,点「上传新图」。" : "没有匹配的文件。"}
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {shown.map((k) => (
              <button
                key={k}
                type="button"
                className="aspect-square overflow-hidden bg-surface"
                title={k}
                onClick={() => {
                  onSelect(mediaUrl({ key: k, src: "" }), k);
                  onClose();
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={mediaUrl({ key: k, src: "" })}
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
