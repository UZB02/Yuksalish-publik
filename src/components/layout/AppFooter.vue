<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { headerInfo } from '@/composables/usePageInfo'
import { formatUpdated } from '@/utils/format'

const { t } = useI18n()
</script>

<template>
  <footer class="mt-12 border-t border-border py-6 text-center text-sm text-fg-muted">
    <p>{{ t('app.footer') }}</p>
    <p v-if="headerInfo?.updatedAt" class="mt-1">
      {{ t('rating.updated') }}: {{ formatUpdated(headerInfo.updatedAt) }}
    </p>
  </footer>
</template>
