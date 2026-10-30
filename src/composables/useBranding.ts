import { computed, ref } from 'vue'
import { get } from '@/api/http'
import type { Branding } from '@/api/types'
import { i18n } from '@/i18n'

const CACHE_KEY = 'branding'
const DEFAULT_FAVICON = '/favicon-32x32.png'

function readCache(): Branding | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const v = JSON.parse(raw) as Branding
    return v && typeof v.appName === 'string' ? v : null
  } catch {
    return null
  }
}

function writeCache(b: Branding) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(b))
  } catch {
    /* kesh ixtiyoriy */
  }
}

// Modul darajasidagi holat: header, sarlavhalar va favicon bitta manbadan o'qiydi.
export const branding = ref<Branding | null>(readCache())

/** `<link rel="icon">` ni brending ikonkasiga almashtiradi; ikonka yo'q bo'lsa standart PNG ga qaytaradi. */
export function applyFavicon(icons: Branding['icons'] | undefined) {
  if (typeof document === 'undefined') return
  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
  if (!link) {
    link = document.createElement('link')
    link.rel = 'icon'
    document.head.appendChild(link)
  }
  if (icons?.favicon) {
    link.removeAttribute('type')
    link.href = icons.favicon
  } else {
    link.type = 'image/png'
    link.href = DEFAULT_FAVICON
  }
}

/** Platforma nomi, logotipi va `<title>` qo'shimchasi. Standart: tarjimadagi `app.name`. */
export function useBranding() {
  const appName = computed(() => branding.value?.appName?.trim() || i18n.global.t('app.name'))
  const logoUrl = computed(() => branding.value?.logoUrl ?? null)
  return { branding, appName, logoUrl }
}

/**
 * Ishga tushganda bir marta chaqiriladi: keshdan darhol bo'yaydi, keyin fonda yangilaydi.
 * Render'ni bloklamaydi; xatoda indamay standart/kesh holatda qoladi.
 */
export async function initBranding(): Promise<void> {
  applyFavicon(branding.value?.icons)
  try {
    const { data } = await get<Branding>('/branding', { timeoutMs: 8000 })
    if (!data || typeof data.appName !== 'string') return
    branding.value = data
    writeCache(data)
    applyFavicon(data.icons)
  } catch {
    /* jim: standart ko'rinish */
  }
}
