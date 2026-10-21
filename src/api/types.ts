export interface ApiMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface SchoolRef {
  name: string
  slug: string
  logoUrl: string | null
}

export interface Period {
  type: string
  from: string
  to: string
  label: string
}

export interface PublicConfig {
  school: SchoolRef
  title: string | null
  subtitle: string | null
  primaryColor: string | null
  showClasses: boolean
  showStudents: boolean
  showScores: boolean
  showMedals: boolean
  showTrend: boolean
  topStudents: number | null
  autoRefreshSeconds: number
  tvSlideSeconds: number
  period: Period
  calculatedAt: string | null
  globalAvailable: boolean
}

/** `score` va `rankChange` sozlama o'chirilgan bo'lsa javobda umuman bo'lmaydi. */
export interface ClassItem {
  rank: number
  rankChange?: number | null
  classId: string
  className: string
  grade: number
  score?: number
  ratedStudents: number
}

export interface StudentItem {
  rank: number
  rankChange?: number | null
  studentKey: string
  fullName: string
  className: string
  classId: string
  score?: number
}

export interface GlobalItem {
  rank: number
  rankChange?: number | null
  schoolName: string
  slug: string
  logoUrl: string | null
  score?: number
  ratedStudents: number
}

export interface RatingResult<T> {
  period: Period
  calculatedAt: string | null
  items: T[]
  meta?: ApiMeta
}

export interface StudentsQuery {
  classId?: string
  grade?: number
  search?: string
  limit?: number
  page?: number
}
