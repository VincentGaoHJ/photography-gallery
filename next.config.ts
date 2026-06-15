import type { NextConfig } from "next";

// Allowed remote image hosts for next/image.
// Phase 1 serves photos from the original Squarespace CDN. Phase 2 sets
// NEXT_PUBLIC_MEDIA_BASE_URL to the S3/CloudFront origin, which is appended here
// automatically so the same code path works once media moves to AWS.
const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
  { protocol: "https", hostname: "images.squarespace-cdn.com", pathname: "/**" },
  { protocol: "https", hostname: "static1.squarespace.com", pathname: "/**" },
];

if (process.env.NEXT_PUBLIC_MEDIA_BASE_URL) {
  try {
    const u = new URL(process.env.NEXT_PUBLIC_MEDIA_BASE_URL);
    remotePatterns.push({
      protocol: u.protocol.replace(":", "") as "https" | "http",
      hostname: u.hostname,
      pathname: "/**",
    });
  } catch {
    // ignore malformed URL
  }
}

const nextConfig: NextConfig = {
  images: { remotePatterns },
  // `next build`'s integrated TypeScript checker runs in a worker that crashes
  // on some Windows machines (heap / worker instability). Type safety is kept by
  // running `tsc --noEmit` in the build script, so skipping the in-build check
  // here is safe and lets the production build complete.
  // (Next 16 removed `next lint` and the `eslint` config option, so the build
  // no longer runs ESLint anyway.)
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
