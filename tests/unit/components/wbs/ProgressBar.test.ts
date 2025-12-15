/**
 * ProgressBar 컴포넌트 단위 테스트
 * Task: TSK-04-02
 * Test Spec: UT-008, UT-009
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import WbsProgressBar from '~/components/wbs/ProgressBar.vue'
import PrimeProgressBar from 'primevue/progressbar'

describe('ProgressBar', () => {
  // UT-008: 진행률 색상 매핑 검증
  it.each<[number, string]>([
    [15, '#ef4444'],  // 0-30% 구간 (빨강)
    [50, '#f59e0b'],  // 30-70% 구간 (황색)
    [85, '#22c55e']   // 70-100% 구간 (초록)
  ])('should apply correct color for %i%%', (value, expectedColor) => {
    const wrapper = mount(WbsProgressBar, {
      props: { value },
      global: {
        components: { ProgressBar: PrimeProgressBar }
      }
    })

    const progressBar = wrapper.findComponent(PrimeProgressBar)
    expect(progressBar.exists()).toBe(true)
    expect(progressBar.props('value')).toBe(value)

    // Check Pass Through API for color
    const pt = progressBar.props('pt')
    expect(pt).toBeDefined()
    expect(pt.value?.style?.backgroundColor).toBe(expectedColor)
  })

  // UT-009: 진행률 범위 경계 테스트
  it.each<[number, string]>([
    [0, '#ef4444'],    // 경계: 0% → 빨강
    [30, '#f59e0b'],   // 경계: 30% → 황색
    [70, '#22c55e'],   // 경계: 70% → 초록
    [100, '#22c55e']   // 경계: 100% → 초록
  ])('should handle boundary value %i%% correctly', (value, expectedColor) => {
    const wrapper = mount(WbsProgressBar, {
      props: { value },
      global: {
        components: { ProgressBar: PrimeProgressBar }
      }
    })

    const pt = wrapper.findComponent(PrimeProgressBar).props('pt')
    expect(pt.value?.style?.backgroundColor).toBe(expectedColor)
  })

  it('should show value by default', () => {
    const wrapper = mount(WbsProgressBar, {
      props: { value: 45 },
      global: {
        components: { ProgressBar: PrimeProgressBar }
      }
    })

    const progressBar = wrapper.findComponent(PrimeProgressBar)
    expect(progressBar.props('showValue')).toBe(true)
  })

  it('should allow hiding value', () => {
    const wrapper = mount(WbsProgressBar, {
      props: { value: 45, showValue: false },
      global: {
        components: { ProgressBar: PrimeProgressBar }
      }
    })

    const progressBar = wrapper.findComponent(PrimeProgressBar)
    expect(progressBar.props('showValue')).toBe(false)
  })
})
