import { describe, expect, it } from 'vitest'
import { createApp, defineComponent, h, nextTick } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { parseQuery, toQuery, useUrlState } from './useUrlState'

const defaults = { tab: '', grade: '', class: '', q: '' }

describe('parseQuery / toQuery', () => {
  it("yo'q kalitlar uchun standart; massiv bo'lsa birinchisi", () => {
    expect(parseQuery({ grade: '7', q: ['ali', 'vali'] }, defaults)).toEqual({
      tab: '',
      grade: '7',
      class: '',
      q: 'ali',
    })
    expect(parseQuery({}, defaults)).toEqual(defaults)
    expect(parseQuery({ grade: '' }, defaults).grade).toBe('')
  })

  it("standart va bo'sh qiymatlar URL ga yozilmaydi", () => {
    expect(toQuery({ tab: 'classes', grade: '7', class: '', q: '' }, defaults)).toEqual({
      tab: 'classes',
      grade: '7',
    })
    expect(toQuery(defaults, defaults)).toEqual({})
    expect(
      toQuery({ tab: 'students', grade: '', class: '', q: '' }, { ...defaults, tab: 'students' }),
    ).toEqual({})
  })
})

describe('useUrlState', () => {
  async function setup(initial: string) {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/:slug', component: { render: () => null } }],
    })
    await router.push(initial)
    await router.isReady()
    let state!: typeof defaults
    const app = createApp(
      defineComponent({
        setup() {
          state = useUrlState(defaults)
          return () => h('div')
        },
      }),
    )
    app.use(router)
    app.mount(document.createElement('div'))
    return { router, state }
  }

  it("URL dan boshlang'ich holat", async () => {
    const { state } = await setup('/demo?tab=classes&grade=7&q=ali')
    expect(state).toMatchObject({ tab: 'classes', grade: '7', q: 'ali', class: '' })
  })

  it("holat o'zgarsa URL yangilanadi (begona query saqlanadi)", async () => {
    const { router, state } = await setup('/demo?utm=1')
    state.grade = '9'
    state.class = 'abc'
    await nextTick()
    await router.isReady()
    await new Promise((r) => setTimeout(r, 0))
    expect(router.currentRoute.value.query).toEqual({ utm: '1', grade: '9', class: 'abc' })
    state.grade = ''
    await nextTick()
    await new Promise((r) => setTimeout(r, 0))
    expect(router.currentRoute.value.query).toEqual({ utm: '1', class: 'abc' })
  })

  it("URL o'zgarsa (orqaga/oldinga) holat yangilanadi", async () => {
    const { router, state } = await setup('/demo')
    await router.push('/demo?tab=classes&grade=5')
    await nextTick()
    expect(state.tab).toBe('classes')
    expect(state.grade).toBe('5')
    await router.push('/demo')
    await nextTick()
    expect(state.tab).toBe('')
    expect(state.grade).toBe('')
  })
})
