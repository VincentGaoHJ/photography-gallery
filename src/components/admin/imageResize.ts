"use client";

/**
 * Downscale an image in the browser before upload, so the payload stays well
 * under the serverless request limit (uploads go through a Lambda) and loads
 * fast on the site. Photos become long-edge<=maxDim JPEGs; PNGs stay PNG.
 * Small files that are already web-sized pass through untouched.
 */
export async function resizeImage(
  file: File,
  maxDim = 2800,
  quality = 0.9
): Promise<{ blob: Blob; filename: string }> {
  if (!file.type.startsWith("image/")) return { blob: file, filename: file.name };

  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return { blob: file, filename: file.name };

  const { width, height } = bitmap;
  const scale = Math.min(1, maxDim / Math.max(width, height));
  // already web-sized and reasonably small -> keep the original bytes
  if (scale === 1 && file.size <= 3_500_000) {
    bitmap.close?.();
    return { blob: file, filename: file.name };
  }

  const w = Math.round(width * scale);
  const h = Math.round(height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close?.();
    return { blob: file, filename: file.name };
  }
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();

  const isPng = file.type === "image/png";
  const outType = isPng ? "image/png" : "image/jpeg";
  const blob: Blob = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b || file), outType, isPng ? undefined : quality)
  );

  const stem = file.name.replace(/\.[^.]+$/, "");
  const ext = isPng ? "png" : "jpg";
  return { blob, filename: `${stem}.${ext}` };
}
