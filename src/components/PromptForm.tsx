import { useState, type FormEvent } from 'react'
import type { Prompt, PromptInput } from '../types'

interface Props {
  initial: Prompt | null
  onSave: (data: PromptInput) => void
  onCancel: () => void
}

export default function PromptForm({ initial, onSave, onCancel }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [content, setContent] = useState(initial?.content ?? '')

  const canSave = title.trim() !== '' && content.trim() !== ''

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!canSave) return
    onSave({ title, content })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className="w-full border rounded px-2 py-1 text-sm outline-none"
        autoFocus
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your prompt here..."
        rows={8}
        className="w-full border rounded px-2 py-1 text-sm outline-none"
      />
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1 text-sm rounded border cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!canSave}
          className="px-3 py-1 text-sm rounded bg-indigo-600 text-white disabled:opacity-40 cursor-pointer"
        >
          Save
        </button>
      </div>
    </form>
  )
}