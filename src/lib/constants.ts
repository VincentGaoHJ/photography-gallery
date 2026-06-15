export const SITE_NAME = "Haojun(Vincent) Gao";
export const SITE_DESCRIPTION =
  "Photography by Haojun (Vincent) Gao — landscapes and journeys from Tibet, Beijing, the Hengduan Mountains, and beyond.";
export const SITE_URL = "https://gaohaojun.com";

// Tagline shown on the About page / hero.
export const SITE_TAGLINE = "A Restless Soul Wanders the World.";

// --- Media hosting -------------------------------------------------------
// Phase 1: media is served from the existing Squarespace CDN (see lib/media.ts).
// Phase 2: set NEXT_PUBLIC_MEDIA_BASE_URL to the S3/CloudFront origin and flip
// the resolver. Bucket settings are kept for the upload script.
export const MEDIA_BASE_URL = process.env.NEXT_PUBLIC_MEDIA_BASE_URL || "";
export const S3_BUCKET_REGION = process.env.NEXT_PUBLIC_S3_REGION || "ap-southeast-1";
export const S3_BUCKET_NAME =
  process.env.NEXT_PUBLIC_S3_BUCKET || "gaohaojun-media";
export const S3_MEDIA_PREFIX = "media/gallery/";

export const GALLERY_ITEMS_PER_PAGE = 48;
export const BLOG_POSTS_PER_PAGE = 6;

// Contact details (from the live site; email typo "gmial" corrected).
export const CONTACT_EMAIL = "vincentgaohj@gmail.com";
export const CONTACT_PHONE = "(+86) 13701062275";

export const INSTAGRAM_URL = "https://www.instagram.com/vincent_gaohj";

export const SOCIAL_LINKS = {
  instagram: INSTAGRAM_URL,
  email: `mailto:${CONTACT_EMAIL}`,
};

// Primary nav mirrors the original site: the logo links home (the portfolio),
// with Blog / About / Contact alongside it.
export const NAV_LINKS = [
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];
