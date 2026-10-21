export type Rgb = [number, number, number]

export const DEFAULT_BRAND = '#4f46e5'
const HEX = /^#[0-9a-fA-F]{6}$/

export const isHex = (v: unknown): v is string => typeof v === 'string' && HEX.test(v)

export function hexToRgb(hex: string): Rgb {
  const h = isHex(hex) ? hex : DEFAULT_BRAND
  return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]
}

export function rgbToHex([r, g, b]: Rgb): string {
  const c = (n: number) =>
    Math.round(Math.min(255, Math.max(0, n)))
      .toString(16)
      .padStart(2, '0')
  return `#${c(r)}${c(g)}${c(b)}`
}

const mix = (a: Rgb, b: Rgb, t: number): Rgb => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
]

const WHITE: Rgb = [255, 255, 255]
const BLACK: Rgb = [0, 0, 0]

export const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const
export type Shade = (typeof SHADES)[number]

// Oqga (yorug') yoki qoraga (to'q) aralashtirish ulushi; 500 - asl rang.
const MIX: Record<Shade, [Rgb, number]> = {
  50: [WHITE, 0.93],
  100: [WHITE, 0.85],
  200: [WHITE, 0.68],
  300: [WHITE, 0.5],
  400: [WHITE, 0.25],
  500: [WHITE, 0],
  600: [BLACK, 0.14],
  700: [BLACK, 0.3],
  800: [BLACK, 0.45],
  900: [BLACK, 0.6],
}

/** Brend rangidan 50-900 tonlar (`#RRGGBB`). Noto'g'ri qiymatda standart rang ishlatiladi. */
export function generateShades(hex: string | null | undefined): Record<Shade, string> {
  const base = hexToRgb(isHex(hex) ? hex : DEFAULT_BRAND)
  const out = {} as Record<Shade, string>
  for (const s of SHADES) {
    const [target, t] = MIX[s]
    out[s] = rgbToHex(mix(base, target, t))
  }
  return out
}

function channel(v: number): number {
  const c = v / 255
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

export function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex)
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

/** WCAG kontrast nisbati (1..21). */
export function contrastRatio(a: string, b: string): number {
  const la = luminance(a)
  const lb = luminance(b)
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la]
  return (hi + 0.05) / (lo + 0.05)
}

export const LIGHT_TEXT = '#ffffff'
export const DARK_TEXT = '#0f172a'

/** Rang ustidagi matn uchun oq yoki to'q rang: kontrasti yuqorisi tanlanadi. */
export function readableOn(bg: string): string {
  return contrastRatio(bg, LIGHT_TEXT) >= contrastRatio(bg, DARK_TEXT) ? LIGHT_TEXT : DARK_TEXT
}

/**
 * Rangni `bg` fonida kamida `min` kontrastga yetguncha (fon yorug' bo'lsa qoraytirib,
 * to'q bo'lsa yoritib) o'zgartiradi. Matn/havola rangi uchun.
 */
export function ensureContrast(color: string, bg: string, min = 4.5): string {
  let c = hexToRgb(color)
  const target = luminance(bg) > 0.5 ? BLACK : WHITE
  for (let i = 0; i < 40 && contrastRatio(rgbToHex(c), bg) < min; i++) {
    c = mix(c, target, 0.08)
  }
  return rgbToHex(c)
}

export const channels = (hex: string): string => hexToRgb(hex).join(' ')
