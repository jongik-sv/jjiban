/**
 * TaskHistory Component Unit Tests
 * Task: TSK-05-02
 * Test Spec: 026-test-specification.md
 *
 * Coverage:
 * - UT-008: sortedHistory computed (timestamp descending)
 * - UT-009: formatHistoryEntry function
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TaskHistory from '~/components/wbs/detail/TaskHistory.vue'
import Panel from 'primevue/panel'
import Timeline from 'primevue/timeline'
import Message from 'primevue/message'
import type { HistoryEntry } from '~/types'

describe('TaskHistory', () => {
  // Helper to create mock history entries
  const createTransitionEntry = (timestamp: string, from: string, to: string, documentCreated?: string): HistoryEntry => ({
    timestamp,
    action: 'transition',
    previousStatus: from,
    newStatus: to,
    command: '/wf:draft',
    documentCreated,
    userId: 'user-001'
  })

  const createUpdateEntry = (timestamp: string): HistoryEntry => ({
    timestamp,
    action: 'update',
    comment: '제목 변경',
    userId: 'user-001'
  })

  const createActionEntry = (timestamp: string): HistoryEntry => ({
    timestamp,
    action: 'action',
    command: '/wf:verify',
    comment: '검증 시작',
    userId: 'user-001'
  })

  describe('sortedHistory computed', () => {
    // UT-008: should sort history by timestamp in descending order
    it('should sort history entries by timestamp descending (newest first)', () => {
      const history: HistoryEntry[] = [
        createTransitionEntry('2025-12-15T09:00:00Z', '[ ]', '[bd]'),
        createTransitionEntry('2025-12-15T13:12:00Z', '[bd]', '[dd]'),
        createTransitionEntry('2025-12-15T11:30:00Z', '[dd]', '[im]')
      ]

      const wrapper = mount(TaskHistory, {
        props: { history },
        global: {
          components: { Panel, Timeline, Message }
        }
      })

      const vm = wrapper.vm as any
      const sorted = vm.sortedHistory

      expect(sorted).toHaveLength(3)
      expect(sorted[0].timestamp).toBe('2025-12-15T13:12:00Z') // Newest
      expect(sorted[1].timestamp).toBe('2025-12-15T11:30:00Z')
      expect(sorted[2].timestamp).toBe('2025-12-15T09:00:00Z') // Oldest
    })

    it('should not mutate original history array', () => {
      const history: HistoryEntry[] = [
        createTransitionEntry('2025-12-15T09:00:00Z', '[ ]', '[bd]'),
        createTransitionEntry('2025-12-15T13:12:00Z', '[bd]', '[dd]')
      ]

      const wrapper = mount(TaskHistory, {
        props: { history },
        global: {
          components: { Panel, Timeline, Message }
        }
      })

      const vm = wrapper.vm as any
      vm.sortedHistory // Access computed

      // Original array should remain unchanged
      expect(history[0].timestamp).toBe('2025-12-15T09:00:00Z')
      expect(history[1].timestamp).toBe('2025-12-15T13:12:00Z')
    })

    it('should handle empty history array', () => {
      const wrapper = mount(TaskHistory, {
        props: { history: [] },
        global: {
          components: { Panel, Timeline, Message }
        }
      })

      const vm = wrapper.vm as any
      expect(vm.sortedHistory).toHaveLength(0)
    })

    it('should handle single entry', () => {
      const history: HistoryEntry[] = [
        createTransitionEntry('2025-12-15T09:00:00Z', '[ ]', '[bd]')
      ]

      const wrapper = mount(TaskHistory, {
        props: { history },
        global: {
          components: { Panel, Timeline, Message }
        }
      })

      const vm = wrapper.vm as any
      expect(vm.sortedHistory).toHaveLength(1)
      expect(vm.sortedHistory[0].timestamp).toBe('2025-12-15T09:00:00Z')
    })
  })

  describe('getEntryIcon method', () => {
    // UT-009: should return correct icon for each action type
    it('should return arrow-right icon for transition action', () => {
      const entry = createTransitionEntry('2025-12-15T09:00:00Z', '[ ]', '[bd]')
      const wrapper = mount(TaskHistory, {
        props: { history: [entry] },
        global: {
          components: { Panel, Timeline, Message }
        }
      })

      const vm = wrapper.vm as any
      expect(vm.getEntryIcon(entry)).toBe('pi pi-arrow-right')
    })

    it('should return pencil icon for update action', () => {
      const entry = createUpdateEntry('2025-12-15T09:00:00Z')
      const wrapper = mount(TaskHistory, {
        props: { history: [entry] },
        global: {
          components: { Panel, Timeline, Message }
        }
      })

      const vm = wrapper.vm as any
      expect(vm.getEntryIcon(entry)).toBe('pi pi-pencil')
    })

    it('should return bolt icon for action type', () => {
      const entry = createActionEntry('2025-12-15T09:00:00Z')
      const wrapper = mount(TaskHistory, {
        props: { history: [entry] },
        global: {
          components: { Panel, Timeline, Message }
        }
      })

      const vm = wrapper.vm as any
      expect(vm.getEntryIcon(entry)).toBe('pi pi-bolt')
    })

    it('should return info-circle icon for unknown action', () => {
      const entry: HistoryEntry = {
        timestamp: '2025-12-15T09:00:00Z',
        action: 'unknown_action'
      }
      const wrapper = mount(TaskHistory, {
        props: { history: [entry] },
        global: {
          components: { Panel, Timeline, Message }
        }
      })

      const vm = wrapper.vm as any
      expect(vm.getEntryIcon(entry)).toBe('pi pi-info-circle')
    })
  })

  describe('getEntryColor method', () => {
    it('should return blue for transition', () => {
      const entry = createTransitionEntry('2025-12-15T09:00:00Z', '[ ]', '[bd]')
      const wrapper = mount(TaskHistory, {
        props: { history: [entry] },
        global: {
          components: { Panel, Timeline, Message }
        }
      })

      const vm = wrapper.vm as any
      expect(vm.getEntryColor(entry)).toBe('#3b82f6')
    })

    it('should return green for update', () => {
      const entry = createUpdateEntry('2025-12-15T09:00:00Z')
      const wrapper = mount(TaskHistory, {
        props: { history: [entry] },
        global: {
          components: { Panel, Timeline, Message }
        }
      })

      const vm = wrapper.vm as any
      expect(vm.getEntryColor(entry)).toBe('#22c55e')
    })

    it('should return amber for action', () => {
      const entry = createActionEntry('2025-12-15T09:00:00Z')
      const wrapper = mount(TaskHistory, {
        props: { history: [entry] },
        global: {
          components: { Panel, Timeline, Message }
        }
      })

      const vm = wrapper.vm as any
      expect(vm.getEntryColor(entry)).toBe('#f59e0b')
    })

    it('should return gray for unknown action', () => {
      const entry: HistoryEntry = {
        timestamp: '2025-12-15T09:00:00Z',
        action: 'unknown'
      }
      const wrapper = mount(TaskHistory, {
        props: { history: [entry] },
        global: {
          components: { Panel, Timeline, Message }
        }
      })

      const vm = wrapper.vm as any
      expect(vm.getEntryColor(entry)).toBe('#6b7280')
    })
  })

  describe('getEntryTitle method', () => {
    // UT-009: should return correct title for each action type
    it('should return "상태 전이" for transition', () => {
      const entry = createTransitionEntry('2025-12-15T09:00:00Z', '[ ]', '[bd]')
      const wrapper = mount(TaskHistory, {
        props: { history: [entry] },
        global: {
          components: { Panel, Timeline, Message }
        }
      })

      const vm = wrapper.vm as any
      expect(vm.getEntryTitle(entry)).toBe('상태 전이')
    })

    it('should return "정보 수정" for update', () => {
      const entry = createUpdateEntry('2025-12-15T09:00:00Z')
      const wrapper = mount(TaskHistory, {
        props: { history: [entry] },
        global: {
          components: { Panel, Timeline, Message }
        }
      })

      const vm = wrapper.vm as any
      expect(vm.getEntryTitle(entry)).toBe('정보 수정')
    })

    it('should return "액션 실행" for action', () => {
      const entry = createActionEntry('2025-12-15T09:00:00Z')
      const wrapper = mount(TaskHistory, {
        props: { history: [entry] },
        global: {
          components: { Panel, Timeline, Message }
        }
      })

      const vm = wrapper.vm as any
      expect(vm.getEntryTitle(entry)).toBe('액션 실행')
    })

    it('should return action value for unknown action', () => {
      const entry: HistoryEntry = {
        timestamp: '2025-12-15T09:00:00Z',
        action: 'custom_action'
      }
      const wrapper = mount(TaskHistory, {
        props: { history: [entry] },
        global: {
          components: { Panel, Timeline, Message }
        }
      })

      const vm = wrapper.vm as any
      expect(vm.getEntryTitle(entry)).toBe('custom_action')
    })
  })

  describe('formatTimestamp method', () => {
    it('should format timestamp to Korean locale string', () => {
      const wrapper = mount(TaskHistory, {
        props: { history: [] },
        global: {
          components: { Panel, Timeline, Message }
        }
      })

      const vm = wrapper.vm as any
      const formatted = vm.formatTimestamp('2025-12-15T00:00:00Z')

      // Should contain year, month, day (format may vary by timezone)
      expect(formatted).toContain('2025')
      expect(formatted).toContain('12')
      expect(formatted).toContain('15')
      // Should be a valid formatted string (not empty)
      expect(formatted.length).toBeGreaterThan(10)
    })

    it('should return consistent format for multiple timestamps', () => {
      const wrapper = mount(TaskHistory, {
        props: { history: [] },
        global: {
          components: { Panel, Timeline, Message }
        }
      })

      const vm = wrapper.vm as any
      const formatted1 = vm.formatTimestamp('2025-12-15T09:00:00Z')
      const formatted2 = vm.formatTimestamp('2025-12-15T13:12:00Z')

      // Both should be formatted strings with similar structure
      expect(formatted1).toContain('2025')
      expect(formatted2).toContain('2025')
      expect(typeof formatted1).toBe('string')
      expect(typeof formatted2).toBe('string')
    })
  })

  describe('Rendering', () => {
    it('should render timeline with correct data-testid', () => {
      const history = [createTransitionEntry('2025-12-15T09:00:00Z', '[ ]', '[bd]')]
      const wrapper = mount(TaskHistory, {
        props: { history },
        global: {
          components: { Panel, Timeline, Message }
        }
      })

      expect(wrapper.find('[data-testid="task-history-panel"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="history-timeline"]').exists()).toBe(true)
    })

    it('should render history entries with correct data-testid', () => {
      const history = [
        createTransitionEntry('2025-12-15T13:12:00Z', '[bd]', '[dd]', '020-detail-design.md'),
        createTransitionEntry('2025-12-15T09:00:00Z', '[ ]', '[bd]', '010-basic-design.md')
      ]
      const wrapper = mount(TaskHistory, {
        props: { history },
        global: {
          components: { Panel, Timeline, Message }
        }
      })

      // Entries should be in reverse order (newest first)
      expect(wrapper.find('[data-testid="history-entry-0"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="history-entry-1"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="history-timestamp-0"]').exists()).toBe(true)
    })

    it('should display transition information with previousStatus and newStatus', () => {
      const history = [
        createTransitionEntry('2025-12-15T09:00:00Z', '[ ]', '[bd]')
      ]
      const wrapper = mount(TaskHistory, {
        props: { history },
        global: {
          components: { Panel, Timeline, Message }
        }
      })

      const transitionEl = wrapper.find('[data-testid="history-transition-0"]')
      expect(transitionEl.exists()).toBe(true)
      expect(transitionEl.text()).toContain('[ ]')
      expect(transitionEl.text()).toContain('[bd]')
    })

    it('should display command information when present', () => {
      const history = [
        createTransitionEntry('2025-12-15T09:00:00Z', '[ ]', '[bd]')
      ]
      const wrapper = mount(TaskHistory, {
        props: { history },
        global: {
          components: { Panel, Timeline, Message }
        }
      })

      const entryText = wrapper.find('[data-testid="history-entry-0"]').text()
      expect(entryText).toContain('명령어')
      expect(entryText).toContain('/wf:draft')
    })

    it('should display document created information when present', () => {
      const history = [
        createTransitionEntry('2025-12-15T09:00:00Z', '[ ]', '[bd]', '010-basic-design.md')
      ]
      const wrapper = mount(TaskHistory, {
        props: { history },
        global: {
          components: { Panel, Timeline, Message }
        }
      })

      const entryText = wrapper.find('[data-testid="history-entry-0"]').text()
      expect(entryText).toContain('문서 생성')
      expect(entryText).toContain('010-basic-design.md')
    })

    it('should display comment when present', () => {
      const entry = createUpdateEntry('2025-12-15T09:00:00Z')
      const wrapper = mount(TaskHistory, {
        props: { history: [entry] },
        global: {
          components: { Panel, Timeline, Message }
        }
      })

      const entryText = wrapper.find('[data-testid="history-entry-0"]').text()
      expect(entryText).toContain('제목 변경')
    })

    it('should display user information when present', () => {
      const entry = createTransitionEntry('2025-12-15T09:00:00Z', '[ ]', '[bd]')
      const wrapper = mount(TaskHistory, {
        props: { history: [entry] },
        global: {
          components: { Panel, Timeline, Message }
        }
      })

      const entryText = wrapper.find('[data-testid="history-entry-0"]').text()
      expect(entryText).toContain('사용자')
      expect(entryText).toContain('user-001')
    })
  })

  describe('Empty State', () => {
    it('should display message when no history exists', () => {
      const wrapper = mount(TaskHistory, {
        props: { history: [] },
        global: {
          components: { Panel, Timeline, Message }
        }
      })

      const message = wrapper.findComponent(Message)
      expect(message.exists()).toBe(true)
      expect(message.text()).toContain('아직 이력이 없습니다')
    })
  })

  describe('Backward Compatibility', () => {
    it('should handle legacy history format with from/to fields', () => {
      const legacyEntry: HistoryEntry = {
        timestamp: '2025-12-15T09:00:00Z',
        action: 'transition',
        from: '[ ]',
        to: '[bd]',
        command: '/wf:start'
      }

      const wrapper = mount(TaskHistory, {
        props: { history: [legacyEntry] },
        global: {
          components: { Panel, Timeline, Message }
        }
      })

      const transitionEl = wrapper.find('[data-testid="history-transition-0"]')
      expect(transitionEl.exists()).toBe(true)
      expect(transitionEl.text()).toContain('[ ]')
      expect(transitionEl.text()).toContain('[bd]')
    })

    it('should handle legacy user field', () => {
      const legacyEntry: HistoryEntry = {
        timestamp: '2025-12-15T09:00:00Z',
        action: 'update',
        user: 'legacy-user'
      }

      const wrapper = mount(TaskHistory, {
        props: { history: [legacyEntry] },
        global: {
          components: { Panel, Timeline, Message }
        }
      })

      const entryText = wrapper.find('[data-testid="history-entry-0"]').text()
      expect(entryText).toContain('사용자')
      expect(entryText).toContain('legacy-user')
    })
  })
})
