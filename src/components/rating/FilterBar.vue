<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import AppIcon from '@/components/ui/AppIcon.vue'

export interface ClassOption {
  value: string
  label: string
}

defineProps<{
  grades: number[]
  grade: string
  classOptions: ClassOption[]
  classId: string
  search: string
  showSearch?: boolean
}>()
const emit = defineEmits<{
  'update:grade': [value: string]
  'update:classId': [value: string]
  'update:search': [value: string]
}>()
const { t } = useI18n()
</script>

<template>
  <div class="space-y-3" data-testid="filter-bar">
    <div
      v-if="grades.length > 1"
      class="flex flex-wrap gap-2"
      role="group"
      :aria-label="t('filter.grade')"
    >
      <button
        type="button"
        class="chip"
        :class="{ 'chip-active': grade === '' }"
        :aria-pressed="grade === ''"
        @click="emit('update:grade', '')"
      >
        {{ t('filter.allGrades') }}
      </button>
      <button
        v-for="g in grades"
        :key="g"
        type="button"
        class="chip"
        :class="{ 'chip-active': grade === String(g) }"
        :aria-pressed="grade === String(g)"
        data-testid="grade-chip"
        @click="emit('update:grade', grade === String(g) ? '' : String(g))"
      >
        {{ t('filter.gradeN', { n: g }) }}
      </button>
    </div>

    <div class="flex flex-col gap-3 sm:flex-row">
      <div v-if="showSearch !== false" class="relative flex-1">
        <AppIcon
          name="search"
          class="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-fg-muted"
        />
        <input
          :value="search"
          type="search"
          inputmode="search"
          autocomplete="off"
          :placeholder="t('filter.searchPlaceholder')"
          :aria-label="t('filter.search')"
          class="h-11 w-full rounded-xl border border-border bg-surface pl-11 pr-3 text-fg placeholder:text-fg-muted/70"
          @input="emit('update:search', ($event.target as HTMLInputElement).value)"
        />
      </div>
      <select
        v-if="classOptions.length > 0"
        :value="classId"
        :aria-label="t('filter.class')"
        class="h-11 rounded-xl border border-border bg-surface px-3 text-fg sm:w-56"
        @change="emit('update:classId', ($event.target as HTMLSelectElement).value)"
      >
        <option value="">{{ t('filter.allClasses') }}</option>
        <option v-for="c in classOptions" :key="c.value" :value="c.value">{{ c.label }}</option>
      </select>
    </div>
  </div>
</template>
