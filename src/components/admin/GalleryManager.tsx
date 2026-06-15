"use client";

import { useEffect, useState } from "react";
import { uploadData, downloadData, getUrl } from "aws-amplify/storage";
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

const MANIFEST_PATH = "media/galleries.json";

function readDims(file: File): Promise<{ w: number; h: number }> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => resolve({ w: 0, h: 0 });
    img.src = URL.createObjectURL(file);
  });
}

function Thumb({ item }: { item: MediaItem }) {
  const [url, setUrl] = useState(
    item.src && item.src.startsWith("http") ? item.src : ""
  );
  useEffect(() => {
    let active = true;
    if (!url) {
      getUrl({ path: `media/${item.key}` })
        .then((r) => active && setUrl(r.url.toString()))
        .catch(() => {});
    }
    return () => {
      active = false;
    };
  }, [item.key, url]);

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
  onDelete,
}: {
  item: MediaItem;
  onDelete: () => void;
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
      className="relative aspect-square overflow-hidden rounded bg-surface"
    >
      <div className="absolute inset-0 cursor-grab" {...attributes} {...listeners}>
        <Thumb item={item} />
      </div>
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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  useEffect(() => {
    (async () => {
      try {
        const { body } = await downloadData({ path: MANIFEST_PATH }).result;
        const data = JSON.parse(await body.text()) as GalleriesManifest;
        setGalleries(data.galleries ?? []);
      } catch {
        // No manifest on S3 yet — seed from the committed file.
        setGalleries((seed as GalleriesManifest).galleries);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const updateTitle = (gi: number, title: string) =>
    setGalleries((gs) => gs.map((g, i) => (i === gi ? { ...g, title } : g)));

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
    const slug = galleries[gi].slug;
    setMsg("上传中…");
    const added: MediaItem[] = [];
    for (const file of Array.from(files)) {
      const key = `${slug}/${file.name}`;
      try {
        await uploadData({
          path: `media/${key}`,
          data: file,
          options: { contentType: file.type },
        }).result;
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
      const json = JSON.stringify({ galleries: normalized }, null, 2);
      await uploadData({
        path: MANIFEST_PATH,
        data: new Blob([json], { type: "application/json" }),
        options: { contentType: "application/json" },
      }).result;
      setMsg("已保存 ✓ 线上约 1 分钟内更新");
    } catch {
      setMsg("保存失败,请重试");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-muted">加载相册…</p>;

  return (
    <div>
      <div className="mb-8 flex items-center gap-4">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="bg-accent px-5 py-2 text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "保存中…" : "保存"}
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
                      onDelete={() => deletePhoto(gi, it.key)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            <label className="mt-4 inline-block cursor-pointer text-sm text-accent hover:underline">
              + 上传照片
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => onUpload(gi, e.target.files)}
              />
            </label>
          </section>
        ))}
      </div>
    </div>
  );
}
