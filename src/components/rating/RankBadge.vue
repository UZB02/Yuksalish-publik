<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import AppIcon from '@/components/ui/AppIcon.vue'

withDefaults(defineProps<{ rank: number; medals?: boolean }>(), { medals: true })
const { t } = useI18n()

const MEDAL = ['text-gold', 'text-silver', 'text-bronze']
</script>

<template>
  <span
    class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold tabular-nums"
    :class="rank <= 3 && medals ? 'bg-surface-muted' : 'bg-surface-muted text-fg-muted'"
    :data-medal="rank <= 3 && medals ? rank : undefined"
  >
    <AppIcon
      v-if="rank <= 3 && medals"
      name="medal"
      class="h-5 w-5"
      :class="MEDAL[rank - 1]"
      role="img"
      :aria-label="t('rating.place', { n: rank })"
    />
    <template v-else>{{ rank }}</template>
  </span>
</template>
