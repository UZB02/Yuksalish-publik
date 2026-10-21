import {
  computed,
  onScopeDispose,
  ref,
  shallowRef,
  watch,
  type ComputedRef,
  type Ref,
  type WatchSource,
} from 'vue'
import { ApiError, isAbort } from '@/api/http'

interface Options {
  /** Avtomatik yangilanish intervali (soniya); 0 yoki bo'sh - o'chirilgan */
  intervalSeconds?: () => number | undefined
  /** O'zgarganda darhol qayta yuklanadigan manbalar (filtrlar) */
  sources?: WatchSource[]
}

export interface RatingData<T> {
  data: Ref<T | null>
  error: Ref<ApiError | null>
  /** Birinchi yuklanish (hali ma'lumot yo'q) */
  loading: ComputedRef<boolean>
  /** Fonda yangilanmoqda (ma'lumot ko'rinib turadi - sakrash yo'q) */
  refreshing: Ref<boolean>
  /** Yangilash muvaffaqiyatsiz, lekin eski ma'lumot ko'rsatilmoqda */
  offline: ComputedRef<boolean>
  lastUpdatedAt: Ref<number | null>
  refresh: () => Promise<void>
}

const toApiError = (e: unknown): ApiError =>
  e instanceof ApiError ? e : new ApiError('network', e instanceof Error ? e.message : 'error')

/**
 * Stale-while-revalidate: yangilanish paytida eski ma'lumot ko'rinib turadi, xatoda ham saqlanadi.
 * Polling sahifa yashirin bo'lsa to'xtaydi va ko'ringanda (eskirgan bo'lsa) darhol yangilaydi.
 */
export function useRatingData<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  options: Options = {},
): RatingData<T> {
  const data = shallowRef<T | null>(null) as Ref<T | null>
  const error = ref<ApiError | null>(null)
  const refreshing = ref(false)
  const fetched = ref(false)
  const lastUpdatedAt = ref<number | null>(null)
  let controller: AbortController | null = null
  let timer: ReturnType<typeof setTimeout> | null = null
  let disposed = false

  const loading = computed(() => !fetched.value && data.value === null && error.value === null)
  const offline = computed(() => error.value !== null && data.value !== null)

  async function refresh() {
    controller?.abort()
    const ctrl = new AbortController()
    controller = ctrl
    refreshing.value = true
    try {
      const result = await fetcher(ctrl.signal)
      if (ctrl.signal.aborted) return
      data.value = result
      error.value = null
      lastUpdatedAt.value = Date.now()
    } catch (e) {
      if (isAbort(e) || ctrl.signal.aborted) return
      error.value = toApiError(e)
    } finally {
      if (controller === ctrl) {
        refreshing.value = false
        fetched.value = true
      }
    }
  }

  const intervalMs = () => (options.intervalSeconds?.() ?? 0) * 1000

  function clearTimer() {
    if (timer) clearTimeout(timer)
    timer = null
  }

  function schedule() {
    clearTimer()
    const ms = intervalMs()
    if (disposed || ms <= 0 || document.hidden) return
    timer = setTimeout(async () => {
      await refresh()
      schedule()
    }, ms)
  }

  function onVisibility() {
    if (document.hidden) {
      clearTimer()
      return
    }
    const ms = intervalMs()
    const stale = lastUpdatedAt.value === null || Date.now() - lastUpdatedAt.value >= ms
    if (ms > 0 && stale) void refresh().then(schedule)
    else schedule()
  }

  document.addEventListener('visibilitychange', onVisibility)
  onScopeDispose(() => {
    disposed = true
    clearTimer()
    controller?.abort()
    document.removeEventListener('visibilitychange', onVisibility)
  })

  if (options.sources?.length) {
    watch(options.sources, () => {
      void refresh().then(schedule)
    })
  }
  watch(intervalMs, schedule)

  void refresh().then(schedule)

  return { data, error, loading, refreshing, offline, lastUpdatedAt, refresh }
}
