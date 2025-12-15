/**
 * WbsTreeNode 컴포넌트 단위 테스트
 * Task: TSK-04-02
 * Test Spec: UT-001, UT-002, UT-003, UT-010
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import WbsTreeNode from '~/components/wbs/WbsTreeNode.vue'
import type { WbsNode } from '~/types'

// Mock 노드 데이터
const createMockNode = (overrides: Partial<WbsNode> = {}): WbsNode => ({
  id: 'WP-01',
  type: 'wp',
  title: 'Test Work Package',
  status: 'implement [im]',
  category: 'development',
  progress: 45,
  children: [],
  ...overrides
})

describe('WbsTreeNode', () => {
  beforeEach(() => {
    setActivePinia(createPinia())

    // Reset global mocks
    globalThis.useSelectionStore = vi.fn(() => ({
      selectedNodeId: null,
      selectNode: vi.fn()
    }))
  })

  // UT-001: 재귀 렌더링 검증
  it('should render node recursively with children', () => {
    const rootNode: WbsNode = createMockNode({
      id: 'WP-01',
      title: 'Root',
      children: [
        createMockNode({
          id: 'ACT-01-01',
          type: 'act',
          title: 'Child',
          children: [
            createMockNode({
              id: 'TSK-01-01-01',
              type: 'task',
              title: 'Grandchild',
              children: []
            })
          ]
        })
      ]
    })

    const wrapper = mount(WbsTreeNode, {
      props: { node: rootNode, depth: 0 },
      global: {
        stubs: {
          NodeIcon: true,
          StatusBadge: true,
          CategoryTag: true,
          ProgressBar: true,
          Button: true
        }
      }
    })

    // 루트 노드 렌더링 확인
    expect(wrapper.find('.wbs-tree-node').exists()).toBe(true)
    expect(wrapper.text()).toContain('Root')

    // 재귀 렌더링으로 자식 노드들이 포함되어야 함
    const allNodes = wrapper.findAllComponents(WbsTreeNode)
    expect(allNodes.length).toBeGreaterThan(1) // 루트 + 최소 1개의 자식
  })

  // UT-002: 들여쓰기 계산 검증
  it.each([
    [0, '0px'],
    [1, '20px'],
    [3, '60px']
  ])('should calculate indent width correctly for depth %i', (depth, expectedPadding) => {
    const node = createMockNode()
    const wrapper = mount(WbsTreeNode, {
      props: { node, depth },
      global: {
        stubs: {
          NodeIcon: true,
          StatusBadge: true,
          CategoryTag: true,
          ProgressBar: true,
          Button: true
        }
      }
    })

    const nodeElement = wrapper.find('.wbs-tree-node')
    const style = nodeElement.attributes('style')
    expect(style).toContain(`padding-left: ${expectedPadding}`)
  })

  // UT-003: 펼침/접기 버튼 조건부 렌더링
  it('should show expand button only if has children', () => {
    // 자식 없는 경우
    const nodeWithoutChildren = createMockNode({ children: [] })
    const wrapperWithout = mount(WbsTreeNode, {
      props: { node: nodeWithoutChildren },
      global: {
        stubs: {
          NodeIcon: true,
          StatusBadge: true,
          CategoryTag: true,
          ProgressBar: true,
          Button: true
        }
      }
    })

    expect(wrapperWithout.find(`[data-testid="expand-toggle-${nodeWithoutChildren.id}"]`).exists()).toBe(false)
    expect(wrapperWithout.find('.expand-placeholder').exists()).toBe(true)

    // 자식 있는 경우
    const nodeWithChildren = createMockNode({
      children: [createMockNode({ id: 'TSK-01-01', type: 'task' })]
    })
    const wrapperWith = mount(WbsTreeNode, {
      props: { node: nodeWithChildren },
      global: {
        stubs: {
          NodeIcon: true,
          StatusBadge: true,
          CategoryTag: true,
          ProgressBar: true,
          Button: true
        }
      }
    })

    expect(wrapperWith.find(`[data-testid="expand-toggle-${nodeWithChildren.id}"]`).exists()).toBe(true)
  })

  // UT-010: 선택 상태 클래스 적용
  it('should apply selected class when node is selected', () => {
    const node = createMockNode({ id: 'TEST-NODE-01' })

    // Mock selection store to return this node as selected
    globalThis.useSelectionStore = vi.fn(() => ({
      selectedNodeId: 'TEST-NODE-01',
      selectNode: vi.fn()
    }))

    const wrapper = mount(WbsTreeNode, {
      props: { node },
      global: {
        stubs: {
          NodeIcon: true,
          StatusBadge: true,
          CategoryTag: true,
          ProgressBar: true,
          Button: true
        }
      }
    })

    // Should have selected class
    expect(wrapper.find('.wbs-tree-node').classes()).toContain('selected')

    // Test not selected case
    globalThis.useSelectionStore = vi.fn(() => ({
      selectedNodeId: 'DIFFERENT-NODE',
      selectNode: vi.fn()
    }))

    const wrapperNotSelected = mount(WbsTreeNode, {
      props: { node },
      global: {
        stubs: {
          NodeIcon: true,
          StatusBadge: true,
          CategoryTag: true,
          ProgressBar: true,
          Button: true
        }
      }
    })

    expect(wrapperNotSelected.find('.wbs-tree-node').classes()).not.toContain('selected')
  })

  it('should render node content with title', () => {
    const node = createMockNode({ title: 'My Test Node' })
    const wrapper = mount(WbsTreeNode, {
      props: { node },
      global: {
        stubs: {
          NodeIcon: true,
          StatusBadge: true,
          CategoryTag: true,
          ProgressBar: true,
          Button: true
        }
      }
    })

    expect(wrapper.find('.node-title').text()).toBe('My Test Node')
  })

  it('should render optional components conditionally', () => {
    // Node with all optional fields
    const fullNode = createMockNode({
      status: 'implement [im]',
      category: 'development',
      progress: 50
    })
    const fullWrapper = mount(WbsTreeNode, {
      props: { node: fullNode },
      global: {
        stubs: {
          NodeIcon: true,
          StatusBadge: true,
          CategoryTag: true,
          ProgressBar: true,
          Button: true
        }
      }
    })

    expect(fullWrapper.findComponent({ name: 'StatusBadge' }).exists()).toBe(true)
    expect(fullWrapper.findComponent({ name: 'CategoryTag' }).exists()).toBe(true)
    expect(fullWrapper.findComponent({ name: 'ProgressBar' }).exists()).toBe(true)

    // Node without optional fields
    const minimalNode = createMockNode({
      status: undefined,
      category: undefined,
      progress: undefined
    })
    const minimalWrapper = mount(WbsTreeNode, {
      props: { node: minimalNode },
      global: {
        stubs: {
          NodeIcon: true,
          StatusBadge: true,
          CategoryTag: true,
          ProgressBar: true,
          Button: true
        }
      }
    })

    expect(minimalWrapper.findComponent({ name: 'StatusBadge' }).exists()).toBe(false)
    expect(minimalWrapper.findComponent({ name: 'CategoryTag' }).exists()).toBe(false)
    expect(minimalWrapper.findComponent({ name: 'ProgressBar' }).exists()).toBe(false)
  })
})
