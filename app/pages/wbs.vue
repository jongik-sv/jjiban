<script setup lang="ts">
/**
 * WBS 페이지
 * - WBS Tree + Task Detail 패널 통합
 * - 프로젝트/WBS 순차 로딩
 * - 에러 핸들링 및 Empty State 관리
 *
 * @task TSK-06-01
 */

import WbsTreePanel from '~/components/wbs/WbsTreePanel.vue'
import NodeDetailPanel from '~/components/wbs/detail/NodeDetailPanel.vue'

// ============================================================
// Page Metadata
// ============================================================
definePageMeta({
  layout: 'default'
})

useHead({
  title: 'WBS - jjiban'
})

// ============================================================
// Composables & Stores
// ============================================================
const route = useRoute()
const router = useRouter()
const projectStore = useProjectStore()
const wbsStore = useWbsStore()
const selectionStore = useSelectionStore()
const wbsPage = useWbsPage()
const { loadProjectAndWbs, handleError } = wbsPage

// ============================================================
// Local State
// ============================================================
const loading = ref(false)
const error = ref<string | null>(null)

/**
 * URL 쿼리에서 projectId 추출 및 형식 검증
 * - 소문자, 숫자, 하이픈만 허용
 * - 잘못된 형식이면 null 반환
 */
const projectId = computed<string | null>(() => {
  const id = route.query.project
  if (!id || typeof id !== 'string') return null

  // 형식 검증: 소문자, 숫자, 하이픈만 허용
  if (!/^[a-z0-9-]+$/.test(id)) {
    console.warn(`Invalid projectId format: ${id}`)
    return null
  }

  return id
})

/**
 * 정상 상태 여부 (콘텐츠 표시 가능 여부)
 */
const isContentReady = computed(() => {
  return !loading.value && !error.value && projectId.value !== null
})

// ============================================================
// Lifecycle Hooks
// ============================================================

/**
 * 페이지 초기화
 * - URL에서 projectId 추출
 * - 프로젝트 → WBS 순차 로딩
 */
onMounted(async () => {
  const id = projectId.value
  if (!id) {
    // projectId 없으면 로딩 중단 (Empty State 표시)
    return
  }

  loading.value = true
  error.value = null

  // loadProjectAndWbs는 내부에서 에러 핸들링 및 Toast 표시
  // 반환값 false면 에러 발생 (error.value는 composable에서 설정됨)
  const success = await loadProjectAndWbs(id)
  if (!success) {
    // error는 useWbsPage에서 이미 설정됨
    error.value = wbsPage.error.value
  }

  loading.value = false
})

/**
 * 페이지 언마운트 시 상태 초기화
 */
onUnmounted(() => {
  wbsStore.clearWbs()
  selectionStore.clearSelection()
  // projectStore.clearProject() // 선택적: 프로젝트 정보는 유지할 수도 있음
})

// ============================================================
// Watch (스토어 간 반응형 연동)
// ============================================================

/**
 * 현재 프로젝트 변화 감지 → WBS 자동 로드
 * 가드 조건:
 * - 동일 프로젝트 ID면 skip
 * - null → null 전환 skip
 */
watch(
  () => projectStore.currentProject,
  async (newProject, oldProject) => {
    // 가드: 동일 프로젝트 ID
    if (newProject?.id === oldProject?.id) return
    // 가드: null → null
    if (!newProject && !oldProject) return

    // 새 프로젝트 로드 시 WBS 자동 조회
    if (newProject) {
      loading.value = true
      try {
        await wbsStore.fetchWbs(newProject.id)
      } catch (e) {
        // 에러 핸들링 및 Toast 표시
        error.value = handleError(e)
      } finally {
        loading.value = false
      }
    }
  }
)

/**
 * 선택된 노드 ID 변화 감지 → Task 상세 로드
 * 가드 조건:
 * - 동일 노드 ID면 skip
 * - Task 타입이 아니면 상세 로드 skip
 */
