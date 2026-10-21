<script setup lang="ts">
import { computed, onScopeDispose, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { publicApi } from '@/api/public.api'
import type { PublicConfig } from '@/api/types'
import ClassesTab from '@/components/rating/ClassesTab.vue'
import FilterBar from '@/components/rating/FilterBar.vue'
import StudentsTab from '@/components/rating/StudentsTab.vue'
import StateView from '@/components/ui/StateView.vue'
import { useRatingData } from '@/composables/useRatingData'
import { useUrlState } from '@/composables/useUrlState'

const props = defineProps<{ slug: string; config: PublicConfig }>()
const emit = defineEmits<{ status: [value: { calculatedAt: string | null; offline: boolean }] }>()
const { t } = useI18n()

type TabKey = 'students' | 'classes'
const url = useUrlState({ tab: '', grade: '', class: '', q: '' })

const tabs = computed(() => {
  const list: { key: TabKey; label: string }[] = []
  if (props.config.showStudents) list.push({ key: 'students', label: t('rating.tabs.students') })
  if (props.config.showClasses) list.push({ key: 'classes', label: t('rating.tabs.classes') })
  return list
})
const active = computed<TabKey | null>(() => {
  const found = tabs.value.find((x) => x.key === url.tab)
  return (found ?? tabs.value[0])?.key ?? null
})

// Sinflar reytingi: "Sinflar" tabi uchun ham, o'quvchilar filtri (sinf/parallel) uchun ham
const classes = props.config.showClasses
  ? useRatingData((signal) => publicApi.classes(props.slug, {}, signal), {
      intervalSeconds: () => props.config.autoRefreshSeconds,
    })
  : null
const classItems = computed(() => classes?.data.value?.items ?? null)

const grades = computed(() => {
  const g = classItems.value ? [...new Set(classItems.value.map((c) => c.grade))] : []
  // Sinflar ro'yxati yo'q bo'lsa (yoqilmagan) umumiy parallellar
  return g.length ? g.sort((a, b) => a - b) : classes ? [] : [5, 6, 7, 8, 9, 10, 11]
})
const classOptions = computed(() =>
  (classItems.value ?? [])
    .filter((c) => !url.grade || String(c.grade) === url.grade)
    .map((c) => ({ value: c.classId, label: c.className })),
)

// Qidiruv: yozish tugagach (debounce) URL ga yoziladi
const searchText = ref(url.q)
let timer: ReturnType<typeof setTimeout> | null = null
watch(searchText, (v) => {
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => (url.q = v.trim()), 350)
})
watch(
  () => url.q,
  (v) => {
    if (v !== searchText.value.trim()) searchText.value = v
  },
)
onScopeDispose(() => timer && clearTimeout(timer))

function openClass(classId: string) {
  url.tab = 'students'
  url.class = classId
  url.grade = ''
}

const studentsStatus = ref({ calculatedAt: null as string | null, offline: false })
function onStudentsStatus(s: { calculatedAt: string | null; offline: boolean }) {
  studentsStatus.value = s
}
watch(
  () => [studentsStatus.value, classes?.data.value?.calculatedAt, classes?.offline.value] as const,
  ([s, classesAt, classesOffline]) =>
    emit('status', {
      calculatedAt: s.calculatedAt ?? classesAt ?? null,
      offline: s.offline || !!classesOffline,
    }),
  { immediate: true, deep: true },
)
</script>

<template>
  <StateView
    v-if="!active"
    icon="inbox"
    :title="t('state.nothingTitle')"
    :text="t('state.nothingText')"
  />
  <div v-else class="space-y-5">
    <div
      v-if="tabs.length > 1"
      role="tablist"
      :aria-label="t('rating.tabs.label')"
      class="inline-flex rounded-2xl border border-border bg-surface p-1"
    >
      <button
        v-for="x in tabs"
        :key="x.key"
        type="button"
        role="tab"
        :aria-selected="active === x.key"
        class="rounded-xl px-5 py-2 text-sm font-semibold transition-colors"
        :class="
          active === x.key
            ? 'bg-brand-500 text-on-brand shadow-card'
            : 'text-fg-muted hover:text-fg'
        "
        @click="url.tab = x.key"
      >
        {{ x.label }}
      </button>
    </div>

    <FilterBar
      v-model:grade="url.grade"
      v-model:class-id="url.class"
      v-model:search="searchText"
      :grades="grades"
      :class-options="active === 'students' ? classOptions : []"
      :show-search="active === 'students'"
    />

    <StudentsTab
      v-if="active === 'students'"
      :slug="slug"
      :config="config"
      :grade="url.grade"
      :class-id="url.class"
      :q="url.q"
      @status="onStudentsStatus"
    />
    <ClassesTab
      v-else
      :items="classItems"
      :loading="classes?.loading.value ?? false"
      :failed="!!classes?.error.value"
      :grade="url.grade"
      :medals="config.showMedals"
      @open="openClass"
      @retry="classes?.refresh()"
    />
  </div>
</template>
