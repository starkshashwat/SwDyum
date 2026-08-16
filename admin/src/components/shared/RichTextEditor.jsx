// ============================================================================
// components/shared/RichTextEditor.jsx
// ----------------------------------------------------------------------------
// Rich text editor for the Product `description` field (a plain-text/HTML
// column per backend/src/validators/product.schema.js — `description` is an
// optional long text field). Built with TipTap (`@tiptap/react` +
// `@tiptap/starter-kit`), which must be added to admin/package.json (already
// done — see the "new dependencies" note in the final completion summary)
// and installed via `npm install` before this component will resolve.
//
// The editor stores/emits an HTML string via `onChange(html)`, matching the
// plain string shape the backend expects for `description`.
//
// Props:
//   value      {string}    Current HTML content.
//   onChange   {function}  Called with the updated HTML string on every edit.
//   label      {string}    Optional label rendered above the editor.
//   placeholder {string}   Optional placeholder text shown when empty.
// ============================================================================

import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, List, ListOrdered, Heading2, Undo2, Redo2 } from 'lucide-react';

function ToolbarButton({ onClick, active, children, title }) {
    return (
        <button
            type="button"
            onMouseDown={(e) => e.preventDefault()} // keep editor focus while clicking toolbar
            onClick={onClick}
            title={title}
            className={`p-1.5 rounded hover:bg-gray-100 ${active ? 'bg-gray-200 text-black' : 'text-gray-600'}`}
        >
            {children}
        </button>
    );
}

export default function RichTextEditor({ value, onChange, label, placeholder = 'Write a description...' }) {
    const editor = useEditor({
        extensions: [StarterKit],
        content: value || '',
        onUpdate: ({ editor: e }) => {
            onChange?.(e.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none min-h-[140px] px-3 py-2 focus:outline-none',
            },
        },
    });

    // Keep the editor's content in sync if `value` is updated externally
    // (e.g. when the parent form re-fetches/resets data) without fighting
    // the user's own typing (only updates when the incoming value actually
    // differs from the editor's current HTML).
    useEffect(() => {
        if (editor && value !== undefined && value !== editor.getHTML()) {
            editor.commands.setContent(value || '', { emitUpdate: false });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, editor]);

    if (!editor) return null;

    return (
        <div>
            {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
            <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-black focus-within:border-black">
                <div className="flex items-center gap-0.5 border-b border-gray-200 bg-gray-50 px-2 py-1">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        active={editor.isActive('bold')}
                        title="Bold"
                    >
                        <Bold className="w-3.5 h-3.5" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        active={editor.isActive('italic')}
                        title="Italic"
                    >
                        <Italic className="w-3.5 h-3.5" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        active={editor.isActive('heading', { level: 2 })}
                        title="Heading"
                    >
                        <Heading2 className="w-3.5 h-3.5" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        active={editor.isActive('bulletList')}
                        title="Bullet list"
                    >
                        <List className="w-3.5 h-3.5" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        active={editor.isActive('orderedList')}
                        title="Numbered list"
                    >
                        <ListOrdered className="w-3.5 h-3.5" />
                    </ToolbarButton>
                    <div className="w-px h-4 bg-gray-300 mx-1" />
                    <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo">
                        <Undo2 className="w-3.5 h-3.5" />
                    </ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo">
                        <Redo2 className="w-3.5 h-3.5" />
                    </ToolbarButton>
                </div>
                <EditorContent editor={editor} placeholder={placeholder} />
            </div>
        </div>
    );
}
