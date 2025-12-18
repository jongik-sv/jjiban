/**
 * Gantt Chart Dependency Arrows Composable
 * Task: TSK-06-02
 *
 * Converts task dependency edges to SVG arrow paths for Gantt chart overlay
 */

import type { TaskEdge } from '@/types/graph'
import type { GanttArrow, GanttTaskBounds, ArrowStatus } from '@/types/gantt'

export function useGanttDependencies() {
  const wbsStore = useWbsStore()
  const { extractStatusCode } = useDependencyGraph()

  /**
   * Build Gantt arrows from task edges and container DOM
   *
   * @param edges Task dependency edges
   * @param containerEl Gantt chart container element
   * @returns Array of GanttArrow data for SVG rendering
   */
  function buildGanttArrows(
    edges: TaskEdge[],
    containerEl: HTMLElement
  ): GanttArrow[] {
    const arrows: GanttArrow[] = []
    const containerRect = containerEl.getBoundingClientRect()

    edges.forEach(edge => {
      try {
        // Query task bar DOM elements by data-id attribute
        const sourceBar = containerEl.querySelector(`[data-task-id="${edge.source}"]`) as HTMLElement
        const targetBar = containerEl.querySelector(`[data-task-id="${edge.target}"]`) as HTMLElement

        if (!sourceBar || !targetBar) {
          console.warn(`[useGanttDependencies] Task bar not found: source=${edge.source}, target=${edge.target}`)
          return
        }

        // Extract bounding boxes
        const sourceBounds = getTaskBounds(edge.source, sourceBar, containerRect)
        const targetBounds = getTaskBounds(edge.target, targetBar, containerRect)

        // Calculate SVG path
        const path = calculateArrowPath(sourceBounds, targetBounds)

        // Determine arrow status from task states
        const sourceNode = wbsStore.flatNodes.get(`${wbsStore.selectedProjectId}:${edge.source}`)
        const targetNode = wbsStore.flatNodes.get(`${wbsStore.selectedProjectId}:${edge.target}`)

        const sourceStatus = sourceNode ? extractStatusCode(sourceNode.status) : '[ ]'
        const targetStatus = targetNode ? extractStatusCode(targetNode.status) : '[ ]'
        const status = getArrowStatus(sourceStatus, targetStatus)

        arrows.push({
          id: `${edge.source}-${edge.target}`,
          sourceId: edge.source,
          targetId: edge.target,
          path,
          status,
          markerEnd: `url(#arrowhead-${status})`
        })
      } catch (error) {
        console.error(`[useGanttDependencies] Failed to build arrow: ${edge.id}`, error)
      }
    })

    return arrows
  }

  /**
   * Get task bar bounding box relative to container
   */
  function getTaskBounds(
    taskId: string,
    taskBar: HTMLElement,
    containerRect: DOMRect
  ): GanttTaskBounds {
    const barRect = taskBar.getBoundingClientRect()

    return {
      taskId,
      left: barRect.left - containerRect.left,
      right: barRect.right - containerRect.left,
      top: barRect.top - containerRect.top,
      bottom: barRect.bottom - containerRect.top
    }
  }

  /**
   * Calculate center Y coordinate of task bounds
   */
  function getCenterY(bounds: GanttTaskBounds): number {
    return (bounds.top + bounds.bottom) / 2
  }

  /**
   * Calculate SVG path for step-style arrow (horizontal-vertical-horizontal)
   *
   * Path format: M x1,y1 H x2 V y3 H x3
   * - M: moveTo starting point (source right center)
   * - H: horizontal line to midpoint
   * - V: vertical line to target height
   * - H: horizontal line to target left center
   */
  function calculateArrowPath(
    source: GanttTaskBounds,
    target: GanttTaskBounds
  ): string {
    const x1 = source.right
    const y1 = getCenterY(source)

    const x3 = target.left
    const y3 = getCenterY(target)

    // Midpoint X coordinate
    const x2 = (x1 + x3) / 2

    return `M ${x1},${y1} H ${x2} V ${y3} H ${x3}`
  }

  /**
   * Determine arrow status based on source and target task statuses
   *
   * Logic:
   * - Both [xx] → completed
   * - Either [im] or [vf] → active
   * - Otherwise → pending
   * - Circular dependency → error (handled externally)
   */
  function getArrowStatus(sourceStatus: string, targetStatus: string): ArrowStatus {
    // Both completed
    if (sourceStatus === '[xx]' && targetStatus === '[xx]') {
      return 'completed'
    }

    // Either in progress or verify
    if (
      sourceStatus === '[im]' || sourceStatus === '[vf]' ||
      targetStatus === '[im]' || targetStatus === '[vf]'
    ) {
      return 'active'
    }

    // Default pending
    return 'pending'
  }

  /**
   * Filter visible arrows for viewport (virtualization optimization)
   *
   * @param arrows All arrows
   * @param viewportBounds Viewport bounding box
   * @returns Arrows intersecting with viewport
   */
  function filterVisibleArrows(
    arrows: GanttArrow[],
    viewportBounds: { left: number; right: number; top: number; bottom: number }
  ): GanttArrow[] {
    // For simplicity, enable virtualization only if arrow count > 100
    if (arrows.length <= 100) {
      return arrows
    }

    return arrows.filter(arrow => {
      // Parse path to extract bounding box (simplified AABB check)
      // Path format: M x1,y1 H x2 V y3 H x3 (5 numbers)
      const coords = arrow.path.match(/[\d.]+/g)?.map(Number)
      if (!coords || coords.length < 5) return true

      const [x1, y1, x2, y3, x3] = coords
      const minX = Math.min(x1, x2, x3)
      const maxX = Math.max(x1, x2, x3)
      const minY = Math.min(y1, y3)
      const maxY = Math.max(y1, y3)

      // AABB intersection test
      return !(
        maxX < viewportBounds.left ||
        minX > viewportBounds.right ||
        maxY < viewportBounds.top ||
        minY > viewportBounds.bottom
      )
    })
  }

  return {
    buildGanttArrows,
    calculateArrowPath,
    getArrowStatus,
    getCenterY,
    filterVisibleArrows
  }
}
