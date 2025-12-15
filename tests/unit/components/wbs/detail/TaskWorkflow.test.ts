/**
 * TaskWorkflow Component Unit Tests
 * Task: TSK-05-02
 * Test Spec: 026-test-specification.md
 *
 * Coverage:
 * - UT-001: workflowSteps computed (development category)
 * - UT-002: workflowSteps computed (defect, infrastructure)
 * - UT-003: currentStepIndex computed
 * - UT-004: getNodeStyle function
 * - UT-010: Independent rendering
 */

import { describe, it, expect, vi, beforeAll } from 'vitest'
import { mount } from '@vue/test-utils'
import type { TaskDetail } from '../../../../types'

// Mock the ~/types module before importing the component
vi.mock('~/types', async () => {
  const actual = await vi.importActual('../../../../types/index.ts')
  return actual
})

import TaskWorkflow from '~/components/wbs/detail/TaskWorkflow.vue'
import Panel from 'primevue/panel'

describe('TaskWorkflow', () => {
  // Helper to create mock task
  const createMockTask = (category: 'development' | 'defect' | 'infrastructure', status: string): Partial<TaskDetail> => ({
    id: 'TSK-05-02',
    title: 'Test Task',
    category,
    status: status as any,
    priority: 'medium',
    requirements: [],
    tags: [],
    documents: [],
    history: [],
    availableActions: [],
    parentWp: 'WP-01'
  })

  describe('workflowSteps computed', () => {
    // UT-001: development category should return 6 steps
    it('should return 6 steps for development category', () => {
      const task = createMockTask('development', '[bd]')
      const wrapper = mount(TaskWorkflow, {
        props: { task: task as TaskDetail },
        global: {
          components: { Panel }
        }
      })

      const vm = wrapper.vm as any
      expect(vm.workflowSteps).toHaveLength(6)
      expect(vm.workflowSteps[0]).toEqual({
        code: '[ ]',
        name: 'Todo',
        description: '시작 전'
      })
      expect(vm.workflowSteps[5]).toEqual({
        code: '[xx]',
        name: 'Done',
        description: '완료'
      })
    })

    // UT-002: defect category should return 5 steps
    it('should return 5 steps for defect category', () => {
      const task = createMockTask('defect', '[an]')
      const wrapper = mount(TaskWorkflow, {
        props: { task: task as TaskDetail },
        global: {
          components: { Panel }
        }
      })

      const vm = wrapper.vm as any
      expect(vm.workflowSteps).toHaveLength(5)
      expect(vm.workflowSteps[1]).toEqual({
        code: '[an]',
        name: 'Analysis',
        description: '분석'
      })
    })

    // UT-002: infrastructure category should return 4 steps
    it('should return 4 steps for infrastructure category', () => {
      const task = createMockTask('infrastructure', '[ds]')
      const wrapper = mount(TaskWorkflow, {
        props: { task: task as TaskDetail },
        global: {
          components: { Panel }
        }
      })

      const vm = wrapper.vm as any
      expect(vm.workflowSteps).toHaveLength(4)
      expect(vm.workflowSteps[1]).toEqual({
        code: '[ds]',
        name: 'Design',
        description: '설계'
      })
    })
  })

  describe('currentStepIndex computed', () => {
    // UT-003: should calculate correct index for current status
    it('should return correct index for current status [dd]', () => {
      const task = createMockTask('development', '[dd]')
      const wrapper = mount(TaskWorkflow, {
        props: { task: task as TaskDetail },
        global: {
          components: { Panel }
        }
      })

      const vm = wrapper.vm as any
      // [dd] is 3rd step (index 2): [ ], [bd], [dd], [im], [vf], [xx]
      expect(vm.currentStepIndex).toBe(2)
    })

    it('should return correct index for status [ ]', () => {
      const task = createMockTask('development', '[ ]')
      const wrapper = mount(TaskWorkflow, {
        props: { task: task as TaskDetail },
        global: {
          components: { Panel }
        }
      })

      const vm = wrapper.vm as any
      expect(vm.currentStepIndex).toBe(0)
    })

    it('should return correct index for status [xx]', () => {
      const task = createMockTask('development', '[xx]')
      const wrapper = mount(TaskWorkflow, {
        props: { task: task as TaskDetail },
        global: {
          components: { Panel }
        }
      })

      const vm = wrapper.vm as any
      expect(vm.currentStepIndex).toBe(5)
    })
  })

  describe('getNodeStyle method', () => {
    // UT-004: completed status should be green
    it('should return green background for completed steps', () => {
      const task = createMockTask('development', '[dd]')
      const wrapper = mount(TaskWorkflow, {
        props: { task: task as TaskDetail },
        global: {
          components: { Panel }
        }
      })

      const vm = wrapper.vm as any
      const style = vm.getNodeStyle(0) // index 0 is before [dd] (index 2)

      expect(style.backgroundColor).toBe('#22c55e')
      expect(style.color).toBe('#ffffff')
      expect(style.border).toBe('none')
    })

    // UT-004: current status should be blue with bold and shadow
    it('should return blue background with bold for current step', () => {
      const task = createMockTask('development', '[dd]')
      const wrapper = mount(TaskWorkflow, {
        props: { task: task as TaskDetail },
        global: {
          components: { Panel }
        }
      })

      const vm = wrapper.vm as any
      const style = vm.getNodeStyle(2) // currentStepIndex is 2

      expect(style.backgroundColor).toBe('#3b82f6')
      expect(style.color).toBe('#ffffff')
      expect(style.fontWeight).toBe('bold')
      expect(style.transform).toBe('scale(1.1)')
      expect(style.boxShadow).toBe('0 4px 6px rgba(59, 130, 246, 0.3)')
    })

    // UT-004: future status should be gray with dashed border
    it('should return gray background with dashed border for future steps', () => {
      const task = createMockTask('development', '[dd]')
      const wrapper = mount(TaskWorkflow, {
        props: { task: task as TaskDetail },
        global: {
          components: { Panel }
        }
      })

      const vm = wrapper.vm as any
      const style = vm.getNodeStyle(4) // index 4 is after [dd] (index 2)

      expect(style.backgroundColor).toBe('#e5e7eb')
      expect(style.color).toBe('#6b7280')
      expect(style.border).toBe('2px dashed #9ca3af')
    })
  })

  describe('Component Rendering', () => {
    // UT-010: should render independently without errors
    it('should render independently with minimal props', () => {
      const task = createMockTask('development', '[bd]')
      const wrapper = mount(TaskWorkflow, {
        props: { task: task as TaskDetail },
        global: {
          components: { Panel }
        }
      })

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('[data-testid="task-workflow-panel"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="workflow-nodes"]').exists()).toBe(true)
    })

    it('should render all workflow nodes', () => {
      const task = createMockTask('development', '[bd]')
      const wrapper = mount(TaskWorkflow, {
        props: { task: task as TaskDetail },
        global: {
          components: { Panel }
        }
      })

      const nodes = wrapper.findAll('[data-testid^="workflow-node-"]')
      expect(nodes.length).toBeGreaterThan(0)
    })

    it('should mark current node with special data-testid', () => {
      const task = createMockTask('development', '[bd]')
      const wrapper = mount(TaskWorkflow, {
        props: { task: task as TaskDetail },
        global: {
          components: { Panel }
        }
      })

      expect(wrapper.find('[data-testid="workflow-node-current"]').exists()).toBe(true)
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      const task = createMockTask('development', '[bd]')
      const wrapper = mount(TaskWorkflow, {
        props: { task: task as TaskDetail },
        global: {
          components: { Panel }
        }
      })

      const nodesList = wrapper.find('[data-testid="workflow-nodes"]')
      expect(nodesList.attributes('role')).toBe('list')
      expect(nodesList.attributes('aria-label')).toBe('워크플로우 단계')
    })

    it('should mark current step with aria-current', () => {
      const task = createMockTask('development', '[bd]')
      const wrapper = mount(TaskWorkflow, {
        props: { task: task as TaskDetail },
        global: {
          components: { Panel }
        }
      })

      const currentNode = wrapper.find('[data-testid="workflow-node-current"]')
      expect(currentNode.attributes('aria-current')).toBe('step')
    })
  })
})
