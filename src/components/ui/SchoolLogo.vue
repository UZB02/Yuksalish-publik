<script setup lang="ts">
import { ref, watch } from 'vue'
import { initials } from '@/utils/format'

const props = defineProps<{ name: string; src?: string | null; eager?: boolean }>()
const failed = ref(false)
watch(
  () => props.src,
  () => (failed.value = false),
)
</script>

<template>
  <span
    class="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-100 font-bold text-brand-800 dark:bg-brand-900 dark:text-brand-100"
  >
    <img
      v-if="src && !failed"
      :src="src"
      :alt="name"
      :loading="eager ? 'eager' : 'lazy'"
      width="64"
      height="64"
      class="h-full w-full object-contain"
      @error="failed = true"
    />
    <span v-else aria-hidden="true">{{ initials(name) }}</span>
  </span>
</template>
