<script setup lang="ts">
/**
 * WbsTreePanel 컴포넌트
 * PrimeVue Tree 기반 WBS 트리 패널 (TSK-08-01)
 *
 * - PrimeVue Tree 컴포넌트로 마이그레이션
 * - WbsNode[] → TreeNode[] 변환
 * - v-model:expandedKeys 기반 펼침/접힘 상태 동기화
 * - 커스텀 노드 템플릿 (NodeIcon + StatusBadge)
 *
 * @see 020-detail-design.md
 */

import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useWbsStore } from '~/stores/wbs'
import { useRoute } from 'vue-router'
import type { WbsNode } from '~/types'
import type { TreeNode } from 'primevue/treenode'
import Tree from 'primevue/tree'
import ProgressSpinner from 'primevue/progressspinner'
import Message from 'primevue/message'
import Button from 'primevue/button'
import WbsTreeHeader from './WbsTreeHeader.vue'
import NodeIcon from './NodeIcon.vue'
import StatusBadge from './StatusBadge.vue'

const route = useRoute()
const wbsStore = useWbsStore()

// Route에서 projectId 추출
const projectId = computed(() => route.query.project as string)

// 스토어 상태 구독
const { loading, error, filteredTree, expandedNodes, flatNodes } = storeToRefs(wbsStore)

// 이벤트 정의
const emit = defineEmits<{
  'node-selected': [nodeId: string]
}>()

/**
 * WbsNode[] → PrimeVue TreeNode[] 변환 함수
 * - 상세설계 섹션 6.1 데이터 변환 로직
 * - 순환 참조 감지 추가 (설계리뷰 IMP-01)
 *
 * @param nodes WbsNode 배열
 * @param visited 순환 참조 감지용 Set (설계리뷰 권고사항)
 * @returns TreeNode 배열
 */
function convertToTreeNodes(nodes: WbsNode[], visited = new Set<string>()): TreeNode[] {
  if (!nodes || nodes.length === 0) {
    return []
  }

  return nodes.map(node => {
    // 순환 참조 감지 (설계리뷰 IMP-01)
    if (visited.has(node.id)) {
      console.error(`Circular reference detected: ${node.id}`)
      return {
        key: node.id,
        label: `${node.id}: ${node.title} (순환 참조 오류)`,
        data: { node },
        children: []
      }
    }
    visited.add(node.id)

    const treeNode: TreeNode = {
      key: node.id,
      label: node.title,
      data: { node },
      children: node.children && node.children.length > 0
        ? convertToTreeNodes(node.children, new Set(visited))
        : undefined
    }

    return treeNode
  })
}

/**
 * PrimeVue TreeNode[] (computed)
 * - filteredTree(검색 적용)를 TreeNode 형식으로 변환
 */
const treeNodes = computed<TreeNode[]>(() => {
  return convertToTreeNodes(filteredTree.value)
})

/**
 * PrimeVue expandedKeys (computed - get/set)
 * - wbsStore.expandedNodes (Set<string>) ↔ Record<string, boolean> 변환
 * - 상세설계 섹션 6.2 변환 로직
 */
const expandedKeys = computed({
  get: (): Record<string, boolean> => {
    const keys: Record<string, boolean> = {}
    expandedNodes.value.forEach(nodeId => {
      keys[nodeId] = true
    })
    return keys
  },
  set: (newKeys: Record<string, boolean>) => {
    // Record에서 true인 키만 Set에 추가
    expandedNodes.value.clear()
    Object.entries(newKeys).forEach(([key, value]) => {
      if (value) {
        expandedNodes.value.add(key)
      }
    })
  }
})

/**
 * 노드 펼침/접힘 이벤트 핸들러
 * - PrimeVue Tree의 @node-expand, @node-collapse 이벤트 처리
 * - wbsStore.expandedNodes 동기화
 *
 * PrimeVue Tree의 이벤트 시그니처: (node: TreeNode) => void
 *
 * @param node 확장/축소된 TreeNode
 */
function updateExpandedKeys(node: TreeNode) {
  const nodeKey = node.key as string

  // 현재 상태 확인 후 토글
  if (expandedNodes.value.has(nodeKey)) {
    expandedNodes.value.delete(nodeKey)
  } else {
    expandedNodes.value.add(nodeKey)
  }
}

/**
 * 노드 클릭 핸들러
 * - 커스텀 템플릿 내 @click에서 호출
 * - 'node-selected' 이벤트 발생
 *
 * @param nodeId 클릭한 노드 ID
 */
function handleNodeClick(nodeId: string) {
  emit('node-selected', nodeId)
}

/**
 * WBS 데이터 로드 함수
 * 에러 발생 시 리트라이 가능하도록 분리
 *
 * 참고: pages/wbs.vue에서 loadProjectAndWbs를 통해 이미 로드됨
 * WbsTreePanel은 데이터가 이미 있으면 다시 로드하지 않음
 */
