/**
 * Standard MoonQL / REST Response Envelopes
 */
export interface PaginationMeta {
  count?: number
  total?: number
  offset?: number
  limit?: number
}

export interface ApiEnvelope<T = unknown> {
  ok: true
  data: T
  meta?: PaginationMeta
  occurred_at?: string
  written_at?: string
}

export interface ApiErrorDetail {
  code: string | number
  message: string
  param?: string | null
  type?: string
}

export interface ApiErrorEnvelope {
  ok: false
  error: ApiErrorDetail
  timestamp?: string
}

export type ApiResponse<T> = ApiEnvelope<T> | ApiErrorEnvelope
