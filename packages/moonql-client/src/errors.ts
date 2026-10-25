/**
 * Every failed call surfaces as this one error: the HTTP status, the API
 * message (identical to `{ ok:false, error.message }`) and the URL that failed.
 */
export class MoonApiError extends Error {
  constructor(
    readonly statusCode: number,
    message: string,
    readonly details?: unknown,
    readonly url?: string,
  ) {
    super(message)
    this.name = 'MoonApiError'
  }
}
