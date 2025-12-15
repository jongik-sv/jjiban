<template>
  <div>
    <!-- 노드 컨테이너 -->
    <div
      class="wbs-tree-node"
      :class="{ 'selected': isSelected }"
      :style="{ paddingLeft: `${indentWidth}px` }"
      :data-testid="`wbs-tree-node-${node.id}`"
      role="treeitem"
      :aria-expanded="hasChildren ? isExpanded : undefined"
      :aria-selected="isSelected"
      :aria-level="(depth ?? 0) + 1"
      tabindex="0"
    >
      <!-- 펼침/접기 버튼 -->
      <Button
        v-if="hasChildren"
        :icon="isExpanded ? 'pi pi-chevron-down' : 'pi pi-chevron-right'"
        text
        rounded
        size="small"
        severity="secondary"
        :data-testid="`expand-toggle-${node.id}`"
        @click="handleToggleExpand"
        aria-label="Toggle expand"
      />
      <span v-else class="expand-placeholder" />

      <!-- 노드 아이콘 -->
      <NodeIcon :type="node.type" />

      <!-- 노드 콘텐츠 -->
      <div
        class="node-content"
        :data-testid="`node-content-${node.id}`"
        @click="handleSelectNode"
      >
        <div class="node-title">{{ node.title }}</div>
        <div v-if="node.status || node.category" class="node-meta">
          <StatusBadge v-if="node.status" :status="node.status" />
          <CategoryTag v-if="node.category" :category="node.category" />
        </div>
        <ProgressBar
          v-if="node.progress !== undefined"
          :value="node.progress"
        />
      </div>
    </div>

    <!-- 재귀: 자식 노드 렌더링 -->
    <template v-if="isExpanded && hasChildren">
      <WbsTreeNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :depth="(depth ?? 0) + 1"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import type { WbsNode } from '~/types'
import NodeIcon from './NodeIcon.vue'
import StatusBadge from './StatusBadge.vue'
import CategoryTag from './CategoryTag.vue'
import ProgressBar from './ProgressBar.vue'

interface Props {
  node: WbsNode
  depth?: number
}

const props = withDefaults(defineProps<Props>(), {
  depth: 0
})

// Vue 재귀 컴포넌트를 위한 name 옵션 필수
defineOptions({
  name: 'WbsTreeNode'
})

const wbsStore = useWbsStore()
const selectionStore = useSelectionStore()

/**
 * 노드 펼침 상태
 */
const isExpanded = computed(() => wbsStore.isExpanded(props.node.id))

/**
 * 노드 선택 상태
 */
const isSelected = computed(() => selectionStore.selectedNodeId === props.node.id)

/**
 * 자식 노드 존재 여부
 */
const hasChildren = computed(() => props.node.children && props.node.children.length > 0)

/**
 * 들여쓰기 너비 계산
 * depth × 20px (최대 깊이 제한은 데이터에서 보장)
 */
const indentWidth = computed(() => {
  const MAX_DEPTH = 10 // 재귀 깊이 제한 (R1 권장사항)
  const safeDepth = Math.min(props.depth ?? 0, MAX_DEPTH)
  return safeDepth * 20
})

/**
 * 펼침/접기 토글
 */
const handleToggleExpand = () => {
  wbsStore.toggleExpand(props.node.id)
}

/**
 * 노드 선택
 */
const handleSelectNode = () => {
  selectionStore.selectNode(props.node.id)
}
</script>

<style scoped>
.wbs-tree-node {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  min-height: 48px;
}

.wbs-tree-node:hover {
  background-color: rgba(55, 65, 81, 0.3); /* gray-700 with opacity */
}

.wbs-tree-node.selected {
  background-color: rgba(59, 130, 246, 0.15); /* blue-500 with low opacity */
  border-left: 3px solid #3b82f6; /* blue-500 accent border */
}

.wbs-tree-node:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.expand-placeholder {
  width: 32px; /* PrimeVue small button 크기와 일치 */
  flex-shrink: 0;
}

.node-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0; /* flexbox overflow 방지 */
}

.node-title {
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

@media (max-width: 767px) {
  .wbs-tree-node {
    font-size: 14px;
    min-height: 40px;
  }

  .node-title {
    font-size: 13px;
  }

  .node-meta {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
