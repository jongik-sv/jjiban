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
  // UT-008: 진행률 색상 매핑 검증 (CSS 클래스 중앙화 적용)
  it.each<[number, string]>([
    [15, 'progress-bar-low'],     // 0-30% 구간 (빨강)
    [50, 'progress-bar-medium'],  // 30-70% 구간 (황색)
    [85, 'progress-bar-high']     // 70-100% 구간 (초록)
  ])('should apply correct color for %i%%', (value, expectedClass) => {
    const wrapper = mount(WbsProgressBar, {
      props: { value },
      global: {
        components: { ProgressBar: PrimeProgressBar }
      }
    })

    const progressBar = wrapper.findComponent(PrimeProgressBar)
    expect(progressBar.exists()).toBe(true)
    expect(progressBar.props('value')).toBe(value)

    // Check Pass Through API for CSS class instead of inline style
    const pt = progressBar.props('pt')
    expect(pt).toBeDefined()
    expect(pt.value?.class).toBe(expectedClass)
  })

  // UT-009: 진행률 범위 경계 테스트 (CSS 클래스 중앙화 적용)
  it.each<[number, string]>([
    [0, 'progress-bar-low'],      // 경계: 0% → 빨강
    [30, 'progress-bar-medium'],  // 경계: 30% → 황색
    [70, 'progress-bar-high'],    // 경계: 70% → 초록
    [100, 'progress-bar-high']    // 경계: 100% → 초록
  ])('should handle boundary value %i%% correctly', (value, expectedClass) => {
    const wrapper = mount(WbsProgressBar, {
      props: { value },
      global: {
        components: { ProgressBar: PrimeProgressBar }
      }
    })

    const pt = wrapper.findComponent(PrimeProgressBar).props('pt')
    expect(pt.value?.class).toBe(expectedClass)
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
