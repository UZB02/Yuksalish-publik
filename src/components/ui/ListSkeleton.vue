<script setup lang="ts">
withDefaults(defineProps<{ rows?: number }>(), { rows: 6 })
</script>

<template>
  <ul class="space-y-2" aria-hidden="true">
    <li
      v-for="n in rows"
      :key="n"
      class="flex animate-pulse items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3"
    >
      <span class="h-9 w-9 rounded-full bg-surface-muted" />
      <span class="flex-1 space-y-2">
        <span class="block h-3.5 w-2/5 rounded bg-surface-muted" />
        <span class="block h-3 w-1/4 rounded bg-surface-muted" />
      </span>
      <span class="h-5 w-12 rounded bg-surface-muted" />
    </li>
  </ul>
</template>
