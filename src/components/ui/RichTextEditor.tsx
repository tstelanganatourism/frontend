'use client';

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Heading1, 
  Heading2, 
  Quote, 
  Undo, 
  Redo 
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  label?: string;
}

export default function RichTextEditor({ value, onChange, label }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  React.useEffect(() => {
    if (editor && !editor.isFocused && editor.getHTML() !== value) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) return null;

  const buttons = [
    {
      icon: Heading1,
      onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: editor.isActive('heading', { level: 1 }),
      title: 'Heading 1',
    },
    {
      icon: Heading2,
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: editor.isActive('heading', { level: 2 }),
      title: 'Heading 2',
    },
    {
      icon: Bold,
      onClick: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive('bold'),
      title: 'Bold',
    },
    {
      icon: Italic,
      onClick: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive('italic'),
      title: 'Italic',
    },
    {
      icon: List,
      onClick: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive('bulletList'),
      title: 'Bullet List',
    },
    {
      icon: ListOrdered,
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive('orderedList'),
      title: 'Ordered List',
    },
    {
      icon: Quote,
      onClick: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: editor.isActive('blockquote'),
      title: 'Blockquote',
    },
  ];

  return (
    <div className="space-y-2">
      {label && <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm focus-within:border-[#5ac4d7] transition-all">
        
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-50 p-2 border-b border-slate-200">
          {buttons.map((btn, i) => {
            const Icon = btn.icon;
            return (
              <button
                key={i}
                type="button"
                onClick={btn.onClick}
                title={btn.title}
                className={`p-2 rounded-xl transition-all ${
                  btn.isActive 
                    ? 'bg-[#5ac4d7] text-slate-900 shadow-sm shadow-[#5ac4d7]/10' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="h-4 w-4" />
              </button>
            );
          })}
          
          <div className="w-[1px] h-6 bg-slate-200 mx-2" />

          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            title="Undo"
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            <Undo className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            title="Redo"
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            <Redo className="h-4 w-4" />
          </button>
        </div>

        {/* Editor Content Area */}
        <EditorContent 
          editor={editor} 
          className="p-4 min-h-[160px] max-h-[300px] overflow-y-auto outline-none cursor-text" 
        />
        
        {/* Premium Typography & Focus Styles */}
        <style>{`
          .ProseMirror {
            min-height: 160px;
            outline: none;
          }
          .ProseMirror h1 {
            font-size: 1.5rem; /* 24px */
            font-weight: 800;
            line-height: 1.25;
            margin-top: 1.25rem;
            margin-bottom: 0.5rem;
            color: #0f172a;
          }
          .ProseMirror h2 {
            font-size: 1.25rem; /* 20px */
            font-weight: 700;
            line-height: 1.35;
            margin-top: 1rem;
            margin-bottom: 0.5rem;
            color: #1e293b;
          }
          .ProseMirror p {
            margin-bottom: 0.75rem;
            line-height: 1.625;
            color: #334155;
          }
          .ProseMirror ul {
            list-style-type: disc !important;
            padding-left: 1.5rem !important;
            margin-bottom: 0.75rem;
          }
          .ProseMirror ol {
            list-style-type: decimal !important;
            padding-left: 1.5rem !important;
            margin-bottom: 0.75rem;
          }
          .ProseMirror li {
            margin-bottom: 0.25rem;
          }
          .ProseMirror blockquote {
            border-left: 4px solid #5ac4d7;
            padding-left: 1rem;
            font-style: italic;
            color: #475569;
            margin: 1rem 0;
          }
        `}</style>
      </div>
    </div>
  );
}
