"use client";

import { useEffect, useState } from "react";
import seed from "../../../content/blog-seed.json";
import { RichTextEditor } from "./RichTextEditor";
import { MediaPicker } from "./MediaPicker";
import { cdnJson, cdnText, apiSave, apiDelete } from "./adminApi";

type Post = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  coverImage?: string | null;
  author?: string;
  tags?: string[];
  draft?: boolean;
  content?: string;
};

const INDEX_PATH = "blog/index.json";
const bodyPath = (slug: string) => `blog/posts/${slug}.html`;
const SEED = (seed as { posts: Post[] }).posts;

function slugify(s: string): string {
  const ascii = s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return ascii || `post-${Date.now()}`;
}

async function writeJson(path: string, data: unknown) {
  await apiSave(path, JSON.stringify(data, null, 2), "application/json");
}

export function BlogManager() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Post | null>(null);
  const [content, setContent] = useState("");
  const [coverPicker, setCoverPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      // read the blog index via the CDN; fall back to the git seed list
      const data = await cdnJson<Post[] | { posts: Post[] }>(INDEX_PATH);
      const list = Array.isArray(data) ? data : data?.posts;
      setPosts(list ?? SEED.map(({ content: _c, ...meta }) => meta));
      setLoading(false);
    })();
  }, []);

  async function openEdit(p: Post) {
    const body =
      (await cdnText(bodyPath(p.slug))) ??
      SEED.find((x) => x.slug === p.slug)?.content ??
      "";
    setContent(body);
    setEditing(p);
  }

  function newPost() {
    setContent("");
    setEditing({
      slug: "",
      title: "",
      date: new Date().toISOString().slice(0, 10),
      excerpt: "",
      coverImage: null,
      author: "Vincent Gao",
      tags: [],
      draft: true,
    });
  }

  async function save() {
    if (!editing) return;
    const slug = editing.slug || slugify(editing.title);
    setSaving(true);
    setMsg("");
    try {
      await apiSave(bodyPath(slug), content, "text/html");
      const meta: Post = {
        slug,
        title: editing.title || "Untitled",
        date: editing.date,
        excerpt: editing.excerpt,
        coverImage: editing.coverImage ?? null,
        author: editing.author || "Vincent Gao",
        tags: editing.tags || [],
        draft: !!editing.draft,
      };
      const next = [...posts.filter((p) => p.slug !== slug), meta].sort((a, b) =>
        b.date.localeCompare(a.date)
      );
      await writeJson(INDEX_PATH, { posts: next });
      setPosts(next);
      setEditing(null);
      setMsg("已保存 ✓ 线上约 1 分钟更新");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "保存失败,请重试");
    } finally {
      setSaving(false);
    }
  }

  async function remove(slug: string) {
    if (!window.confirm("删除这篇文章?")) return;
    const next = posts.filter((p) => p.slug !== slug);
    try {
      await writeJson(INDEX_PATH, { posts: next });
      await apiDelete(bodyPath(slug)).catch(() => {});
      setPosts(next);
      setMsg("已删除");
    } catch {
      setMsg("删除失败");
    }
  }

  if (loading) return <p className="text-muted">加载文章…</p>;

  if (editing) {
    const e = editing;
    const set = (patch: Partial<Post>) => setEditing({ ...e, ...patch });
    return (
      <div>
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <button
            onClick={save}
            disabled={saving}
            className="bg-accent px-5 py-2 text-sm text-white disabled:opacity-50"
          >
            {saving ? "保存中…" : "保存文章"}
          </button>
          <button
            onClick={() => setEditing(null)}
            className="text-sm text-muted hover:text-accent"
          >
            ← 返回列表
          </button>
          {msg && <span className="text-sm text-muted">{msg}</span>}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="label text-muted">标题</span>
            <input
              value={e.title}
              onChange={(ev) => set({ title: ev.target.value })}
              className="mt-1 w-full border border-border bg-background px-3 py-2"
            />
          </label>
          <label className="block">
            <span className="label text-muted">Slug(网址)</span>
            <input
              value={e.slug}
              onChange={(ev) => set({ slug: ev.target.value })}
              placeholder={slugify(e.title)}
              className="mt-1 w-full border border-border bg-background px-3 py-2"
            />
          </label>
          <label className="block">
            <span className="label text-muted">日期</span>
            <input
              type="date"
              value={e.date}
              onChange={(ev) => set({ date: ev.target.value })}
              className="mt-1 w-full border border-border bg-background px-3 py-2"
            />
          </label>
          <label className="flex items-center gap-2 pt-6 text-sm">
            <input
              type="checkbox"
              checked={!!e.draft}
              onChange={(ev) => set({ draft: ev.target.checked })}
            />
            草稿(不公开)
          </label>
          <label className="block sm:col-span-2">
            <span className="label text-muted">介绍 / 摘要</span>
            <textarea
              value={e.excerpt}
              onChange={(ev) => set({ excerpt: ev.target.value })}
              rows={3}
              placeholder="单独写一段介绍 —— 与正文分开"
              className="mt-1 w-full border border-border bg-background px-3 py-2"
            />
            <span className="mt-1 block text-xs text-muted">
              这段「介绍」只显示在 /blog 列表卡片上,独立于正文(正文在下方富文本里写)。
            </span>
          </label>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={() => setCoverPicker(true)}
            className="border border-border px-3 py-1.5 text-sm hover:bg-surface"
          >
            {e.coverImage ? "换封面" : "选封面"}
          </button>
          {e.coverImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={e.coverImage} alt="" className="h-12 w-20 object-cover" />
          )}
        </div>

        <div className="mt-6">
          <span className="label text-muted">正文</span>
          <div className="mt-2">
            <RichTextEditor value={content} onChange={setContent} />
          </div>
        </div>

        <MediaPicker
          open={coverPicker}
          onClose={() => setCoverPicker(false)}
          initialFolder="blog"
          onSelect={(url) => set({ coverImage: url })}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={newPost}
          className="bg-accent px-5 py-2 text-sm text-white"
        >
          + 新建文章
        </button>
        {msg && <span className="text-sm text-muted">{msg}</span>}
      </div>

      <div className="border-y border-border">
        {posts.length === 0 && (
          <p className="py-6 text-muted">还没有文章,点「新建文章」。</p>
        )}
        {posts.map((p) => (
          <div
            key={p.slug}
            className="flex items-center gap-4 border-b border-border py-3 last:border-b-0"
          >
            <div className="flex-1">
              <div className="font-heading text-lg">
                {p.title || "Untitled"}
                {p.draft && (
                  <span className="ml-2 text-xs text-muted">(草稿)</span>
                )}
              </div>
              <div className="text-sm text-muted">
                {p.date} · /{p.slug}
              </div>
            </div>
            <button
              onClick={() => openEdit(p)}
              className="text-sm text-accent hover:underline"
            >
              编辑
            </button>
            <button
              onClick={() => remove(p.slug)}
              className="text-sm text-muted hover:text-accent"
            >
              删除
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
