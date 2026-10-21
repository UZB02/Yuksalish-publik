<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { publicApi } from '@/api/public.api'
import StateView from '@/components/ui/StateView.vue'
import { useBrandColor } from '@/composables/useBrandColor'
import { useRatingData } from '@/composables/useRatingData'
import TvGlobal from './TvGlobal.vue'
import TvSchool from './TvSchool.vue'

const { t } = useI18n()
const route = useRoute()
const isGlobal = computed(() => route.name === 'global-tv')
const slug = computed(() => String(route.params.slug ?? ''))

// Maktab TV: avval config, so'ng ma'lumotlar. Umumiy TV: umumiy reyting javobi.
const config = useRatingData(
  (signal) => (isGlobal.value ? Promise.resolve(null) : publicApi.config(slug.value, signal)),
  { intervalSeconds: () => 300, sources: [slug, isGlobal] },
)
const globalRating = useRatingData(
  (signal) => (isGlobal.value ? publicApi.global(signal) : Promise.resolve(null)),
  { sources: [isGlobal] },
)

useBrandColor(computed(() => config.data.value?.primaryColor ?? null))

const cfg = computed(() => config.data.value)
const error = computed(() => (isGlobal.value ? globalRating.error.value : config.error.value))
const notFound = computed(() => error.value?.kind === 'not_found')

watch(
  () => [cfg.value, isGlobal.value] as const,
  () => {
    document.title = `${cfg.value?.school.name ?? t('global.title')} | ${t('tv.mode')}`
  },
  { immediate: true },
)
</script>

<template>
  <div
    v-if="notFound || (error && !cfg && !globalRating.data.value)"
    class="flex min-h-screen items-center justify-center bg-page"
  >
    <StateView
      :icon="notFound ? 'search' : 'alert'"
      :title="notFound ? t('state.notFoundTitle') : t('state.errorTitle')"
      :text="notFound ? t('state.notFoundText') : t('state.errorText')"
    >
      <RouterLink :to="{ name: 'home' }" class="btn btn-brand">{{ t('state.toHome') }}</RouterLink>
    </StateView>
  </div>

  <TvGlobal v-else-if="isGlobal && globalRating.data.value" :initial="globalRating.data.value" />
  <TvSchool v-else-if="!isGlobal && cfg" :key="slug" :slug="slug" :config="cfg" />

  <div v-else class="flex min-h-screen items-center justify-center bg-page" aria-busy="true">
    <span class="h-12 w-12 animate-spin rounded-full border-4 border-border border-t-brand-500" />
  </div>
</template>
