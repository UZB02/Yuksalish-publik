import { onMounted, onScopeDispose, ref } from 'vue'

export function useFullscreen() {
  const active = ref(false)
  const sync = () => (active.value = !!document.fullscreenElement)

  async function toggle() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else await document.documentElement.requestFullscreen()
    } catch {
      // brauzer ruxsat bermadi (masalan, foydalanuvchi harakatisiz) - jim o'tamiz
    }
  }

  onMounted(() => {
    sync()
    document.addEventListener('fullscreenchange', sync)
  })
  onScopeDispose(() => document.removeEventListener('fullscreenchange', sync))

  return {
    active,
    toggle,
    supported: typeof document !== 'undefined' && !!document.fullscreenEnabled,
  }
}
