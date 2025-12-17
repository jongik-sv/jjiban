<script setup lang="ts">
/**
 * 의존관계 그래프 모달 컴포넌트
 * Task: TSK-06-01
 *
 * PrimeVue Dialog 기반 전체화면 모달
 */

import type { GraphFilter } from '~/types/graph'

// 클라이언트 전용 컴포넌트 동적 import
const DependencyGraph = defineAsyncComponent(() =>
  import('./DependencyGraph.client.vue')
)
const GraphLegend = defineAsyncComponent(() =>
  import('./GraphLegend.vue')
)

// Props
const visible = defineModel<boolean>('visible', { required: true })

// Emits
const emit = defineEmits<{
  taskSelect: [taskId: string]
}>()

// Composables
const { buildGraphData, getGraphStats, getCategoryName } = useDependencyGraph()
const selectionStore = useSelectionStore()

// Refs
const graphRef = ref<{ fit: () => void; zoomIn: () => void; zoomOut: () => void; resetZoom: () => void } | null>(null)

// State
const selectedCategories = ref<string[]>([])
const selectedStatuses = ref<string[]>([])
const isLoading = ref(true)

// Options for filters
const categoryOptions = [
  { label: '개발', value: 'development' },
  { label: '결함', value: 'defect' },
  { label: '인프라', value: 'infrastructure' }
]

const statusOptions = [
  { label: 'Todo', value: '[ ]' },
  { label: '기본설계', value: '[bd]' },
  { label: '상세설계', value: '[dd]' },
  { label: '구현', value: '[im]' },
  { label: '검증', value: '[vf]' },
  { label: '완료', value: '[xx]' }
]

// Computed
const graphData = computed(() => {
  const filter: GraphFilter | undefined =
    selectedCategories.value.length > 0 || selectedStatuses.value.length > 0
      ? {
          categories: selectedCategories.value,
          statuses: selectedStatuses.value
        }
      : undefined

  return buildGraphData(filter)
})

const stats = computed(() => getGraphStats())

// Methods
function handleNodeClick(event: { nodeId: string }) {
  selectionStore.selectNode(event.nodeId)
  emit('taskSelect', event.nodeId)
}

function handleNodeDoubleClick(event: { nodeId: string }) {
  selectionStore.selectNode(event.nodeId)
  emit('taskSelect', event.nodeId)
  visible.value = false
}

function handleStabilized() {
  isLoading.value = false
}

function resetFilters() {
  selectedCategories.value = []
  selectedStatuses.value = []
}

function zoomIn() {
  graphRef.value?.zoomIn()
}

function zoomOut() {
  graphRef.value?.zoomOut()
}

function resetZoom() {
  graphRef.value?.resetZoom()
}

// Watch modal open to reset loading state
watch(visible, (newVal) => {
  if (newVal) {
    isLoading.value = true
    // 모달이 열릴 때 잠시 후 fit 호출
    nextTick(() => {
      setTimeout(() => {
        graphRef.value?.fit()
      }, 100)
    })
  }
})
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    maximizable
    :style="{ width: '90vw', height: '85vh' }"
    header="의존관계 그래프"
    :pt="{
      content: { style: 'height: calc(100% - 60px); display: flex; flex-direction: column;' }
    }"
  >
    <!-- 툴바 -->
    <div class="graph-toolbar">
      <!-- 필터 -->
      <div class="filter-group">
        <MultiSelect
          v-model="selectedCategories"
          :options="categoryOptions"
          option-label="label"
          option-value="value"
          placeholder="카테고리"
          :max-selected-labels="2"
          class="filter-select"
        />

        <MultiSelect
          v-model="selectedStatuses"
          :options="statusOptions"
          option-label="label"
          option-value="value"
          placeholder="상태"
          :max-selected-labels="2"
          class="filter-select"
        />

        <Button
          v-if="selectedCategories.length > 0 || selectedStatuses.length > 0"
          icon="pi pi-filter-slash"
          severity="secondary"
          text
          rounded
          size="small"
          v-tooltip.top="'필터 초기화'"
          @click="resetFilters"
        />
      </div>

      <!-- 통계 -->
      <div class="stats-group">
        <Tag severity="info">
          노드: {{ stats.taskCount }}
        </Tag>
        <Tag severity="secondary">
          엣지: {{ stats.edgeCount }}
        </Tag>
      </div>

      <!-- 줌 컨트롤 -->
      <div class="zoom-group">
        <Button
          icon="pi pi-search-plus"
          severity="secondary"
          text
          rounded
          size="small"
          v-tooltip.top="'확대'"
          @click="zoomIn"
        />
        <Button
          icon="pi pi-search-minus"
          severity="secondary"
          text
          rounded
          size="small"
          v-tooltip.top="'축소'"
          @click="zoomOut"
        />
        <Button
          icon="pi pi-expand"
          severity="secondary"
          text
          rounded
          size="small"
          v-tooltip.top="'전체 보기'"
          @click="resetZoom"
        />
      </div>
    </div>

    <!-- 그래프 영역 -->
    <div class="graph-area">
      <ClientOnly>
        <DependencyGraph
          ref="graphRef"
          :graph-data="graphData"
          height="100%"
          @node-click="handleNodeClick"
          @node-double-click="handleNodeDoubleClick"
          @stabilized="handleStabilized"
        />

        <template #fallback>
          <div class="loading-fallback">
            <ProgressSpinner
              style="width: 50px; height: 50px;"
              stroke-width="4"
            />
            <span>그래프 로딩 중...</span>
          </div>
        </template>
      </ClientOnly>
    </div>

    <!-- 범례 -->
    <div class="graph-footer">
      <GraphLegend />
    </div>
  </Dialog>
</template>

<style scoped>
.graph-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--surface-border);
  margin-bottom: 0.75rem;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-select {
  min-width: 140px;
}

.stats-group {
  display: flex;
  gap: 0.5rem;
}

.zoom-group {
  display: flex;
  gap: 0.25rem;
}

.graph-area {
  flex: 1;
  min-height: 400px;
  height: calc(85vh - 250px);
  position: relative;
  border-radius: 6px;
  overflow: hidden;
}

.loading-fallback {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 1rem;
  color: var(--text-color-secondary);
}

.graph-footer {
  padding-top: 0.75rem;
  border-top: 1px solid var(--surface-border);
  margin-top: 0.75rem;
}
</style>
