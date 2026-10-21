<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AppFooter from '@/components/layout/AppFooter.vue'
import AppHeader from '@/components/layout/AppHeader.vue'

const route = useRoute()
const { t } = useI18n()
</script>

<template>
  <!-- TV rejimida header/footer yo'q: to'liq ekran sahna -->
  <template v-if="route.meta.tv">
    <RouterView />
  </template>
  <div v-else class="flex min-h-screen flex-col">
    <a
      href="#main"
      class="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2"
    >
      {{ t('app.skip') }}
    </a>
    <AppHeader />
    <main id="main" class="mx-auto w-full max-w-5xl flex-1 px-4 pt-6">
      <RouterView />
    </main>
    <AppFooter />
  </div>
</template>
