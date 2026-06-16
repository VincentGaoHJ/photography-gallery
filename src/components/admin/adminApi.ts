"use client";

import { MEDIA_BASE_URL } from "@/lib/constants";

const base = MEDIA_BASE_URL.replace(/\/$/, "");

/**
 * Admin data layer. The browser (in China) can't reach S3 directly, so:
 *  - READS go through the CloudFront CDN (fast, reachable) — cdnJson/cdnText.
 *  - LIST + WRITES go through same-origin Next API routes, which do the S3 work
 *    server-side inside AWS — apiListMedia/apiUpload/apiSave/apiDelete.
 */

// ---- CDN reads (CloudFront) ----
export async function cdnJson<T>(relPath: string): Promise<T | null> {
  if (!base) return null;
  try {
    const res = await fetch(`${base}/${relPath}?t=${Date.now()}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function cdnText(relPath: string): Promise<string | null> {
  if (!base) return null;
  try {
    const res = await fetch(`${base}/${relPath}?t=${Date.now()}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

// ---- API routes (server-side S3) ----
export async function apiListMedia(): Promise<string[]> {
  const res = await fetch("/api/admin/media", { cache: "no-store" });
  if (res.status === 401) throw new Error("未登录,请重新登录");
  if (!res.ok) throw new Error(`列素材库失败 (${res.status})`);
  const d = await res.json();
  return (d.keys as string[]) || [];
}

export async function apiUpload(
  data: Blob,
  key: string,
  filename: string
): Promise<string> {
  const fd = new FormData();
  fd.append("file", data, filename);
  fd.append("path", key);
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
  if (!res.ok) throw new Error(`上传失败 (${res.status})`);
  const d = await res.json();
  return d.key as string;
}

export async function apiSave(
  path: string,
  content: string,
  contentType: string
): Promise<void> {
  const res = await fetch("/api/admin/save", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ path, content, contentType }),
  });
  if (!res.ok) throw new Error(`保存失败 (${res.status})`);
}

export async function apiDelete(key: string): Promise<void> {
  const res = await fetch(`/api/admin/media?path=${encodeURIComponent(key)}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`删除失败 (${res.status})`);
}
