import { useState } from 'react'
import type { Prompt } from '../types'

interface Props {
  prompts: Prompt[]
  query: string
  onEdit: (prompt: Prompt) => void
  onDelete: (id: string) => void
}

export default function PromptList({ prompts, query, onEdit, onDelete }: Props) {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopy = async (prompt: Prompt) => {
    try {
      await navigator.clipboard.writeText(prompt.content)
      setCopiedId(prompt.id)
      setTimeout(() => setCopiedId(null), 1500)
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }

  if (prompts.length === 0) {
    return (
      <p className="text-sm text-gray-500 text-center py-8">
        {query
          ? `No prompts match "${query}".`
          : 'No prompts yet. Click "New" to add your first one.'}
      </p>
    )
  }

  return (
    <ul className="space-y-2">
      {prompts.map((p) => (
        <li key={p.id} className="border rounded p-2">
          <div className="flex justify-between items-center gap-2">
            <div className="min-w-0">
              <h2 className="text-sm font-semibold truncate">{p.title}</h2>
              <p className="text-xs text-gray-500 line-clamp-2">{p.content}</p>
            </div>
            <div className="flex gap-2 text-xs shrink-0">
              <button
                onClick={() => handleCopy(p)}
                className="text-green-600 font-medium cursor-pointer"
              >
                {copiedId === p.id ? 'Copied!' : 'Copy'}
              </button>
              <button onClick={() => onEdit(p)} className="text-indigo-600 cursor-pointer">
                Edit
              </button>
              <button
                onClick={() => {
                  if (confirm(`Delete "${p.title}"?`)) onDelete(p.id)
                }}
                className="text-red-500 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}