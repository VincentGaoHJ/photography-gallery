import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeSlug]}
      components={{
        // Custom image rendering
        img: ({ src, alt, ...props }) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src || ""}
            alt={alt || ""}
            className="w-full h-auto my-8"
            loading="lazy"
            {...props}
          />
        ),
        // Editorial blockquote
        blockquote: ({ children, ...props }) => (
          <blockquote
            className="border-l-2 border-foreground pl-6 my-8 italic font-serif text-xl text-muted"
            {...props}
          >
            {children}
          </blockquote>
        ),
        // Underline links
        a: ({ children, href, ...props }) => (
          <a
            href={href}
            className="underline underline-offset-4 decoration-1 hover:decoration-2"
            target={href?.startsWith("http") ? "_blank" : undefined}
            rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
            {...props}
          >
            {children}
          </a>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}