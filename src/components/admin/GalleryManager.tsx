"use client";

import { useEffect, useState } from "react";
import { mediaUrl } from "@/lib/media";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import seed from "../../../content/galleries.json";
import type { Gallery, GalleriesManifest, MediaItem } from "@/types/gallery";
import { MediaPicker } from "./MediaPicker";
import { uploadToLibrary } from "./mediaUpload";
import { cdnJson, apiSave } from "./adminApi";

function slugify(s: string): string {
  const a = s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return a || `gallery-${Date.now()}`;
}

function readDims(src: File | string): Promise<{ w: number; h: number }> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => resolve({ w: 0, h: 0 });
    img.src = typeof src === "string" ? src : URL.createObjectURL(src);
  });
}

function Thumb({ item }: { item: MediaItem }) {
  // CDN URL (reachable in CN); seed items already carry an http src.
  const url =
    item.src && item.src.startsWith("http")
      ? item.src
      : mediaUrl({ key: item.key, src: "" });

  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt={item.alt || ""} className="h-full w-full object-cover" />
  ) : (
    <div className="flex h-full items-center justify-center p-1 text-center text-[10px] text-muted">
      {item.key.split("/").pop()}
    </div>
  );
}

function SortablePhoto({
  item,
  isCover,
  onDelete,
  onSetCover,
}: {
  item: MediaItem;
  isCover: boolean;
  onDelete: () => void;
  onSetCover: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.key });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative aspect-square overflow-hidden rounded bg-surface ${
        isCover ? "ring-2 ring-accent" : ""
      }`}
    >
      <div className="absolute inset-0 cursor-grab" {...attributes} {...listeners}>
        <Thumb item={item} />
      </div>
      <button
        type="button"
        onClick={onSetCover}
        className="absolute left-1 top-1 z-10 rounded bg-black/60 px-1.5 text-[10px] leading-5 text-white"
        title="设为封面"
      >
        {isCover ? "★ 封面" : "☆ 封面"}
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="absolute right-1 top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs leading-none text-white"
        aria-label="Remove photo"
      >
        ×
      </button>
    </div>
  );
}

export function GalleryManager({ onSignOut }: { onSignOut?: () => void }) {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [pickerGi, setPickerGi] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  useEffect(() => {
    (async () => {
      // read the manifest via the CDN (reachable in CN); fall back to the seed
      const data = await cdnJson<GalleriesManifest>("galleries.json");
      setGalleries(data?.galleries ?? (seed as GalleriesManifest).galleries);
      setLoading(false);
    })();
  }, []);

  const updateTitle = (gi: number, title: string) =>
    setGalleries((gs) => gs.map((g, i) => (i === gi ? { ...g, title } : g)));

  const setCover = (gi: number, item: MediaItem) =>
    setGalleries((gs) =>
      gs.map((g, i) =>
        i === gi
          ? {
              ...g,
              cover: {
                key: item.key,
                src: item.src || "",
                width: item.width ?? null,
                height: item.height ?? null,
              },
            }
          : g
      )
    );

  const createGallery = () => {
    const title = window.prompt("相册标题");
    if (title === null) return;
    const fallback = slugify(title);
    const slug = (window.prompt("相册网址 slug", fallback) || fallback).trim();
    if (galleries.some((g) => g.slug === slug)) {
      setMsg(`slug "${slug}" 已存在`);
      return;
    }
    setGalleries((gs) => [
      ...gs,
      { slug, title: title || slug, cover: null, count: 0, items: [] },
    ]);
    setMsg("已新建相册 — 上传照片后记得「保存」");
  };

  const deleteGallery = (gi: number) => {
    if (!window.confirm(`删除相册「${galleries[gi].title}」?(S3 上的图不会被删)`))
      return;
    setGalleries((gs) => gs.filter((_, i) => i !== gi));
    setMsg("已删除相册 — 记得「保存」");
  };

  const onDragEnd = (gi: number, e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setGalleries((gs) =>
      gs.map((g, i) => {
        if (i !== gi) return g;
        const from = g.items.findIndex((it) => it.key === active.id);
        const to = g.items.findIndex((it) => it.key === over.id);
        if (from < 0 || to < 0) return g;
        return { ...g, items: arrayMove(g.items, from, to) };
      })
    );
  };

  const onUpload = async (gi: number, files: FileList | null) => {
    if (!files?.length) return;
    setMsg("上传中…");
    const existing = new Set(galleries[gi].items.map((it) => it.key));
    const added: MediaItem[] = [];
    for (const file of Array.from(files)) {
      try {
        // one shared pool + dedup; auto-organized into a folder named after the gallery
        const { key } = await uploadToLibrary(file, galleries[gi].slug);
        if (existing.has(key) || added.some((a) => a.key === key)) continue;
        const { w, h } = await readDims(file);
        added.push({ key, src: "", width: w || null, height: h || null, alt: "" });
      } catch {
        setMsg(`上传失败:${file.name}`);
      }
    }
    setGalleries((gs) =>
      gs.map((g, i) => (i === gi ? { ...g, items: [...g.items, ...added] } : g))
    );
    setMsg(`已上传 ${added.length} 张 — 记得点「保存」`);
  };

  const addFromLibrary = async (gi: number, url: string, key: string) => {
    if (galleries[gi].items.some((it) => it.key === key)) {
      setMsg("这张已在相册里");
      return;
    }
    const { w, h } = await readDims(url);
    setGalleries((gs) =>
      gs.map((g, i) =>
        i === gi
          ? {
              ...g,
              items: [
                ...g.items,
                { key, src: "", width: w || null, height: h || null, alt: "" },
              ],
            }
          : g
      )
    );
    setMsg("已从素材库添加 — 记得「保存」");
  };

  const deletePhoto = (gi: number, key: string) =>
    setGalleries((gs) =>
      gs.map((g, i) =>
        i === gi ? { ...g, items: g.items.filter((it) => it.key !== key) } : g
      )
    );

  const save = async () => {
    setSaving(true);
    setMsg("");
    try {
      const normalized = galleries.map((g) => ({ ...g, count: g.items.length }));
      await apiSave(
        "galleries.json",
        JSON.stringify({ galleries: normalized }, null, 2),
        "application/json"
      );
      setMsg("已保存 ✓ 线上约 1 分钟内更新");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "保存失败,请重试");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-muted">加载相册…</p>;

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="bg-accent px-5 py-2 text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "保存中…" : "保存"}
        </button>
        <button
          type="button"
          onClick={createGallery}
          className="border border-border px-4 py-2 text-sm hover:bg-surface"
        >
          + 新建相册
        </button>
        {msg && <span className="text-sm text-muted">{msg}</span>}
        {onSignOut && (
          <button
            type="button"
            onClick={onSignOut}
            className="ml-auto text-sm text-muted transition-colors hover:text-accent"
          >
            退出登录
          </button>
        )}
      </div>

      <div className="space-y-12">
        {galleries.map((g, gi) => (
          <section key={g.slug} className="border-t border-border pt-6">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <input
                value={g.title}
                onChange={(e) => updateTitle(gi, e.target.value)}
                className="w-full max-w-xl border border-border bg-background px-3 py-2 font-heading text-xl"
              />
              <span className="whitespace-nowrap text-sm text-muted">
                /{g.slug} · {g.items.length} 张
              </span>
              <button
                type="button"
                onClick={() => deleteGallery(gi)}
                className="ml-auto text-sm text-muted hover:text-accent"
              >
                删除相册
              </button>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={(e) => onDragEnd(gi, e)}
            >
              <SortableContext
                items={g.items.map((it) => it.key)}
                strategy={rectSortingStrategy}
              >
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-6">
                  {g.items.map((it) => (
                    <SortablePhoto
                      key={it.key}
                      item={it}
                      isCover={g.cover?.key === it.key}
                      onDelete={() => deletePhoto(gi, it.key)}
                      onSetCover={() => setCover(gi, it)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            <div className="mt-4 flex gap-5 text-sm">
              <label className="cursor-pointer text-accent hover:underline">
                + 上传照片
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onUpload(gi, e.target.files)}
                />
              </label>
              <button
                type="button"
                onClick={() => setPickerGi(gi)}
                className="text-accent hover:underline"
              >
                + 从素材库选
              </button>
            </div>
          </section>
        ))}
      </div>

      <MediaPicker
        open={pickerGi !== null}
        onClose={() => setPickerGi(null)}
        initialFolder={pickerGi !== null ? galleries[pickerGi].slug : ""}
        onSelect={(url, key) => {
          if (pickerGi !== null) addFromLibrary(pickerGi, url, key);
        }}
      />
    </div>
  );
}
