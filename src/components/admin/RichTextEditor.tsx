'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import { useEffect, useMemo } from 'react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'

export interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: string
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
  minHeight = '200px',
}: RichTextEditorProps) {
  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({ openOnClick: false }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: placeholder ?? 'Write here...' }),
    ],
    [placeholder],
  )

  const editor = useEditor({
    extensions,
    content: value || '',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'ProseMirror',
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML())
    },
  })

  useEffect(() => {
    if (!editor) return
    const cur = editor.getHTML()
    const next = value || ''
    if (cur !== next) {
      editor.commands.setContent(next, { emitUpdate: false })
    }
  }, [editor, value])

  return (
    <div
      className="rich-text-editor"
      style={{
        border: '1px solid rgba(42,37,32,0.15)',
        borderRadius: '2px',
        overflow: 'hidden',
      }}
    >
      <div
        className="rte-toolbar"
        style={{
          display: 'flex',
          gap: '4px',
          padding: '8px',
          borderBottom: '1px solid rgba(42,37,32,0.1)',
          background: 'var(--surface)',
          flexWrap: 'wrap',
        }}
      >
        {editor
          ? [
              { label: 'B', action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold') },
              {
                label: 'I',
                action: () => editor.chain().focus().toggleItalic().run(),
                active: editor.isActive('italic'),
              },
              {
                label: 'U',
                action: () => editor.chain().focus().toggleUnderline().run(),
                active: editor.isActive('underline'),
              },
              {
                label: 'H2',
                action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
                active: editor.isActive('heading', { level: 2 }),
              },
              {
                label: 'H3',
                action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
                active: editor.isActive('heading', { level: 3 }),
              },
              {
                label: '❝',
                action: () => editor.chain().focus().toggleBlockquote().run(),
                active: editor.isActive('blockquote'),
              },
              {
                label: '≡',
                action: () => editor.chain().focus().toggleBulletList().run(),
                active: editor.isActive('bulletList'),
              },
            ].map(({ label, action, active }) => (
              <button
                key={label}
                type="button"
                onClick={action}
                style={{
                  padding: '4px 8px',
                  fontSize: '12px',
                  fontFamily: 'var(--font-jost)',
                  background: active ? 'var(--accent)' : 'transparent',
                  color: active ? 'white' : 'var(--body)',
                  border: '1px solid rgba(42,37,32,0.15)',
                  cursor: 'pointer',
                  minWidth: '32px',
                  transition: 'all 0.2s',
                }}
              >
                {label}
              </button>
            ))
          : null}
      </div>

      <EditorContent
        editor={editor}
        style={{
          padding: '16px',
          minHeight,
          background: 'var(--bg)',
        }}
      />
    </div>
  )
}
