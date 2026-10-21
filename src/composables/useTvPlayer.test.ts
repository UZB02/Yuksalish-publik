import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, defineComponent, h, nextTick, ref } from 'vue'
import { useTvPlayer } from './useTvPlayer'

describe('useTvPlayer', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  function setup(totalSlides = 3, seconds = 10) {
    const total = ref(totalSlides)
    const secs = ref(seconds)
    let player!: ReturnType<typeof useTvPlayer>
    const app = createApp(
      defineComponent({
        setup() {
          player = useTvPlayer(total, secs)
          return () => h('div')
        },
      }),
    )
    app.mount(document.createElement('div'))
    return { player, total, secs, app }
  }

  it('slaydlar har N soniyada avtomatik almashadi va aylanadi', async () => {
    const { player, app } = setup(3, 10)
    expect(player.index.value).toBe(0)
    await vi.advanceTimersByTimeAsync(10_000)
    expect(player.index.value).toBe(1)
    await vi.advanceTimersByTimeAsync(20_000)
    expect(player.index.value).toBe(0) // 3 slayddan keyin boshiga
    app.unmount()
  })

  it("pauza: almashuv to'xtaydi, davom ettirilganda yana boshlanadi", async () => {
    const { player, app } = setup(3, 10)
    player.toggle()
    await vi.advanceTimersByTimeAsync(60_000)
    expect(player.index.value).toBe(0)
    player.toggle()
    await vi.advanceTimersByTimeAsync(10_000)
    expect(player.index.value).toBe(1)
    app.unmount()
  })

  it("qo'lda o'tish taymerni qayta boshlaydi (darhol keyingi o'tmaydi)", async () => {
    const { player, app } = setup(4, 10)
    await vi.advanceTimersByTimeAsync(8_000)
    player.next()
    expect(player.index.value).toBe(1)
    await vi.advanceTimersByTimeAsync(8_000)
    expect(player.index.value).toBe(1) // 8s < 10s
    await vi.advanceTimersByTimeAsync(2_000)
    expect(player.index.value).toBe(2)
    player.prev()
    player.prev()
    player.prev()
    expect(player.index.value).toBe(3) // orqaga aylanadi
    app.unmount()
  })

  it("klaviatura: o'ng/chap strelka, probel - pauza", async () => {
    const { player, app } = setup(3, 10)
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
    expect(player.index.value).toBe(1)
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
    expect(player.index.value).toBe(0)
    window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', code: 'Space' }))
    expect(player.paused.value).toBe(true)
    app.unmount()
  })

  it("ma'lumot yangilanib slaydlar soni kamaysa indeks chegaraga moslanadi, almashuv uzilmaydi", async () => {
    const { player, total, app } = setup(5, 10)
    player.goTo(4)
    total.value = 3
    await nextTick()
    expect(player.index.value).toBe(1) // 4 % 3
    await vi.advanceTimersByTimeAsync(10_000)
    expect(player.index.value).toBe(2)
    app.unmount()
  })

  it("bitta slaydda avtomatik almashuv yo'q", async () => {
    const { player, app } = setup(1, 5)
    await vi.advanceTimersByTimeAsync(60_000)
    expect(player.index.value).toBe(0)
    app.unmount()
  })

  it("boshqaruv paneli harakatdan so'ng 3 soniya ko'rinadi", async () => {
    const { player, app } = setup()
    expect(player.controlsVisible.value).toBe(true)
    await vi.advanceTimersByTimeAsync(3_100)
    expect(player.controlsVisible.value).toBe(false)
    player.showControls()
    expect(player.controlsVisible.value).toBe(true)
    app.unmount()
  })
})
