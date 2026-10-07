import type { Prompt, PromptInput } from '../types'

const KEY = 'prompts'

const hasExtStorage =
  typeof chrome !== 'undefined' && !!chrome.storage?.local

// Older saves have no `copies` counter; fall back to 0.
const withDefaults = (prompt: Prompt): Prompt => ({ ...prompt, copies: prompt.copies ?? 0 })

async function read(): Promise<Prompt[]> {
  if (hasExtStorage) {
    const result = await chrome.storage.local.get(KEY)
    return ((result[KEY] as Prompt[] | undefined) ?? []).map(withDefaults)
  }
  return (JSON.parse(localStorage.getItem(KEY) ?? '[]') as Prompt[]).map(
    withDefaults,
  )
}

async function write(prompts: Prompt[]): Promise<void> {
  if (hasExtStorage) {
    await chrome.storage.local.set({ [KEY]: prompts })
  } else {
    localStorage.setItem(KEY, JSON.stringify(prompts))
  }
}

export async function getPrompts(): Promise<Prompt[]> {
  return read()
}

export async function addPrompt({ title, content }: PromptInput): Promise<Prompt> {
  const prompts = await read()
  const now = Date.now()
  const prompt: Prompt = {
    id: crypto.randomUUID(),
    title: title.trim(),
    content: content.trim(),
    createdAt: now,
    updatedAt: now,
    copies: 0,
  }
  await write([prompt, ...prompts])
  return prompt
}

export async function updatePrompt(
  id: string,
  changes: Partial<PromptInput>
): Promise<Prompt | undefined> {
  const prompts = await read()
  const updated = prompts.map((p) =>
    p.id === id ? { ...p, ...changes, updatedAt: Date.now() } : p
  )
  await write(updated)
  return updated.find((p) => p.id === id)
}

export async function deletePrompt(id: string): Promise<void> {
  const prompts = await read()
  await write(prompts.filter((p) => p.id !== id))
}

export async function incrementCopies(id: string): Promise<void> {
  const prompts = await read()
  await write(
    prompts.map((p) => (p.id === id ? { ...p, copies: p.copies + 1 } : p))
  )
}

// --- Draft autosave (survives the popup closing on tab switch / blur) ---

const DRAFT_KEY = 'newPromptDraft'

export interface Draft {
  title: string
  content: string
  savedAt: number
}

export async function saveDraft(draft: Draft): Promise<void> {
  if (hasExtStorage) {
    await chrome.storage.local.set({ [DRAFT_KEY]: draft })
  } else {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
  }
}

export async function getDraft(): Promise<Draft | null> {
  if (hasExtStorage) {
    const result = await chrome.storage.local.get(DRAFT_KEY)
    return (result[DRAFT_KEY] as Draft | undefined) ?? null
  }
  const raw = localStorage.getItem(DRAFT_KEY)
  return raw ? (JSON.parse(raw) as Draft) : null
}

export async function clearDraft(): Promise<void> {
  if (hasExtStorage) {
    await chrome.storage.local.remove(DRAFT_KEY)
  } else {
    localStorage.removeItem(DRAFT_KEY)
  }
}