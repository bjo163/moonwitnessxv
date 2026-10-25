/** The public API response contract, defined once for the whole monorepo. */

export interface ApiOk<T> {
  ok: true
  data: T
  timestamp: string
}

export interface ApiError {
  ok: false
  error: { statusCode: number; message: string; details?: unknown }
  timestamp: string
}

export type ApiResponse<T> = ApiOk<T> | ApiError
