import type {
  AiProvider,
  ChatCompletionRequest,
  ChatCompletionResponse,
  ModelDescriptor,
  ProviderStatus,
} from './types.js'
import { GeminiProvider } from './providers/gemini.js'
import { GroqProvider } from './providers/groq.js'
import { OpenRouterProvider } from './providers/openrouter.js'
import { OllamaProvider } from './providers/ollama.js'
import { HeuristicProvider } from './providers/heuristic.js'

export class AiRouter {
  private readonly providers: AiProvider[]

  constructor(customProviders?: AiProvider[]) {
    this.providers = customProviders ?? [
      new GeminiProvider(),
      new GroqProvider(),
      new OpenRouterProvider(),
      new OllamaProvider(),
      new HeuristicProvider(),
    ]
  }

  getProviderStatuses(): ProviderStatus[] {
    return this.providers.map((p) => ({
      name: p.name,
      available: p.isAvailable(),
      models: [...p.supportedModels],
      reason: p.isAvailable() ? 'Active / Configured' : 'Missing API Key or Offline',
    }))
  }

  listModels(): ModelDescriptor[] {
    const list: ModelDescriptor[] = [
      {
        id: 'free',
        provider: 'router',
        pricing: 'free',
        description: 'Automatic cascading free-first router (Gemini -> Groq -> OpenRouter -> Ollama -> Heuristic)',
      },
      {
        id: 'auto',
        provider: 'router',
        pricing: 'free',
        description: 'Alias for free-first cascading router',
      },
    ]

    for (const p of this.providers) {
      for (const m of p.supportedModels) {
        list.push({
          id: m,
          provider: p.name,
          pricing: p.name === 'ollama' ? 'local' : p.name === 'heuristic' ? 'free' : 'freemium',
          description: `Direct provider model on ${p.name}`,
        })
      }
    }

    return list
  }

  async route(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const requestedModel = request.model?.trim()
    const attempts: string[] = []

    // 1. If explicit specific model was requested (not 'free'/'auto'/'default'), find matching provider first
    if (requestedModel && !['free', 'auto', 'default', ''].includes(requestedModel)) {
      const directProvider = this.providers.find((p) => p.supportedModels.includes(requestedModel))
      if (directProvider && directProvider.isAvailable()) {
        try {
          const resp = await directProvider.chat(request)
          resp.router_telemetry.attempts = [`direct:${directProvider.name}(${requestedModel})`]
          return resp
        } catch (err) {
          const reason = err instanceof Error ? err.message : String(err)
          attempts.push(`${directProvider.name}(${requestedModel}):failed(${reason.slice(0, 60)})`)
        }
      }
    }

    // 2. Cascade through priority providers (Free First)
    for (const provider of this.providers) {
      if (!provider.isAvailable()) {
        attempts.push(`${provider.name}:skipped(not_configured)`)
        continue
      }

      try {
        const resp = await provider.chat(request)
        resp.router_telemetry.attempts = [...attempts, `${provider.name}:success`]
        return resp
      } catch (err) {
        const reason = err instanceof Error ? err.message : String(err)
        attempts.push(`${provider.name}:failed(${reason.slice(0, 60)})`)
      }
    }

    // Should never happen because HeuristicProvider is infallible, but if it does:
    const fallback = new HeuristicProvider()
    const fallbackResp = await fallback.chat(request)
    fallbackResp.router_telemetry.attempts = attempts
    return fallbackResp
  }
}
