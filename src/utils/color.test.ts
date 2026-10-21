import { describe, expect, it } from 'vitest'
import {
  DARK_TEXT,
  DEFAULT_BRAND,
  LIGHT_TEXT,
  SHADES,
  contrastRatio,
  ensureContrast,
  generateShades,
  hexToRgb,
  isHex,
  luminance,
  readableOn,
} from './color'

describe('generateShades', () => {
  it("500 - asl rang, yorug'lari yorqinroq, to'qlari qoraroq", () => {
    const s = generateShades('#2563eb')
    expect(s[500]).toBe('#2563eb')
    for (let i = 0; i < SHADES.length - 1; i++) {
      expect(luminance(s[SHADES[i]!])).toBeGreaterThan(luminance(s[SHADES[i + 1]!]))
    }
    expect(luminance(s[50])).toBeGreaterThan(0.8)
    expect(luminance(s[900])).toBeLessThan(0.05)
  })

  it("noto'g'ri yoki bo'sh hex bo'lsa standart rangga qaytadi", () => {
    for (const bad of ['red', '#12', '#gggggg', '', null, undefined, '#12345678']) {
      expect(generateShades(bad as string)[500]).toBe(DEFAULT_BRAND)
    }
  })

  it('hex tekshiruvi', () => {
    expect(isHex('#aabbcc')).toBe(true)
    expect(isHex('#AABBCC')).toBe(true)
    expect(isHex('aabbcc')).toBe(false)
    expect(isHex('#abc')).toBe(false)
    expect(hexToRgb('#0a141e')).toEqual([10, 20, 30])
  })
})

describe('kontrast', () => {
  it('oq/qora orasidagi nisbat 21', () => {
    expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 0)
    expect(contrastRatio('#777777', '#777777')).toBeCloseTo(1, 5)
  })

  it("readableOn: to'q fonda oq, yorug' fonda to'q matn", () => {
    expect(readableOn('#1e1b4b')).toBe(LIGHT_TEXT)
    expect(readableOn('#4f46e5')).toBe(LIGHT_TEXT)
    expect(readableOn('#fde047')).toBe(DARK_TEXT)
    expect(readableOn('#ffffff')).toBe(DARK_TEXT)
    expect(readableOn('#000000')).toBe(LIGHT_TEXT)
  })

  it("tanlangan matn rangi har doim kamida 4.5:1 beradi (o'rtacha ranglar ham)", () => {
    for (const bg of [
      '#4f46e5',
      '#16a34a',
      '#f59e0b',
      '#06b6d4',
      '#ef4444',
      '#a3e635',
      '#808080',
    ]) {
      const best = Math.max(contrastRatio(bg, LIGHT_TEXT), contrastRatio(bg, DARK_TEXT))
      expect(best).toBeGreaterThanOrEqual(4.5)
      expect(contrastRatio(bg, readableOn(bg))).toBe(best)
    }
  })

  it('ensureContrast: fonga nisbatan AA gacha qoraytiradi/yoritadi', () => {
    const onWhite = ensureContrast('#fde047', '#ffffff')
    expect(contrastRatio(onWhite, '#ffffff')).toBeGreaterThanOrEqual(4.5)
    const onDark = ensureContrast('#1e1b4b', '#111626')
    expect(contrastRatio(onDark, '#111626')).toBeGreaterThanOrEqual(4.5)
    // yetarli kontrastli rang o'zgarmaydi
    expect(ensureContrast('#1e1b4b', '#ffffff')).toBe('#1e1b4b')
  })
})
