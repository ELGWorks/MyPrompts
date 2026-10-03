export interface AiSite {
  name: string
  hosts: string[]
}

export const AI_SITES: AiSite[] = [
  { name: 'ChatGPT', hosts: ['chatgpt.com', 'chat.openai.com'] },
  { name: 'Gemini', hosts: ['gemini.google.com'] },
  { name: 'Claude', hosts: ['claude.ai'] },
  { name: 'DeepSeek', hosts: ['chat.deepseek.com'] },
  { name: 'Perplexity', hosts: ['www.perplexity.ai', 'perplexity.ai'] },
  { name: 'Copilot', hosts: ['copilot.microsoft.com'] },
]

export function detectSite(hostname: string): AiSite | undefined {
  return AI_SITES.find((site) => site.hosts.includes(hostname))
}

export const AI_ORIGINS = AI_SITES.flatMap((site) =>
  site.hosts.map((host) => `https://${host}/*`)
)