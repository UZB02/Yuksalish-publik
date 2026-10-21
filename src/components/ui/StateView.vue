<script setup lang="ts">
import AppIcon, { type IconName } from './AppIcon.vue'

withDefaults(defineProps<{ icon?: IconName; title: string; text?: string }>(), { icon: 'inbox' })
</script>

<template>
  <div class="mx-auto flex max-w-md flex-col items-center px-4 py-14 text-center" role="status">
    <span
      class="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 text-brand-fg dark:bg-brand-900"
    >
      <AppIcon :name="icon" class="h-8 w-8" />
    </span>
    <h2 class="text-xl font-bold text-fg">{{ title }}</h2>
    <p v-if="text" class="mt-2 text-fg-muted">{{ text }}</p>
    <div v-if="$slots.default" class="mt-6 flex flex-wrap justify-center gap-3"><slot /></div>
  </div>
</template>
