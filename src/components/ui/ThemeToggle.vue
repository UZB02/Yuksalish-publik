<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTheme } from '@/composables/useTheme'
import AppIcon from './AppIcon.vue'

const { t } = useI18n()
const { mode, cycle } = useTheme()
const icon = computed(() =>
  mode.value === 'light' ? 'sun' : mode.value === 'dark' ? 'moon' : 'monitor',
)
</script>

<template>
  <button
    type="button"
    class="inline-flex h-10 w-10 items-center justify-center rounded-xl text-fg-muted transition-colors hover:bg-surface-muted hover:text-fg"
    :title="t(`theme.${mode}`)"
    :aria-label="t('theme.toggle', { current: t(`theme.${mode}`) })"
    @click="cycle"
  >
    <AppIcon :name="icon" class="h-5 w-5" />
  </button>
</template>
