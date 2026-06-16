// Print NEXT_PUBLIC_MEDIA_BASE_URL for the build: the CloudFront media domain
// from the backend outputs, plus the "/media" key prefix. Empty if not present.
// Used by amplify.yml:  export NEXT_PUBLIC_MEDIA_BASE_URL=$(node scripts/media-base.mjs)
import fs from "node:fs";

let url = "";
try {
  const o = JSON.parse(fs.readFileSync("amplify_outputs.json", "utf8"));
  const cdn = (o.custom && o.custom.mediaCdnUrl) || "";
  url = cdn ? `${cdn.replace(/\/+$/, "")}/media` : "";
} catch {
  url = "";
}
process.stdout.write(url);
