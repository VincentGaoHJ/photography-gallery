"use client";

import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExt from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { MediaPicker } from "./MediaPicker";

/**
 * TipTap rich-text editor. Outputs the same semantic HTML the public blog
 * renders (h2/h3, blockquote, strong/em, text-align, img), and applies the
 * `.article-body` styles so editing is WYSIWYG. Images come from the shared
 * media library (upload or pick).
 */
export function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      ImageExt,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: { class: "article-body min-h-[320px] focus:outline-none" },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  if (!editor) return null;

  const cls = (active: boolean) =>
    `min-w-8 border border-border px-2 py-1 text-sm ${
      active ? "bg-accent text-white" : "bg-background hover:bg-surface"
    }`;

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-1">
        <button type="button" className={cls(editor.isActive("bold"))} onClick={() => editor.chain().focus().toggleBold().run()}>
          <strong>B</strong>
        </button>
        <button type="button" className={cls(editor.isActive("italic"))} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <em>I</em>
        </button>
        <button type="button" className={cls(editor.isActive("heading", { level: 2 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          H2
        </button>
        <button type="button" className={cls(editor.isActive("heading", { level: 3 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          H3
        </button>
        <button type="button" className={cls(editor.isActive("blockquote"))} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          引用
        </button>
        <button type="button" className={cls(editor.isActive("bulletList"))} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          • 列表
        </button>
        <span className="mx-1 h-5 w-px bg-border" />
        <button type="button" className={cls(editor.isActive({ textAlign: "left" }))} onClick={() => editor.chain().focus().setTextAlign("left").run()}>
          左
        </button>
        <button type="button" className={cls(editor.isActive({ textAlign: "center" }))} onClick={() => editor.chain().focus().setTextAlign("center").run()}>
          中
        </button>
        <button type="button" className={cls(editor.isActive({ textAlign: "right" }))} onClick={() => editor.chain().focus().setTextAlign("right").run()}>
          右
        </button>
        <span className="mx-1 h-5 w-px bg-border" />
        <button
          type="button"
          className={cls(editor.isActive("link"))}
          onClick={() => {
            const url = window.prompt("链接地址(留空取消链接)", "https://");
            if (url === null) return;
            if (url === "") editor.chain().focus().unsetLink().run();
            else editor.chain().focus().toggleLink({ href: url }).run();
          }}
        >
          🔗
        </button>
        <button type="button" className={cls(false)} onClick={() => setPickerOpen(true)}>
          🖼 图片
        </button>
      </div>

      <div className="border border-border p-4">
        <EditorContent editor={editor} />
      </div>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        initialFolder="blog"
        onSelect={(url) => editor.chain().focus().setImage({ src: url }).run()}
      />
    </div>
  );
}
