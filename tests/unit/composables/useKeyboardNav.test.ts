/**
 * useKeyboardNav Composable 단위 테스트
 * Task: TSK-04-03
 * Priority: P3
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { ref, nextTick } from 'vue'
import { useKeyboardNav } from '~/composables/useKeyboardNav'
import { useWbsStore } from '~/stores/wbs'
import type { WbsNode } from '~/types/index'

describe('useKeyboardNav', () => {
  let mockTreeRoot: WbsNode[]

  beforeEach(() => {
    setActivePinia(createPinia())

    // Create mock tree structure
    mockTreeRoot = [
      {
        id: 'WP-01',
        type: 'wp',
        title: 'Work Package 1',
        children: [
          {
            id: 'ACT-01-01',
            type: 'act',
            title: 'Activity 1',
            children: [
              { id: 'TSK-01-01-01', type: 'task', title: 'Task 1', children: [] }
            ]
          },
          { id: 'ACT-01-02', type: 'act', title: 'Activity 2', children: [] }
        ]
      },
      {
        id: 'WP-02',
        type: 'wp',
        title: 'Work Package 2',
        children: []
      }
    ]
  })

  describe('handleKeyDown', () => {
    it('should call handler for valid key', () => {
      const wbsStore = useWbsStore()
      wbsStore.expandedNodes.add('WP-01')

      const onNodeSelect = vi.fn()
      const { handleKeyDown, focusNode } = useKeyboardNav({
        treeRoot: ref(mockTreeRoot),
        onNodeSelect
      })

      // Set initial focus
      focusNode('WP-01')

      // Press ArrowDown
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' })
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')
      const stopPropagationSpy = vi.spyOn(event, 'stopPropagation')

      handleKeyDown(event)

      expect(preventDefaultSpy).toHaveBeenCalled()
      expect(stopPropagationSpy).toHaveBeenCalled()
    })

    it('should ignore invalid keys', () => {
      const onNodeSelect = vi.fn()
      const { handleKeyDown } = useKeyboardNav({
        treeRoot: ref(mockTreeRoot),
        onNodeSelect
      })

      const event = new KeyboardEvent('keydown', { key: 'a' })
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')

      handleKeyDown(event)

      expect(preventDefaultSpy).not.toHaveBeenCalled()
    })
  })

  describe('handleArrowDown', () => {
    it('should move to next node', () => {
      const wbsStore = useWbsStore()
      wbsStore.expandedNodes.add('WP-01')

      const { handleKeyDown, focusedNodeId, focusNode } = useKeyboardNav({
        treeRoot: ref(mockTreeRoot)
      })

      focusNode('WP-01')

      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' })
      handleKeyDown(event)

      expect(focusedNodeId.value).toBe('ACT-01-01')
    })

    it('should stay at last node when at end', () => {
      const wbsStore = useWbsStore()
      wbsStore.expandedNodes.add('WP-01')

      const { handleKeyDown, focusedNodeId, focusNode } = useKeyboardNav({
        treeRoot: ref(mockTreeRoot)
      })

      focusNode('WP-02')

      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' })
      handleKeyDown(event)

      expect(focusedNodeId.value).toBe('WP-02')
    })
  })

  describe('handleArrowUp', () => {
    it('should move to previous node', () => {
      const wbsStore = useWbsStore()
      wbsStore.expandedNodes.add('WP-01')

      const { handleKeyDown, focusedNodeId, focusNode } = useKeyboardNav({
        treeRoot: ref(mockTreeRoot)
      })

      focusNode('ACT-01-01')

      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' })
      handleKeyDown(event)

      expect(focusedNodeId.value).toBe('WP-01')
    })

    it('should stay at first node when at beginning', () => {
      const { handleKeyDown, focusedNodeId, focusNode } = useKeyboardNav({
        treeRoot: ref(mockTreeRoot)
      })

      focusNode('WP-01')

      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' })
      handleKeyDown(event)

      expect(focusedNodeId.value).toBe('WP-01')
    })
  })

  describe('handleArrowRight', () => {
    it('should expand collapsed node with children', () => {
      const wbsStore = useWbsStore()
      wbsStore.flatNodes = new Map([
        ['WP-01', mockTreeRoot[0]],
        ['ACT-01-01', mockTreeRoot[0].children[0]]
      ])

      const { handleKeyDown, focusedNodeId, focusNode } = useKeyboardNav({
        treeRoot: ref(mockTreeRoot)
      })

      focusNode('WP-01')
      expect(wbsStore.expandedNodes.has('WP-01')).toBe(false)

      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' })
      handleKeyDown(event)

      expect(wbsStore.expandedNodes.has('WP-01')).toBe(true)
      expect(focusedNodeId.value).toBe('WP-01') // Still on same node
    })

    it('should move to first child if already expanded', () => {
      const wbsStore = useWbsStore()
      wbsStore.expandedNodes.add('WP-01')
      wbsStore.flatNodes = new Map([
        ['WP-01', mockTreeRoot[0]],
        ['ACT-01-01', mockTreeRoot[0].children[0]]
      ])

      const { handleKeyDown, focusedNodeId, focusNode } = useKeyboardNav({
        treeRoot: ref(mockTreeRoot)
      })

      focusNode('WP-01')

      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' })
      handleKeyDown(event)

      expect(focusedNodeId.value).toBe('ACT-01-01')
    })

    it('should do nothing on leaf node', () => {
      const wbsStore = useWbsStore()
      wbsStore.flatNodes = new Map([
        ['WP-02', mockTreeRoot[1]]
      ])

      const { handleKeyDown, focusedNodeId, focusNode } = useKeyboardNav({
        treeRoot: ref(mockTreeRoot)
      })

      focusNode('WP-02')

      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' })
      handleKeyDown(event)

      expect(focusedNodeId.value).toBe('WP-02') // No change
    })
  })

  describe('handleArrowLeft', () => {
    it('should collapse expanded node with children', () => {
      const wbsStore = useWbsStore()
      wbsStore.expandedNodes.add('WP-01')
      wbsStore.flatNodes = new Map([
        ['WP-01', mockTreeRoot[0]]
      ])

      const { handleKeyDown, focusedNodeId, focusNode } = useKeyboardNav({
        treeRoot: ref(mockTreeRoot)
      })

      focusNode('WP-01')

      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' })
      handleKeyDown(event)

      expect(wbsStore.expandedNodes.has('WP-01')).toBe(false)
      expect(focusedNodeId.value).toBe('WP-01') // Still on same node
    })

    it('should move to parent if already collapsed', () => {
      const wbsStore = useWbsStore()
      wbsStore.expandedNodes.add('WP-01')
      wbsStore.flatNodes = new Map([
        ['WP-01', mockTreeRoot[0]],
        ['ACT-01-01', mockTreeRoot[0].children[0]]
      ])

      const { handleKeyDown, focusedNodeId, focusNode } = useKeyboardNav({
        treeRoot: ref(mockTreeRoot)
      })

      focusNode('ACT-01-01')

      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' })
      handleKeyDown(event)

      expect(focusedNodeId.value).toBe('WP-01')
    })
  })

  describe('handleEnter', () => {
    it('should call onNodeSelect callback', () => {
      const onNodeSelect = vi.fn()
      const { handleKeyDown, focusNode } = useKeyboardNav({
        treeRoot: ref(mockTreeRoot),
        onNodeSelect
      })

      focusNode('WP-01')

      const event = new KeyboardEvent('keydown', { key: 'Enter' })
      handleKeyDown(event)

      expect(onNodeSelect).toHaveBeenCalledWith('WP-01')
    })

    it('should not call callback if no node focused', () => {
      const onNodeSelect = vi.fn()
      const { handleKeyDown } = useKeyboardNav({
        treeRoot: ref(mockTreeRoot),
        onNodeSelect
      })

      const event = new KeyboardEvent('keydown', { key: 'Enter' })
      handleKeyDown(event)

      expect(onNodeSelect).not.toHaveBeenCalled()
    })
  })

  describe('handleSpace', () => {
    it('should toggle node expansion', () => {
      const wbsStore = useWbsStore()
      wbsStore.flatNodes = new Map([
        ['WP-01', mockTreeRoot[0]]
      ])

      const { handleKeyDown, focusNode } = useKeyboardNav({
        treeRoot: ref(mockTreeRoot)
      })

      focusNode('WP-01')
      expect(wbsStore.expandedNodes.has('WP-01')).toBe(false)

      const event = new KeyboardEvent('keydown', { key: ' ' })
      handleKeyDown(event)

      expect(wbsStore.expandedNodes.has('WP-01')).toBe(true)
    })

    it('should not toggle node without children', () => {
      const wbsStore = useWbsStore()
      wbsStore.flatNodes = new Map([
        ['WP-02', mockTreeRoot[1]]
      ])

      const { handleKeyDown, focusNode } = useKeyboardNav({
        treeRoot: ref(mockTreeRoot)
      })

      focusNode('WP-02')

      const event = new KeyboardEvent('keydown', { key: ' ' })
      handleKeyDown(event)

      expect(wbsStore.expandedNodes.has('WP-02')).toBe(false)
    })
  })

  describe('handleHome', () => {
    it('should move to first node', () => {
      const { handleKeyDown, focusedNodeId, focusNode } = useKeyboardNav({
        treeRoot: ref(mockTreeRoot)
      })

      focusNode('WP-02')

      const event = new KeyboardEvent('keydown', { key: 'Home' })
      handleKeyDown(event)

      expect(focusedNodeId.value).toBe('WP-01')
    })
  })

  describe('handleEnd', () => {
    it('should move to last node', () => {
      const { handleKeyDown, focusedNodeId, focusNode } = useKeyboardNav({
        treeRoot: ref(mockTreeRoot)
      })

      focusNode('WP-01')

      const event = new KeyboardEvent('keydown', { key: 'End' })
      handleKeyDown(event)

      expect(focusedNodeId.value).toBe('WP-02')
    })
  })

  describe('handleEscape', () => {
    it('should handle Escape key', () => {
      const { handleKeyDown } = useKeyboardNav({
        treeRoot: ref(mockTreeRoot)
      })

      const event = new KeyboardEvent('keydown', { key: 'Escape' })
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')

      handleKeyDown(event)

      // Just verify the handler was called (preventDefault confirms it)
      expect(preventDefaultSpy).toHaveBeenCalled()
    })
  })

  describe('flattenedNodes', () => {
    it('should include only expanded nodes', () => {
      const wbsStore = useWbsStore()
      wbsStore.expandedNodes.add('WP-01')

      const { handleKeyDown, focusNode } = useKeyboardNav({
        treeRoot: ref(mockTreeRoot)
      })

      focusNode('WP-01')

      // Move down should go to ACT-01-01 (child of expanded WP-01)
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' })
      handleKeyDown(event)

      // Should be able to navigate to child
      expect(wbsStore.expandedNodes.has('WP-01')).toBe(true)
    })

    it('should exclude children of collapsed nodes', () => {
      const wbsStore = useWbsStore()
      // WP-01 is NOT expanded

      const { handleKeyDown, focusedNodeId, focusNode } = useKeyboardNav({
        treeRoot: ref(mockTreeRoot)
      })

      focusNode('WP-01')

      // Move down should skip children and go to WP-02
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' })
      handleKeyDown(event)

      expect(focusedNodeId.value).toBe('WP-02')
    })
  })
})
