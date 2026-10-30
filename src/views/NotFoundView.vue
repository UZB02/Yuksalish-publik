<script setup lang="ts">
import { useBranding } from '@/composables/useBranding'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import StateView from '@/components/ui/StateView.vue'
import { usePageInfo } from '@/composables/usePageInfo'
import { ref } from 'vue'

const { t } = useI18n()
const { appName } = useBranding()
usePageInfo(
  ref(null),
  computed(() => `${t('state.notFoundTitle')} | ${appName.value}`),
)
</script>

<template>
  <StateView icon="search" :title="t('state.notFoundTitle')" :text="t('state.notFoundText')">
    <RouterLink :to="{ name: 'home' }" class="btn btn-brand">{{ t('state.toHome') }}</RouterLink>
  </StateView>
</template>
