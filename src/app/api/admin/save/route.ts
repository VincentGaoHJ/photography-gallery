import { uploadData } from "aws-amplify/storage/server";
import { asAdmin } from "@/lib/amplifyServer";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Write a small text object (galleries.json, blog index.json, a post's .html, or
// a folder's .keep marker) at a media-relative path. Used for all admin "saves".
export async function POST(request: Request) {
  const { path, content, contentType } = (await request.json()) as {
    path?: string;
    content?: string;
    contentType?: string;
  };
  if (!path) return Response.json({ error: "missing path" }, { status: 400 });
  const full = `media/${path.replace(/^\/+/, "")}`;
  return asAdmin(async (ctx) => {
    await uploadData(ctx, {
      path: full,
      data: content ?? "",
      options: { contentType: contentType || "application/json" },
    }).result;
    return Response.json({ ok: true, path });
  });
}
