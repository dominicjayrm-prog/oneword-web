'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { useCallback } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  onImageUpload?: (file: File) => Promise<string | null>;
  placeholder?: string;
}

function ToolbarButton({
  active,
  onClick,
  disabled,
  title,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded-md transition-all ${
        active
          ? 'bg-[#FF6B4A] text-white shadow-sm'
          : 'text-[#5A5A6E] hover:bg-[#F5F0E8] hover:text-[#1A1A2E]'
      } ${disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-6 bg-[#E8E3D9] mx-1" />;
}

export default function RichTextEditor({
  content,
  onChange,
  onImageUpload,
  placeholder = 'Start writing your post...',
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full mx-auto',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-lg max-w-none min-h-[500px] px-6 py-4 focus:outline-none text-[#1A1A2E] ' +
          '[&_h1]:text-3xl [&_h1]:font-bold [&_h1]:font-serif [&_h1]:mt-8 [&_h1]:mb-4 ' +
          '[&_h2]:text-2xl [&_h2]:font-bold [&_h2]:font-serif [&_h2]:mt-6 [&_h2]:mb-3 ' +
          '[&_h3]:text-xl [&_h3]:font-bold [&_h3]:font-serif [&_h3]:mt-5 [&_h3]:mb-2 ' +
          '[&_p]:mb-3 [&_p]:leading-relaxed [&_p]:text-[#4A4A5A] ' +
          '[&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-3 ' +
          '[&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-3 ' +
          '[&_li]:mb-1 [&_li]:leading-relaxed ' +
          '[&_blockquote]:border-l-4 [&_blockquote]:border-[#FF6B4A] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-[#8B8697] [&_blockquote]:my-4 ' +
          '[&_code]:bg-[#F5F0E8] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono ' +
          '[&_pre]:bg-[#1A1A2E] [&_pre]:text-green-400 [&_pre]:p-4 [&_pre]:rounded-xl [&_pre]:my-4 [&_pre]:overflow-x-auto ' +
          '[&_hr]:border-[#E8E3D9] [&_hr]:my-6 ' +
          '[&_img]:rounded-xl [&_img]:my-4 ' +
          '[&_.is-editor-empty:first-child::before]:text-[#8B8697] [&_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.is-editor-empty:first-child::before]:float-left [&_.is-editor-empty:first-child::before]:h-0 [&_.is-editor-empty:first-child::before]:pointer-events-none',
      },
    },
  });

  const handleImageUpload = useCallback(async () => {
    if (!onImageUpload || !editor) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/webp';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const url = await onImageUpload(file);
      if (url) {
        editor.chain().focus().setImage({ src: url }).run();
      }
    };
    input.click();
  }, [editor, onImageUpload]);

  if (!editor) return null;

  return (
    <div className="border border-[#E8E3D9] rounded-xl bg-white overflow-hidden shadow-sm">
      {/* Toolbar */}
      <div className="border-b border-[#E8E3D9] bg-[#FAFAF7] px-3 py-2 flex flex-wrap items-center gap-0.5 sticky top-0 z-10">
        {/* Text format */}
        <ToolbarButton
          active={editor.isActive('heading', { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          title="Heading 1"
        >
          <span className="text-xs font-bold w-5 h-5 flex items-center justify-center">H1</span>
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Heading 2"
        >
          <span className="text-xs font-bold w-5 h-5 flex items-center justify-center">H2</span>
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          title="Heading 3"
        >
          <span className="text-xs font-bold w-5 h-5 flex items-center justify-center">H3</span>
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('paragraph')}
          onClick={() => editor.chain().focus().setParagraph().run()}
          title="Paragraph"
        >
          <span className="text-xs font-medium w-5 h-5 flex items-center justify-center">P</span>
        </ToolbarButton>

        <ToolbarDivider />

        {/* Inline format */}
        <ToolbarButton
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold (Ctrl+B)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
          </svg>
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic (Ctrl+I)"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="19" y1="4" x2="10" y2="4" strokeWidth={2} strokeLinecap="round" />
            <line x1="14" y1="20" x2="5" y2="20" strokeWidth={2} strokeLinecap="round" />
            <line x1="15" y1="4" x2="9" y2="20" strokeWidth={2} strokeLinecap="round" />
          </svg>
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Underline (Ctrl+U)"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M6 3v7a6 6 0 006 6 6 6 0 006-6V3" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            <line x1="4" y1="21" x2="20" y2="21" strokeWidth={2} strokeLinecap="round" />
          </svg>
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="Strikethrough"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="4" y1="12" x2="20" y2="12" strokeWidth={2} strokeLinecap="round" />
            <path d="M17.5 7.5c0-2-1.5-3.5-5.5-3.5s-5.5 1.5-5.5 3.5c0 2 1.5 3 5.5 4.5 4 1.5 5.5 2.5 5.5 4.5s-1.5 3.5-5.5 3.5-5.5-1.5-5.5-3.5" strokeWidth={2} strokeLinecap="round" />
          </svg>
        </ToolbarButton>

        <ToolbarDivider />

        {/* Lists */}
        <ToolbarButton
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet List"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            <circle cx="1.5" cy="6" r="1" fill="currentColor" />
            <circle cx="1.5" cy="12" r="1" fill="currentColor" />
            <circle cx="1.5" cy="18" r="1" fill="currentColor" />
          </svg>
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Numbered List"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 6h13M8 12h13M8 18h13" />
            <text x="1" y="8" fill="currentColor" fontSize="8" fontWeight="bold">1</text>
            <text x="1" y="14" fill="currentColor" fontSize="8" fontWeight="bold">2</text>
            <text x="1" y="20" fill="currentColor" fontSize="8" fontWeight="bold">3</text>
          </svg>
        </ToolbarButton>

        <ToolbarDivider />

        {/* Block format */}
        <ToolbarButton
          active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="Quote"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
          </svg>
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('codeBlock')}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          title="Code Block"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Divider"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="3" y1="12" x2="21" y2="12" strokeWidth={2} strokeLinecap="round" />
          </svg>
        </ToolbarButton>

        {onImageUpload && (
          <>
            <ToolbarDivider />
            <ToolbarButton
              onClick={handleImageUpload}
              title="Insert Image"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </ToolbarButton>
          </>
        )}

        <ToolbarDivider />

        {/* Undo/Redo */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo (Ctrl+Z)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a5 5 0 015 5v2M3 10l4-4M3 10l4 4" />
          </svg>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo (Ctrl+Shift+Z)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a5 5 0 00-5 5v2M21 10l-4-4M21 10l-4 4" />
          </svg>
        </ToolbarButton>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
}
