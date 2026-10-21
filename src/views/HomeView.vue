<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { publicApi } from '@/api/public.api'
import type { RatingResult, GlobalItem } from '@/api/types'
import { ApiError } from '@/api/http'
import AppIcon from '@/components/ui/AppIcon.vue'
import SchoolLogo from '@/components/ui/SchoolLogo.vue'
import StateView from '@/components/ui/StateView.vue'
import { usePageInfo } from '@/composables/usePageInfo'
import { useRatingData } from '@/composables/useRatingData'

const { t } = useI18n()
const router = useRouter()

const schools = useRatingData((signal) => publicApi.schools(signal))
// Umumiy reyting yoqilmagan bo'lsa 404 - bu xato emas, shunchaki "mavjud emas"
const global = useRatingData<RatingResult<GlobalItem> | null>(async (signal) => {
  try {
    return await publicApi.global(signal)
  } catch (e) {
    if (e instanceof ApiError && e.kind === 'not_found') return null
    throw e
  }
})

const query = ref('')
const list = computed(() => schools.data.value ?? [])
const showSearch = computed(() => list.value.length > 8)
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return q ? list.value.filter((s) => s.name.toLowerCase().includes(q)) : list.value
})
const hasGlobal = computed(() => !!global.data.value)
const settled = computed(
  () =>
    schools.data.value !== null &&
    (global.data.value !== null || global.error.value !== null || !global.loading.value),
)

// Bitta maktab va umumiy reyting yo'q bo'lsa to'g'ridan-to'g'ri maktab sahifasiga
watchEffect(() => {
  if (!schools.data.value || global.loading.value) return
  if (list.value.length === 1 && !hasGlobal.value) {
    void router.replace({ name: 'school', params: { slug: list.value[0]!.slug } })
  }
})

usePageInfo(
  ref(null),
  computed(() => t('app.name')),
)
</script>

<template>
  <div class="pb-6">
    <div class="mb-8 text-center">
      <h1 class="text-3xl font-extrabold text-fg sm:text-4xl">{{ t('home.title') }}</h1>
      <p class="mx-auto mt-2 max-w-xl text-fg-muted">{{ t('home.subtitle') }}</p>
    </div>

    <StateView
      v-if="schools.error.value && !schools.data.value"
      icon="alert"
      :title="t('state.errorTitle')"
      :text="t('state.errorText')"
    >
      <button type="button" class="btn btn-brand" @click="schools.refresh()">
        {{ t('state.retry') }}
      </button>
    </StateView>

    <ul v-else-if="schools.loading.value" class="grid gap-3 sm:grid-cols-2" aria-busy="true">
      <li v-for="n in 4" :key="n" class="h-24 animate-pulse rounded-2xl bg-surface-muted" />
    </ul>

    <template v-else>
      <RouterLink
        v-if="hasGlobal"
        :to="{ name: 'global' }"
        class="mb-6 flex items-center gap-4 rounded-3xl bg-brand-500 p-5 text-on-brand shadow-pop transition hover:-translate-y-0.5 sm:p-7"
        data-testid="global-card"
      >
        <span class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20">
          <AppIcon name="globe" class="h-8 w-8" />
        </span>
        <span class="min-w-0 flex-1">
          <span class="block text-xl font-extrabold">{{ t('home.globalTitle') }}</span>
          <span class="block opacity-90">{{ t('home.globalText') }}</span>
        </span>
        <AppIcon name="right" class="h-6 w-6" />
      </RouterLink>

      <StateView
        v-if="settled && list.length === 0"
        icon="school"
        :title="t('home.emptyTitle')"
        :text="t('home.emptyText')"
      />
      <template v-else>
        <div v-if="showSearch" class="relative mb-4">
          <AppIcon
            name="search"
            class="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-fg-muted"
          />
          <input
            v-model="query"
            type="search"
            :placeholder="t('home.searchPlaceholder')"
            :aria-label="t('home.searchPlaceholder')"
            class="h-12 w-full rounded-xl border border-border bg-surface pl-11 pr-3 text-fg"
          />
        </div>
        <ul class="grid gap-3 sm:grid-cols-2">
          <li v-for="s in filtered" :key="s.slug" data-testid="school-card">
            <RouterLink
              :to="{ name: 'school', params: { slug: s.slug } }"
              class="card flex items-center gap-4 p-4 transition hover:-translate-y-0.5"
            >
              <SchoolLogo :name="s.name" :src="s.logoUrl" class="h-14 w-14 text-lg" />
              <span class="min-w-0 flex-1 truncate text-lg font-bold text-fg">{{ s.name }}</span>
              <AppIcon name="right" class="h-5 w-5 text-fg-muted" />
            </RouterLink>
          </li>
        </ul>
        <p v-if="showSearch && filtered.length === 0" class="py-8 text-center text-fg-muted">
          {{ t('state.noMatches') }}
        </p>
      </template>
    </template>
  </div>
</template>
