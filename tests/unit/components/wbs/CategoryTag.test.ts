/**
 * CategoryTag 컴포넌트 단위 테스트
 * Task: TSK-04-02
 * Test Spec: UT-007
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CategoryTag from '~/components/wbs/CategoryTag.vue'
import Tag from 'primevue/tag'
import type { TaskCategory } from '~/types'

describe('CategoryTag', () => {
  // UT-007: 카테고리 매핑 검증
  it.each<[TaskCategory, string, string, string]>([
    ['development', 'pi-code', '#3b82f6', 'Dev'],
    ['defect', 'pi-exclamation-triangle', '#ef4444', 'Defect'],
    ['infrastructure', 'pi-cog', '#8b5cf6', 'Infra']
  ])('should display correct tag for %s', (category, expectedIcon, expectedColor, expectedLabel) => {
    const wrapper = mount(CategoryTag, {
      props: { category },
      global: {
        components: { Tag }
      }
    })

    const tag = wrapper.findComponent(Tag)
    expect(tag.exists()).toBe(true)
    expect(tag.props('value')).toBe(expectedLabel)
    expect(tag.props('icon')).toBe(`pi ${expectedIcon}`)

    // Check background color in style
    const styleAttr = wrapper.find(`[data-testid="category-tag-${category}"]`).attributes('style')
    expect(styleAttr).toContain(`background-color: ${expectedColor}`)
  })

  it('should have rounded attribute', () => {
    const wrapper = mount(CategoryTag, {
      props: { category: 'development' },
      global: {
        components: { Tag }
      }
    })

    const tag = wrapper.findComponent(Tag)
    expect(tag.props('rounded')).toBe(true)
  })

  it('should render icon and label together', () => {
    const wrapper = mount(CategoryTag, {
      props: { category: 'development' },
      global: {
        components: { Tag }
      }
    })

    const tag = wrapper.findComponent(Tag)
    expect(tag.props('icon')).toBeTruthy()
    expect(tag.props('value')).toBeTruthy()
  })
})
