export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatCompletionRequest {
  model?: string
  messages: ChatMessage[]
  temperature?: number
  max_tokens?: number
  stream?: boolean
}

export interface ChatCompletionChoice {
  index: number
  message: ChatMessage
  finish_reason: string
}

export interface CompletionUsage {
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
}

export interface RouterTelemetry {
  provider: string
  model_used: string
  latency_ms: number
  attempts?: string[]
}

export interface ChatCompletionResponse {
  id: string
  object: 'chat.completion'
  created: number
  model: string
  choices: ChatCompletionChoice[]
  usage: CompletionUsage
  router_telemetry: RouterTelemetry
}

export interface ModelDescriptor {
  id: string
  provider: string
  pricing: 'free' | 'freemium' | 'local'
  context_window?: number
  description: string
}

export interface ProviderStatus {
  name: string
  available: boolean
  models: string[]
  reason?: string
}

export interface AiProvider {
  readonly name: string
  readonly defaultModel: string
  readonly supportedModels: string[]
  isAvailable(): boolean
  chat(request: ChatCompletionRequest): Promise<ChatCompletionResponse>
}
