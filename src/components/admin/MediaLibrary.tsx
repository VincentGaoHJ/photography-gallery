"use client";

import { useEffect, useState } from "react";
import { list, remove } from "aws-amplify/storage";
import { mediaUrl } from "@/lib/media";
import { uploadToLibrary } from "./mediaUpload";

const IMG_RE = /\.(jpe?g|png|webp|gif|avif)$/i;

/**
 * Standalone media library — the home base for all uploaded media. Browse the
 * whole S3 pool, batch-upload (deduped), search, and delete. The same pool is
 * what the gallery/blog pickers read from.
 */
export function MediaLibrary() {
  const [keys, setKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState("");
  const [msg, setMsg] = useState("");

  const load = () => {
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
  };

  useEffect(() => {
    load();
  }, []);

  const onUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setMsg("上传中…");
    let n = 0;
    for (const f of Array.from(files)) {
      try {
        await uploadToLibrary(f);
        n++;
      } catch {
        /* skip */
      }
    }
    setBusy(false);
    setMsg(`已上传 ${n} 张`);
    load();
  };

  const del = async (key: string) => {
    if (
      !window.confirm(
        `删除 ${key}?\n请先确认没有相册/文章在用它,否则那里会显示破图。`
      )
    )
      return;
    try {
      await remove({ path: `media/${key}` });
      setKeys((ks) => ks.filter((k) => k !== key));
      setMsg("已删除");
    } catch {
      setMsg("删除失败");
    }
  };

  const shown = q
    ? keys.filter((k) => k.toLowerCase().includes(q.toLowerCase()))
    : keys;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <label className="cursor-pointer bg-accent px-5 py-2 text-sm text-white">
          {busy ? "上传中…" : "+ 上传图片"}
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => onUpload(e.target.files)}
          />
        </label>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="搜索文件名…"
          className="border border-border bg-background px-3 py-1.5 text-sm"
        />
        <span className="text-sm text-muted">
          {keys.length} 张{msg && ` · ${msg}`}
        </span>
      </div>

      {loading ? (
        <p className="text-muted">加载素材库…</p>
      ) : shown.length === 0 ? (
        <p className="text-muted">
          {keys.length === 0
            ? "还没有素材,点「上传图片」。"
            : "没有匹配的文件。"}
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {shown.map((k) => (
            <div
              key={k}
              className="group relative aspect-square overflow-hidden bg-surface"
              title={k}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mediaUrl({ key: k, src: "" })}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => del(k)}
                className="absolute right-1 top-1 hidden h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs text-white group-hover:flex"
                aria-label="删除"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
