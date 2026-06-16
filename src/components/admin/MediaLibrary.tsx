"use client";

import { useEffect, useMemo, useState } from "react";
import { uploadToLibrary, createFolder } from "./mediaUpload";
import { listAllMediaKeys, nodeAt, crumbs, KEEP } from "./mediaTree";
import { MediaThumb } from "./MediaThumb";
import { apiDelete } from "./adminApi";

/**
 * Standalone media library — the home base for all uploaded media. Browse the
 * one S3 pool as folders, create folders, batch-upload into the current folder
 * (deduped), search, and delete. The gallery/blog pickers read from this same
 * pool, so nothing is ever stored twice.
 */
export function MediaLibrary() {
  const [allKeys, setAllKeys] = useState<string[]>([]);
  const [path, setPath] = useState(""); // current folder prefix, "" = root
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState("");
  const [msg, setMsg] = useState("");

  const load = () => {
    setLoading(true);
    setErr("");
    listAllMediaKeys()
      .then((ks) => {
        setAllKeys(ks);
        setErr("");
      })
      .catch((e) => {
        setAllKeys([]);
        setErr(e?.message || "加载失败");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const node = useMemo(() => nodeAt(allKeys, path), [allKeys, path]);

  const onUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setMsg("上传中…");
    let n = 0;
    for (const f of Array.from(files)) {
      try {
        await uploadToLibrary(f, path);
        n++;
      } catch {
        /* skip */
      }
    }
    setBusy(false);
    setMsg(`已上传 ${n} 张到 ${path || "根目录"}`);
    load();
  };

  const onNewFolder = async () => {
    const name = window.prompt("新文件夹名称(可用 / 建子文件夹)");
    if (!name) return;
    const safe = name.replace(/[^\w一-龥/-]+/g, "-").replace(/^\/+|\/+$/g, "");
    if (!safe) return;
    setBusy(true);
    try {
      await createFolder(`${path}${safe}`);
      setMsg(`已新建文件夹「${safe}」`);
      load();
    } finally {
      setBusy(false);
    }
  };

  const delImage = async (key: string) => {
    if (
      !window.confirm(
        `删除 ${key}?\n请先确认没有相册/文章在用它,否则那里会显示破图。`
      )
    )
      return;
    try {
      await apiDelete(key);
      setAllKeys((ks) => ks.filter((k) => k !== key));
      setMsg("已删除");
    } catch {
      setMsg("删除失败");
    }
  };

  const delFolder = async (folder: string) => {
    const prefix = `${path}${folder}/`;
    const inside = allKeys.filter(
      (k) => k.startsWith(prefix) && k !== `${prefix}${KEEP}`
    );
    if (inside.length) {
      setMsg(`「${folder}」非空(${inside.length} 项),请先清空再删`);
      return;
    }
    if (!window.confirm(`删除空文件夹「${folder}」?`)) return;
    try {
      await apiDelete(`${prefix}${KEEP}`).catch(() => {});
      setMsg(`已删除文件夹「${folder}」`);
      load();
    } catch {
      setMsg("删除失败");
    }
  };

  // Search is a flat filter across the whole pool (ignores the current folder).
  const searchHits = useMemo(() => {
    if (!q) return [];
    const t = q.toLowerCase();
    return allKeys
      .filter((k) => !k.endsWith(`/${KEEP}`) && k !== KEEP)
      .filter((k) => k.toLowerCase().includes(t))
      .sort();
  }, [q, allKeys]);

  const totalImages = allKeys.filter(
    (k) => !k.endsWith(`/${KEEP}`) && k !== KEEP
  ).length;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="cursor-pointer bg-accent px-5 py-2 text-sm text-white">
          {busy ? "处理中…" : "+ 上传到当前文件夹"}
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => onUpload(e.target.files)}
          />
        </label>
        <button
          type="button"
          onClick={onNewFolder}
          className="border border-border px-4 py-2 text-sm hover:bg-surface"
        >
          + 新建文件夹
        </button>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="搜索全部文件名…"
          className="border border-border bg-background px-3 py-1.5 text-sm"
        />
        <span className="text-sm text-muted">
          共 {totalImages} 张{msg && ` · ${msg}`}
        </span>
      </div>

      {/* breadcrumb */}
      {!q && (
        <div className="mb-5 flex flex-wrap items-center gap-1 text-sm">
          <button
            type="button"
            onClick={() => setPath("")}
            className={
              path === "" ? "text-foreground" : "text-accent hover:underline"
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
      ) : err ? (
        <p className="text-sm text-red-600">
          加载失败:{err}
          <button type="button" onClick={load} className="ml-3 underline">
            重试
          </button>
        </p>
      ) : q ? (
        searchHits.length === 0 ? (
          <p className="text-muted">没有匹配「{q}」的文件。</p>
        ) : (
          <ImageGrid keys={searchHits} onDelete={delImage} showPath />
        )
      ) : (
        <>
          {node.folders.length > 0 && (
            <div className="mb-6 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {node.folders.map((f) => (
                <div key={f} className="group relative">
                  <button
                    type="button"
                    onClick={() => setPath(`${path}${f}/`)}
                    className="flex aspect-square w-full flex-col items-center justify-center gap-2 border border-border bg-surface text-center hover:border-accent"
                    title={f}
                  >
                    <span className="text-3xl">📁</span>
                    <span className="line-clamp-2 px-2 text-xs">{f}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => delFolder(f)}
                    className="absolute right-1 top-1 hidden h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs text-white group-hover:flex"
                    aria-label="删除文件夹"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {node.images.length > 0 ? (
            <ImageGrid keys={node.images} onDelete={delImage} />
          ) : node.folders.length === 0 ? (
            <p className="text-muted">
              这个文件夹是空的,点「上传到当前文件夹」或「新建文件夹」。
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}

function ImageGrid({
  keys,
  onDelete,
  showPath,
}: {
  keys: string[];
  onDelete: (key: string) => void;
  showPath?: boolean;
}) {
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
      {keys.map((k) => (
        <div
          key={k}
          className="group relative aspect-square overflow-hidden bg-surface"
          title={k}
        >
          <MediaThumb k={k} className="h-full w-full object-cover" />
          {showPath && (
            <span className="absolute inset-x-0 bottom-0 truncate bg-black/50 px-1 py-0.5 text-[10px] text-white">
              {k}
            </span>
          )}
          <button
            type="button"
            onClick={() => onDelete(k)}
            className="absolute right-1 top-1 hidden h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs text-white group-hover:flex"
            aria-label="删除"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
