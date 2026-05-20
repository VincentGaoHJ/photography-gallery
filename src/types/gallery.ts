export interface GalleryItem {
  key: string;
  url: string;
  thumbnailUrl?: string;
  category: string;
  title?: string;
  caption?: string;
  width?: number;
  height?: number;
  type: "image" | "video";
}

export interface GalleryCategory {
  slug: string;
  label: string;
  count: number;
}