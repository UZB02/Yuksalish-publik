import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError, get, isAbort } from './http'
import { publicApi } from './public.api'

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })

describe('http.get', () => {
  const fetchMock = vi.fn()
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockReset()
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it("muvaffaqiyat: data va meta ajratiladi, bo'sh parametrlar tushib qoladi", async () => {
    fetchMock.mockResolvedValue(
      json(200, { success: true, data: [1], meta: { page: 1, limit: 1, total: 1, totalPages: 1 } }),
    )
    const res = await get<number[]>('/x', { params: { a: 1, b: '', c: undefined, d: 'q w' } })
    expect(res.data).toEqual([1])
    expect(res.meta?.total).toBe(1)
    const url = String(fetchMock.mock.calls[0]![0])
    expect(url).toContain('/x?')
    expect(url).toContain('a=1')
    expect(url).toContain('d=q+w')
    expect(url).not.toContain('b=')
    expect(url).not.toContain('c=')
  })

  it("404 -> 'not_found' turidagi ApiError (server xabari bilan)", async () => {
    fetchMock.mockResolvedValue(
      json(404, { success: false, error: { code: 'NOT_FOUND', message: 'Reyting topilmadi' } }),
    )
    const err = await get('/x').catch((e) => e)
    expect(err).toBeInstanceOf(ApiError)
    expect(err.kind).toBe('not_found')
    expect(err.status).toBe(404)
    expect(err.message).toBe('Reyting topilmadi')
  })

  it("429 va 500 turlari; JSON bo'lmagan javob ham ApiError", async () => {
    fetchMock.mockResolvedValueOnce(json(429, { success: false, error: { message: 'x' } }))
    expect((await get('/x').catch((e) => e)).kind).toBe('rate_limited')
    fetchMock.mockResolvedValueOnce(new Response('<html>', { status: 502 }))
    const e = await get('/x').catch((er) => er)
    expect(e.kind).toBe('server')
    expect(e.status).toBe(502)
  })

  it("tarmoq xatosi -> 'network'", async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))
    expect((await get('/x').catch((e) => e)).kind).toBe('network')
  })

  it("timeout -> 'timeout' turidagi xato", async () => {
    vi.useFakeTimers()
    fetchMock.mockImplementation(
      (_url: string, init: RequestInit) =>
        new Promise((_res, rej) => {
          init.signal!.addEventListener('abort', () =>
            rej(new DOMException('aborted', 'AbortError')),
          )
        }),
    )
    const p = get('/x', { timeoutMs: 1000 }).catch((e) => e)
    await vi.advanceTimersByTimeAsync(1001)
    const err = await p
    expect(err).toBeInstanceOf(ApiError)
    expect(err.kind).toBe('timeout')
  })

  it("tashqi signal bilan bekor qilish ApiError emas, AbortError bo'lib qoladi", async () => {
    fetchMock.mockImplementation(
      (_url: string, init: RequestInit) =>
        new Promise((_res, rej) => {
          init.signal!.addEventListener('abort', () =>
            rej(new DOMException('aborted', 'AbortError')),
          )
        }),
    )
    const ctrl = new AbortController()
    const p = get('/x', { signal: ctrl.signal }).catch((e) => e)
    ctrl.abort()
    const err = await p
    expect(isAbort(err)).toBe(true)
  })
})

describe('publicApi', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })
  afterEach(() => vi.unstubAllGlobals())

  it("students: score/rankChange kalitlari bo'lmagan javob buzilmaydi; slug kodlanadi", async () => {
    vi.mocked(fetch).mockResolvedValue(
      json(200, {
        success: true,
        data: {
          period: { type: 'month', from: '2026-10-01', to: '2026-10-31', label: 'Oktyabr' },
          calculatedAt: null,
          items: [{ rank: 1, studentKey: 'k', fullName: 'A', className: '7-A', classId: 'c' }],
        },
        meta: { page: 1, limit: 50, total: 1, totalPages: 1 },
      }),
    )
    const r = await publicApi.students('demo maktab', { limit: 50, grade: 7 })
    expect(r.items[0]).not.toHaveProperty('score')
    expect(r.items[0]).not.toHaveProperty('rankChange')
    expect(r.meta?.total).toBe(1)
    const url = String(vi.mocked(fetch).mock.calls[0]![0])
    expect(url).toContain('/public/demo%20maktab/rating/students')
    expect(url).toContain('grade=7')
  })
})
