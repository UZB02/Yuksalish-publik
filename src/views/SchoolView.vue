<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { publicApi } from '@/api/public.api'
import AppIcon from '@/components/ui/AppIcon.vue'
import ListSkeleton from '@/components/ui/ListSkeleton.vue'
import OfflineBadge from '@/components/ui/OfflineBadge.vue'
import SchoolLogo from '@/components/ui/SchoolLogo.vue'
import StateView from '@/components/ui/StateView.vue'
import { useBrandColor } from '@/composables/useBrandColor'
import { usePageInfo, type HeaderInfo } from '@/composables/usePageInfo'
import { useRatingData } from '@/composables/useRatingData'
import { formatDate, formatUpdated } from '@/utils/format'
import SchoolContent from './SchoolContent.vue'

const { t } = useI18n()
const route = useRoute()
const slug = computed(() => String(route.params.slug))

const interval = ref(120)
const config = useRatingData((signal) => publicApi.config(slug.value, signal), {
  intervalSeconds: () => interval.value,
  sources: [slug],
})
watch(
  () => config.data.value?.autoRefreshSeconds,
  (s) => s && (interval.value = s),
)

const cfg = computed(() => config.data.value)
const notFound = computed(() => config.error.value?.kind === 'not_found')

useBrandColor(computed(() => cfg.value?.primaryColor ?? null))

const status = ref({ calculatedAt: null as string | null, offline: false })
const updatedAt = computed(() => status.value.calculatedAt ?? cfg.value?.calculatedAt ?? null)
const heading = computed(() => cfg.value?.title || cfg.value?.school.name || '')

const info = computed<HeaderInfo | null>(() =>
  cfg.value
    ? {
        name: cfg.value.school.name,
        slug: cfg.value.school.slug,
        logoUrl: cfg.value.school.logoUrl,
        updatedAt: updatedAt.value,
        globalAvailable: cfg.value.globalAvailable,
      }
    : null,
)
const pageTitle = computed(() =>
  cfg.value
    ? `${heading.value} - ${cfg.value.period.label} | ${t('app.name')}`
    : notFound.value
      ? `${t('state.notFoundTitle')} | ${t('app.name')}`
      : t('app.name'),
)
usePageInfo(info, pageTitle)
</script>

<template>
  <StateView
    v-if="notFound"
    icon="search"
    :title="t('state.notFoundTitle')"
    :text="t('state.notFoundText')"
  >
    <RouterLink :to="{ name: 'home' }" class="btn btn-brand">{{ t('state.toHome') }}</RouterLink>
  </StateView>

  <StateView
    v-else-if="config.error.value && !cfg"
    icon="alert"
    :title="t('state.errorTitle')"
    :text="t('state.errorText')"
  >
    <button type="button" class="btn btn-brand" @click="config.refresh()">
      {{ t('state.retry') }}
    </button>
  </StateView>

  <div v-else-if="!cfg" class="space-y-4" aria-busy="true">
    <div class="h-36 animate-pulse rounded-3xl bg-surface-muted" />
    <ListSkeleton />
  </div>

  <div v-else class="space-y-6">
    <section
      class="relative overflow-hidden rounded-3xl bg-brand-500 p-5 text-on-brand shadow-pop sm:p-8"
      data-testid="hero"
    >
      <span
        class="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-white/10"
        aria-hidden="true"
      />
      <span
        class="pointer-events-none absolute -bottom-24 right-24 h-48 w-48 rounded-full bg-black/10"
        aria-hidden="true"
      />
      <div class="relative flex items-start gap-4">
        <SchoolLogo
          :name="cfg.school.name"
          :src="cfg.school.logoUrl"
          class="h-16 w-16 bg-white/90 text-lg text-slate-800 sm:h-20 sm:w-20"
        />
        <div class="min-w-0 flex-1">
          <h1 class="text-2xl font-extrabold leading-tight sm:text-3xl">{{ heading }}</h1>
          <p v-if="cfg.subtitle" class="mt-1 text-base opacity-90">{{ cfg.subtitle }}</p>
        </div>
      </div>
      <div class="relative mt-5 flex flex-wrap items-center gap-2 text-sm">
        <span
          class="inline-flex items-center gap-1.5 rounded-full bg-black/20 px-3 py-1 font-semibold"
        >
          <AppIcon name="trophy" class="h-4 w-4" />
          {{ cfg.period.label }}
        </span>
        <span class="opacity-90"
          >{{ formatDate(cfg.period.from) }} - {{ formatDate(cfg.period.to) }}</span
        >
        <span v-if="updatedAt" class="opacity-90">
          {{ t('rating.updated') }}: {{ formatUpdated(updatedAt) }}
        </span>
        <OfflineBadge v-if="status.offline" />
        <RouterLink
          v-if="cfg.globalAvailable"
          :to="{ name: 'global' }"
          class="ml-auto inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-1.5 font-semibold text-slate-900 hover:bg-white"
        >
          <AppIcon name="globe" class="h-4 w-4" /> {{ t('rating.schoolsRating') }}
        </RouterLink>
      </div>
    </section>

    <SchoolContent :key="slug" :slug="slug" :config="cfg" @status="status = $event" />
  </div>
</template>
