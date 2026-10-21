import { ref } from 'vue'

export type ThemeMode = 'light' | 'dark' | 'system'
const KEY = 'theme'

function read(): ThemeMode {
  try {
    const v = localStorage.getItem(KEY)
    if (v === 'light' || v === 'dark' || v === 'system') return v
  } catch {
    // localStorage mavjud emas
  }
  return 'system'
}

export function isDarkMode(mode: ThemeMode, systemDark: boolean): boolean {
  return mode === 'dark' || (mode === 'system' && systemDark)
}

// Modul darajasida bitta holat: header va TV boshqaruvi bir xil mavzuni ko'radi.
const mode = ref<ThemeMode>(read())
const systemDark = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches

export function applyTheme() {
  document.documentElement.classList.toggle('dark', isDarkMode(mode.value, systemDark()))
}

let listening = false

/** Mavzu: yorug'/qorong'i/tizim. Faqat 'theme' kaliti localStorage da saqlanadi. */
export function useTheme() {
  if (!listening && typeof window !== 'undefined') {
    listening = true
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', () => mode.value === 'system' && applyTheme())
  }
  function set(next: ThemeMode) {
    mode.value = next
    try {
      localStorage.setItem(KEY, next)
    } catch {
      // ignore
    }
    applyTheme()
  }
  /** system -> light -> dark -> system */
  const cycle = () =>
    set(mode.value === 'system' ? 'light' : mode.value === 'light' ? 'dark' : 'system')
  return { mode, set, cycle }
}
