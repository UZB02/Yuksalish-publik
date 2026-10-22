<script setup lang="ts">
import { ref, watch } from 'vue'
import { initials } from '@/utils/format'
import { resolvePhotoUrl } from '@/utils/photo'

/**
 * Aylana avatar: rasm bo'lsa rasm, aks holda bosh harflar. O'lcham ota class orqali beriladi
 * (px yoki em), shuning uchun rasm yuklanguncha ham joy band bo'lib qoladi - layout siljimaydi.
 */
const props = defineProps<{ name: string; src?: string | null }>()
const failed = ref(false)
watch(
  () => props.src,
  () => (failed.value = false),
)
</script>

<template>
  <span
    class="inline-flex aspect-square shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-brand-100 font-bold text-brand-800 dark:bg-brand-900 dark:text-brand-100"
    data-testid="person-avatar"
  >
    <img
      v-if="src && !failed"
      :src="resolvePhotoUrl(src) ?? ''"
      :alt="name"
      loading="lazy"
      decoding="async"
      class="h-full w-full object-cover"
      @error="failed = true"
    />
    <span v-else aria-hidden="true">{{ initials(name) }}</span>
  </span>
</template>
