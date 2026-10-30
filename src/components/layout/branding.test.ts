import { describe, expect, it, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createMemoryHistory } from 'vue-router'
import { createI18n } from 'vue-i18n'
import { createAppRouter } from '@/router'
import uz from '@/locales/uz.json'
import { branding } from '@/composables/useBranding'
import { headerInfo } from '@/composables/usePageInfo'
import AppHeader from './AppHeader.vue'
import SchoolRow from '@/components/rating/SchoolRow.vue'
import TvStage from '@/components/tv/TvStage.vue'

const i18n = createI18n({ legacy: false, locale: 'uz', messages: { uz } })
const router = () => createAppRouter(createMemoryHistory())
const base = { version: '1', shortName: 'Y', icons: null }

beforeEach(() => {
  window.matchMedia ??= (() => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
  })) as never
  branding.value = null
  headerInfo.value = null
})

describe('AppHeader brending', () => {
  it("standart: tarjimadagi nom, logotip rasmi yo'q", () => {
    const w = mount(AppHeader, {
      global: { plugins: [i18n, router()], stubs: { ThemeToggle: true } },
    })
    expect(w.get('[data-testid=brand-name]').text()).toBe('Intizom reytingi')
    expect(w.find('[data-testid=brand-logo]').exists()).toBe(false)
  })
  it("appName va logo ko'rsatiladi; xatoda logo yashiriladi", async () => {
    branding.value = { ...base, appName: 'Yuksalish EDU', logoUrl: '/l.png' }
    const w = mount(AppHeader, {
      global: { plugins: [i18n, router()], stubs: { ThemeToggle: true } },
    })
    expect(w.get('[data-testid=brand-name]').text()).toBe('Yuksalish EDU')
    const img = w.get('[data-testid=brand-logo]')
    expect(img.attributes('src')).toBe('/l.png')
    expect(img.attributes('alt')).toBe('Yuksalish EDU')
    await img.trigger('error')
    expect(w.find('[data-testid=brand-logo]').exists()).toBe(false)
  })
})

describe('maktab logotipi', () => {
  const item = { rank: 1, schoolName: 'Maktab 1', slug: 'm1', ratedStudents: 5 }
  it("ro'yxat: logoUrl bo'lsa rasm (lazy, alt), bo'lmasa bosh harflar", () => {
    const withLogo = mount(SchoolRow, {
      props: { item: { ...item, logoUrl: '/m1.png' } },
      global: { plugins: [i18n, router()] },
    })
    const img = withLogo.get('img')
    expect(img.attributes('alt')).toBe('Maktab 1')
    expect(img.attributes('loading')).toBe('lazy')
    expect(img.attributes('width')).toBe('64')
    const without = mount(SchoolRow, {
      props: { item },
      global: { plugins: [i18n, router()] },
    })
    expect(without.find('img').exists()).toBe(false)
  })

  const stage = (logoUrl?: string | null) =>
    mount(TvStage, {
      props: {
        slides: [{ kind: 'students', items: [], page: 1, pages: 1 } as never],
        seconds: 10,
        rows: 8,
        medals: true,
        name: 'Maktab 1',
        logoUrl,
        period: null,
        calculatedAt: null,
        offline: false,
        exitTo: { name: 'home' },
      },
      global: { plugins: [i18n, router()], stubs: { TvSlide: true } },
    })
  it("TV: logo eager yuklanadi; yo'q bo'lsa rasm chizilmaydi", () => {
    const img = stage('/m1.png').get('img')
    expect(img.attributes('loading')).toBe('eager')
    expect(img.attributes('alt')).toBe('Maktab 1')
    expect(stage(null).find('img').exists()).toBe(false)
  })
})
