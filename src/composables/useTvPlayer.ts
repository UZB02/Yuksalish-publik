import { computed, onMounted, onScopeDispose, ref, watch, type Ref } from 'vue'
import { clampIndex } from '@/utils/slides'

/**
 * TV slayd pleyeri: avtomatik almashuv, pauza, qo'lda o'tish va sichqoncha harakatida
 * boshqaruv panelini vaqtincha ko'rsatish. Ma'lumot yangilanganda (slaydlar soni o'zgarganda)
 * indeks saqlanadi va faqat chegaraga moslanadi - slayd almashuvi kesilmaydi.
 */
export function useTvPlayer(total: Ref<number>, seconds: Ref<number>, controlsMs = 3000) {
  const index = ref(0)
  const paused = ref(false)
  /** Har gal taymer qayta boshlanganda o'zgaradi (progress animatsiyasi kaliti) */
  const cycle = ref(0)
  const controlsVisible = ref(true)
  let slideTimer: ReturnType<typeof setTimeout> | null = null
  let hideTimer: ReturnType<typeof setTimeout> | null = null

  const current = computed(() => clampIndex(index.value, total.value))

  function clearSlide() {
    if (slideTimer) clearTimeout(slideTimer)
    slideTimer = null
  }

  function restart() {
    clearSlide()
    cycle.value++
    if (paused.value || total.value <= 1 || seconds.value <= 0) return
    slideTimer = setTimeout(next, seconds.value * 1000)
  }

  function go(delta: number) {
    index.value = clampIndex(current.value + delta, total.value)
    restart()
  }
  const next = () => go(1)
  const prev = () => go(-1)
  function goTo(i: number) {
    index.value = clampIndex(i, total.value)
    restart()
  }
  function toggle() {
    paused.value = !paused.value
    restart()
  }

  // Ma'lumot yangilanib slaydlar soni o'zgarsa: indeksni moslaymiz, taymerni uzmaymiz
  watch(total, (n, old) => {
    index.value = clampIndex(index.value, n)
    if (old <= 1 !== n <= 1) restart()
  })
  watch(seconds, restart)

  function showControls() {
    controlsVisible.value = true
    if (hideTimer) clearTimeout(hideTimer)
    hideTimer = setTimeout(() => (controlsVisible.value = false), controlsMs)
  }

  function onKey(e: KeyboardEvent) {
    if (e.key === 'ArrowRight') next()
    else if (e.key === 'ArrowLeft') prev()
    else if (e.key === ' ' || e.code === 'Space') {
      e.preventDefault()
      toggle()
    } else return
    showControls()
  }

  onMounted(() => {
    restart()
    showControls()
    window.addEventListener('keydown', onKey)
  })
  onScopeDispose(() => {
    clearSlide()
    if (hideTimer) clearTimeout(hideTimer)
    window.removeEventListener('keydown', onKey)
  })

  return { index: current, paused, cycle, controlsVisible, next, prev, goTo, toggle, showControls }
}
