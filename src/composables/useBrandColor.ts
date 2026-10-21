import { onScopeDispose, watch, type Ref } from 'vue'
import {
  DARK_TEXT,
  DEFAULT_BRAND,
  LIGHT_TEXT,
  channels,
  ensureContrast,
  generateShades,
  isHex,
  readableOn,
  SHADES,
} from '@/utils/color'

// Sahifa foni (yorug' / qorong'i) - matn rangi kontrasti shunga nisbatan hisoblanadi.
const BG_LIGHT = '#ffffff'
const BG_DARK = '#111626'

/** Brend tokenlarini <html> ga yozadi (CSS o'zgaruvchilar). */
export function applyBrand(
  color: string | null | undefined,
  el: HTMLElement = document.documentElement,
) {
  const base = isHex(color) ? color : DEFAULT_BRAND
  const shades = generateShades(base)
  for (const s of SHADES) el.style.setProperty(`--brand-${s}`, channels(shades[s]))
  // Brend rangi ustidagi matn: oq yoki to'q (kontrast bo'yicha)
  const on = readableOn(base)
  el.style.setProperty('--on-brand', channels(on === LIGHT_TEXT ? LIGHT_TEXT : DARK_TEXT))
  // Fonda matn/havola sifatida ishlatiladigan brend: AA (4.5:1) kontrast
  el.style.setProperty('--brand-fg-light', channels(ensureContrast(base, BG_LIGHT)))
  el.style.setProperty('--brand-fg-dark', channels(ensureContrast(base, BG_DARK)))
}

export function resetBrand(el: HTMLElement = document.documentElement) {
  for (const s of SHADES) el.style.removeProperty(`--brand-${s}`)
  for (const p of ['--on-brand', '--brand-fg-light', '--brand-fg-dark']) el.style.removeProperty(p)
}

/** Maktab `primaryColor` i o'zgarganda mavzu dinamik moslashadi; sahifadan chiqqanda tiklanadi. */
export function useBrandColor(color: Ref<string | null | undefined>) {
  watch(color, (c) => applyBrand(c), { immediate: true })
  onScopeDispose(() => resetBrand())
}
