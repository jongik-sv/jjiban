<script setup lang="ts">
/**
 * Gantt Dependency Overlay Component
 * Task: TSK-06-02
 *
 * Renders SVG arrows over Gantt chart to visualize task dependencies
 */

import type { GanttArrow } from '@/types/gantt'

// Props
interface Props {
  arrows: GanttArrow[]
  selectedTaskId?: string | null
  containerWidth: number
  containerHeight: number
}

const props = withDefaults(defineProps<Props>(), {
  selectedTaskId: null
})

// Events
const emit = defineEmits<{
  arrowClick: [payload: { sourceId: string; targetId: string }]
  arrowHover: [payload: { sourceId: string; targetId: string; isHover: boolean }]
}>()

// State
const hoveredArrowId = ref<string | null>(null)
const tooltipVisible = ref(false)
const tooltipPosition = ref({ x: 0, y: 0 })
const tooltipContent = ref({ sourceId: '', targetId: '', status: '' })

// Handle arrow click
function handleArrowClick(arrow: GanttArrow) {
  emit('arrowClick', {
    sourceId: arrow.sourceId,
    targetId: arrow.targetId
  })
}

// Handle arrow hover enter
function handleArrowHoverEnter(arrow: GanttArrow, event: MouseEvent) {
  hoveredArrowId.value = arrow.id
  tooltipVisible.value = true
  tooltipPosition.value = {
    x: event.clientX,
    y: event.clientY
  }
  tooltipContent.value = {
    sourceId: arrow.sourceId,
    targetId: arrow.targetId,
    status: getStatusLabel(arrow.status)
  }

  emit('arrowHover', {
    sourceId: arrow.sourceId,
    targetId: arrow.targetId,
    isHover: true
  })
}

// Handle arrow hover leave
function handleArrowHoverLeave(arrow: GanttArrow) {
  hoveredArrowId.value = null
  tooltipVisible.value = false

  emit('arrowHover', {
    sourceId: arrow.sourceId,
    targetId: arrow.targetId,
    isHover: false
  })
}

// Get status label
function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    completed: '완료',
    active: '진행중',
    pending: '대기',
    error: '순환 의존성'
  }
  return labels[status] || status
}

// Check if arrow is highlighted
function isArrowHighlighted(arrow: GanttArrow): boolean {
  if (!props.selectedTaskId) return false
  return arrow.sourceId === props.selectedTaskId || arrow.targetId === props.selectedTaskId
}

// Check if arrow is dimmed
function isArrowDimmed(arrow: GanttArrow): boolean {
  if (!props.selectedTaskId) return false
  return !isArrowHighlighted(arrow)
}

// Get arrow CSS classes
function getArrowClasses(arrow: GanttArrow): string[] {
  const classes = ['gantt-arrow', `gantt-arrow-${arrow.status}`]

  if (isArrowHighlighted(arrow)) {
    classes.push('gantt-arrow-highlighted')
  } else if (isArrowDimmed(arrow)) {
    classes.push('gantt-arrow-dimmed')
  }

  return classes
}
</script>

<template>
  <div class="gantt-arrows-overlay">
    <svg
      :width="containerWidth"
      :height="containerHeight"
      role="group"
      aria-label="Task 의존관계 화살표"
    >
      <title>Gantt 차트 의존관계</title>
      <desc>Task 간 선후행 관계를 화살표로 표시합니다.</desc>

      <!-- Arrow markers definition -->
      <defs>
        <marker
          id="arrowhead-completed"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="5"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--color-success)" />
        </marker>

        <marker
          id="arrowhead-active"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="5"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--color-primary)" />
        </marker>

        <marker
          id="arrowhead-pending"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="5"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--color-text-muted)" />
        </marker>

        <marker
          id="arrowhead-error"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="5"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--color-danger)" />
        </marker>

        <marker
          id="arrowhead-highlighted"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="5"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" class="gantt-arrow-marker-highlighted" />
        </marker>
      </defs>

      <!-- Render arrows -->
      <path
        v-for="arrow in arrows"
        :key="arrow.id"
        :d="arrow.path"
        :class="getArrowClasses(arrow)"
        :marker-end="isArrowHighlighted(arrow) ? 'url(#arrowhead-highlighted)' : arrow.markerEnd"
        role="img"
        :aria-label="`${arrow.sourceId}에서 ${arrow.targetId}로의 의존관계, 상태: ${getStatusLabel(arrow.status)}`"
        tabindex="0"
        @click="handleArrowClick(arrow)"
        @mouseenter="(e) => handleArrowHoverEnter(arrow, e)"
        @mouseleave="handleArrowHoverLeave(arrow)"
      />
    </svg>

    <!-- Tooltip -->
    <Teleport to="body">
      <div
        v-if="tooltipVisible"
        :style="{
          position: 'fixed',
          left: `${tooltipPosition.x + 10}px`,
          top: `${tooltipPosition.y + 10}px`,
          zIndex: 9999
        }"
        class="gantt-arrow-tooltip"
      >
        <div class="bg-bg-card border border-border rounded-lg p-3 shadow-lg text-sm">
          <div class="font-medium">{{ tooltipContent.sourceId }} → {{ tooltipContent.targetId }}</div>
          <div class="text-text-secondary mt-1">상태: {{ tooltipContent.status }}</div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
/* Component-specific styles - most styles in main.css */
.gantt-arrow-tooltip {
  pointer-events: none;
}
</style>
