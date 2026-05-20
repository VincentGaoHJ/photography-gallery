export const SITE_NAME = "Photographer Name";
export const SITE_DESCRIPTION =
  "Editorial and portrait photography. Capturing stories through light and shadow.";
export const SITE_URL = "https://your-domain.com";

export const S3_BUCKET_REGION = process.env.NEXT_PUBLIC_S3_REGION || "us-east-1";
export const S3_BUCKET_NAME =
  process.env.NEXT_PUBLIC_S3_BUCKET || "photographer-media-bucket";
export const S3_MEDIA_PREFIX = "media/gallery/";

export const GALLERY_ITEMS_PER_PAGE = 24;
export const BLOG_POSTS_PER_PAGE = 6;

export const SOCIAL_LINKS = {
  instagram: "https://instagram.com/your-handle",
  email: "mailto:hello@your-domain.com",
};

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/gallery", label: "Gallery" },
  { href: "/blog", label: "Journal" },
  { href: "/about", label: "About" },
];