import type { ApiMeta } from './types'

export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL || '/api/v1'

export type ApiErrorKind = 'not_found' | 'rate_limited' | 'server' | 'network' | 'timeout'

export class ApiError extends Error {
  readonly kind: ApiErrorKind
  readonly status: number

  constructor(kind: ApiErrorKind, message: string, status = 0) {
    super(message)
    this.name = 'ApiError'
    this.kind = kind
    this.status = status
  }
}

export interface Envelope<T> {
  data: T
  meta?: ApiMeta
}

interface RequestOptions {
  params?: Record<string, string | number | boolean | undefined | null>
  signal?: AbortSignal
  timeoutMs?: number
}

function buildUrl(path: string, params?: RequestOptions['params']): string {
  const qs = new URLSearchParams()
  for (const [k, v] of Object.entries(params ?? {})) {
    if (v !== undefined && v !== null && v !== '') qs.set(k, String(v))
  }
  const q = qs.toString()
  return `${API_BASE_URL}${path}${q ? `?${q}` : ''}`
}

function kindFromStatus(status: number): ApiErrorKind {
  if (status === 404) return 'not_found'
  if (status === 429) return 'rate_limited'
  return 'server'
}

/**
 * GET so'rovi: timeout, tashqi bekor qilish (AbortSignal) va xatolarni yagona ApiError ga o'girish.
 * Kesh (ETag/If-None-Match) brauzer tomonidan avtomatik boshqariladi.
 */
export async function get<T>(path: string, options: RequestOptions = {}): Promise<Envelope<T>> {
  const controller = new AbortController()
  let timedOut = false
  const timer = setTimeout(() => {
    timedOut = true
    controller.abort()
  }, options.timeoutMs ?? 15000)
  const onAbort = () => controller.abort()
  options.signal?.addEventListener('abort', onAbort)

  try {
    const res = await fetch(buildUrl(path, options.params), {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })
    let body: { success?: boolean; data?: T; meta?: ApiMeta; error?: { message?: string } } | null =
      null
    try {
      body = await res.json()
    } catch {
      body = null
    }
    if (!res.ok || !body || body.success === false) {
      throw new ApiError(
        kindFromStatus(res.status),
        body?.error?.message ?? `HTTP ${res.status}`,
        res.status,
      )
    }
    return { data: body.data as T, meta: body.meta }
  } catch (e) {
    if (e instanceof ApiError) throw e
    if (options.signal?.aborted && !timedOut) throw e // chaqiruvchi o'zi bekor qilgan
    if (timedOut) throw new ApiError('timeout', 'Timeout')
    throw new ApiError('network', e instanceof Error ? e.message : 'Network error')
  } finally {
    clearTimeout(timer)
    options.signal?.removeEventListener('abort', onAbort)
  }
}

export const isAbort = (e: unknown): boolean => e instanceof DOMException && e.name === 'AbortError'