watch(
  () => selectionStore.selectedNodeId,
  (newId, oldId) => {
    // 가드: 동일 노드 ID
    if (newId === oldId) return

    // Task 타입이 아니면 상세 초기화
    if (!newId || !newId.toUpperCase().startsWith('TSK-')) {
      // selectionStore 내부에서 처리됨
      return
    }

    // Task 상세 로드는 selectionStore.selectNode에서 자동 처리됨
  }
)

// ============================================================
// Event Handlers
// ============================================================

/**
 * WbsTreePanel 노드 선택 이벤트
 */
function handleNodeSelected(nodeId: string) {
  selectionStore.selectNode(nodeId)
}

/**
 * 재시도 버튼 클릭
 */
async function handleRetry() {
  const id = projectId.value
  if (!id) return

  loading.value = true
  error.value = null

  const success = await loadProjectAndWbs(id)
  if (!success) {
    error.value = wbsPage.error.value
  }

  loading.value = false
}

/**
 * 대시보드로 이동
 */
function goToDashboard() {
  router.push('/')
}
</script>

<template>
  <LayoutAppLayout aria-label="WBS 페이지">
    <!-- Header Slot: AppHeader 컴포넌트 -->
    <template #header>
      <LayoutAppHeader :project-name="projectStore.projectName || ''" />
    </template>

    <!-- Left Panel Slot -->
    <template #left>
      <!-- 1. 로딩 중 -->
      <div
        v-if="loading"
        class="flex items-center justify-center h-full"
        data-testid="loading-spinner"
      >
        <div class="text-center">
          <ProgressSpinner
            stroke-width="4"
            animation-duration="1s"
            aria-label="로딩 중"
          />
          <p class="mt-4 text-text-secondary">로딩 중입니다...</p>
        </div>
      </div>

      <!-- 2. 에러 상태 -->
      <div
        v-else-if="error"
        class="flex items-center justify-center h-full p-8"
        data-testid="error-message"
      >
        <div class="text-center max-w-md">
          <Message severity="error" :closable="false">
            {{ error }}
          </Message>
          <Button
            label="재시도"
            icon="pi pi-refresh"
            severity="secondary"
            class="mt-4"
            data-testid="retry-button"
            @click="handleRetry"
          />
        </div>
      </div>

      <!-- 3. projectId 없음/잘못된 형식 -->
      <div
        v-else-if="!projectId"
        class="flex items-center justify-center h-full p-8"
        data-testid="empty-state-no-project"
      >
        <div class="text-center">
          <i class="pi pi-folder text-6xl text-text-muted mb-4"></i>
          <h3 class="text-xl font-semibold text-text mb-2">프로젝트를 선택하세요</h3>
          <p class="text-text-secondary mb-6">
            대시보드에서 프로젝트를 선택하거나 새 프로젝트를 생성하세요.
          </p>
          <Button
            label="대시보드로 이동"
            icon="pi pi-home"
            severity="primary"
            data-testid="dashboard-link"
            @click="goToDashboard"
          />
        </div>
      </div>

      <!-- 4. 정상 상태: WBS 트리 패널 -->
      <div
        v-else
        class="h-full"
        data-testid="wbs-content"
      >
        <WbsTreePanel
          aria-label="WBS 트리 패널"
          :aria-busy="wbsStore.loading ? 'true' : 'false'"
          @node-selected="handleNodeSelected"
        />
      </div>
    </template>

    <!-- Right Panel Slot -->
    <template #right>
      <div
        class="h-full"
        aria-label="노드 상세 패널"
      >
        <!-- 로딩/에러/프로젝트없음 상태에서는 빈 상태 표시 -->
        <div
          v-if="!isContentReady"
          class="flex items-center justify-center h-full p-4"
          data-testid="right-panel-placeholder"
        >
          <div class="text-center text-text-muted">
            <i class="pi pi-info-circle text-2xl mb-2"></i>
            <p class="text-sm">프로젝트를 로드하면 상세 정보가 표시됩니다.</p>
          </div>
        </div>

        <!-- 노드 상세 정보 표시 (TSK-05-01 ~ TSK-05-05) -->
        <NodeDetailPanel v-else />
      </div>
    </template>
  </LayoutAppLayout>
</template>

<style scoped>
/* WBS 페이지 스타일 */
</style>