async function loadWbs() {
  // projectId 미존재 시 사용자 안내 (설계리뷰 IMP-02)
  if (!projectId.value) {
    console.error('Project ID is required')
    return
  }

  // 이미 데이터가 있으면 다시 로드하지 않음 (중복 방지)
  if (filteredTree.value && filteredTree.value.length > 0) {
    return
  }

  try {
    await wbsStore.fetchWbs(projectId.value)
  } catch (e) {
    console.error('Failed to load WBS:', e)
  }
}

/**
 * 노드 타입에 따른 텍스트 스타일 클래스 반환
 * @param type 노드 타입
 */
function getTitleClass(type: string): string {
  const classMap: Record<string, string> = {
    'wp': 'wbs-tree-node-title-wp',
    'act': 'wbs-tree-node-title-act',
    'task': 'wbs-tree-node-title-task'
  }
  return classMap[type] || 'wbs-tree-node-title-wp'
}

// 컴포넌트 마운트 시 WBS 데이터 로드 (필요한 경우에만)
onMounted(loadWbs)

// 언마운트 시에는 wbsStore.clearWbs()를 호출하지 않음
// pages/wbs.vue에서 언마운트 시 정리함
</script>

<template>
  <div
    data-testid="wbs-tree-panel"
    class="wbs-tree-panel h-full bg-bg-sidebar flex flex-col overflow-hidden"
    role="region"
    aria-label="WBS Tree Panel"
    :aria-busy="loading"
  >
    <!-- 로딩 상태 -->
    <div
      v-if="loading"
      data-testid="loading-state"
      class="flex items-center justify-center h-full"
    >
      <ProgressSpinner
        style="width: 50px; height: 50px"
        strokeWidth="4"
        fill="transparent"
        animationDuration="1s"
        aria-label="Loading WBS data"
      />
    </div>

    <!-- 에러 상태 -->
    <div
      v-else-if="error"
      data-testid="error-state"
      class="p-4 flex flex-col items-center justify-center h-full"
    >
      <Message
        severity="error"
        :closable="false"
        class="mb-4"
      >
        {{ error }}
      </Message>
      <Button
        data-testid="retry-button"
        label="다시 시도"
        icon="pi pi-refresh"
        severity="secondary"
        outlined
        @click="loadWbs"
        aria-label="WBS 데이터 다시 로드"
      />
    </div>

    <!-- projectId 미존재 상태 (설계리뷰 IMP-02) -->
    <div
      v-else-if="!projectId"
      data-testid="no-project-state"
      class="p-4 flex flex-col items-center justify-center h-full"
    >
      <Message
        severity="warn"
        :closable="false"
        class="mb-4"
      >
        프로젝트 ID가 지정되지 않았습니다.
      </Message>
      <Button
        label="프로젝트 목록으로"
        icon="pi pi-arrow-left"
        severity="secondary"
        outlined
        @click="$router.push('/projects')"
        aria-label="프로젝트 목록으로 돌아가기"
      />
    </div>

    <!-- 정상 상태 -->
    <div
      v-else
      data-testid="content-state"
      class="flex flex-col h-full"
    >
      <!-- 헤더 (고정) -->
      <WbsTreeHeader class="flex-shrink-0" />

      <!-- PrimeVue Tree (스크롤) -->
      <div class="flex-1 overflow-y-auto" data-testid="wbs-tree">
        <!-- PrimeVue Tree 컴포넌트 (TSK-08-01) -->
        <Tree
          v-if="treeNodes.length > 0"
          v-model:expandedKeys="expandedKeys"
          :value="treeNodes"
          class="wbs-tree"
          :metaKeySelection="false"
          @node-expand="updateExpandedKeys"
          @node-collapse="updateExpandedKeys"
        >
          <!-- 커스텀 노드 템플릿 -->
          <template #default="slotProps">
            <div
              class="wbs-tree-node-label"
              :data-testid="`wbs-tree-node-${slotProps.node.key}`"
              @click="handleNodeClick(slotProps.node.key as string)"
            >
              <!-- NodeIcon 컴포넌트 -->
              <NodeIcon :type="slotProps.node.data.node.type" />

              <!-- 노드 제목 -->
              <span
                class="wbs-tree-node-title"
                :class="getTitleClass(slotProps.node.data.node.type)"
              >
                {{ slotProps.node.key }}: {{ slotProps.node.label }}
              </span>

              <!-- 진행률 표시 (WP/ACT 노드만) -->
              <span
                v-if="slotProps.node.data.node.type === 'wp' || slotProps.node.data.node.type === 'act'"
                class="wbs-tree-node-progress"
              >
                {{ slotProps.node.data.node.progress || 0 }}%
              </span>

              <!-- StatusBadge (Task 노드만) -->
              <StatusBadge
                v-if="slotProps.node.data.node.type === 'task'"
                :status="slotProps.node.data.node.status || '[ ]'"
                class="ml-auto"
              />
            </div>
          </template>
        </Tree>

        <!-- 빈 상태 -->
        <div
          v-else
          data-testid="empty-state-no-wbs"
          class="flex flex-col items-center justify-center h-full text-text-secondary"
        >
          <i class="pi pi-inbox text-4xl mb-4 opacity-50"></i>
          <p>WBS 데이터가 없습니다.</p>
        </div>
      </div>
    </div>
  </div>
</template>
