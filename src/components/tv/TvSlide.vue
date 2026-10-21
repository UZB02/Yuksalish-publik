<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import AppIcon from '@/components/ui/AppIcon.vue'
import Podium from '@/components/rating/Podium.vue'
import RankBadge from '@/components/rating/RankBadge.vue'
import RankChange from '@/components/rating/RankChange.vue'
import SchoolLogo from '@/components/ui/SchoolLogo.vue'
import type { Period } from '@/api/types'
import { formatDate, formatScore, formatUpdated } from '@/utils/format'
import type { Slide } from '@/utils/slides'

defineProps<{
  slide: Slide
  rows: number
  medals: boolean
  period: Period | null
  calculatedAt: string | null
  schoolName: string
}>()
const { t } = useI18n()
</script>

<template>
  <div class="flex h-full min-h-0 flex-col" :data-slide="slide.kind">
    <!-- Sinflar -->
    <template v-if="slide.kind === 'classes'">
      <h2 class="mb-[0.6em] text-[1.5em] font-extrabold text-fg">
        {{ t('rating.tabs.classes') }}
        <span v-if="slide.pages > 1" class="font-semibold text-fg-muted">
          {{ slide.page }}/{{ slide.pages }}
        </span>
      </h2>
      <ul class="grid min-h-0 flex-1 grid-cols-2 content-start gap-[0.7em]">
        <li
          v-for="c in slide.items"
          :key="c.classId"
          class="flex items-center gap-[0.8em] rounded-[0.9em] border border-border bg-surface px-[1em] py-[0.7em]"
        >
          <RankBadge :rank="c.rank" :medals="medals" class="!h-[2.4em] !w-[2.4em] !text-[1em]" />
          <span class="min-w-0 flex-1 truncate text-[1.5em] font-bold text-fg">{{
            c.className
          }}</span>
          <span
            v-if="c.score !== undefined"
            class="text-[1.6em] font-extrabold tabular-nums text-brand-fg"
          >
            {{ formatScore(c.score) }}
          </span>
          <RankChange :change="c.rankChange" class="text-[1em]" />
        </li>
      </ul>
    </template>

    <!-- Podium -->
    <template v-else-if="slide.kind === 'podium'">
      <h2 class="mb-[0.4em] text-center text-[1.6em] font-extrabold text-fg">
        {{ t('tv.topStudents') }}
      </h2>
      <div class="flex min-h-0 flex-1 items-end justify-center overflow-hidden text-[1.1em]">
        <Podium
          class="w-full max-w-[70em]"
          :medals="medals"
          :items="
            slide.items.map((s) => ({
              rank: s.rank,
              title: s.fullName,
              subtitle: s.className,
              score: s.score,
              rankChange: s.rankChange,
            }))
          "
        />
      </div>
    </template>

    <!-- O'quvchilar ro'yxati -->
    <template v-else-if="slide.kind === 'students'">
      <h2 class="mb-[0.5em] text-[1.5em] font-extrabold text-fg">
        {{ t('rating.tabs.students') }}
        <span v-if="slide.pages > 1" class="font-semibold text-fg-muted">
          {{ slide.page }}/{{ slide.pages }}
        </span>
      </h2>
      <ul
        class="grid min-h-0 flex-1 gap-[0.5em]"
        :style="{ gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))` }"
      >
        <li
          v-for="s in slide.items"
          :key="s.studentKey"
          class="flex items-center gap-[0.9em] rounded-[0.8em] border border-border bg-surface px-[1em]"
        >
          <RankBadge :rank="s.rank" :medals="medals" class="!h-[2.2em] !w-[2.2em] !text-[1em]" />
          <span class="min-w-0 flex-1 truncate text-[1.45em] font-semibold text-fg">{{
            s.fullName
          }}</span>
          <span class="text-[1.1em] text-fg-muted">{{ s.className }}</span>
          <span
            v-if="s.score !== undefined"
            class="min-w-[3.5em] text-right text-[1.5em] font-extrabold tabular-nums text-brand-fg"
          >
            {{ formatScore(s.score) }}
          </span>
          <RankChange :change="s.rankChange" />
        </li>
      </ul>
    </template>

    <!-- Maktablar -->
    <template v-else-if="slide.kind === 'schools'">
      <h2 class="mb-[0.5em] text-[1.5em] font-extrabold text-fg">
        {{ t('global.title') }}
        <span v-if="slide.pages > 1" class="font-semibold text-fg-muted">
          {{ slide.page }}/{{ slide.pages }}
        </span>
      </h2>
      <ul
        class="grid min-h-0 flex-1 gap-[0.5em]"
        :style="{ gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))` }"
      >
        <li
          v-for="s in slide.items"
          :key="s.slug"
          class="flex items-center gap-[0.9em] rounded-[0.8em] border border-border bg-surface px-[1em]"
        >
          <RankBadge :rank="s.rank" :medals="medals" class="!h-[2.2em] !w-[2.2em] !text-[1em]" />
          <SchoolLogo :name="s.schoolName" :src="s.logoUrl" class="h-[2.4em] w-[2.4em]" />
          <span class="min-w-0 flex-1 truncate text-[1.45em] font-semibold text-fg">{{
            s.schoolName
          }}</span>
          <span
            v-if="s.score !== undefined"
            class="min-w-[3.5em] text-right text-[1.5em] font-extrabold tabular-nums text-brand-fg"
          >
            {{ formatScore(s.score) }}
          </span>
          <RankChange :change="s.rankChange" />
        </li>
      </ul>
    </template>

    <!-- Ma'lumot -->
    <template v-else>
      <div class="flex flex-1 flex-col items-center justify-center text-center">
        <AppIcon name="trophy" class="mb-[0.6em] h-[4em] w-[4em] text-brand-fg" />
        <p class="text-[2.2em] font-extrabold text-fg">{{ schoolName }}</p>
        <p v-if="period" class="mt-[0.4em] text-[1.6em] font-semibold text-brand-fg">
          {{ period.label }}
        </p>
        <p v-if="period" class="mt-[0.3em] text-[1.2em] text-fg-muted">
          {{ formatDate(period.from) }} - {{ formatDate(period.to) }}
        </p>
        <p v-if="calculatedAt" class="mt-[1em] text-[1.1em] text-fg-muted">
          {{ t('rating.updated') }}: {{ formatUpdated(calculatedAt) }}
        </p>
      </div>
    </template>
  </div>
</template>
