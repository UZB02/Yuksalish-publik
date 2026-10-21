import { onMounted, onScopeDispose, ref } from 'vue'

interface WakeLockSentinelLike {
  release: () => Promise<void>
}
interface WakeLockApi {
  request: (type: 'screen') => Promise<WakeLockSentinelLike>
}

/** Screen Wake Lock: TV rejimida ekran o'chib qolmasin (API bo'lmasa jim ishlamaydi). */
export function useWakeLock() {
  const active = ref(false)
  let sentinel: WakeLockSentinelLike | null = null
  const api = (navigator as Navigator & { wakeLock?: WakeLockApi }).wakeLock

  async function acquire() {
    if (!api || document.hidden || sentinel) return
    try {
      sentinel = await api.request('screen')
      active.value = true
    } catch {
      sentinel = null
      active.value = false
    }
  }

  // Sahifa yashiringanda lock avtomatik bo'shaydi; qaytganda qayta olamiz.
  const onVisible = () => {
    if (!document.hidden) {
      sentinel = null
      void acquire()
    }
  }

  onMounted(() => {
    void acquire()
    document.addEventListener('visibilitychange', onVisible)
  })
  onScopeDispose(() => {
    document.removeEventListener('visibilitychange', onVisible)
    void sentinel?.release().catch(() => undefined)
    sentinel = null
  })

  return { active, supported: !!api }
}
