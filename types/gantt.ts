/**
 * Gantt Chart Dependency Arrow Types
 * Task: TSK-06-02
 */

// Arrow status based on task states
export type ArrowStatus = 'completed' | 'active' | 'pending' | 'error'

// Coordinate for SVG positioning
export interface GanttCoordinate {
  x: number  // X coordinate in pixels
  y: number  // Y coordinate in pixels
}

// Task bar bounding box
export interface GanttTaskBounds {
  taskId: string     // Task ID
  left: number       // Left X coordinate
  right: number      // Right X coordinate
  top: number        // Top Y coordinate
  bottom: number     // Bottom Y coordinate
}

// Arrow data for SVG rendering
export interface GanttArrow {
  id: string              // Unique arrow ID: `${sourceId}-${targetId}`
  sourceId: string        // Source task ID
  targetId: string        // Target task ID
  path: string            // SVG path d attribute (M/H/V commands)
  status: ArrowStatus     // Arrow status for color
  markerEnd: string       // Arrow marker reference: `url(#arrowhead-${status})`
}

// Frappe Gantt task interface (subset)
export interface FrappeGanttTask {
  id: string
  name: string
  start: string    // YYYY-MM-DD
  end: string      // YYYY-MM-DD
  progress: number // 0-100
  dependencies?: string  // Comma-separated task IDs
}
