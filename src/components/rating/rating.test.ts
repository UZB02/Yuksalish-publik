import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import uz from '@/locales/uz.json'
import Podium from './Podium.vue'
import RankBadge from './RankBadge.vue'
import RankChange from './RankChange.vue'
import StudentRow from './StudentRow.vue'

const i18n = createI18n({ legacy: false, locale: 'uz', messages: { uz } })
const opts = { global: { plugins: [i18n] } }

describe('RankChange', () => {
  it("kalit yo'q (undefined): hech narsa chizilmaydi", () => {
    const w = mount(RankChange, { props: {}, ...opts })
    expect(w.find('span').exists()).toBe(false)
  })
  it('musbat/manfiy/nol/null', () => {
    const up = mount(RankChange, { props: { change: 3 }, ...opts })
    expect(up.attributes('data-kind')).toBe('up')
    expect(up.text()).toBe('3')
    const down = mount(RankChange, { props: { change: -2 }, ...opts })
    expect(down.attributes('data-kind')).toBe('down')
    expect(down.text()).toBe('2')
    expect(mount(RankChange, { props: { change: 0 }, ...opts }).attributes('data-kind')).toBe(
      'same',
    )
    expect(mount(RankChange, { props: { change: null }, ...opts }).attributes('data-kind')).toBe(
      'same',
    )
  })
})

describe('RankBadge', () => {
  it('top-3 medal bilan, 4+ raqam bilan', () => {
    expect(mount(RankBadge, { props: { rank: 1 }, ...opts }).attributes('data-medal')).toBe('1')
    const r4 = mount(RankBadge, { props: { rank: 4 }, ...opts })
    expect(r4.attributes('data-medal')).toBeUndefined()
    expect(r4.text()).toBe('4')
  })
  it('medals=false: top-3 ham oddiy raqam', () => {
    const w = mount(RankBadge, { props: { rank: 2, medals: false }, ...opts })
    expect(w.attributes('data-medal')).toBeUndefined()
    expect(w.text()).toBe('2')
  })
})

const item = (rank: number, extra: object = {}) => ({
  rank,
  title: `Ism ${rank}`,
  subtitle: '7-A',
  ...extra,
})

describe('Podium', () => {
  it('tartib 2-1-3, medallar bor', () => {
    const w = mount(Podium, {
      props: { items: [item(1, { score: 98 }), item(2, { score: 95 }), item(3, { score: 90 })] },
      ...opts,
    })
    const ranks = w.findAll('[data-testid="podium-item"]').map((i) => i.text())
    expect(ranks[0]).toContain('Ism 2')
    expect(ranks[1]).toContain('Ism 1')
    expect(ranks[2]).toContain('Ism 3')
    expect(w.findAll('[data-medal]').length).toBeGreaterThanOrEqual(3)
  })

  it("showMedals=false: medal ikonkalari yo'q, raqamlar bor", () => {
    const w = mount(Podium, {
      props: { medals: false, items: [item(1), item(2), item(3)] },
      ...opts,
    })
    expect(w.findAll('[data-medal]')).toHaveLength(0)
    expect(w.text()).toContain('1')
  })

  it("score va rankChange yo'q bo'lsa ular ko'rsatilmaydi", () => {
    const w = mount(Podium, { props: { items: [item(1), item(2), item(3)] }, ...opts })
    expect(w.findAll('[data-testid="podium-score"]')).toHaveLength(0)
    expect(w.findAll('[data-kind]')).toHaveLength(0)
  })

  it("score va rankChange bor bo'lsa ko'rsatiladi", () => {
    const w = mount(Podium, {
      props: { items: [item(1, { score: 98.5, rankChange: 2 })] },
      ...opts,
    })
    expect(w.find('[data-testid="podium-score"]').text()).toBe('98.5')
    expect(w.find('[data-kind="up"]').exists()).toBe(true)
  })

  it('bitta yoki ikkita qatnashchi bilan ham buzilmaydi', () => {
    expect(mount(Podium, { props: { items: [item(1)] }, ...opts }).findAll('li')).toHaveLength(1)
    expect(
      mount(Podium, { props: { items: [item(1), item(2)] }, ...opts }).findAll('li'),
    ).toHaveLength(2)
  })
})

describe('StudentRow', () => {
  const base = { rank: 5, studentKey: 'k', fullName: 'Aliyev Vali', className: '7-A', classId: 'c' }
  it("score/rankChange yo'q: faqat o'rin, ism, sinf", () => {
    const w = mount(StudentRow, { props: { item: base }, ...opts })
    expect(w.find('[data-testid="row-score"]').exists()).toBe(false)
    expect(w.find('[data-kind]').exists()).toBe(false)
    expect(w.text()).toContain('Aliyev Vali')
    expect(w.text()).toContain('7-A')
  })
  it('score va rankChange bor', () => {
    const w = mount(StudentRow, {
      props: { item: { ...base, score: 91, rankChange: -1 } },
      ...opts,
    })
    expect(w.find('[data-testid="row-score"]').text()).toBe('91')
    expect(w.find('[data-kind="down"]').exists()).toBe(true)
  })

  it("photoUrl yo'q (rasmlar o'chiq): avatar chizilmaydi, dizayn o'zgarmaydi", () => {
    const w = mount(StudentRow, { props: { item: base }, ...opts })
    expect(w.find('[data-testid="person-avatar"]').exists()).toBe(false)
    expect(w.find('img').exists()).toBe(false)
  })
  it('photoUrl bor: lazy rasm, API bazasi bilan', () => {
    const w = mount(StudentRow, {
      props: { item: { ...base, photoUrl: '/api/v1/public/demo/photos/abc' } },
      ...opts,
    })
    const img = w.get('img')
    expect(img.attributes('src')).toBe('/api/v1/public/demo/photos/abc')
    expect(img.attributes('loading')).toBe('lazy')
    expect(img.attributes('alt')).toBe('Aliyev Vali')
  })
  it('photoUrl null (rasmlar yoqilgan, o`quvchida yo`q): bosh harflar, joy saqlanadi', () => {
    const w = mount(StudentRow, { props: { item: { ...base, photoUrl: null } }, ...opts })
    expect(w.find('img').exists()).toBe(false)
    expect(w.get('[data-testid="person-avatar"]').text()).toBe('AV')
  })
  it('rasm yuklanmasa bosh harflarga qaytadi', async () => {
    const w = mount(StudentRow, {
      props: { item: { ...base, photoUrl: '/api/v1/public/demo/photos/x' } },
      ...opts,
    })
    await w.get('img').trigger('error')
    expect(w.find('img').exists()).toBe(false)
    expect(w.get('[data-testid="person-avatar"]').text()).toBe('AV')
  })
})

describe('Podium: rasm', () => {
  it('photoUrl bo`lsa rasm, bo`lmasa bosh harflar', () => {
    const w = mount(Podium, {
      props: {
        items: [
          item(1, { photoUrl: '/api/v1/public/demo/photos/a' }),
          item(2),
          item(3, { photoUrl: null }),
        ],
      },
      ...opts,
    })
    const photos = w.findAll('[data-testid="podium-photo"]')
    expect(photos).toHaveLength(1)
    expect(photos[0]!.attributes('src')).toBe('/api/v1/public/demo/photos/a')
    expect(photos[0]!.attributes('loading')).toBe('lazy')
  })
})
