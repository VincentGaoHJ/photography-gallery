"use client";

import { useEffect, useMemo, useState } from "react";
import { mediaUrl } from "@/lib/media";
import { uploadToLibrary } from "./mediaUpload";
import { listAllMediaKeys, nodeAt, crumbs } from "./mediaTree";

/**
 * Shared media library picker — browse the one S3 pool as folders and reuse any
 * image across Work and Blog, or upload a new one into the current folder
 * (deduped). Returns the public URL + the media-relative key.
 */
export function MediaPicker({
  open,
  onClose,
  onSelect,
  initialFolder = "",
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string, key: string) => void;
  initialFolder?: string;
}) {
  const [allKeys, setAllKeys] = useState<string[]>([]);
  const [path, setPath] = useState("");
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!open) return;
    setPath(initialFolder ? `${initialFolder.replace(/\/+$/, "")}/` : "");
    setQ("");
    setLoading(true);
    listAllMediaKeys()
      .then(setAllKeys)
      .catch(() => setAllKeys([]))
      .finally(() => setLoading(false));
  }, [open, initialFolder]);

  const node = useMemo(() => nodeAt(allKeys, path), [allKeys, path]);

  const searchHits = useMemo(() => {
    if (!q) return [];
    const t = q.toLowerCase();
    return allKeys.filter((k) => k.toLowerCase().includes(t)).sort();
  }, [q, allKeys]);

  const onUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    try {
      const { url, key } = await uploadToLibrary(files[0], path);
      onSelect(url, key);
      onClose();
    } finally {
      setBusy(false);
    }
  };

  const pick = (key: string) => {
    onSelect(mediaUrl({ key, src: "" }), key);
    onClose();
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
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <h3 className="font-heading text-xl">素材库</h3>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜索全部文件名…"
            className="min-w-40 flex-1 border border-border bg-background px-3 py-1.5 text-sm"
          />
          <label className="cursor-pointer whitespace-nowrap bg-accent px-3 py-1.5 text-sm text-white">
            {busy ? "上传中…" : "上传到此处"}
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

        {/* breadcrumb */}
        {!q && (
          <div className="mb-4 flex flex-wrap items-center gap-1 text-sm">
            <button
              type="button"
              onClick={() => setPath("")}
              className={
                path === ""
                  ? "text-foreground"
                  : "text-accent hover:underline"
              }
            >
              素材库
            </button>
            {crumbs(path).map((c) => (
              <span key={c.prefix} className="flex items-center gap-1">
                <span className="text-muted">/</span>
                <button
                  type="button"
                  onClick={() => setPath(c.prefix)}
                  className={
                    c.prefix === path
                      ? "text-foreground"
                      : "text-accent hover:underline"
                  }
                >
                  {c.name}
                </button>
              </span>
            ))}
          </div>
        )}

        {loading ? (
          <p className="text-muted">加载素材库…</p>
        ) : q ? (
          searchHits.length === 0 ? (
            <p className="text-muted">没有匹配「{q}」的文件。</p>
          ) : (
            <PickGrid keys={searchHits} onPick={pick} showPath />
          )
        ) : (
          <>
            {node.folders.length > 0 && (
              <div className="mb-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {node.folders.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setPath(`${path}${f}/`)}
                    className="flex aspect-square flex-col items-center justify-center gap-2 border border-border bg-surface text-center hover:border-accent"
                    title={f}
                  >
                    <span className="text-3xl">📁</span>
                    <span className="line-clamp-2 px-2 text-xs">{f}</span>
                  </button>
                ))}
              </div>
            )}
            {node.images.length > 0 ? (
              <PickGrid keys={node.images} onPick={pick} />
            ) : node.folders.length === 0 ? (
              <p className="text-muted">
                这个文件夹是空的,点「上传到此处」。
              </p>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

function PickGrid({
  keys,
  onPick,
  showPath,
}: {
  keys: string[];
  onPick: (key: string) => void;
  showPath?: boolean;
}) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {keys.map((k) => (
        <button
          key={k}
          type="button"
          className="relative aspect-square overflow-hidden bg-surface"
          title={k}
          onClick={() => onPick(k)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mediaUrl({ key: k, src: "" })}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
          />
          {showPath && (
            <span className="absolute inset-x-0 bottom-0 truncate bg-black/50 px-1 py-0.5 text-[10px] text-white">
              {k}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
