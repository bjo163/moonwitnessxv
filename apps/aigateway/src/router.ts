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
    const configuredProviders: AiProvider[] = customProviders ?? [
      new GeminiProvider(),
      new GroqProvider(),
      new OpenRouterProvider(),
      new OllamaProvider(),
      new HeuristicProvider(),
    ]
    // Inference can expose private prompts to a local daemon or a cloud provider.
    // Require an explicit opt-in before any model provider is considered.
    if (process.env.AI_ENABLED === 'true') {
      this.providers = configuredProviders
    } else {
      const heuristicProviders = configuredProviders.filter((provider) => provider.name === 'heuristic')
      this.providers = heuristicProviders.length > 0 ? heuristicProviders : [new HeuristicProvider()]
    }
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
    const providerOrder = this.providers.map((provider) => provider.name).join(' -> ')
    const list: ModelDescriptor[] = [
      {
        id: 'free',
        provider: 'router',
        pricing: 'free',
        description: `Automatic cascading router (${providerOrder})`,
      },
      {
        id: 'auto',
        provider: 'router',
        pricing: 'free',
        description: `Alias for automatic cascading router (${providerOrder})`,
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
        } catch {
          attempts.push(`${directProvider.name}(${requestedModel}):failed`)
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
      } catch {
        // Provider error bodies may echo prompts, credentials, or private source text.
        attempts.push(`${provider.name}:failed`)
      }
    }

    // Should never happen because HeuristicProvider is infallible, but if it does:
    const fallback = new HeuristicProvider()
    const fallbackResp = await fallback.chat(request)
    fallbackResp.router_telemetry.attempts = attempts
    return fallbackResp
  }
}
