import type { ClassItem, GlobalItem, StudentItem } from '@/api/types'

export type Slide =
  | { kind: 'classes'; items: ClassItem[]; page: number; pages: number }
  | { kind: 'podium'; items: StudentItem[] }
  | { kind: 'students'; items: StudentItem[]; page: number; pages: number }
  | { kind: 'schools'; items: GlobalItem[]; page: number; pages: number }
  | { kind: 'info' }

export interface SlideInput {
  classes?: ClassItem[]
  students?: StudentItem[]
  schools?: GlobalItem[]
  /** Bir slaydagi o'quvchilar/maktablar qatorlari soni */
  rowsPerSlide: number
  /** Bir slaydagi sinf kartalari soni */
  classesPerSlide: number
}

export function chunk<T>(list: readonly T[], size: number): T[][] {
  const n = Math.max(1, Math.floor(size))
  const out: T[][] = []
  for (let i = 0; i < list.length; i += n) out.push(list.slice(i, i + n))
  return out
}

const paged = <T, K extends 'classes' | 'students' | 'schools'>(
  kind: K,
  list: readonly T[],
  size: number,
): Slide[] => {
  const pages = chunk(list, size)
  return pages.map(
    (items, i) => ({ kind, items, page: i + 1, pages: pages.length }) as unknown as Slide,
  )
}

/**
 * TV slaydlari: sinflar (sahifalab) -> o'quvchilar top-3 podium -> o'quvchilar ro'yxati
 * (4-o'rindan, bo'laklarga) -> davr haqida ma'lumot. Maktablar reytingi uchun maktablar -> ma'lumot.
 * Ma'lumot bo'lmasa faqat "info" slaydi qaytadi.
 */
export function buildSlides(input: SlideInput): Slide[] {
  const slides: Slide[] = []
  if (input.schools?.length) slides.push(...paged('schools', input.schools, input.rowsPerSlide))
  if (input.classes?.length) slides.push(...paged('classes', input.classes, input.classesPerSlide))
  if (input.students?.length) {
    slides.push({ kind: 'podium', items: input.students.slice(0, 3) })
    const rest = input.students.slice(3)
    if (rest.length) slides.push(...paged('students', rest, input.rowsPerSlide))
  }
  slides.push({ kind: 'info' })
  return slides
}

/** Joriy indeksni yangi slaydlar soniga moslash (ma'lumot yangilanganda sakramasligi uchun). */
export function clampIndex(index: number, total: number): number {
  if (total <= 0) return 0
  return ((index % total) + total) % total
}
