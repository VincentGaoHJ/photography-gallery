import { uploadData, getProperties } from "aws-amplify/storage/server";
import { asAdmin } from "@/lib/amplifyServer";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Upload one image into the library. The browser sends the (already web-resized)
// file; the S3 PutObject happens here, server-side, inside AWS. Deduped by path.
export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file") as File | null;
  const key = ((form.get("path") as string) || "").replace(/^\/+/, "");
  if (!file || !key) {
    return Response.json({ error: "missing file or path" }, { status: 400 });
  }
  const path = `media/${key}`;
  return asAdmin(async (ctx) => {
    try {
      await getProperties(ctx, { path });
      return Response.json({ key, deduped: true }); // already there -> reuse
    } catch {
      /* not present -> upload */
    }
    await uploadData(ctx, {
      path,
      data: file,
      options: { contentType: file.type || "application/octet-stream" },
    }).result;
    return Response.json({ key });
  });
}
