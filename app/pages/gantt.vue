<script setup lang="ts">
/**
 * Gantt Chart Page
 * Task: TSK-06-02
 *
 * Displays Gantt chart with dependency arrows overlay
 */

import Gantt from 'frappe-gantt'
import type { FrappeGanttTask, GanttArrow } from '@/types/gantt'
import type { TaskEdge } from '@/types/graph'

definePageMeta({
  layout: 'default',
  title: 'Gantt 차트'
})

const wbsStore = useWbsStore()
const selectionStore = useSelectionStore()
const { buildGraphData } = useDependencyGraph()
const { buildGanttArrows } = useGanttDependencies()

// State
const ganttContainer = ref<HTMLElement | null>(null)
const ganttInstance = ref<any>(null)
const arrows = ref<GanttArrow[]>([])
const selectedTaskId = ref<string | null>(null)
const containerWidth = ref(0)
const containerHeight = ref(0)

// Computed
const currentProjectId = computed(() => selectionStore.selectedProjectId)

// Convert WBS nodes to Frappe Gantt tasks
function convertToGanttTasks(): FrappeGanttTask[] {
  const tasks: FrappeGanttTask[] = []

  wbsStore.flatNodes.forEach((node, id) => {
    if (node.type === 'task' && id.startsWith(`${currentProjectId.value}:`)) {
      const taskId = id.split(':')[1]
      const schedule = node.schedule || {
        start: new Date().toISOString().split('T')[0],
        end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }

      tasks.push({
        id: taskId,
        name: node.title,
        start: schedule.start,
        end: schedule.end,
        progress: node.progress || 0,
        dependencies: node.depends || ''
      })
    }
  })

  return tasks
}

// Initialize Gantt chart
function initGantt() {
  if (!ganttContainer.value) return

  const tasks = convertToGanttTasks()

  if (tasks.length === 0) {
    console.warn('[Gantt] No tasks found for current project')
    return
  }

  // Clean up existing instance
  if (ganttInstance.value) {
    ganttInstance.value = null
    ganttContainer.value.innerHTML = ''
  }

  // Create new Gantt instance
  ganttInstance.value = new Gantt(ganttContainer.value, tasks, {
    view_mode: 'Week',
    bar_height: 30,
    bar_corner_radius: 3,
    arrow_curve: 5,
    padding: 18,
    date_format: 'YYYY-MM-DD',
    custom_popup_html: (task: any) => {
      return `
        <div class="gantt-popup">
          <h5>${task.name}</h5>
          <p>기간: ${task._start.toLocaleDateString()} ~ ${task._end.toLocaleDateString()}</p>
          <p>진행률: ${task.progress}%</p>
        </div>
      `
    },
    on_click: (task: any) => {
      selectedTaskId.value = task.id
      updateArrows()
    }
  })

  // Update container dimensions
  updateContainerDimensions()

  // Build dependency arrows
  updateArrows()
}

// Update dependency arrows
function updateArrows() {
  if (!ganttContainer.value) return

  try {
    // Build graph data to get edges
    const { edges } = buildGraphData()

    // Build arrows
    arrows.value = buildGanttArrows(edges, ganttContainer.value)
  } catch (error) {
    console.error('[Gantt] Failed to build arrows:', error)
  }
}

// Update container dimensions
function updateContainerDimensions() {
  if (!ganttContainer.value) return

  const rect = ganttContainer.value.getBoundingClientRect()
  containerWidth.value = rect.width
  containerHeight.value = rect.height
}

// Handle arrow click
function handleArrowClick(payload: { sourceId: string; targetId: string }) {
  console.log('[Gantt] Arrow clicked:', payload)
  selectedTaskId.value = payload.targetId
}

// Handle arrow hover
function handleArrowHover(payload: { sourceId: string; targetId: string; isHover: boolean }) {
  // Optional: add visual feedback for hovered tasks
}

// Watch for project changes
watch(currentProjectId, () => {
  nextTick(() => {
    initGantt()
  })
})

const route = useRoute()
const router = useRouter()
const projectStore = useProjectStore()

