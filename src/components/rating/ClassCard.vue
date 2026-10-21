<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { ClassItem } from '@/api/types'
import { formatScore } from '@/utils/format'
import RankBadge from './RankBadge.vue'
import RankChange from './RankChange.vue'

defineProps<{ item: ClassItem; medals?: boolean }>()
const emit = defineEmits<{ open: [classId: string] }>()
const { t } = useI18n()
</script>

<template>
  <li data-testid="class-card">
    <button
      type="button"
      class="group flex w-full items-center gap-3 rounded-2xl border border-border bg-surface p-4 text-left transition hover:-translate-y-0.5 hover:shadow-card"
      :aria-label="t('rating.openClass', { name: item.className })"
      @click="emit('open', item.classId)"
    >
      <RankBadge :rank="item.rank" :medals="medals" />
      <div class="min-w-0 flex-1">
        <p class="truncate text-lg font-bold text-fg group-hover:text-brand-fg">
          {{ item.className }}
        </p>
        <p class="text-sm text-fg-muted">{{ t('rating.rated', { n: item.ratedStudents }) }}</p>
      </div>
      <div class="flex flex-col items-end">
        <span
          v-if="item.score !== undefined"
          class="text-xl font-extrabold tabular-nums text-brand-fg"
        >
          {{ formatScore(item.score) }}
        </span>
        <RankChange :change="item.rankChange" />
      </div>
    </button>
  </li>
</template>
