import { useEffect, useRef, useState, type FormEvent } from 'react'
import {
  saveDraft,
  clearDraft,
  type Draft,
} from '../lib/storage'
import type { Prompt, PromptInput } from '../types'

interface Props {
  initial: Prompt | null
  /** Set when we restored an unsaved draft from a previous session. */
  restoredDraft?: Draft | null
  onSave: (data: PromptInput) => void
  onCancel: () => void
  /** Clears the stored draft (Discard). */
  onDiscardDraft?: () => void
}

export default function PromptForm({
  initial,
  restoredDraft = null,
  onSave,
  onCancel,
  onDiscardDraft,
}: Props) {
  const [title, setTitle] = useState(
    initial?.title ?? restoredDraft?.title ?? '',
  )
  const [content, setContent] = useState(
    initial?.content ?? restoredDraft?.content ?? '',
  )

  // Editing an existing prompt never touches the new-prompt draft.
  const isDraftSession = !initial

  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (!isDraftSession) return
    if (debounce.current) clearTimeout(debounce.current)
    if (title.trim() === '' && content.trim() === '') return // don't save empty
    debounce.current = setTimeout(() => {
      void saveDraft({ title, content, savedAt: Date.now() })
    }, 400)
    return () => {
      if (debounce.current) clearTimeout(debounce.current)
    }
  }, [title, content, isDraftSession])

  // Flush immediately if the popup is being closed (tab switch / blur).
  useEffect(() => {
    if (!isDraftSession) return
    const flush = () => {
      if (title.trim() !== '' || content.trim() !== '') {
        void saveDraft({ title, content, savedAt: Date.now() })
      }
    }
    window.addEventListener('blur', flush)
    document.addEventListener('visibilitychange', flush)
    return () => {
      window.removeEventListener('blur', flush)
      document.removeEventListener('visibilitychange', flush)
    }
  }, [title, content, isDraftSession])

  const canSave = title.trim() !== '' && content.trim() !== ''

  const handleDiscard = () => {
    if (isDraftSession) onDiscardDraft?.()
    onCancel()
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!canSave) return
    onSave({ title, content })
  }

  return (
    <form
      onSubmit={handleSubmit}
      onBlur={(e) => {
        const to = (e.relatedTarget as HTMLElement | null)?.tagName
        if (isDraftSession && to !== 'BUTTON') {
          void saveDraft({ title, content, savedAt: Date.now() })
        }
      }}
      className="space-y-3"
    >
      {isDraftSession && restoredDraft && (
        <div className="rounded border border-amber-300 bg-amber-50 p-2 text-xs text-amber-900">
          Switching tabs doesn't save the creation session — your draft was
          restored from {new Date(restoredDraft.savedAt).toLocaleTimeString()}.
          Save it or discard below.
        </div>
      )}
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
          onClick={handleDiscard}
          className="px-3 py-1 text-sm rounded border cursor-pointer"
        >
          {isDraftSession ? 'Discard' : 'Cancel'}
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