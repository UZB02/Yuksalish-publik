<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AppIcon from '@/components/ui/AppIcon.vue'

const props = defineProps<{ change?: number | null }>()
const { t } = useI18n()

// Kalit javobda umuman bo'lmasa (sozlama o'chiq) hech narsa ko'rsatilmaydi;
// null/0 - o'zgarishsiz belgisi.
const kind = computed<'hidden' | 'up' | 'down' | 'same'>(() => {
  if (props.change === undefined) return 'hidden'
  if (props.change === null || props.change === 0) return 'same'
  return props.change > 0 ? 'up' : 'down'
})
</script>

<template>
  <span
    v-if="kind !== 'hidden'"
    class="inline-flex min-w-[2.5rem] items-center justify-end gap-0.5 text-sm font-semibold tabular-nums"
    :class="{
      'text-success': kind === 'up',
      'text-danger': kind === 'down',
      'text-fg-muted': kind === 'same',
    }"
    :data-kind="kind"
    :aria-label="
      kind === 'up'
        ? t('rating.change.up', { n: change })
        : kind === 'down'
          ? t('rating.change.down', { n: Math.abs(change ?? 0) })
          : t('rating.change.same')
    "
  >
    <AppIcon v-if="kind === 'up'" name="up" class="h-3.5 w-3.5" />
    <AppIcon v-else-if="kind === 'down'" name="down" class="h-3.5 w-3.5" />
    <AppIcon v-else name="minus" class="h-3.5 w-3.5" />
    <span v-if="kind === 'up' || kind === 'down'">{{ Math.abs(change ?? 0) }}</span>
  </span>
</template>
