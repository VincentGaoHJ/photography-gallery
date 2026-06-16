import { mediaUrl } from "@/lib/media";
import { KEEP } from "./mediaTree";
import { apiUpload, apiSave } from "./adminApi";
import { resizeImage } from "./imageResize";

/** Normalize a folder prefix to "" or "a/b/" (no leading slash, trailing slash). */
function normFolder(folder?: string): string {
  const f = (folder || "").replace(/^\/+|\/+$/g, "").trim();
  return f ? `${f}/` : "";
}

/**
 * Single shared media library: every upload goes to one pool (media/) and is
 * deduped server-side, so an image is stored once and referenced (by key) from
 * any gallery or blog post — never duplicated per section. `folder` picks the
 * sub-folder ("" = library root). The file is web-resized in the browser, then
 * sent to the API route which does the S3 write inside AWS.
 */
export async function uploadToLibrary(
  file: File,
  folder?: string
): Promise<{ key: string; url: string }> {
  const { blob, filename } = await resizeImage(file);
  const safe = filename.replace(/\s+/g, "-");
  const key = `${normFolder(folder)}${safe}`;
  await apiUpload(blob, key, safe); // dedup happens server-side
  return { key, url: mediaUrl({ key, src: "" }) };
}

/**
 * Create an (empty) folder by writing a 0-byte `.keep` marker, so it persists
 * and shows up in the library even before any image is uploaded into it.
 */
export async function createFolder(folder: string): Promise<void> {
  const f = normFolder(folder);
  if (!f) return;
  await apiSave(`${f}${KEEP}`, "", "text/plain");
}
