<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { publicApi } from '@/api/public.api'
import type { PublicConfig, RatingResult, StudentItem } from '@/api/types'
import ListSkeleton from '@/components/ui/ListSkeleton.vue'
import StateView from '@/components/ui/StateView.vue'
import { useRatingData } from '@/composables/useRatingData'
import Podium from './Podium.vue'
import StudentRow from './StudentRow.vue'

const props = defineProps<{
  slug: string
  config: PublicConfig
  grade: string
  classId: string
  q: string
}>()
const emit = defineEmits<{ status: [value: { calculatedAt: string | null; offline: boolean }] }>()
const { t } = useI18n()

const PAGE = 50
const pages = ref(1)
const key = computed(() => `${props.grade}|${props.classId}|${props.q}`)
// Filtr o'zgarsa birinchi sahifadan boshlanadi
watch(key, () => (pages.value = 1))

interface Feed {
  period: RatingResult<StudentItem>['period']
  calculatedAt: string | null
  items: StudentItem[]
  total: number
}

const feed = useRatingData<Feed>(
  async (signal) => {
    const items: StudentItem[] = []
    let first: RatingResult<StudentItem> | null = null
    let total = 0
    // Yangilashda yuklangan hamma sahifalar qayta olinadi - reyting o'rinlari mos bo'lib qoladi
    for (let page = 1; page <= pages.value; page++) {
      const r = await publicApi.students(
        props.slug,
        {
          classId: props.classId || undefined,
          grade: props.grade ? Number(props.grade) : undefined,
          search: props.q || undefined,
          limit: PAGE,
          page,
        },
        signal,
      )
      first ??= r
      items.push(...r.items)
      total = r.meta?.total ?? items.length
      if (r.items.length < PAGE) break
    }
    return { period: first!.period, calculatedAt: first!.calculatedAt, items, total }
  },
  { intervalSeconds: () => props.config.autoRefreshSeconds, sources: [key, pages] },
)

watch(
  () => [feed.data.value?.calculatedAt, feed.offline.value] as const,
  ([calculatedAt, offline]) => emit('status', { calculatedAt: calculatedAt ?? null, offline }),
  { immediate: true },
)

const items = computed(() => feed.data.value?.items ?? [])
const filtered = computed(() => !!(props.grade || props.classId || props.q))
const medals = computed(() => props.config.showMedals)
// Filtrsiz ko'rinishda top-3 podiumga chiqadi, ro'yxat 4-o'rindan boshlanadi
const podium = computed(() =>
  filtered.value ? [] : items.value.filter((i) => i.rank <= 3).slice(0, 3),
)
const list = computed(() =>
  filtered.value ? items.value : items.value.filter((i) => !podium.value.includes(i)),
)
const hasMore = computed(() =>
  feed.data.value ? items.value.length < feed.data.value.total : false,
)
const loadingMore = computed(() => feed.refreshing.value && pages.value > 1)
</script>

<template>
  <section :aria-busy="feed.loading.value || feed.refreshing.value">
    <ListSkeleton v-if="feed.loading.value" />

    <StateView
      v-else-if="feed.error.value && !feed.data.value"
      icon="alert"
      :title="t('state.errorTitle')"
      :text="t('state.errorText')"
    >
      <button type="button" class="btn btn-brand" @click="feed.refresh()">
        {{ t('state.retry') }}
      </button>
    </StateView>

    <template v-else-if="feed.data.value">
      <StateView
        v-if="items.length === 0"
        :icon="filtered ? 'search' : 'trophy'"
        :title="filtered ? t('state.noMatches') : t('state.emptyTitle')"
        :text="filtered ? t('state.noMatchesText') : t('state.emptyText')"
      />
      <template v-else>
        <div v-if="podium.length" class="pb-6 pt-4" data-testid="students-podium">
          <Podium
            :medals="medals"
            :items="
              podium.map((s) => ({
                rank: s.rank,
                title: s.fullName,
                subtitle: s.className,
                score: s.score,
                rankChange: s.rankChange,
              }))
            "
          />
        </div>
        <ul class="space-y-2" :class="{ 'opacity-80': feed.refreshing.value && !loadingMore }">
          <StudentRow v-for="s in list" :key="s.studentKey" :item="s" :medals="medals" />
        </ul>
        <div v-if="hasMore" class="mt-5 flex justify-center">
          <button
            type="button"
            class="btn btn-ghost"
            :disabled="loadingMore"
            data-testid="load-more"
            @click="pages++"
          >
            {{ loadingMore ? t('state.loading') : t('rating.loadMore') }}
          </button>
        </div>
      </template>
    </template>
  </section>
</template>
