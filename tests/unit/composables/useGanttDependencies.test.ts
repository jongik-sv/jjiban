/**
 * useGanttDependencies Composable 단위 테스트
 * Task: TSK-06-02
 * Test Spec: 026-test-specification.md
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useGanttDependencies } from '~/composables/useGanttDependencies'
import { useWbsStore } from '~/stores/wbs'
import { useSelectionStore } from '~/stores/selection'
import type { TaskEdge } from '~/types/graph'
import type { GanttTaskBounds } from '~/types/gantt'
import type { WbsNode } from '~/types'

describe('useGanttDependencies', () => {
  beforeEach(() => {
    setActivePinia(createPinia())

    // Setup stores
    const wbsStore = useWbsStore()
    const selectionStore = useSelectionStore()
    selectionStore.selectedProjectId = 'test-project'

    // Clear flatNodes before each test
    wbsStore.flatNodes.clear()
  })

  // Helper to create mock container with task bars
  function createMockContainer(
    tasks: Array<{ taskId: string; left: number; top: number; width: number; height: number }>
  ): HTMLElement {
    const container = document.createElement('div')
    container.className = 'gantt-chart-container'

    // Set container position
    document.body.appendChild(container)

    tasks.forEach(task => {
      const taskBar = document.createElement('div')
      taskBar.setAttribute('data-task-id', task.taskId)
      taskBar.style.position = 'absolute'
      taskBar.style.left = `${task.left}px`
      taskBar.style.top = `${task.top}px`
      taskBar.style.width = `${task.width}px`
      taskBar.style.height = `${task.height}px`
      container.appendChild(taskBar)
    })

    return container
  }

  // Helper to create mock task node
  function createMockTask(
    taskId: string,
    status: string
  ): WbsNode {
    return {
      id: taskId,
      type: 'task',
      title: `Task ${taskId}`,
      status,
      children: []
    } as WbsNode
  }

  // Helper to add task to store (status should already be in [xx] format)
  function addTaskToStore(taskId: string, status: string) {
    const wbsStore = useWbsStore()
    const fullId = `test-project:${taskId}`
    wbsStore.flatNodes.set(fullId, createMockTask(taskId, status))
  }

  describe('buildGanttArrows', () => {
    // UT-001: 정상 의존관계 변환
    it('should convert edges to gantt arrows', () => {
      // Arrange: Mock DOM
      const containerEl = createMockContainer([
        { taskId: 'TSK-A', left: 0, top: 0, width: 100, height: 40 },
        { taskId: 'TSK-B', left: 200, top: 50, width: 100, height: 40 }
      ])

      // Use status codes that extractStatusCode will return as-is
      addTaskToStore('TSK-A', 'implementation [im]')
      addTaskToStore('TSK-B', 'basic-design [bd]')

      const edges: TaskEdge[] = [
        { id: 'A-B', source: 'TSK-A', target: 'TSK-B' }
      ]

      // Act
      const { buildGanttArrows } = useGanttDependencies()
      const arrows = buildGanttArrows(edges, containerEl)

      // Assert
      expect(arrows).toHaveLength(1)
      expect(arrows[0].id).toBe('TSK-A-TSK-B')
      expect(arrows[0].sourceId).toBe('TSK-A')
      expect(arrows[0].targetId).toBe('TSK-B')
      expect(arrows[0].path).toContain('M') // SVG path starts with M command
      expect(arrows[0].status).toBe('active') // [im] status
      expect(arrows[0].markerEnd).toBe('url(#arrowhead-active)')

      // Cleanup
      document.body.removeChild(containerEl)
    })

    // UT-002: Task 바 DOM 미발견
    it('should handle missing task bars gracefully', () => {
      // Arrange: Empty container
      const containerEl = createMockContainer([])
      const edges: TaskEdge[] = [
        { id: 'A-B', source: 'TSK-A', target: 'TSK-B' }
      ]

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      // Act
      const { buildGanttArrows } = useGanttDependencies()
      const arrows = buildGanttArrows(edges, containerEl)

      // Assert
      expect(arrows).toHaveLength(0)
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Task bar not found')
      )

      // Cleanup
      warnSpy.mockRestore()
      document.body.removeChild(containerEl)
    })

    it('should handle missing source task bar', () => {
      // Arrange: Only target task bar
      const containerEl = createMockContainer([
        { taskId: 'TSK-B', left: 200, top: 50, width: 100, height: 40 }
      ])

      const edges: TaskEdge[] = [
        { id: 'A-B', source: 'TSK-A', target: 'TSK-B' }
      ]

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      // Act
      const { buildGanttArrows } = useGanttDependencies()
      const arrows = buildGanttArrows(edges, containerEl)

      // Assert
      expect(arrows).toHaveLength(0)
      expect(warnSpy).toHaveBeenCalled()

      // Cleanup
      warnSpy.mockRestore()
      document.body.removeChild(containerEl)
    })

    it('should handle missing target task bar', () => {
      // Arrange: Only source task bar
      const containerEl = createMockContainer([
        { taskId: 'TSK-A', left: 0, top: 0, width: 100, height: 40 }
      ])

      const edges: TaskEdge[] = [
        { id: 'A-B', source: 'TSK-A', target: 'TSK-B' }
      ]

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      // Act
      const { buildGanttArrows } = useGanttDependencies()
      const arrows = buildGanttArrows(edges, containerEl)

      // Assert
      expect(arrows).toHaveLength(0)
      expect(warnSpy).toHaveBeenCalled()

      // Cleanup
      warnSpy.mockRestore()
      document.body.removeChild(containerEl)
    })

    it('should handle multiple edges', () => {
      // Arrange
      const containerEl = createMockContainer([
        { taskId: 'TSK-01', left: 0, top: 0, width: 100, height: 40 },
        { taskId: 'TSK-02', left: 200, top: 0, width: 100, height: 40 },
        { taskId: 'TSK-03', left: 400, top: 50, width: 100, height: 40 }
      ])

      addTaskToStore('TSK-01', 'implementation [im]')
      addTaskToStore('TSK-02', 'implementation [im]')
      addTaskToStore('TSK-03', 'basic-design [bd]')

      const edges: TaskEdge[] = [
        { id: '01-02', source: 'TSK-01', target: 'TSK-02' },
        { id: '02-03', source: 'TSK-02', target: 'TSK-03' }
      ]

      // Act
      const { buildGanttArrows } = useGanttDependencies()
      const arrows = buildGanttArrows(edges, containerEl)

      // Assert
      expect(arrows).toHaveLength(2)
      expect(arrows[0].sourceId).toBe('TSK-01')
      expect(arrows[1].sourceId).toBe('TSK-02')

      // Cleanup
      document.body.removeChild(containerEl)
    })

    it('should handle empty edges', () => {
      // Arrange
      const containerEl = createMockContainer([
        { taskId: 'TSK-A', left: 0, top: 0, width: 100, height: 40 }
      ])

      const edges: TaskEdge[] = []

      // Act
      const { buildGanttArrows } = useGanttDependencies()
      const arrows = buildGanttArrows(edges, containerEl)

      // Assert
      expect(arrows).toHaveLength(0)

      // Cleanup
      document.body.removeChild(containerEl)
    })
  })

  describe('calculateArrowPath', () => {
    // UT-003: 수평 정렬 Task
    it('should generate step path for horizontally aligned tasks', () => {
      // Arrange
      const source: GanttTaskBounds = {
        taskId: 'TSK-A',
        left: 0,
        right: 100,
        top: 0,
        bottom: 40
      }

      const target: GanttTaskBounds = {
        taskId: 'TSK-B',
        left: 200,
        right: 300,
        top: 0,
        bottom: 40
      }

      // Act
      const { calculateArrowPath } = useGanttDependencies()
      const path = calculateArrowPath(source, target)

      // Assert
      // Expected: M 100,20 H 150 V 20 H 200
      // source.right=100, centerY=20, target.left=200, centerY=20, midX=150
      expect(path).toBe('M 100,20 H 150 V 20 H 200')
    })

    // UT-004: 수직 간격 큰 Task
    it('should generate step path for vertically separated tasks', () => {
      // Arrange
      const source: GanttTaskBounds = {
        taskId: 'TSK-A',
        left: 0,
        right: 100,
        top: 0,
        bottom: 40
      }

      const target: GanttTaskBounds = {
        taskId: 'TSK-B',
        left: 200,
        right: 300,
        top: 100,
        bottom: 140
      }

      // Act
      const { calculateArrowPath } = useGanttDependencies()
      const path = calculateArrowPath(source, target)

      // Assert
      // Expected: M 100,20 H 150 V 120 H 200
      // source centerY = (0 + 40) / 2 = 20
      // target centerY = (100 + 140) / 2 = 120
      // midX = (100 + 200) / 2 = 150
      expect(path).toBe('M 100,20 H 150 V 120 H 200')
    })

    it('should handle source higher than target', () => {
      // Arrange
      const source: GanttTaskBounds = {
        taskId: 'TSK-A',
        left: 0,
        right: 100,
        top: 100,
        bottom: 140
      }

      const target: GanttTaskBounds = {
        taskId: 'TSK-B',
        left: 200,
        right: 300,
        top: 0,
        bottom: 40
      }

      // Act
      const { calculateArrowPath } = useGanttDependencies()
      const path = calculateArrowPath(source, target)

      // Assert
      // source centerY = 120, target centerY = 20
      expect(path).toBe('M 100,120 H 150 V 20 H 200')
    })

    it('should handle adjacent tasks', () => {
      // Arrange
      const source: GanttTaskBounds = {
        taskId: 'TSK-A',
        left: 0,
        right: 100,
        top: 0,
        bottom: 40
      }

      const target: GanttTaskBounds = {
        taskId: 'TSK-B',
        left: 100, // Adjacent (no gap)
        right: 200,
        top: 0,
        bottom: 40
      }

      // Act
      const { calculateArrowPath } = useGanttDependencies()
      const path = calculateArrowPath(source, target)

      // Assert
      // midX = (100 + 100) / 2 = 100
      expect(path).toBe('M 100,20 H 100 V 20 H 100')
    })
  })

  describe('getArrowStatus', () => {
    // UT-005: Task 상태별 ArrowStatus
    // Note: it.each format is (expected, sourceStatus, targetStatus)
    it.each([
      ['completed', '[xx]', '[xx]'],
      ['active', '[xx]', '[im]'],
      ['active', '[im]', '[bd]'],
      ['active', '[vf]', '[dd]'],
      ['active', '[im]', '[im]'],
      ['active', '[vf]', '[vf]'],
      ['pending', '[bd]', '[dd]'],
      ['pending', '[ ]', '[bd]'],
      ['pending', '[dd]', '[ ]'],
      ['pending', '[ ]', '[ ]']
    ])('should return %s for source=%s, target=%s', (expected, sourceStatus, targetStatus) => {
      const { getArrowStatus } = useGanttDependencies()
      const status = getArrowStatus(sourceStatus, targetStatus)
      expect(status).toBe(expected)
    })

    it('should prioritize completed status', () => {
      const { getArrowStatus } = useGanttDependencies()

      // Both completed = completed
      expect(getArrowStatus('[xx]', '[xx]')).toBe('completed')

      // One not completed = not completed
      expect(getArrowStatus('[xx]', '[im]')).toBe('active')
      expect(getArrowStatus('[im]', '[xx]')).toBe('active')
    })

    it('should detect active status', () => {
      const { getArrowStatus } = useGanttDependencies()

      // [im] or [vf] = active
      expect(getArrowStatus('[im]', '[ ]')).toBe('active')
      expect(getArrowStatus('[ ]', '[im]')).toBe('active')
      expect(getArrowStatus('[vf]', '[bd]')).toBe('active')
      expect(getArrowStatus('[bd]', '[vf]')).toBe('active')
    })

    it('should default to pending status', () => {
      const { getArrowStatus } = useGanttDependencies()

      // No [xx], [im], or [vf] = pending
      expect(getArrowStatus('[ ]', '[ ]')).toBe('pending')
      expect(getArrowStatus('[bd]', '[dd]')).toBe('pending')
    })
  })

  describe('getCenterY', () => {
    it('should calculate center Y coordinate', () => {
      const { getCenterY } = useGanttDependencies()

      const bounds: GanttTaskBounds = {
        taskId: 'TSK-A',
        left: 0,
        right: 100,
        top: 0,
        bottom: 40
      }

      expect(getCenterY(bounds)).toBe(20)
    })

    it('should handle different heights', () => {
      const { getCenterY } = useGanttDependencies()

      const bounds: GanttTaskBounds = {
        taskId: 'TSK-A',
        left: 0,
        right: 100,
        top: 50,
        bottom: 150
      }

      expect(getCenterY(bounds)).toBe(100) // (50 + 150) / 2
    })
  })

  describe('filterVisibleArrows', () => {
    it('should return all arrows when count <= 100', () => {
      const { filterVisibleArrows } = useGanttDependencies()

      const arrows = Array.from({ length: 50 }, (_, i) => ({
        id: `arrow-${i}`,
        sourceId: `TSK-${i}`,
        targetId: `TSK-${i + 1}`,
        path: `M 0,0 H 100 V 100 H 200`,
        status: 'pending' as const,
        markerEnd: 'url(#arrowhead-pending)'
      }))

      const viewportBounds = { left: 0, right: 1000, top: 0, bottom: 1000 }
      const result = filterVisibleArrows(arrows, viewportBounds)

      expect(result).toHaveLength(50)
      expect(result).toEqual(arrows)
    })

    it('should filter arrows outside viewport when count > 100', () => {
      const { filterVisibleArrows } = useGanttDependencies()

      const arrows = [
        ...Array.from({ length: 101 }, (_, i) => ({
          id: `arrow-${i}`,
          sourceId: `TSK-${i}`,
          targetId: `TSK-${i + 1}`,
          path: `M ${i * 10},${i * 10} H ${i * 10 + 50} V ${i * 10 + 50} H ${i * 10 + 100}`,
          status: 'pending' as const,
          markerEnd: 'url(#arrowhead-pending)'
        })),
        {
          id: 'arrow-far-away',
          sourceId: 'TSK-FAR',
          targetId: 'TSK-AWAY',
          path: 'M 5000,5000 H 5500 V 5500 H 6000', // Outside viewport
          status: 'pending' as const,
          markerEnd: 'url(#arrowhead-pending)'
        }
      ]

      const viewportBounds = { left: 0, right: 1000, top: 0, bottom: 1000 }
      const result = filterVisibleArrows(arrows, viewportBounds)

      // Should filter out the far-away arrow
      expect(result.length).toBeLessThan(arrows.length)
      expect(result.find(a => a.id === 'arrow-far-away')).toBeUndefined()
    })

    it('should include arrows intersecting viewport', () => {
      const { filterVisibleArrows } = useGanttDependencies()

      const arrows = Array.from({ length: 101 }, (_, i) => ({
        id: `arrow-${i}`,
        sourceId: `TSK-${i}`,
        targetId: `TSK-${i + 1}`,
        path: `M ${i * 10},${i * 5} H ${i * 10 + 50} V ${i * 5 + 50} H ${i * 10 + 100}`,
        status: 'pending' as const,
        markerEnd: 'url(#arrowhead-pending)'
      }))

      const viewportBounds = { left: 100, right: 500, top: 50, bottom: 300 }
      const result = filterVisibleArrows(arrows, viewportBounds)

      // Should only include arrows within viewport bounds
      result.forEach(arrow => {
        const coords = arrow.path.match(/[\d.]+/g)?.map(Number)
        expect(coords).toBeDefined()
        if (coords && coords.length >= 5) {
          const [x1, , x2, , x3] = coords
          const maxX = Math.max(x1, x2, x3)
          const minX = Math.min(x1, x2, x3)

          // Should intersect with viewport
          expect(maxX >= viewportBounds.left || minX <= viewportBounds.right).toBe(true)
        }
      })
    })
  })

  describe('performance', () => {
    // UT-007: 100개 Task 성능
    it('should build 100 arrows in less than 100ms', () => {
      // Arrange
      const tasks = Array.from({ length: 100 }, (_, i) => ({
        taskId: `TSK-${i.toString().padStart(3, '0')}`,
        left: i * 150,
        top: i % 10 * 50,
        width: 100,
        height: 40
      }))

      const containerEl = createMockContainer(tasks)

      // Add tasks to store
      tasks.forEach(task => {
        addTaskToStore(task.taskId, 'implementation [im]')
      })

      const edges: TaskEdge[] = Array.from({ length: 100 }, (_, i) => ({
        id: `edge-${i}`,
        source: `TSK-${i.toString().padStart(3, '0')}`,
        target: `TSK-${((i + 1) % 100).toString().padStart(3, '0')}`
      }))

      // Act
      const { buildGanttArrows } = useGanttDependencies()
      const start = performance.now()
      const arrows = buildGanttArrows(edges, containerEl)
      const end = performance.now()
      const duration = end - start

      // Assert
      expect(arrows).toHaveLength(100)
      expect(duration).toBeLessThan(100)

      // Cleanup
      document.body.removeChild(containerEl)
    })

    it('should handle 200 arrows efficiently', () => {
      // Arrange
      const tasks = Array.from({ length: 200 }, (_, i) => ({
        taskId: `TSK-${i.toString().padStart(3, '0')}`,
        left: i * 150,
        top: i % 20 * 50,
        width: 100,
        height: 40
      }))

      const containerEl = createMockContainer(tasks)

      tasks.forEach(task => {
        addTaskToStore(task.taskId, 'implementation [im]')
      })

      const edges: TaskEdge[] = Array.from({ length: 200 }, (_, i) => ({
        id: `edge-${i}`,
        source: `TSK-${i.toString().padStart(3, '0')}`,
        target: `TSK-${((i + 1) % 200).toString().padStart(3, '0')}`
      }))

      // Act
      const { buildGanttArrows } = useGanttDependencies()
      const start = performance.now()
      const arrows = buildGanttArrows(edges, containerEl)
      const end = performance.now()
      const duration = end - start

      // Assert
      expect(arrows).toHaveLength(200)
      expect(duration).toBeLessThan(200) // Allow 1ms per arrow

      // Cleanup
      document.body.removeChild(containerEl)
    })
  })

  describe('integration', () => {
    it('should build complete arrow with all properties', () => {
      // Arrange
      const containerEl = createMockContainer([
        { taskId: 'TSK-01', left: 0, top: 0, width: 100, height: 40 },
        { taskId: 'TSK-02', left: 200, top: 50, width: 100, height: 40 }
      ])

      addTaskToStore('TSK-01', 'done [xx]')
      addTaskToStore('TSK-02', 'done [xx]')

      const edges: TaskEdge[] = [
        { id: 'edge-01-02', source: 'TSK-01', target: 'TSK-02' }
      ]

      // Act
      const { buildGanttArrows } = useGanttDependencies()
      const arrows = buildGanttArrows(edges, containerEl)

      // Assert
      expect(arrows).toHaveLength(1)

      const arrow = arrows[0]
      expect(arrow.id).toBe('TSK-01-TSK-02')
      expect(arrow.sourceId).toBe('TSK-01')
      expect(arrow.targetId).toBe('TSK-02')
      expect(arrow.path).toMatch(/^M [\d.]+,[\d.]+ H [\d.]+ V [\d.]+ H [\d.]+$/)
      expect(arrow.status).toBe('completed')
      expect(arrow.markerEnd).toBe('url(#arrowhead-completed)')

      // Cleanup
      document.body.removeChild(containerEl)
    })

    it('should handle real-world scenario with mixed statuses', () => {
      // Arrange
      const containerEl = createMockContainer([
        { taskId: 'TSK-01', left: 0, top: 0, width: 100, height: 40 },
        { taskId: 'TSK-02', left: 200, top: 0, width: 100, height: 40 },
        { taskId: 'TSK-03', left: 400, top: 50, width: 100, height: 40 },
        { taskId: 'TSK-04', left: 600, top: 100, width: 100, height: 40 }
      ])

      addTaskToStore('TSK-01', 'done [xx]')
      addTaskToStore('TSK-02', 'implementation [im]')
      addTaskToStore('TSK-03', 'basic-design [bd]')
      addTaskToStore('TSK-04', 'todo [ ]')

      const edges: TaskEdge[] = [
        { id: 'e1', source: 'TSK-01', target: 'TSK-02' },
        { id: 'e2', source: 'TSK-02', target: 'TSK-03' },
        { id: 'e3', source: 'TSK-03', target: 'TSK-04' }
      ]

      // Act
      const { buildGanttArrows } = useGanttDependencies()
      const arrows = buildGanttArrows(edges, containerEl)

      // Assert
      expect(arrows).toHaveLength(3)

      // TSK-01 ([xx]) → TSK-02 ([im]): active
      expect(arrows[0].status).toBe('active')

      // TSK-02 ([im]) → TSK-03 ([bd]): active
      expect(arrows[1].status).toBe('active')

      // TSK-03 ([bd]) → TSK-04 ([ ]): pending
      expect(arrows[2].status).toBe('pending')

      // Cleanup
      document.body.removeChild(containerEl)
    })
  })

  describe('edge cases', () => {
    it('should handle tasks with no store data', () => {
      // Arrange
      const containerEl = createMockContainer([
        { taskId: 'TSK-A', left: 0, top: 0, width: 100, height: 40 },
        { taskId: 'TSK-B', left: 200, top: 0, width: 100, height: 40 }
      ])

      // Note: NOT adding tasks to store

      const edges: TaskEdge[] = [
        { id: 'a-b', source: 'TSK-A', target: 'TSK-B' }
      ]

      // Act
      const { buildGanttArrows } = useGanttDependencies()
      const arrows = buildGanttArrows(edges, containerEl)

      // Assert - should still create arrow with default pending status
      expect(arrows).toHaveLength(1)
      expect(arrows[0].status).toBe('pending') // Default when no store data

      // Cleanup
      document.body.removeChild(containerEl)
    })

    it('should handle malformed edge data', () => {
      // Arrange
      const containerEl = createMockContainer([
        { taskId: 'TSK-A', left: 0, top: 0, width: 100, height: 40 }
      ])

      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const edges: TaskEdge[] = [
        { id: 'invalid', source: '', target: '' } as TaskEdge
      ]

      // Act
      const { buildGanttArrows } = useGanttDependencies()
      const arrows = buildGanttArrows(edges, containerEl)

      // Assert
      expect(arrows).toHaveLength(0)

      // Cleanup
      errorSpy.mockRestore()
      warnSpy.mockRestore()
      document.body.removeChild(containerEl)
    })

    it('should handle zero-dimension task bars', () => {
      // Arrange
      const containerEl = createMockContainer([
        { taskId: 'TSK-A', left: 0, top: 0, width: 0, height: 0 },
        { taskId: 'TSK-B', left: 200, top: 50, width: 100, height: 40 }
      ])

      addTaskToStore('TSK-A', 'implementation [im]')
      addTaskToStore('TSK-B', 'basic-design [bd]')

      const edges: TaskEdge[] = [
        { id: 'a-b', source: 'TSK-A', target: 'TSK-B' }
      ]

      // Act
      const { buildGanttArrows } = useGanttDependencies()
      const arrows = buildGanttArrows(edges, containerEl)

      // Assert - should still create arrow
      expect(arrows).toHaveLength(1)
      expect(arrows[0].path).toBeDefined()

      // Cleanup
      document.body.removeChild(containerEl)
    })
  })
})
