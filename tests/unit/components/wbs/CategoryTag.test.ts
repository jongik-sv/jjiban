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
  // UT-007: 카테고리 매핑 검증 (CSS 클래스 중앙화 적용)
  it.each<[TaskCategory, string, string, string]>([
    ['development', 'pi-code', 'category-tag-development', 'Dev'],
    ['defect', 'pi-exclamation-triangle', 'category-tag-defect', 'Defect'],
    ['infrastructure', 'pi-cog', 'category-tag-infrastructure', 'Infra']
  ])('should display correct tag for %s', (category, expectedIcon, expectedClass, expectedLabel) => {
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

    // Check CSS class instead of inline style (CSS 클래스 중앙화)
    const wrapperElement = wrapper.find(`[data-testid="category-tag-${category}"]`)
    expect(wrapperElement.classes()).toContain(expectedClass)
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
