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
/* Frappe Gantt base styles */
.gantt-chart-container {
  width: 100%;
  height: 100%;
  overflow: auto;
}

.gantt .bar {
  fill: var(--color-primary);
}

.gantt .bar-progress {
  fill: var(--color-success);
}

.gantt .bar-label {
  fill: white;
  font-size: 12px;
}

.gantt-popup {
  background: var(--color-card);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.gantt-popup h5 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
}

.gantt-popup p {
  margin: 4px 0;
  font-size: 12px;
  color: var(--color-text-secondary);
}

/* Add data-task-id attributes for arrow positioning */
.gantt .bar {
  cursor: pointer;
}

/* Dark theme for Frappe Gantt */
.gantt-container {
  background: var(--color-bg);
}

.gantt-container .grid-header {
  fill: var(--color-header);
  stroke: var(--color-border);
}

.gantt-container .grid-row {
  fill: var(--color-bg);
}

.gantt-container .grid-row:nth-child(even) {
  fill: var(--color-card);
}

.gantt-container .row-line {
  stroke: var(--color-border);
}

.gantt-container .tick {
  stroke: var(--color-border);
}

.gantt-container .today-highlight {
  fill: rgba(59, 130, 246, 0.1);
}

.gantt-container text {
  fill: var(--color-text);
}

.gantt-container .upper-text,
.gantt-container .lower-text {
  fill: var(--color-text-secondary);
}
</style>
