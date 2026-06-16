"use client";

import { list } from "aws-amplify/storage";

const IMG_RE = /\.(jpe?g|png|webp|gif|avif)$/i;
export const KEEP = ".keep"; // 0-byte marker so empty folders persist in S3

/**
 * A media key is "visible" in the library if it's an image, or a `.keep` folder
 * marker (kept only so empty folders show up). Everything else under media/ —
 * galleries.json, blog/index.json, blog/posts/*.html — is data, not an asset,
 * and is therefore excluded automatically (it isn't an image).
 */
function isVisible(key: string): boolean {
  if (!key || key.endsWith("/")) return false;
  const base = key.split("/").pop() || "";
  return base === KEEP || IMG_RE.test(base);
}

/** Reject if a promise doesn't settle in time, so a hung S3 call surfaces as an
 *  error/fallback instead of an infinite spinner. */
export function withTimeout<T>(p: Promise<T>, ms: number, label = "操作"): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${label}超时(${Math.round(ms / 1000)}s)`)), ms)
    ),
  ]);
}

/** All visible media keys, media-relative (the leading "media/" is stripped). */
export async function listAllMediaKeys(): Promise<string[]> {
  const res = await withTimeout(
    list({ path: "media/", options: { listAll: true } }),
    20000,
    "列素材库"
  );
  const keys = res.items
    .map((i) => i.path.replace(/^media\//, ""))
    .filter(isVisible);
  return Array.from(new Set(keys));
}

export type MediaNode = { folders: string[]; images: string[] };

/**
 * The folder view at `prefix` ("" = library root, "tibet/" = inside Tibet):
 * immediate subfolders and the image keys that live directly in this folder.
 * Folders are derived from the keys, so one appears as soon as it holds an
 * image or a `.keep` marker.
 */
export function nodeAt(allKeys: string[], prefix: string): MediaNode {
  const folders = new Set<string>();
  const images: string[] = [];
  for (const k of allKeys) {
    if (!k.startsWith(prefix)) continue;
    const rest = k.slice(prefix.length);
    const slash = rest.indexOf("/");
    if (slash >= 0) {
      folders.add(rest.slice(0, slash));
    } else if (rest !== KEEP && IMG_RE.test(rest)) {
      images.push(k);
    }
  }
  return {
    folders: Array.from(folders).sort((a, b) => a.localeCompare(b)),
    images: images.sort((a, b) => a.localeCompare(b)),
  };
}

/** Breadcrumb segments for a prefix, each with its own navigable prefix. */
export function crumbs(prefix: string): { name: string; prefix: string }[] {
  const out: { name: string; prefix: string }[] = [];
  let acc = "";
  for (const seg of prefix.split("/").filter(Boolean)) {
    acc += `${seg}/`;
    out.push({ name: seg, prefix: acc });
  }
  return out;
}
