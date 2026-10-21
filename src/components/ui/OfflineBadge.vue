<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import AppIcon from './AppIcon.vue'

const { t } = useI18n()
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-900"
    role="status"
    data-testid="offline-badge"
  >
    <AppIcon name="wifiOff" class="h-3.5 w-3.5" />
    {{ t('state.offline') }}
  </span>
</template>
