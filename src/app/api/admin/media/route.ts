import { list, remove } from "aws-amplify/storage/server";
import { asAdmin } from "@/lib/amplifyServer";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// List every media key (media-relative). Runs server-side inside AWS, so it
// returns quickly even though the browser can't reach S3 directly from China.
export async function GET() {
  return asAdmin(async (ctx) => {
    const res = await list(ctx, {
      path: "media/",
      options: { listAll: true },
    });
    const keys = res.items
      .map((i) => i.path.replace(/^media\//, ""))
      .filter((k) => k && !k.endsWith("/"));
    return Response.json({ keys: Array.from(new Set(keys)) });
  });
}

// Delete one object by media-relative key (?path=tibet/foo.jpg).
export async function DELETE(request: Request) {
  const path = new URL(request.url).searchParams.get("path") || "";
  if (!path) return Response.json({ error: "missing path" }, { status: 400 });
  return asAdmin(async (ctx) => {
    await remove(ctx, { path: `media/${path}` });
    return Response.json({ ok: true });
  });
}
