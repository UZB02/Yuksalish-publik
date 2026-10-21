import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope, nextTick, ref } from 'vue'
import { ApiError } from '@/api/http'
import { useRatingData } from './useRatingData'

function setHidden(hidden: boolean) {
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => hidden })
  document.dispatchEvent(new Event('visibilitychange'))
}

const flush = async () => {
  await vi.advanceTimersByTimeAsync(0)
  await nextTick()
}

describe('useRatingData', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    setHidden(false)
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  function mount<T>(fetcher: () => Promise<T>, seconds = 30, sources: never[] = []) {
    const scope = effectScope()
    const state = scope.run(() =>
      useRatingData(fetcher, { intervalSeconds: () => seconds, sources }),
    )!
    return { scope, state }
  }

  it('birinchi yuklanish: loading -> data', async () => {
    const fetcher = vi.fn().mockResolvedValue('A')
    const { state, scope } = mount(fetcher)
    expect(state.loading.value).toBe(true)
    await flush()
    expect(state.data.value).toBe('A')
    expect(state.loading.value).toBe(false)
    expect(state.error.value).toBeNull()
    scope.stop()
  })

  it('polling: har intervalda qayta yuklaydi', async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce('A')
      .mockResolvedValueOnce('B')
      .mockResolvedValue('C')
    const { state, scope } = mount(fetcher, 30)
    await flush()
    expect(fetcher).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(30_000)
    expect(fetcher).toHaveBeenCalledTimes(2)
    expect(state.data.value).toBe('B')
    await vi.advanceTimersByTimeAsync(30_000)
    expect(state.data.value).toBe('C')
    scope.stop()
  })

  it("sahifa yashirin bo'lsa polling to'xtaydi, ko'ringanda eskirgan bo'lsa darhol yangilaydi", async () => {
    const fetcher = vi.fn().mockResolvedValue('A')
    const { scope } = mount(fetcher, 30)
    await flush()
    expect(fetcher).toHaveBeenCalledTimes(1)

    setHidden(true)
    await vi.advanceTimersByTimeAsync(120_000)
    expect(fetcher).toHaveBeenCalledTimes(1) // yashirin: so'rov yo'q

    setHidden(false) // eskirgan -> darhol
    await flush()
    expect(fetcher).toHaveBeenCalledTimes(2)
    scope.stop()
  })

  it("yangi bo'lsa (interval o'tmagan) ko'ringanda qayta yuklanmaydi", async () => {
    const fetcher = vi.fn().mockResolvedValue('A')
    const { scope } = mount(fetcher, 30)
    await flush()
    setHidden(true)
    await vi.advanceTimersByTimeAsync(5_000)
    setHidden(false)
    await flush()
    expect(fetcher).toHaveBeenCalledTimes(1)
    scope.stop()
  })

  it("xatoda oxirgi ma'lumot saqlanadi va offline=true; keyingi muvaffaqiyatda tiklanadi", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce('A')
      .mockRejectedValueOnce(new ApiError('network', 'down'))
      .mockResolvedValue('B')
    const { state, scope } = mount(fetcher, 30)
    await flush()
    await vi.advanceTimersByTimeAsync(30_000)
    expect(state.data.value).toBe('A') // eski ma'lumot yo'qolmadi
    expect(state.error.value?.kind).toBe('network')
    expect(state.offline.value).toBe(true)
    expect(state.loading.value).toBe(false)

    await vi.advanceTimersByTimeAsync(30_000)
    expect(state.data.value).toBe('B')
    expect(state.offline.value).toBe(false)
    scope.stop()
  })

  it("birinchi yuklanishdagi xato: data yo'q, error bor, offline emas", async () => {
    const { state, scope } = mount(vi.fn().mockRejectedValue(new ApiError('not_found', 'x', 404)))
    await flush()
    expect(state.data.value).toBeNull()
    expect(state.error.value?.kind).toBe('not_found')
    expect(state.offline.value).toBe(false)
    expect(state.loading.value).toBe(false)
    scope.stop()
  })

  it("manba (filtr) o'zgarsa darhol qayta yuklaydi; eskisi bekor qilinadi", async () => {
    const q = ref('a')
    const signals: AbortSignal[] = []
    const fetcher = vi.fn(async (s: AbortSignal) => {
      signals.push(s)
      return q.value
    })
    const scope = effectScope()
    const state = scope.run(() =>
      useRatingData(fetcher, { intervalSeconds: () => 0, sources: [q] }),
    )!
    await flush()
    expect(state.data.value).toBe('a')
    q.value = 'b'
    await flush()
    expect(state.data.value).toBe('b')
    expect(fetcher).toHaveBeenCalledTimes(2)
    expect(signals[0]!.aborted).toBe(true)
    scope.stop()
  })

  it("scope to'xtaganda timer tozalanadi", async () => {
    const fetcher = vi.fn().mockResolvedValue('A')
    const { scope } = mount(fetcher, 30)
    await flush()
    scope.stop()
    await vi.advanceTimersByTimeAsync(120_000)
    expect(fetcher).toHaveBeenCalledTimes(1)
  })
})
