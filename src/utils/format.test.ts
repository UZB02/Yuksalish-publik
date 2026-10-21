import { describe, expect, it } from 'vitest'
import {
  formatDate,
  formatDateTime,
  formatScore,
  formatTime,
  formatUpdated,
  initials,
} from './format'

describe('format (Asia/Tashkent)', () => {
  it("UTC vaqt Toshkent vaqtiga (+05:00) o'giriladi", () => {
    expect(formatTime('2026-10-15T09:32:00Z')).toBe('14:32')
    expect(formatDateTime('2026-10-15T09:32:00Z')).toBe('15.10.2026 14:32')
  })

  it('UTC kechasi Toshkentda keyingi kun', () => {
    expect(formatDateTime('2026-10-15T20:30:00Z')).toBe('16.10.2026 01:30')
  })

  it("noto'g'ri yoki bo'sh qiymat: bo'sh satr", () => {
    expect(formatTime(null)).toBe('')
    expect(formatTime('abc')).toBe('')
    expect(formatDateTime(undefined)).toBe('')
  })

  it('formatUpdated: bugun - faqat vaqt, boshqa kun - sana bilan (Toshkent kuniga nisbatan)', () => {
    const now = new Date('2026-10-15T10:00:00Z') // 15.10 15:00 Toshkent
    expect(formatUpdated('2026-10-15T09:32:00Z', now)).toBe('14:32')
    expect(formatUpdated('2026-10-14T09:32:00Z', now)).toBe('14.10.2026 14:32')
    // UTC bo'yicha 15-kun, Toshkentda 16-kun: now ham 16 bo'lsa "bugun"
    const late = new Date('2026-10-15T21:00:00Z')
    expect(formatUpdated('2026-10-15T20:00:00Z', late)).toBe('01:00')
  })

  it('formatDate vaqt mintaqasisiz', () => {
    expect(formatDate('2026-10-01')).toBe('01.10.2026')
    expect(formatDate('2026-10-31T00:00:00.000Z')).toBe('31.10.2026')
    expect(formatDate('')).toBe('')
  })

  it('ball va bosh harflar', () => {
    expect(formatScore(95)).toBe('95')
    expect(formatScore(95.456)).toBe('95.46')
    expect(initials('Aliyev Vali Karimovich')).toBe('AV')
    expect(initials('')).toBe('')
  })
})
