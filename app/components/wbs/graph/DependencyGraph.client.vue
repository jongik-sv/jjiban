<script setup lang="ts">
/**
 * 의존관계 그래프 캔버스 컴포넌트
 * Task: TSK-06-01
 *
 * vis-network 기반 그래프 렌더링
 * - 노드 선택 시 연결된 엣지/노드 강조
 * - 의존하는(선행)/의존되어지는(후행) Task 색상 구분
 */

import { Network } from 'vis-network'
import type { GraphData, GraphOptions } from '~/types/graph'
import { DEFAULT_GRAPH_OPTIONS } from '~/types/graph'

// 하이라이트 색상 상수
const HIGHLIGHT_COLORS = {
  selectedNode: { background: '#fbbf24', border: '#f59e0b' },     // 선택된 노드: 노란색
  dependsOn: { background: '#ef4444', border: '#dc2626' },        // 의존하는 Task (선행): 빨간색
  dependedBy: { background: '#22c55e', border: '#16a34a' },       // 의존되어지는 Task (후행): 녹색
  highlightEdge: { color: '#fbbf24', width: 3 },                   // 강조 엣지: 노란색 두꺼운 선
  normalEdge: { color: '#6c9bcf', width: 1 }                       // 기본 엣지
}

// Props
interface Props {
  graphData: GraphData
  options?: Partial<GraphOptions>
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  height: '100%'
})

// Emits
const emit = defineEmits<{
  nodeClick: [{ nodeId: string }]
  nodeDoubleClick: [{ nodeId: string }]
  stabilized: []
}>()

// Refs
const containerRef = ref<HTMLElement | null>(null)
const networkInstance = ref<Network | null>(null)
const isStabilizing = ref(false)
const stabilizationProgress = ref(0)
const selectedNodeId = ref<string | null>(null)
const originalNodeColors = ref<Map<string, any>>(new Map())
const originalEdgeColors = ref<Map<string, any>>(new Map())
const isHighlighting = ref(false)  // 하이라이트 업데이트 중 플래그

// Computed
const mergedOptions = computed(() => {
  return {
    ...DEFAULT_GRAPH_OPTIONS,
    ...props.options
  }
})

// Lifecycle
onMounted(() => {
  initNetwork()
})

onUnmounted(() => {
  destroyNetwork()
})

// Watch for data changes (하이라이트 업데이트 중에는 무시)
watch(() => props.graphData, () => {
  if (networkInstance.value && !isHighlighting.value) {
    networkInstance.value.setData({
      nodes: props.graphData.nodes,
      edges: props.graphData.edges
    })
  }
}, { deep: true })

// Methods
function initNetwork() {
  if (!containerRef.value) return

  const data = {
    nodes: props.graphData.nodes,
    edges: props.graphData.edges
  }

  networkInstance.value = new Network(
    containerRef.value,
    data,
    mergedOptions.value as any
  )

  // 이벤트 바인딩
  networkInstance.value.on('click', (params) => {
    if (params.nodes.length > 0) {
      const nodeId = params.nodes[0]
      highlightConnections(nodeId)
      emit('nodeClick', { nodeId })
    } else {
      // 빈 공간 클릭 시 하이라이트 해제 (플래그 설정으로 watch 트리거 방지)
      clearHighlight(true)
    }
  })

  networkInstance.value.on('doubleClick', (params) => {
    if (params.nodes.length > 0) {
      emit('nodeDoubleClick', { nodeId: params.nodes[0] })
    }
  })

  networkInstance.value.on('stabilizationProgress', (params) => {
    isStabilizing.value = true
    stabilizationProgress.value = Math.round((params.iterations / params.total) * 100)
  })

  networkInstance.value.on('stabilizationIterationsDone', () => {
    isStabilizing.value = false
    stabilizationProgress.value = 100
    emit('stabilized')
  })

  networkInstance.value.on('stabilized', () => {
    isStabilizing.value = false
    emit('stabilized')
  })
}

function destroyNetwork() {
  if (networkInstance.value) {
    networkInstance.value.destroy()
    networkInstance.value = null
  }
}

// Exposed methods
function fit() {
  networkInstance.value?.fit()
}

function zoomIn() {
  const scale = networkInstance.value?.getScale() || 1
  networkInstance.value?.moveTo({ scale: scale * 1.2 })
}

function zoomOut() {
  const scale = networkInstance.value?.getScale() || 1
  networkInstance.value?.moveTo({ scale: scale / 1.2 })
}

function resetZoom() {
  fit()
}

function focusNode(nodeId: string) {
  networkInstance.value?.focus(nodeId, {
    scale: 1.5,
    animation: {
      duration: 500,
      easingFunction: 'easeInOutQuad'
    }
  })
}

function selectNode(nodeId: string) {
  networkInstance.value?.selectNodes([nodeId])
  highlightConnections(nodeId)
}

/**
 * 선택된 노드와 연결된 노드/엣지 하이라이트
 * - 선택된 노드: 노란색
 * - 의존하는 Task (선행, from → selected): 빨간색
 * - 의존되어지는 Task (후행, selected → to): 녹색
 * - 연결된 엣지: 노란색 두꺼운 선
 */
