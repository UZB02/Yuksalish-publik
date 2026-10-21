<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { publicApi } from '@/api/public.api'
import type { GlobalItem, RatingResult } from '@/api/types'
import TvStage from '@/components/tv/TvStage.vue'
import { useRatingData } from '@/composables/useRatingData'
import { buildSlides } from '@/utils/slides'

const props = defineProps<{ initial: RatingResult<GlobalItem> }>()
const { t } = useI18n()

const rating = useRatingData((s) => publicApi.global(s), { intervalSeconds: () => 60 })
const data = computed(() => rating.data.value ?? props.initial)

const ROWS = 8
const slides = computed(() =>
  buildSlides({ schools: data.value.items, rowsPerSlide: ROWS, classesPerSlide: 8 }),
)
</script>

<template>
  <TvStage
    :slides="slides"
    :seconds="15"
    :rows="ROWS"
    :medals="true"
    :name="t('global.title')"
    :period="data.period"
    :calculated-at="data.calculatedAt"
    :offline="rating.offline.value"
    :exit-to="{ name: 'global' }"
  />
</template>
