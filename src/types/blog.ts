export interface BlogPostMeta {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  coverImage?: string;
  author: string;
  tags: string[];
  readingTime: number;
  draft: boolean;
}

export interface BlogPost extends BlogPostMeta {
  content: string;
}