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
import Button from 'primevue/button'
import WbsTreeHeader from './WbsTreeHeader.vue'
// WbsTreeNode는 TSK-04-02에서 구현

const route = useRoute()
const wbsStore = useWbsStore()

// Route에서 projectId 추출
const projectId = computed(() => route.query.project as string)

// 스토어 상태 구독
const { loading, error, tree } = storeToRefs(wbsStore)

// 이벤트 정의
const emit = defineEmits<{
  'node-selected': [nodeId: string]
}>()

/**
 * WBS 데이터 로드 함수
 * 에러 발생 시 리트라이 가능하도록 분리
 *
 * 참고: pages/wbs.vue에서 loadProjectAndWbs를 통해 이미 로드됨
 * WbsTreePanel은 데이터가 이미 있으면 다시 로드하지 않음
 */
async function loadWbs() {
  if (!projectId.value) {
    console.error('Project ID is required')
    return
  }

  // 이미 데이터가 있으면 다시 로드하지 않음 (중복 방지)
  if (tree.value && tree.value.length > 0) {
    return
  }

  try {
    await wbsStore.fetchWbs(projectId.value)
  } catch (e) {
    console.error('Failed to load WBS:', e)
  }
}

/**
 * 노드 선택 핸들러
 */
function handleNodeClick(nodeId: string) {
  emit('node-selected', nodeId)
}

// 컴포넌트 마운트 시 WBS 데이터 로드 (필요한 경우에만)
onMounted(loadWbs)

// 언마운트 시에는 wbsStore.clearWbs()를 호출하지 않음
// pages/wbs.vue에서 언마운트 시 정리함
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

    <!-- 정상 상태 -->
    <div
      v-else
      data-testid="content-state"
      class="flex flex-col h-full"
    >
      <!-- 헤더 (고정) -->
      <WbsTreeHeader class="flex-shrink-0" />

      <!-- 트리 노드 (스크롤) -->
      <div class="flex-1 overflow-y-auto" data-testid="wbs-tree">
        <!-- WBS 트리 렌더링 -->
        <div
          v-if="tree && tree.length > 0"
          class="p-2"
        >
          <!-- 재귀적 트리 노드 렌더링 (간소화 버전) -->
          <div
            v-for="wpNode in tree"
            :key="wpNode.id"
            class="mb-2"
          >
            <!-- WP 노드 -->
            <div
              class="flex items-center gap-2 px-3 py-2 rounded cursor-pointer hover:bg-[#1a1a3a] transition-colors"
              :data-testid="`wbs-tree-node-${wpNode.id}`"
              @click="handleNodeClick(wpNode.id)"
            >
              <i class="pi pi-folder text-blue-400"></i>
              <span class="text-sm text-[#e0e0e0]">{{ wpNode.id }}: {{ wpNode.title }}</span>
            </div>

            <!-- ACT/TSK 노드 (1단계 자식) -->
            <div
              v-for="childNode in wpNode.children"
              :key="childNode.id"
              class="ml-4"
            >
              <!-- ACT 노드 -->
              <div
                v-if="childNode.type === 'act'"
                class="mb-1"
              >
                <div
                  class="flex items-center gap-2 px-3 py-1.5 rounded cursor-pointer hover:bg-[#1a1a3a] transition-colors"
                  :data-testid="`wbs-tree-node-${childNode.id}`"
                  @click="handleNodeClick(childNode.id)"
                >
                  <i class="pi pi-sitemap text-green-400"></i>
                  <span class="text-sm text-[#c0c0c0]">{{ childNode.id }}: {{ childNode.title }}</span>
                </div>

                <!-- TSK 노드 (ACT의 자식) -->
                <div
                  v-for="taskNode in childNode.children"
                  :key="taskNode.id"
                  class="ml-4"
                >
                  <div
                    class="flex items-center gap-2 px-3 py-1 rounded cursor-pointer hover:bg-[#1a1a3a] transition-colors"
                    :data-testid="`wbs-tree-node-${taskNode.id}`"
                    @click="handleNodeClick(taskNode.id)"
                  >
                    <i class="pi pi-file text-yellow-400"></i>
                    <span class="text-xs text-[#a0a0a0]">{{ taskNode.id }}: {{ taskNode.title }}</span>
                    <span
                      class="ml-auto text-xs px-1.5 py-0.5 rounded"
                      :class="{
                        'bg-gray-500/20 text-gray-400': taskNode.status === '[ ]',
                        'bg-blue-500/20 text-blue-400': ['[bd]', '[dd]'].includes(taskNode.status),
                        'bg-yellow-500/20 text-yellow-400': ['[im]', '[fx]'].includes(taskNode.status),
                        'bg-green-500/20 text-green-400': taskNode.status === '[xx]'
                      }"
                    >
                      {{ taskNode.status }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- TSK 노드 (3단계 구조: WP의 직접 자식) -->
              <div
                v-else-if="childNode.type === 'task'"
                class="flex items-center gap-2 px-3 py-1 rounded cursor-pointer hover:bg-[#1a1a3a] transition-colors"
                :data-testid="`wbs-tree-node-${childNode.id}`"
                @click="handleNodeClick(childNode.id)"
              >
                <i class="pi pi-file text-yellow-400"></i>
                <span class="text-xs text-[#a0a0a0]">{{ childNode.id }}: {{ childNode.title }}</span>
                <span
                  class="ml-auto text-xs px-1.5 py-0.5 rounded"
                  :class="{
                    'bg-gray-500/20 text-gray-400': childNode.status === '[ ]',
                    'bg-blue-500/20 text-blue-400': ['[bd]', '[dd]'].includes(childNode.status),
                    'bg-yellow-500/20 text-yellow-400': ['[im]', '[fx]'].includes(childNode.status),
                    'bg-green-500/20 text-green-400': childNode.status === '[xx]'
                  }"
                >
                  {{ childNode.status }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 빈 상태 -->
        <div
          v-else
          data-testid="empty-state-no-wbs"
          class="flex flex-col items-center justify-center h-full text-[#888888]"
        >
          <i class="pi pi-inbox text-4xl mb-4 opacity-50"></i>
          <p>WBS 데이터가 없습니다.</p>
        </div>
      </div>
    </div>
  </div>
</template>
