<script setup lang="ts">
/**
 * 의존관계 그래프 캔버스 컴포넌트
 * Task: TSK-06-01
 *
 * vis-network 기반 그래프 렌더링
 */

import { Network } from 'vis-network'
import type { GraphData, GraphOptions } from '~/types/graph'
import { DEFAULT_GRAPH_OPTIONS } from '~/types/graph'

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

// Watch for data changes
watch(() => props.graphData, () => {
  if (networkInstance.value) {
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
      emit('nodeClick', { nodeId: params.nodes[0] })
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
