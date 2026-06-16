import { uploadData, getProperties } from "aws-amplify/storage";
import { mediaUrl } from "@/lib/media";

/**
 * Single shared media library: every upload goes to one pool (media/library/)
 * and is deduped by filename, so an image is stored once and referenced (by key)
 * from any gallery or blog post — never duplicated per section.
 */
export async function uploadToLibrary(
  file: File
): Promise<{ key: string; url: string }> {
  const name = file.name.replace(/\s+/g, "-");
  const key = `library/${name}`;
  const path = `media/${key}`;

  let exists = false;
  try {
    await getProperties({ path });
    exists = true; // same filename already in the library -> reuse, don't duplicate
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
