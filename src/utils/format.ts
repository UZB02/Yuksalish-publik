export const TIME_ZONE = 'Asia/Tashkent'

const parts = (d: Date) => {
  const f = new Intl.DateTimeFormat('en-GB', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  })
  const o: Record<string, string> = {}
  for (const p of f.formatToParts(d)) o[p.type] = p.value
  return o as { year: string; month: string; day: string; hour: string; minute: string }
}

function parse(value: string | null | undefined): Date | null {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

/** 14:32 (Asia/Tashkent) */
export function formatTime(value: string | null | undefined): string {
  const d = parse(value)
  if (!d) return ''
  const p = parts(d)
  return `${p.hour}:${p.minute}`
}

/** 14.10.2026 14:32 (Asia/Tashkent) */
export function formatDateTime(value: string | null | undefined): string {
  const d = parse(value)
  if (!d) return ''
  const p = parts(d)
  return `${p.day}.${p.month}.${p.year} ${p.hour}:${p.minute}`
}

/** Bugun bo'lsa faqat vaqt, aks holda sana va vaqt. */
export function formatUpdated(value: string | null | undefined, now: Date = new Date()): string {
  const d = parse(value)
  if (!d) return ''
  const a = parts(d)
  const b = parts(now)
  const sameDay = a.day === b.day && a.month === b.month && a.year === b.year
  return sameDay ? `${a.hour}:${a.minute}` : formatDateTime(value)
}

/** 'YYYY-MM-DD' -> '14.10.2026' (vaqt mintaqasi siljishisiz) */
export function formatDate(iso: string | null | undefined): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso ?? '')
  return m ? `${m[3]}.${m[2]}.${m[1]}` : ''
}

/** Ball: butun bo'lsa butun, aks holda 2 xonagacha. */
export function formatScore(score: number): string {
  return Number.isInteger(score) ? String(score) : String(Math.round(score * 100) / 100)
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('')
}
