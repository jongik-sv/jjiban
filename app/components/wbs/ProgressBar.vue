<template>
  <ProgressBar
    :value="clampedValue"
    :show-value="showValue"
    :pt="passThrough"
    :aria-label="`Progress: ${clampedValue}%`"
    role="progressbar"
    :aria-valuenow="clampedValue"
    aria-valuemin="0"
    aria-valuemax="100"
    :data-testid="`progress-bar-${clampedValue}`"
  />
</template>

<script setup lang="ts">
import ProgressBar from 'primevue/progressbar'
import type { ProgressBarPassThroughOptions } from 'primevue/progressbar'

interface Props {
  value: number
  showValue?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showValue: true
})

/**
 * 진행률 임계값 상수
 * CSS 클래스 중앙화: HEX 제거, main.css에서 관리
 */
const PROGRESS_THRESHOLDS = { LOW: 30, MEDIUM: 70 } as const

/**
 * 값 클램핑: 0-100 범위로 제한
 */
const clampedValue = computed(() => Math.min(100, Math.max(0, props.value)))

/**
 * 진행률 구간별 CSS 클래스 계산
 * 0-29%: progress-bar-low (빨강)
 * 30-69%: progress-bar-medium (황색)
 * 70-100%: progress-bar-high (초록)
 */
const barClass = computed(() => {
  if (clampedValue.value < PROGRESS_THRESHOLDS.LOW) return 'progress-bar-low'
  if (clampedValue.value < PROGRESS_THRESHOLDS.MEDIUM) return 'progress-bar-medium'
  return 'progress-bar-high'
})

/**
 * PrimeVue Pass Through API 설정
 * CSS 클래스 주입 (style → class 변경)
 */
const passThrough = computed((): ProgressBarPassThroughOptions => ({
  value: {
    class: barClass.value
  }
}))
</script>

<style scoped>
/* PrimeVue ProgressBar 스타일은 전역 테마에서 처리 */
</style>
