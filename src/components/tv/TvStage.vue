<script setup lang="ts">
import { computed, onMounted, onScopeDispose, toRef } from 'vue'
import { useRouter, type RouteLocationRaw } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AppIcon from '@/components/ui/AppIcon.vue'
import OfflineBadge from '@/components/ui/OfflineBadge.vue'
import SchoolLogo from '@/components/ui/SchoolLogo.vue'
import { useFullscreen } from '@/composables/useFullscreen'
import { useTheme } from '@/composables/useTheme'
import { useTvPlayer } from '@/composables/useTvPlayer'
import { useWakeLock } from '@/composables/useWakeLock'
import type { Period } from '@/api/types'
import { formatUpdated } from '@/utils/format'
import type { Slide } from '@/utils/slides'
import TvSlide from './TvSlide.vue'

const props = defineProps<{
  slides: Slide[]
  seconds: number
  rows: number
  medals: boolean
  name: string
  logoUrl?: string | null
  title?: string
  period: Period | null
  calculatedAt: string | null
  offline: boolean
  exitTo: RouteLocationRaw
}>()
const { t } = useI18n()
const router = useRouter()

const total = computed(() => props.slides.length)
const player = useTvPlayer(total, toRef(props, 'seconds'))
const fullscreen = useFullscreen()
const theme = useTheme()
useWakeLock()

const slide = computed(() => props.slides[player.index.value]!)
const exit = () => router.push(props.exitTo)

function onKey(e: KeyboardEvent) {
  if (e.key === 'f' || e.key === 'F') {
    void fullscreen.toggle()
    player.showControls()
  } else if (e.key === 'Escape' && !document.fullscreenElement) exit()
  // Fullscreen ichida Esc brauzerning o'zi uni yopadi; ikkinchi Esc chiqish
}
onMounted(() => window.addEventListener('keydown', onKey))
onScopeDispose(() => window.removeEventListener('keydown', onKey))

const btn =
  'inline-flex h-[2.6em] w-[2.6em] items-center justify-center rounded-full bg-surface/90 text-fg shadow-card ring-1 ring-border hover:bg-surface-muted'
</script>

<template>
  <div
    class="tv-root fixed inset-0 flex flex-col overflow-hidden bg-page text-fg"
    :class="{ 'tv-idle': !player.controlsVisible.value }"
    data-testid="tv-stage"
    @mousemove="player.showControls()"
    @pointerdown="player.showControls()"
  >
    <header class="flex items-center gap-[1em] px-[2em] pt-[1.2em]">
      <SchoolLogo :name="name" :src="logoUrl" class="h-[3.2em] w-[3.2em]" />
      <div class="min-w-0 flex-1">
        <p class="truncate text-[1.9em] font-extrabold leading-tight">{{ title || name }}</p>
        <p v-if="period" class="text-[1.1em] font-semibold text-brand-fg">{{ period.label }}</p>
      </div>
      <OfflineBadge v-if="offline" class="!text-[0.9em]" />
    </header>

    <main class="min-h-0 flex-1 px-[2em] py-[1em]" aria-live="off">
      <Transition name="tv-fade" mode="out-in">
        <TvSlide
          :key="player.index.value"
          class="animate-slidein"
          :slide="slide"
          :rows="rows"
          :medals="medals"
          :period="period"
          :calculated-at="calculatedAt"
          :school-name="title || name"
        />
      </Transition>
    </main>

    <footer class="px-[2em] pb-[1em]">
      <div class="mb-[0.5em] flex items-center justify-between text-[0.9em] text-fg-muted">
        <span v-if="calculatedAt"
          >{{ t('rating.updated') }}: {{ formatUpdated(calculatedAt) }}</span
        >
        <span v-else />
        <ol class="flex items-center gap-[0.5em]" :aria-label="t('tv.slides')">
          <li v-for="n in total" :key="n">
            <button
              type="button"
              class="h-[0.7em] rounded-full transition-all"
              :class="n - 1 === player.index.value ? 'w-[2em] bg-brand-500' : 'w-[0.7em] bg-border'"
              :aria-label="t('tv.goTo', { n })"
              :aria-current="n - 1 === player.index.value"
              @click="player.goTo(n - 1)"
            />
          </li>
        </ol>
      </div>
      <div class="h-[0.35em] overflow-hidden rounded-full bg-border" aria-hidden="true">
        <div
          :key="player.cycle.value"
          class="h-full origin-left rounded-full bg-brand-500"
          :style="{
            animation:
              player.paused.value || total <= 1 ? 'none' : `tvprogress ${seconds}s linear forwards`,
            transform: player.paused.value ? 'scaleX(1)' : undefined,
            opacity: player.paused.value ? 0.4 : 1,
          }"
          data-testid="tv-progress"
        />
      </div>
    </footer>

    <!-- Boshqaruv: sichqoncha qimirlaganda 3 soniya -->
    <Transition name="tv-fade">
      <div
        v-show="player.controlsVisible.value"
        class="absolute right-[1.2em] top-[1em] flex items-center gap-[0.5em] text-[1em]"
        role="toolbar"
        :aria-label="t('tv.controls')"
      >
        <button type="button" :class="btn" :aria-label="t('tv.prev')" @click="player.prev()">
          <AppIcon name="left" class="h-[1.3em] w-[1.3em]" />
        </button>
        <button
          type="button"
          :class="btn"
          :aria-label="player.paused.value ? t('tv.play') : t('tv.pause')"
          data-testid="tv-toggle"
          @click="player.toggle()"
        >
          <AppIcon :name="player.paused.value ? 'play' : 'pause'" class="h-[1.3em] w-[1.3em]" />
        </button>
        <button type="button" :class="btn" :aria-label="t('tv.next')" @click="player.next()">
          <AppIcon name="right" class="h-[1.3em] w-[1.3em]" />
        </button>
        <button
          v-if="fullscreen.supported"
          type="button"
          :class="btn"
          :aria-label="t('tv.fullscreen')"
          @click="fullscreen.toggle()"
        >
          <AppIcon
            :name="fullscreen.active.value ? 'minimize' : 'maximize'"
            class="h-[1.3em] w-[1.3em]"
          />
        </button>
        <button
          type="button"
          :class="btn"
          :aria-label="t('theme.toggle', { current: t(`theme.${theme.mode.value}`) })"
          @click="theme.cycle()"
        >
          <AppIcon
            :name="
              theme.mode.value === 'dark'
                ? 'moon'
                : theme.mode.value === 'light'
                  ? 'sun'
                  : 'monitor'
            "
            class="h-[1.3em] w-[1.3em]"
          />
        </button>
        <button type="button" :class="btn" :aria-label="t('tv.exit')" @click="exit">
          <AppIcon name="x" class="h-[1.3em] w-[1.3em]" />
        </button>
      </div>
    </Transition>
  </div>
</template>

<style>
@keyframes tvprogress {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}
.tv-fade-enter-active,
.tv-fade-leave-active {
  transition: opacity 0.35s ease;
}
.tv-fade-enter-from,
.tv-fade-leave-to {
  opacity: 0;
}
</style>
