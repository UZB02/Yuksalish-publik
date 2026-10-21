import { reactive, watch } from 'vue'
import { useRoute, useRouter, type LocationQuery } from 'vue-router'

type State = Record<string, string>

/** URL query dan holat: yo'q/bo'sh kalitlar uchun standart qiymat olinadi. */
export function parseQuery<T extends State>(query: LocationQuery, defaults: T): T {
  const out = { ...defaults } as State
  for (const key of Object.keys(defaults)) {
    const raw = query[key]
    const v = Array.isArray(raw) ? raw[0] : raw
    if (typeof v === 'string' && v !== '') out[key] = v
  }
  return out as T
}

/** Holatdan query: standart qiymatga teng kalitlar URL ga yozilmaydi (havola qisqa qoladi). */
export function toQuery<T extends State>(state: T, defaults: T): Record<string, string> {
  const q: Record<string, string> = {}
  for (const key of Object.keys(defaults)) {
    if (state[key] !== '' && state[key] !== defaults[key]) q[key] = state[key]!
  }
  return q
}

/**
 * Holat <-> URL query sinxronizatsiyasi (tab, parallel, sinf, qidiruv): havolani ulashish mumkin.
 * Boshqa (begona) query kalitlari saqlanadi; tarixga yangi yozuv qo'shilmaydi (replace).
 */
export function useUrlState<T extends State>(defaults: T) {
  const route = useRoute()
  const router = useRouter()
  const state = reactive({ ...parseQuery(route.query, defaults) }) as T

  watch(
    () => route.query,
    (q) => {
      const next = parseQuery(q, defaults)
      for (const key of Object.keys(defaults)) {
        if (state[key] !== next[key]) (state as State)[key] = next[key]!
      }
    },
  )

  watch(
    () => ({ ...state }),
    (s) => {
      const own = new Set(Object.keys(defaults))
      const foreign = Object.fromEntries(
        Object.entries(route.query).filter(([k]) => !own.has(k)),
      ) as Record<string, string>
      const query = { ...foreign, ...toQuery(s, defaults) }
      if (JSON.stringify(query) !== JSON.stringify(route.query)) {
        void router.replace({ query })
      }
    },
  )

  return state
}
