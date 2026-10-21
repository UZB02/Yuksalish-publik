<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AppIcon from '@/components/ui/AppIcon.vue'
import SchoolLogo from '@/components/ui/SchoolLogo.vue'
import ThemeToggle from '@/components/ui/ThemeToggle.vue'
import { headerInfo } from '@/composables/usePageInfo'

const { t } = useI18n()
const route = useRoute()

const tvTarget = computed(() => {
  const slug = (route.params.slug as string | undefined) ?? headerInfo.value?.slug
  if (route.name === 'global') return { name: 'global-tv' }
  return slug ? { name: 'school-tv', params: { slug } } : null
})
</script>

<template>
  <header
    class="sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur supports-[backdrop-filter]:bg-surface/75"
  >
    <div class="mx-auto flex h-16 max-w-5xl items-center gap-3 px-4">
      <RouterLink :to="{ name: 'home' }" class="flex min-w-0 items-center gap-3 rounded-xl">
        <template v-if="headerInfo?.slug">
          <SchoolLogo :name="headerInfo.name" :src="headerInfo.logoUrl" class="h-9 w-9" />
          <span class="truncate text-base font-bold text-fg">{{ headerInfo.name }}</span>
        </template>
        <template v-else>
          <span
            class="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-on-brand"
          >
            <AppIcon name="trophy" class="h-5 w-5" />
          </span>
          <span class="truncate text-base font-bold text-fg">{{ t('app.name') }}</span>
        </template>
      </RouterLink>

      <div class="ml-auto flex items-center gap-1">
        <RouterLink
          v-if="tvTarget"
          :to="tvTarget"
          class="inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-fg-muted transition-colors hover:bg-surface-muted hover:text-fg"
        >
          <AppIcon name="tv" class="h-5 w-5" />
          <span class="hidden sm:inline">{{ t('tv.mode') }}</span>
          <span class="sr-only sm:hidden">{{ t('tv.mode') }}</span>
        </RouterLink>
        <ThemeToggle />
      </div>
    </div>
  </header>
</template>
