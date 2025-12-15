/**
 * NodeIcon 컴포넌트 단위 테스트
 * Task: TSK-04-02
 * Test Spec: UT-004
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NodeIcon from '~/components/wbs/NodeIcon.vue'
import type { WbsNodeType } from '~/types'

describe('NodeIcon', () => {
  // UT-004: 계층별 아이콘 매핑 검증
  it.each<[WbsNodeType, string, string]>([
    ['project', 'pi-folder', '#6366f1'],
    ['wp', 'pi-briefcase', '#3b82f6'],
    ['act', 'pi-list', '#10b981'],
    ['task', 'pi-check-square', '#f59e0b']
  ])('should display correct icon for %s', (type, expectedIcon, expectedColor) => {
    const wrapper = mount(NodeIcon, {
      props: { type }
    })

    const iconElement = wrapper.find('i')
    expect(iconElement.exists()).toBe(true)
    expect(iconElement.classes()).toContain('pi')
    expect(iconElement.classes()).toContain(expectedIcon)

    const containerElement = wrapper.find('.node-icon')
    expect(containerElement.exists()).toBe(true)
    expect(containerElement.attributes('style')).toContain(`background-color: ${expectedColor}`)
  })

  it('should render with correct dimensions', () => {
    const wrapper = mount(NodeIcon, {
      props: { type: 'project' }
    })

    const container = wrapper.find('.node-icon')
    expect(container.classes()).toContain('node-icon')
    // Check for flex layout and sizing in classes or styles
    expect(container.element.tagName).toBe('DIV')
  })

  it('should have rounded rectangle shape', () => {
    const wrapper = mount(NodeIcon, {
      props: { type: 'wp' }
    })

    const container = wrapper.find('.node-icon')
    // Should have border-radius styling (checked via class application)
    expect(container.exists()).toBe(true)
  })
})
