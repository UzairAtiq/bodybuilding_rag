// message role definition
export type MessageRole = 'user' | 'assistant'

// status sequence during query processing
export type QueryStatus = 'idle' | 'sending' | 'generating' | 'streaming' | 'complete' | 'error'

// individual message interface
export interface ChatMessageItem {
  id: string
  role: MessageRole
  content: string
  timestamp: string
  status?: QueryStatus
}

// chat session item for sidebar
export interface ChatSession {
  id: string
  title: string
  timestamp: string
  preview: string
  messages: ChatMessageItem[]
}

// starter prompt suggestion for carousel
export interface PromptSuggestion {
  id: string
  title: string
  subtitle: string
  query: string
  category: string
}
