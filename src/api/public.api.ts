import { get } from './http'
import type {
  ClassItem,
  GlobalItem,
  PublicConfig,
  RatingResult,
  SchoolRef,
  StudentItem,
  StudentsQuery,
} from './types'

interface RatingData<T> {
  period: RatingResult<T>['period']
  calculatedAt: string | null
  items: T[]
}

async function rating<T>(
  path: string,
  params: Record<string, string | number | undefined>,
  signal?: AbortSignal,
): Promise<RatingResult<T>> {
  const { data, meta } = await get<RatingData<T>>(path, { params, signal })
  return { period: data.period, calculatedAt: data.calculatedAt, items: data.items, meta }
}

export const publicApi = {
  schools: async (signal?: AbortSignal) =>
    (await get<SchoolRef[]>('/public/schools', { signal })).data,
  config: async (slug: string, signal?: AbortSignal) =>
    (await get<PublicConfig>(`/public/${encodeURIComponent(slug)}/config`, { signal })).data,
  classes: (slug: string, query: { grade?: number } = {}, signal?: AbortSignal) =>
    rating<ClassItem>(`/public/${encodeURIComponent(slug)}/rating/classes`, query, signal),
  students: (slug: string, query: StudentsQuery = {}, signal?: AbortSignal) =>
    rating<StudentItem>(
      `/public/${encodeURIComponent(slug)}/rating/students`,
      { ...query },
      signal,
    ),
  global: (signal?: AbortSignal) => rating<GlobalItem>('/public/global/rating', {}, signal),
}
