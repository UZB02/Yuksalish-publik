<script setup lang="ts">
import type { StudentItem } from '@/api/types'
import { formatScore } from '@/utils/format'
import RankBadge from './RankBadge.vue'
import RankChange from './RankChange.vue'

defineProps<{ item: StudentItem; medals?: boolean }>()
</script>

<template>
  <li
    class="flex items-center gap-3 rounded-2xl border border-border bg-surface px-3 py-2.5 sm:gap-4 sm:px-4"
    data-testid="student-row"
  >
    <RankBadge :rank="item.rank" :medals="medals" />
    <div class="min-w-0 flex-1">
      <p class="truncate font-semibold text-fg">{{ item.fullName }}</p>
      <p class="truncate text-sm text-fg-muted">{{ item.className }}</p>
    </div>
    <span
      v-if="item.score !== undefined"
      class="text-lg font-bold tabular-nums text-fg"
      data-testid="row-score"
    >
      {{ formatScore(item.score) }}
    </span>
    <RankChange :change="item.rankChange" />
  </li>
</template>