// Initialize on mount
onMounted(async () => {
  // 1. WBS 데이터 로드 (먼저 로드해야 노드 선택 가능)
  if (wbsStore.flatNodes.size === 0) {
    await wbsStore.fetchAllWbs()
  }

  // 2. URL 쿼리에서 프로젝트 ID 확인 및 복원
  const projectIdFromUrl = route.query.project as string
  if (projectIdFromUrl) {
    // 프로젝트 선택 (ProjectStore & SelectionStore 동기화)
    if (projectStore.currentProject?.id !== projectIdFromUrl) {
      await projectStore.loadProject(projectIdFromUrl)
    }
    // WBS 로드 후 노드 선택 (selectedProjectId 설정)
    await selectionStore.selectNode(projectIdFromUrl)
  }

  nextTick(() => {
    initGantt()
  })

  // Add resize observer
  if (ganttContainer.value) {
    const resizeObserver = new ResizeObserver(() => {
      updateContainerDimensions()
      updateArrows()
    })
    resizeObserver.observe(ganttContainer.value)

    onBeforeUnmount(() => {
      resizeObserver.disconnect()
    })
  }
})
</script>

<template>
  <div class="gantt-page h-full flex flex-col">
    <!-- Header -->
    <div class="bg-bg-header border-b border-border p-4">
      <h1 class="text-2xl font-bold text-text">Gantt 차트</h1>
      <p class="text-sm text-text-secondary mt-1">
        프로젝트 일정과 의존관계 시각화
      </p>
    </div>

    <!-- Gantt Chart Container -->
    <div class="flex-1 p-4 overflow-auto">
      <div v-if="!currentProjectId" class="flex items-center justify-center h-full">
        <div class="text-center">
          <i class="pi pi-info-circle text-4xl text-text-muted mb-4" />
          <p class="text-text-secondary">프로젝트를 선택해주세요</p>
        </div>
      </div>

      <div v-else class="relative h-full min-h-[600px]">
        <!-- Frappe Gantt Container -->
        <div ref="ganttContainer" class="gantt-chart-container" />

        <!-- Dependency Arrows Overlay -->
        <GanttDependencyOverlay
          v-if="arrows.length > 0"
          :arrows="arrows"
          :selected-task-id="selectedTaskId"
          :container-width="containerWidth"
          :container-height="containerHeight"
          @arrow-click="handleArrowClick"
          @arrow-hover="handleArrowHover"
        />
      </div>
    </div>
  </div>
</template>

<style>
/* Dark theme - Override Frappe Gantt CSS variables */
.gantt-chart-container {
  --g-arrow-color: #94a3b8;
  --g-bar-color: #3b82f6;
  --g-bar-border: #2563eb;
  --g-tick-color-thick: #374151;
  --g-tick-color: #1f2937;
  --g-actions-background: #1f2937;
  --g-border-color: #374151;
  --g-text-muted: #9ca3af;
  --g-text-light: #f9fafb;
  --g-text-dark: #e5e7eb;
  --g-progress-color: #22c55e;
  --g-handle-color: #60a5fa;
  --g-weekend-label-color: #4b5563;
  --g-expected-progress: #6366f1;
  --g-header-background: #111827;
  --g-row-color: #111827;
  --g-row-border-color: #374151;
  --g-today-highlight: #fbbf24;
  --g-popup-actions: #1f2937;
  --g-weekend-highlight-color: #1f2937;

  width: 100%;
  height: 100%;
  overflow: auto;
  background: #111827;
}

/* Bar styles */
.gantt .bar {
  fill: var(--g-bar-color);
  cursor: pointer;
}

.gantt .bar-progress {
  fill: var(--g-progress-color);
}

.gantt .bar-label {
  fill: var(--g-text-light);
  font-size: 12px;
}

/* Popup styles */
.gantt-popup {
  background: #1f2937;
  color: #e5e7eb;
  border: 1px solid #374151;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.5);
}

.gantt-popup h5 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #f9fafb;
}

.gantt-popup p {
  margin: 4px 0;
  font-size: 12px;
  color: #9ca3af;
}

/* Grid and row overrides */
.gantt-container {
  background: #111827 !important;
}

.gantt .grid-background {
  fill: none;
}

.gantt .grid-row {
  fill: #1e293b;
}

.gantt .row-line {
  stroke: #374151;
}

.gantt .tick {
  stroke: #374151;
}

.gantt .tick.thick {
  stroke: #4b5563;
}

/* Header text */
.gantt-container .upper-text,
.gantt-container .lower-text {
  color: #9ca3af !important;
  fill: #9ca3af;
}

.gantt-container .current-upper {
  background: #111827 !important;
}

.gantt-container .grid-header {
  background-color: #111827 !important;
}

.gantt-container .side-header * {
  background-color: #1f2937 !important;
  color: #e5e7eb !important;
}

/* Arrow styles */
.gantt .arrow {
  stroke: #60a5fa;
}
</style>
