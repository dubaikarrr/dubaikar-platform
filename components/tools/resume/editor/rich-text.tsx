"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Link as LinkIcon,
  Undo,
  Redo,
  Sparkles,
} from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface RichTextProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  /** Optional AI action shown as a "✨ Improve" button in the toolbar. */
  onGenerate?: () => void;
  generating?: boolean;
}

export function RichText({
  value,
  onChange,
  placeholder,
  onGenerate,
  generating,
}: RichTextProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: false }),
      TextAlign.configure({ types: ["paragraph"] }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "prose-resume min-h-28 max-h-72 overflow-y-auto rounded-b-[var(--radius-control)] border border-t-0 border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // Keep editor content in sync when the value changes externally (e.g. AI fill).
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  if (!editor) return null;

  const Btn = ({
    onClick,
    active,
    title,
    children,
  }: {
    onClick: () => void;
    active?: boolean;
    title: string;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded text-text-muted hover:bg-surface-2 hover:text-text",
        active && "bg-brand-soft text-brand",
      )}
    >
      {children}
    </button>
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-0.5 rounded-t-[var(--radius-control)] border border-border bg-surface-2 px-1.5 py-1">
        <Btn title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="h-4 w-4" />
        </Btn>
        <Btn title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="h-4 w-4" />
        </Btn>
        <Btn title="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon className="h-4 w-4" />
        </Btn>
        <span className="mx-1 h-4 w-px bg-border" />
        <Btn title="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="h-4 w-4" />
        </Btn>
        <Btn title="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="h-4 w-4" />
        </Btn>
        <Btn
          title="Link"
          active={editor.isActive("link")}
          onClick={() => {
            const url = window.prompt("Link URL");
            if (url) editor.chain().focus().setLink({ href: url }).run();
            else editor.chain().focus().unsetLink().run();
          }}
        >
          <LinkIcon className="h-4 w-4" />
        </Btn>
        <span className="mx-1 h-4 w-px bg-border" />
        <Btn title="Undo" onClick={() => editor.chain().focus().undo().run()}>
          <Undo className="h-4 w-4" />
        </Btn>
        <Btn title="Redo" onClick={() => editor.chain().focus().redo().run()}>
          <Redo className="h-4 w-4" />
        </Btn>
        {onGenerate ? (
          <button
            type="button"
            onClick={onGenerate}
            disabled={generating}
            className="ml-auto flex items-center gap-1 rounded bg-brand-soft px-2 py-1 text-xs font-medium text-brand hover:bg-brand/15 disabled:opacity-50"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {generating ? "Writing…" : "Improve with AI"}
          </button>
        ) : null}
      </div>
      <EditorContent editor={editor} />
      {placeholder && editor.isEmpty ? (
        <p className="pointer-events-none -mt-[4.5rem] px-3 text-sm text-text-subtle">
          {placeholder}
        </p>
      ) : null}
    </div>
  );
}
