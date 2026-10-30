import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const ICONS = {
  favicon: '/b/fav.png',
  icon192: '/b/192.png',
  icon512: '/b/512.png',
  maskable512: '/b/m512.png',
  apple180: '/b/180.png',
}
const brand = (extra: object = {}) => ({
  appName: 'Yuksalish EDU',
  shortName: 'Yuksalish',
  logoUrl: null,
  icons: null,
  version: '1',
  ...extra,
})
const ok = (data: unknown) =>
  new Response(JSON.stringify({ success: true, data }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  })

async function load() {
  vi.resetModules()
  return await import('./useBranding')
}

describe('useBranding', () => {
  const fetchMock = vi.fn()
  beforeEach(() => {
    localStorage.clear()
    document.head.innerHTML = '<link rel="icon" type="image/png" href="/favicon-32x32.png">'
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })
  afterEach(() => vi.unstubAllGlobals())

  it("standart: tarjimadagi nom, logotip yo'q, favicon PNG", async () => {
    fetchMock.mockRejectedValue(new Error('offline'))
    const m = await load()
    await m.initBranding()
    expect(m.useBranding().appName.value).toBe('Intizom reytingi')
    expect(m.useBranding().logoUrl.value).toBeNull()
    expect(document.querySelector('link[rel="icon"]')?.getAttribute('href')).toBe('/favicon-32x32.png')
  })

  it('muvaffaqiyat: nom, logotip, favicon almashadi va kesh yoziladi', async () => {
    fetchMock.mockResolvedValue(ok(brand({ logoUrl: '/b/logo.png', icons: ICONS })))
    const m = await load()
    await m.initBranding()
    const { appName, logoUrl } = m.useBranding()
    expect(appName.value).toBe('Yuksalish EDU')
    expect(logoUrl.value).toBe('/b/logo.png')
    const link = document.querySelector('link[rel="icon"]')!
    expect(link.getAttribute('href')).toBe('/b/fav.png')
    expect(link.getAttribute('type')).toBeNull()
    expect(JSON.parse(localStorage.getItem('branding')!).appName).toBe('Yuksalish EDU')
  })

  it("kesh: xato bo'lsa ham oxirgi qiymat darhol ishlatiladi", async () => {
    localStorage.setItem('branding', JSON.stringify(brand({ appName: 'Keshdagi' })))
    fetchMock.mockRejectedValue(new Error('offline'))
    const m = await load()
    expect(m.useBranding().appName.value).toBe('Keshdagi')
    await m.initBranding()
    expect(m.useBranding().appName.value).toBe('Keshdagi')
  })

  it("buzuq kesh e'tiborga olinmaydi", async () => {
    localStorage.setItem('branding', '{not json')
    fetchMock.mockRejectedValue(new Error('x'))
    const m = await load()
    expect(m.useBranding().appName.value).toBe('Intizom reytingi')
  })

  it("icons=null bo'lsa favicon PNG ga qaytadi", async () => {
    const m = await load()
    m.applyFavicon(ICONS)
    m.applyFavicon(null)
    const link = document.querySelector('link[rel="icon"]')!
    expect(link.getAttribute('href')).toBe('/favicon-32x32.png')
    expect(link.getAttribute('type')).toBe('image/png')
  })
})
