/** THE one way to raise an HTTP error, in every layer (apps + packages). */
export interface HttpError extends Error {
  statusCode: number
}

export function httpError(statusCode: number, message: string): HttpError {
  const err = new Error(message) as HttpError
  err.statusCode = statusCode
  return err
}

export const badRequest = (m = 'Bad Request') => httpError(400, m)
export const unauthorized = (m = 'Unauthorized') => httpError(401, m)
export const forbidden = (m = 'Forbidden') => httpError(403, m)
export const notFound = (m = 'Not Found') => httpError(404, m)
export const conflict = (m = 'Conflict') => httpError(409, m)
export const serviceUnavailable = (m = 'Service Unavailable') => httpError(503, m)
