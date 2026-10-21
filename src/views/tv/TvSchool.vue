<script setup lang="ts">
import { computed } from 'vue'
import { publicApi } from '@/api/public.api'
import type { PublicConfig } from '@/api/types'
import TvStage from '@/components/tv/TvStage.vue'
import { useRatingData } from '@/composables/useRatingData'
import { buildSlides } from '@/utils/slides'

const props = defineProps<{ slug: string; config: PublicConfig }>()

// TV: bitta so'rovda ko'p o'quvchi (server max 200). Fonda yangilanadi, slaydlar uzilmaydi.
const students = props.config.showStudents
  ? useRatingData((s) => publicApi.students(props.slug, { limit: 200 }, s), {
      intervalSeconds: () => props.config.autoRefreshSeconds,
    })
  : null
const classes = props.config.showClasses
  ? useRatingData((s) => publicApi.classes(props.slug, {}, s), {
      intervalSeconds: () => props.config.autoRefreshSeconds,
    })
  : null

const ROWS = 8
const slides = computed(() =>
  buildSlides({
    students: students?.data.value?.items,
    classes: classes?.data.value?.items,
    rowsPerSlide: ROWS,
    classesPerSlide: 8,
  }),
)
const calculatedAt = computed(
  () =>
    students?.data.value?.calculatedAt ??
    classes?.data.value?.calculatedAt ??
    props.config.calculatedAt,
)
const offline = computed(() => !!(students?.offline.value || classes?.offline.value))
const period = computed(
  () => students?.data.value?.period ?? classes?.data.value?.period ?? props.config.period,
)
</script>

<template>
  <TvStage
    :slides="slides"
    :seconds="config.tvSlideSeconds"
    :rows="ROWS"
    :medals="config.showMedals"
    :name="config.school.name"
    :logo-url="config.school.logoUrl"
    :title="config.title ?? undefined"
    :period="period"
    :calculated-at="calculatedAt"
    :offline="offline"
    :exit-to="{ name: 'school', params: { slug } }"
  />
</template>
