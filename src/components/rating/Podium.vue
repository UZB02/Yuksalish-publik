<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { RouteLocationRaw } from 'vue-router'
import AppIcon from '@/components/ui/AppIcon.vue'
import { formatScore, initials } from '@/utils/format'
import RankChange from './RankChange.vue'

export interface PodiumItem {
  rank: number
  title: string
  subtitle?: string
  score?: number
  rankChange?: number | null
  /** Berilsa nom havola bo'ladi (masalan, maktab sahifasi) */
  to?: RouteLocationRaw
}

const props = withDefaults(defineProps<{ items: PodiumItem[]; medals?: boolean }>(), {
  medals: true,
})
const { t } = useI18n()

// Klassik podium tartibi: 2-o'rin, 1-o'rin, 3-o'rin (o'lchamlar em da - TV rejimida ham proporsional)
const ordered = computed(() => {
  const by = new Map(props.items.map((i) => [i.rank, i]))
  const top = props.items.slice(0, 3)
  if (top.length < 3) return top.sort((a, b) => a.rank - b.rank)
  return [by.get(top[1]!.rank), by.get(top[0]!.rank), by.get(top[2]!.rank)].filter(
    (x): x is PodiumItem => !!x,
  )
})

const BAR = ['h-[5.5em]', 'h-[4em]', 'h-[2.8em]']
const RING = ['ring-gold', 'ring-silver', 'ring-bronze']
const MEDAL = ['text-gold', 'text-silver', 'text-bronze']
const idx = (rank: number) => Math.min(Math.max(rank, 1), 3) - 1
</script>

<template>
  <ol
    class="mx-auto flex max-w-[48em] items-end justify-center gap-[0.6em] px-1 sm:gap-[1em]"
    :aria-label="t('rating.podium')"
    data-testid="podium"
  >
    <li
      v-for="item in ordered"
      :key="item.rank"
      class="flex min-w-0 flex-1 flex-col items-center text-center"
      data-testid="podium-item"
    >
      <div class="relative mb-[0.5em]">
        <span
          class="flex h-[4.2em] w-[4.2em] items-center justify-center rounded-full bg-brand-100 text-[1.3em] font-bold text-brand-800 ring-4 dark:bg-brand-900 dark:text-brand-100"
          :class="medals ? RING[idx(item.rank)] : 'ring-brand-300'"
          aria-hidden="true"
        >
          {{ initials(item.title) }}
        </span>
        <span
          v-if="medals"
          class="absolute -bottom-[0.5em] -right-[0.3em] flex h-[1.9em] w-[1.9em] items-center justify-center rounded-full bg-surface shadow-card"
          :data-medal="item.rank"
        >
          <AppIcon name="medal" class="h-[1.3em] w-[1.3em]" :class="MEDAL[idx(item.rank)]" />
        </span>
      </div>
      <p class="line-clamp-2 w-full break-words text-[1em] font-semibold leading-tight text-fg">
        <RouterLink v-if="item.to" :to="item.to" class="hover:underline">{{
          item.title
        }}</RouterLink>
        <template v-else>{{ item.title }}</template>
      </p>
      <p v-if="item.subtitle" class="mt-0.5 text-[0.85em] text-fg-muted">{{ item.subtitle }}</p>
      <div class="mt-[0.4em] flex items-center gap-2" data-testid="podium-meta">
        <span
          v-if="item.score !== undefined"
          class="text-[1.4em] font-extrabold tabular-nums text-brand-fg"
          data-testid="podium-score"
        >
          {{ formatScore(item.score) }}
        </span>
        <RankChange :change="item.rankChange" />
      </div>
      <div
        class="mt-[0.6em] flex w-full items-start justify-center rounded-t-2xl bg-gradient-to-b from-brand-500 to-brand-600 pt-[0.4em] text-[1.6em] font-extrabold leading-none text-on-brand shadow-pop"
        :class="BAR[idx(item.rank)]"
        aria-hidden="true"
      >
        {{ item.rank }}
      </div>
    </li>
  </ol>
</template>
