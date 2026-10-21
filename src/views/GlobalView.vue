<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { publicApi } from '@/api/public.api'
import Podium from '@/components/rating/Podium.vue'
import SchoolRow from '@/components/rating/SchoolRow.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import ListSkeleton from '@/components/ui/ListSkeleton.vue'
import OfflineBadge from '@/components/ui/OfflineBadge.vue'
import StateView from '@/components/ui/StateView.vue'
import { usePageInfo, type HeaderInfo } from '@/composables/usePageInfo'
import { useRatingData } from '@/composables/useRatingData'
import { formatDate, formatUpdated } from '@/utils/format'

const { t } = useI18n()
const rating = useRatingData((signal) => publicApi.global(signal), {
  intervalSeconds: () => 120,
})

const data = computed(() => rating.data.value)
const notFound = computed(() => rating.error.value?.kind === 'not_found')
const items = computed(() => data.value?.items ?? [])
const top = computed(() => items.value.filter((i) => i.rank <= 3).slice(0, 3))
const rest = computed(() => items.value.filter((i) => !top.value.includes(i)))
// Medal/ball ko'rinishi: umumiy reytingda har doim medal; ball kalitlari bo'lsa ko'rsatiladi
const medals = true

const info = computed<HeaderInfo>(() => ({
  name: t('global.title'),
  updatedAt: data.value?.calculatedAt ?? null,
}))
usePageInfo(
  info,
  computed(() => `${t('global.title')} | ${t('app.name')}`),
)
</script>

<template>
  <div class="space-y-6">
    <section
      class="relative overflow-hidden rounded-3xl bg-brand-500 p-5 text-on-brand shadow-pop sm:p-8"
    >
      <span
        class="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-white/10"
        aria-hidden="true"
      />
      <div class="relative flex items-center gap-4">
        <span class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20">
          <AppIcon name="globe" class="h-8 w-8" />
        </span>
        <div>
          <h1 class="text-2xl font-extrabold sm:text-3xl">{{ t('global.title') }}</h1>
          <p class="opacity-90">{{ t('global.subtitle') }}</p>
        </div>
      </div>
      <div v-if="data" class="relative mt-5 flex flex-wrap items-center gap-2 text-sm">
        <span
          class="inline-flex items-center gap-1.5 rounded-full bg-black/20 px-3 py-1 font-semibold"
        >
          <AppIcon name="trophy" class="h-4 w-4" /> {{ data.period.label }}
        </span>
        <span class="opacity-90"
          >{{ formatDate(data.period.from) }} - {{ formatDate(data.period.to) }}</span
        >
        <span v-if="data.calculatedAt" class="opacity-90">
          {{ t('rating.updated') }}: {{ formatUpdated(data.calculatedAt) }}
        </span>
        <OfflineBadge v-if="rating.offline.value" />
      </div>
    </section>

    <StateView
      v-if="notFound"
      icon="search"
      :title="t('state.notFoundTitle')"
      :text="t('state.notFoundText')"
    >
      <RouterLink :to="{ name: 'home' }" class="btn btn-brand">{{ t('state.toHome') }}</RouterLink>
    </StateView>
    <StateView
      v-else-if="rating.error.value && !data"
      icon="alert"
      :title="t('state.errorTitle')"
      :text="t('state.errorText')"
    >
      <button type="button" class="btn btn-brand" @click="rating.refresh()">
        {{ t('state.retry') }}
      </button>
    </StateView>
    <ListSkeleton v-else-if="rating.loading.value" :rows="4" />
    <StateView
      v-else-if="items.length === 0"
      icon="trophy"
      :title="t('state.emptyTitle')"
      :text="t('state.emptyText')"
    />
    <template v-else>
      <Podium
        v-if="top.length"
        :medals="medals"
        :items="
          top.map((s) => ({
            rank: s.rank,
            title: s.schoolName,
            to: { name: 'school', params: { slug: s.slug } },
            score: s.score,
            rankChange: s.rankChange,
          }))
        "
      />
      <ul class="space-y-2">
        <SchoolRow v-for="s in rest" :key="s.slug" :item="s" :medals="medals" />
      </ul>
    </template>
  </div>
</template>
