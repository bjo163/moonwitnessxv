/**
 * AI Gateway, Cascading Router & Embeddings Typings
 */
export interface AiChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface AiChatCompletionRequest {
  model?: string
  messages: AiChatMessage[]
  temperature?: number
  max_tokens?: number
  stream?: boolean
}

export interface AiChatChoice {
  index: number
  message: AiChatMessage
  finish_reason: string
}

export interface AiUsage {
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
}

export interface AiChatCompletionResponse {
  id: string
  object: 'chat.completion'
  created: number
  model: string
  choices: AiChatChoice[]
  usage: AiUsage
}

export interface AiModelDescriptor {
  id: string
  provider: string
  pricing: 'free' | 'local' | 'freemium' | 'paid'
  description?: string
}

export interface EmbeddingItem {
  object: 'embedding'
  index: number
  embedding: number[]
}

export interface EmbeddingResponse {
  object: 'list'
  data: EmbeddingItem[]
  model: string
  usage: {
    prompt_tokens: number
    total_tokens: number
  }
}
