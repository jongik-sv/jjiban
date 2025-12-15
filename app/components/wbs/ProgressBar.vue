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
 * 값 클램핑: 0-100 범위로 제한
 */
const clampedValue = computed(() => Math.min(100, Math.max(0, props.value)))

/**
 * 진행률 구간별 색상 계산
 * 0-30%: 빨강 (#ef4444)
 * 30-70%: 황색 (#f59e0b)
 * 70-100%: 초록 (#22c55e)
 */
const barColor = computed(() => {
  if (clampedValue.value < 30) return '#ef4444'
  if (clampedValue.value < 70) return '#f59e0b'
  return '#22c55e'
})

/**
 * PrimeVue Pass Through API 설정
 */
const passThrough = computed((): ProgressBarPassThroughOptions => ({
  value: {
    style: {
      backgroundColor: barColor.value
    }
  }
}))
</script>

<style scoped>
/* PrimeVue ProgressBar 스타일은 전역 테마에서 처리 */
</style>
