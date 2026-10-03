import type { Prompt, PromptInput } from '../types'

const KEY = 'prompts'

const hasExtStorage =
  typeof chrome !== 'undefined' && !!chrome.storage?.local

async function read(): Promise<Prompt[]> {
  if (hasExtStorage) {
    const result = await chrome.storage.local.get(KEY)
    return (result[KEY] as Prompt[] | undefined) ?? []
  }
  return JSON.parse(localStorage.getItem(KEY) ?? '[]')
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