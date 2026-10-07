export interface Prompt {
  id: string
  title: string
  content: string
  createdAt: number
  updatedAt: number
  copies: number
}

// What the form sends when saving
export type PromptInput = Pick<Prompt, 'title' | 'content'>

// Popup navigation targets
export type PopupView = 'home' | 'all'