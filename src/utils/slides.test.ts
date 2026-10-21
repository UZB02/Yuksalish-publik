import { describe, expect, it } from 'vitest'
import type { ClassItem, GlobalItem, StudentItem } from '@/api/types'
import { buildSlides, chunk, clampIndex } from './slides'

const students = (n: number): StudentItem[] =>
  Array.from({ length: n }, (_, i) => ({
    rank: i + 1,
    studentKey: `s${i + 1}`,
    fullName: `Student ${i + 1}`,
    className: '7-A',
    classId: 'c1',
  }))
const classes = (n: number): ClassItem[] =>
  Array.from({ length: n }, (_, i) => ({
    rank: i + 1,
    classId: `c${i + 1}`,
    className: `${i + 1}-A`,
    grade: i + 1,
    ratedStudents: 5,
  }))
const schools = (n: number): GlobalItem[] =>
  Array.from({ length: n }, (_, i) => ({
    rank: i + 1,
    schoolName: `School ${i + 1}`,
    slug: `s${i + 1}`,
    logoUrl: null,
    ratedStudents: 10,
  }))

const opts = { rowsPerSlide: 8, classesPerSlide: 8 }

describe('chunk', () => {
  it("bo'laklarga ajratadi, oxirgisi qisqa bo'lishi mumkin", () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]])
    expect(chunk([], 3)).toEqual([])
    expect(chunk([1, 2], 0)).toEqual([[1], [2]]) // 0 -> kamida 1
  })
})

describe('buildSlides', () => {
  it("ma'lumot yo'q: faqat info slaydi", () => {
    expect(buildSlides(opts)).toEqual([{ kind: 'info' }])
    expect(buildSlides({ ...opts, students: [], classes: [] })).toEqual([{ kind: 'info' }])
  })

  it("tartib: sinflar -> podium -> o'quvchilar (4-o'rindan) -> info", () => {
    const slides = buildSlides({ ...opts, classes: classes(3), students: students(12) })
    expect(slides.map((s) => s.kind)).toEqual(['classes', 'podium', 'students', 'students', 'info'])
    const podium = slides[1]!
    expect(podium.kind === 'podium' && podium.items.map((s) => s.rank)).toEqual([1, 2, 3])
    const list = slides[2]!
    expect(list.kind === 'students' && list.items[0]!.rank).toBe(4)
  })

  it("o'quvchilar bo'laklarga: 20 ta -> top3 + 17 ta (8+8+1)", () => {
    const slides = buildSlides({ ...opts, students: students(20) })
    const lists = slides.filter((s) => s.kind === 'students')
    expect(lists).toHaveLength(3)
    expect(lists.map((s) => (s.kind === 'students' ? s.items.length : 0))).toEqual([8, 8, 1])
    expect(lists.map((s) => (s.kind === 'students' ? `${s.page}/${s.pages}` : ''))).toEqual([
      '1/3',
      '2/3',
      '3/3',
    ])
  })

  it("3 va undan kam o'quvchi: podium bor, ro'yxat slaydi yo'q", () => {
    for (const n of [1, 2, 3]) {
      const kinds = buildSlides({ ...opts, students: students(n) }).map((s) => s.kind)
      expect(kinds).toEqual(['podium', 'info'])
    }
  })

  it("faqat sinflar yoki faqat o'quvchilar bo'lganda mos slaydlar", () => {
    expect(buildSlides({ ...opts, classes: classes(10) }).map((s) => s.kind)).toEqual([
      'classes',
      'classes',
      'info',
    ])
    expect(buildSlides({ ...opts, students: students(5) }).map((s) => s.kind)).toEqual([
      'podium',
      'students',
      'info',
    ])
  })

  it("maktablar reytingi: sahifalab, so'ng info", () => {
    const slides = buildSlides({ ...opts, schools: schools(10) })
    expect(slides.map((s) => s.kind)).toEqual(['schools', 'schools', 'info'])
  })
})

describe('clampIndex', () => {
  it("aylanma indeks va bo'sh ro'yxat", () => {
    expect(clampIndex(5, 3)).toBe(2)
    expect(clampIndex(-1, 3)).toBe(2)
    expect(clampIndex(2, 0)).toBe(0)
  })
})
