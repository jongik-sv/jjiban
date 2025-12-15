<script setup lang="ts">
/**
 * WbsTreePanel 컴포넌트
 * WBS 트리 패널의 컨테이너 역할
 * - 데이터 로드 조정
 * - 로딩/에러 상태 관리
 * - 자식 컴포넌트 통합
 *
 * @see TSK-04-01
 * @see 020-detail-design.md
 */

import { useWbsStore } from '~/stores/wbs'
import { useRoute } from 'vue-router'
import ProgressSpinner from 'primevue/progressspinner'
import Message from 'primevue/message'
import WbsTreeHeader from './WbsTreeHeader.vue'
// WbsTreeNode는 TSK-04-02에서 구현

const route = useRoute()
const wbsStore = useWbsStore()

// Route에서 projectId 추출
const projectId = computed(() => route.query.projectId as string)

// 스토어 상태 구독
const { loading, error, tree } = storeToRefs(wbsStore)

// 컴포넌트 마운트 시 WBS 데이터 로드
onMounted(async () => {
  if (!projectId.value) {
    console.error('Project ID is required')
    return
  }

  try {
    await wbsStore.fetchWbs(projectId.value)
  } catch (e) {
    console.error('Failed to load WBS:', e)
  }
})

// 컴포넌트 언마운트 시 클린업
onUnmounted(() => {
  wbsStore.clearWbs()
})
</script>

<template>
  <div
    data-testid="wbs-tree-panel"
    class="wbs-tree-panel h-full bg-[#0f0f23] flex flex-col overflow-hidden"
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
      class="p-4"
    >
      <Message
        severity="error"
        :closable="false"
      >
        {{ error }}
      </Message>
    </div>

    <!-- 정상 상태 -->
    <div
      v-else
      data-testid="content-state"
      class="flex flex-col h-full"
    >
      <!-- 헤더 (고정) -->
      <WbsTreeHeader class="flex-shrink-0" />

      <!-- 트리 노드 (스크롤) -->
      <div class="flex-1 overflow-y-auto">
        <!-- WbsTreeNode는 TSK-04-02에서 구현 -->
        <div
          v-if="tree && tree.length > 0"
          class="p-2"
        >
          <!-- <WbsTreeNode v-for="node in tree" :key="node.id" :node="node" /> -->
          <div class="text-[#888888] text-sm p-4 text-center">
            Tree nodes will be rendered here (TSK-04-02)
          </div>
        </div>

        <!-- 빈 상태 -->
        <div
          v-else
          data-testid="empty-state"
          class="flex flex-col items-center justify-center h-full text-[#888888]"
        >
          <i class="pi pi-inbox text-4xl mb-4 opacity-50"></i>
          <p>WBS 데이터가 없습니다.</p>
        </div>
      </div>
    </div>
  </div>
</template>