function highlightConnections(nodeId: string) {
  if (!networkInstance.value) return

  // 하이라이트 업데이트 중 플래그 설정 (watch 트리거 방지)
  isHighlighting.value = true

  // 이전 하이라이트 해제
  clearHighlight()

  selectedNodeId.value = nodeId

  const nodes = props.graphData.nodes
  const edges = props.graphData.edges

  // 현재 노드 위치 저장 (위치 유지를 위해)
  const positions = networkInstance.value.getPositions()

  // 연결된 엣지와 노드 찾기
  const connectedEdges: string[] = []
  const dependsOnNodes: string[] = []    // 이 노드가 의존하는 노드들 (선행)
  const dependedByNodes: string[] = []   // 이 노드에 의존하는 노드들 (후행)

  edges.forEach((edge: any) => {
    if (edge.from === nodeId) {
      // 선택된 노드 → 다른 노드 (의존되어지는 Task)
      connectedEdges.push(edge.id)
      dependedByNodes.push(edge.to)
    } else if (edge.to === nodeId) {
      // 다른 노드 → 선택된 노드 (의존하는 Task)
      connectedEdges.push(edge.id)
      dependsOnNodes.push(edge.from)
    }
  })

  // 원본 색상 저장 및 노드 하이라이트
  nodes.forEach((node: any) => {
    // 원본 저장
    originalNodeColors.value.set(node.id, {
      color: node.color,
      font: node.font
    })

    // 현재 위치 가져오기
    const pos = positions[node.id]

    if (node.id === nodeId) {
      // 선택된 노드: 노란색
      nodes.update({
        id: node.id,
        color: HIGHLIGHT_COLORS.selectedNode,
        font: { color: '#000000', bold: true },
        x: pos?.x,
        y: pos?.y
      })
    } else if (dependsOnNodes.includes(node.id)) {
      // 의존하는 Task (선행): 빨간색
      nodes.update({
        id: node.id,
        color: HIGHLIGHT_COLORS.dependsOn,
        font: { color: '#ffffff', bold: true },
        x: pos?.x,
        y: pos?.y
      })
    } else if (dependedByNodes.includes(node.id)) {
      // 의존되어지는 Task (후행): 녹색
      nodes.update({
        id: node.id,
        color: HIGHLIGHT_COLORS.dependedBy,
        font: { color: '#ffffff', bold: true },
        x: pos?.x,
        y: pos?.y
      })
    } else {
      // 연결되지 않은 노드: 흐리게
      nodes.update({
        id: node.id,
        color: { background: '#374151', border: '#4b5563' },
        font: { color: '#6b7280' },
        x: pos?.x,
        y: pos?.y
      })
    }
  })

  // 엣지 하이라이트
  edges.forEach((edge: any) => {
    // 원본 저장
    originalEdgeColors.value.set(edge.id, {
      color: edge.color,
      width: edge.width
    })

    if (connectedEdges.includes(edge.id)) {
      // 연결된 엣지: 노란색 두꺼운 선
      edges.update({
        id: edge.id,
        color: { color: HIGHLIGHT_COLORS.highlightEdge.color },
        width: HIGHLIGHT_COLORS.highlightEdge.width
      })
    } else {
      // 연결되지 않은 엣지: 흐리게
      edges.update({
        id: edge.id,
        color: { color: '#374151' },
        width: 0.5
      })
    }
  })

  // 하이라이트 업데이트 완료
  nextTick(() => {
    isHighlighting.value = false
  })
}

/**
 * 하이라이트 해제 및 원본 색상 복원
 * @param setHighlightFlag 외부에서 호출 시 플래그 설정 여부 (기본: true)
 */
function clearHighlight(setHighlightFlag: boolean = false) {
  if (!networkInstance.value || !selectedNodeId.value) return

  // 외부에서 직접 호출 시 플래그 설정 (빈 공간 클릭 등)
  if (setHighlightFlag) {
    isHighlighting.value = true
  }

  const nodes = props.graphData.nodes
  const edges = props.graphData.edges

  // 현재 노드 위치 저장 (위치 유지를 위해)
  const positions = networkInstance.value.getPositions()

  // 노드 원본 복원 (위치 유지)
  originalNodeColors.value.forEach((original, nodeId) => {
    const pos = positions[nodeId]
    nodes.update({
      id: nodeId,
      color: original.color,
      font: original.font,
      x: pos?.x,
      y: pos?.y
    })
  })

  // 엣지 원본 복원
  originalEdgeColors.value.forEach((original, edgeId) => {
    edges.update({
      id: edgeId,
      color: original.color,
      width: original.width || 1
    })
  })

  originalNodeColors.value.clear()
  originalEdgeColors.value.clear()
  selectedNodeId.value = null

  // 외부에서 직접 호출 시 플래그 해제
  if (setHighlightFlag) {
    nextTick(() => {
      isHighlighting.value = false
    })
  }
}

defineExpose({
  fit,
  zoomIn,
  zoomOut,
  resetZoom,
  focusNode,
  selectNode
})
</script>

<template>
  <div class="dependency-graph">
    <!-- 안정화 진행률 표시 -->
    <div
      v-if="isStabilizing"
      class="stabilization-overlay"
    >
      <ProgressSpinner
        style="width: 50px; height: 50px;"
        stroke-width="4"
      />
      <span class="progress-text">레이아웃 계산 중... {{ stabilizationProgress }}%</span>
    </div>

    <!-- 그래프 캔버스 -->
    <div
      ref="containerRef"
      class="graph-container"
      :style="{ height: props.height }"
    />
  </div>
</template>

<style scoped>
.dependency-graph {
  position: relative;
  width: 100%;
  height: 100%;
}

.graph-container {
  width: 100%;
  height: 100%;
  background-color: var(--surface-ground);
  border-radius: 6px;
}

.stabilization-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 10;
  border-radius: 6px;
}

.progress-text {
  margin-top: 1rem;
  color: var(--text-color);
  font-size: 0.875rem;
}
</style>
