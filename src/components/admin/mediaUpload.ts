import { uploadData, getProperties } from "aws-amplify/storage";
import { mediaUrl } from "@/lib/media";
import { KEEP } from "./mediaTree";

/** Normalize a folder prefix to "" or "a/b/" (no leading slash, trailing slash). */
function normFolder(folder?: string): string {
  const f = (folder || "").replace(/^\/+|\/+$/g, "").trim();
  return f ? `${f}/` : "";
}

/**
 * Single shared media library: every upload goes to one pool (media/) and is
 * deduped by path, so an image is stored once and referenced (by key) from any
 * gallery or blog post — never duplicated per section. `folder` picks the
 * sub-folder it lands in ("" = library root); the returned key is the
 * media-relative path used everywhere else.
 */
export async function uploadToLibrary(
  file: File,
  folder?: string
): Promise<{ key: string; url: string }> {
  const name = file.name.replace(/\s+/g, "-");
  const key = `${normFolder(folder)}${name}`;
  const path = `media/${key}`;

  let exists = false;
  try {
    await getProperties({ path });
    exists = true; // same path already in the library -> reuse, don't duplicate
  } catch {
    exists = false;
  }
  if (!exists) {
    await uploadData({
      path,
      data: file,
      options: { contentType: file.type },
    }).result;
  }

  return { key, url: mediaUrl({ key, src: "" }) };
}

/**
 * Create an (empty) folder by writing a 0-byte `.keep` marker, so it persists
 * and shows up in the library even before any image is uploaded into it.
 */
export async function createFolder(folder: string): Promise<void> {
  const f = normFolder(folder);
  if (!f) return;
  await uploadData({
    path: `media/${f}${KEEP}`,
    data: new Blob([""], { type: "text/plain" }),
    options: { contentType: "text/plain" },
  }).result;
}
