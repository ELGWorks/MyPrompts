export interface Prompt {
  id: string
  title: string
  content: string
  createdAt: number
  updatedAt: number
}

// What the form sends when saving
export type PromptInput = Pick<Prompt, 'title' | 'content'>