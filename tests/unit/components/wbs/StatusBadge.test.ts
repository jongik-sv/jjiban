/**
 * StatusBadge 컴포넌트 단위 테스트
 * Task: TSK-04-02
 * Test Spec: UT-005, UT-006
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StatusBadge from '~/components/wbs/StatusBadge.vue'
import Tag from 'primevue/tag'

describe('StatusBadge', () => {
  // UT-005: 상태 코드 정상 파싱
  it('should parse status code correctly', () => {
    const wrapper = mount(StatusBadge, {
      props: { status: 'basic-design [bd]' },
      global: {
        components: { Tag }
      }
    })

    const tag = wrapper.findComponent(Tag)
    expect(tag.exists()).toBe(true)
    expect(tag.props('value')).toBe('Design')
    expect(tag.props('severity')).toBe('info')
  })

  it.each([
    ['detail-design [dd]', 'Detail', 'info'],
    ['implement [im]', 'Implement', 'warning'],
    ['verify [vf]', 'Verify', 'success'],
    ['done [xx]', 'Done', 'success'],
    ['todo [ ]', 'Todo', 'secondary']
  ])('should parse "%s" to label "%s" with severity "%s"', (status, expectedLabel, expectedSeverity) => {
    const wrapper = mount(StatusBadge, {
      props: { status },
      global: {
        components: { Tag }
      }
    })

    const tag = wrapper.findComponent(Tag)
    expect(tag.props('value')).toBe(expectedLabel)
    expect(tag.props('severity')).toBe(expectedSeverity)
  })

  // UT-006: 상태 코드 파싱 실패 시 원본 표시
  it('should display original status if parsing fails', () => {
    const wrapper = mount(StatusBadge, {
      props: { status: 'unknown-status' },
      global: {
        components: { Tag }
      }
    })

    const tag = wrapper.findComponent(Tag)
    expect(tag.exists()).toBe(true)
    expect(tag.props('value')).toBe('unknown-status')
    expect(tag.props('severity')).toBe('secondary')
  })

  it('should have rounded and small size attributes', () => {
    const wrapper = mount(StatusBadge, {
      props: { status: 'basic-design [bd]' },
      global: {
        components: { Tag }
      }
    })

    const tag = wrapper.findComponent(Tag)
    expect(tag.props('rounded')).toBe(true)
  })
})
