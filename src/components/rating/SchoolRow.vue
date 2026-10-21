<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { GlobalItem } from '@/api/types'
import { formatScore } from '@/utils/format'
import SchoolLogo from '@/components/ui/SchoolLogo.vue'
import RankBadge from './RankBadge.vue'
import RankChange from './RankChange.vue'

defineProps<{ item: GlobalItem; medals?: boolean }>()
const { t } = useI18n()
</script>

<template>
  <li data-testid="school-row">
    <RouterLink
      :to="{ name: 'school', params: { slug: item.slug } }"
      class="flex items-center gap-3 rounded-2xl border border-border bg-surface px-3 py-3 transition hover:shadow-card sm:gap-4 sm:px-4"
    >
      <RankBadge :rank="item.rank" :medals="medals" />
      <SchoolLogo :name="item.schoolName" :src="item.logoUrl" class="h-11 w-11" />
      <div class="min-w-0 flex-1">
        <p class="truncate font-semibold text-fg">{{ item.schoolName }}</p>
        <p class="text-sm text-fg-muted">{{ t('rating.rated', { n: item.ratedStudents }) }}</p>
      </div>
      <span v-if="item.score !== undefined" class="text-lg font-bold tabular-nums text-fg">
        {{ formatScore(item.score) }}
      </span>
      <RankChange :change="item.rankChange" />
    </RouterLink>
  </li>
</template>
