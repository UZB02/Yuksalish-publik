<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ClassItem } from '@/api/types'
import ListSkeleton from '@/components/ui/ListSkeleton.vue'
import StateView from '@/components/ui/StateView.vue'
import ClassCard from './ClassCard.vue'

const props = defineProps<{
  items: ClassItem[] | null
  loading: boolean
  failed: boolean
  grade: string
  medals: boolean
}>()
const emit = defineEmits<{ open: [classId: string]; retry: [] }>()
const { t } = useI18n()

const shown = computed(() =>
  (props.items ?? []).filter((c) => !props.grade || String(c.grade) === props.grade),
)
</script>

<template>
  <section :aria-busy="loading">
    <ListSkeleton v-if="loading" :rows="4" />
    <StateView
      v-else-if="failed && !items"
      icon="alert"
      :title="t('state.errorTitle')"
      :text="t('state.errorText')"
    >
      <button type="button" class="btn btn-brand" @click="emit('retry')">
        {{ t('state.retry') }}
      </button>
    </StateView>
    <StateView
      v-else-if="shown.length === 0"
      icon="school"
      :title="grade ? t('state.noMatches') : t('state.emptyTitle')"
      :text="grade ? t('state.noMatchesText') : t('state.emptyText')"
    />
    <ul v-else class="grid gap-3 sm:grid-cols-2">
      <ClassCard
        v-for="c in shown"
        :key="c.classId"
        :item="c"
        :medals="medals"
        @open="emit('open', $event)"
      />
    </ul>
  </section>
</template>
