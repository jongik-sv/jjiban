<template>
  <Card
    class="task-detail-panel h-full"
    data-testid="task-detail-panel"
    role="region"
    aria-label="Task 상세 정보"
  >
    <!-- 로딩 상태 -->
    <template v-if="loadingTask" #content>
      <div data-testid="task-detail-skeleton" aria-busy="true" aria-live="polite">
        <Skeleton height="2rem" class="mb-4" />
        <Skeleton height="1.5rem" class="mb-2" />
        <Skeleton height="1.5rem" class="mb-2" />
        <Skeleton height="1.5rem" class="mb-4" />
        <Skeleton height="8rem" />
      </div>
    </template>

    <!-- 에러 상태 -->
    <template v-else-if="error" #content>
      <Message
        severity="error"
        data-testid="error-message"
        role="alert"
        aria-live="assertive"
      >
        Task 정보를 불러오는 데 실패했습니다.
      </Message>
      <div class="mt-4">
        <Button
          label="다시 시도"
          icon="pi pi-refresh"
          data-testid="error-retry-btn"
          @click="handleRetry"
        />
      </div>
    </template>

    <!-- 빈 상태 -->
    <template v-else-if="!selectedTask" #content>
      <Message
        severity="info"
        data-testid="empty-state-message"
      >
        왼쪽에서 Task를 선택하세요
      </Message>
    </template>

    <!-- 정상 상태 -->
    <template v-else #content>
      <div class="task-detail-content overflow-y-auto" style="max-height: calc(100vh - 200px);">
        <!-- 기본 정보 (TSK-05-01) -->
        <TaskBasicInfo
          :task="selectedTask"
          :updating="isUpdating"
          @update:title="handleUpdateTitle"
          @update:priority="handleUpdatePriority"
          @update:assignee="handleUpdateAssignee"
        />

        <!-- 진행 상태 (TSK-05-01) -->
        <TaskProgress :task="selectedTask" />

        <!-- 워크플로우 흐름 (TSK-05-02) -->
        <TaskWorkflow :task="selectedTask" />

        <!-- Task 액션 (TSK-05-03) -->
        <TaskActions
          :task="selectedTask"
          :team-members="teamMembers"
          @task-updated="handleTaskUpdated"
          @transition-completed="handleTransitionCompleted"
          @open-documents="handleOpenDocuments"
        />

        <!-- 요구사항 (TSK-05-02) -->
        <TaskRequirements
          :task="selectedTask"
          @update:requirements="handleUpdateRequirements"
        />

        <!-- 관련 문서 (TSK-05-02) -->
        <TaskDocuments
          :documents="selectedTask.documents"
          @open-document="handleOpenDocument"
        />

        <!-- 이력 (TSK-05-02) -->
        <TaskHistory :history="selectedTask.history" />
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
/**
 * TaskDetailPanel - Task 상세 정보 컨테이너 컴포넌트
 * Task: TSK-05-01, TSK-05-02
 * 상세설계: 020-detail-design.md 섹션 9.3
 *
 * 책임:
 * - Pinia useSelectionStore 구독
 * - 로딩/에러/빈 상태 분기 처리
 * - 인라인 편집 이벤트 핸들링 및 API 호출
 * - 낙관적 업데이트 및 롤백 로직
 * - TSK-05-02: 4개 섹션 컴포넌트 통합 및 이벤트 핸들링
 */

import { storeToRefs } from 'pinia'
import { useToast } from 'primevue/usetoast'
import type { Priority, DocumentInfo, TeamMember } from '~/types/index'

// ============================================================
// Stores & Composables
// ============================================================
const selectionStore = useSelectionStore()
const projectStore = useProjectStore()
const { selectedTask, loadingTask, error } = storeToRefs(selectionStore)
const toast = useToast()
const notification = useNotification()

// ============================================================
// State
// ============================================================
const isUpdating = ref(false)
const teamMembers = ref<TeamMember[]>([])

// ============================================================
// Lifecycle
// ============================================================
onMounted(async () => {
  // 팀원 목록 로드
  try {
    const currentProject = projectStore.currentProject
    if (currentProject?.id) {
      const response = await $fetch<{ team: TeamMember[] }>(`/api/projects/${currentProject.id}`)
      teamMembers.value = response.team || []
    }
  } catch (e) {
    console.warn('팀원 목록 로드 실패:', e)
  }
})

// ============================================================
// Error Messages
// ============================================================
const ERROR_MESSAGES = {
  TITLE_LENGTH: 'Task 제목은 1자 이상 200자 이하여야 합니다.',
  INVALID_PRIORITY: '올바른 우선순위를 선택해주세요.',
  ASSIGNEE_NOT_FOUND: '선택한 팀원이 프로젝트에 없습니다. 팀원 목록을 확인해주세요.',
  UPDATE_FAILED: '변경사항을 저장하는 중 오류가 발생했습니다. 다시 시도해주세요.',
  NETWORK_ERROR: '네트워크 연결을 확인해주세요.',
  REQUIREMENTS_UPDATE_FAILED: '요구사항 저장에 실패했습니다.',
} as const

// ============================================================
// Methods
// ============================================================

/**
 * 공통 Task 업데이트 핸들러 (MAJ-001 리팩토링)
 * 낙관적 업데이트 + 롤백 + 에러 처리 통합
 */
async function handleUpdate<K extends keyof typeof selectedTask.value>(
  field: K,
  newValue: (typeof selectedTask.value)[K],
  apiBody: Record<string, unknown>,
  successMessage: string,
  validation?: () => string | null
): Promise<void> {
  if (!selectedTask.value) return

  // 동시성 제어 (MIN-002)
  if (isUpdating.value) return

  // 클라이언트 검증
  if (validation) {
    const validationError = validation()
    if (validationError) {
      toast.add({
        severity: 'error',
        summary: '유효성 검증 실패',
        detail: validationError,
        life: 3000,
      })
      return
    }
  }

  isUpdating.value = true
  const prevValue = selectedTask.value[field] // 백업

  try {
    // 낙관적 업데이트 (FR-008)
    ;(selectedTask.value as Record<K, unknown>)[field] = newValue

    // API 호출
    const response = await $fetch<{ success: boolean; task: typeof selectedTask.value }>(
      `/api/tasks/${selectedTask.value.id}`,
      {
        method: 'PUT',
        body: apiBody,
      }
    )

    if (response.success) {
      await selectionStore.refreshTaskDetail()
      toast.add({
        severity: 'success',
        summary: '저장 완료',
        detail: successMessage,
        life: 2000,
      })
    }
  } catch (e) {
    // 롤백 (BR-004)
    if (selectedTask.value) {
      ;(selectedTask.value as Record<K, unknown>)[field] = prevValue
    }

    const errorMessage = e instanceof Error ? e.message : ERROR_MESSAGES.UPDATE_FAILED
    toast.add({
      severity: 'error',
      summary: '저장 실패',
      detail: errorMessage,
      life: 3000,
    })
  } finally {
    isUpdating.value = false
  }
}

/**
 * 제목 수정 핸들러
 * FR-003, BR-001, BR-004, FR-008
 */
function handleUpdateTitle(newTitle: string) {
  handleUpdate(
    'title',
    newTitle,
    { title: newTitle },
    '제목이 변경되었습니다.',
    () => {
      if (newTitle.length < 1 || newTitle.length > 200) {
        return ERROR_MESSAGES.TITLE_LENGTH
      }
      return null
    }
  )
}

/**
 * 우선순위 수정 핸들러
 * FR-004, BR-002, BR-004, FR-008
 */
function handleUpdatePriority(newPriority: Priority) {
  handleUpdate(
    'priority',
    newPriority,
    { priority: newPriority },
    '우선순위가 변경되었습니다.'
  )
}

/**
 * 담당자 수정 핸들러
 * FR-005, BR-003, BR-004, FR-008
 */
function handleUpdateAssignee(assigneeId: string | null) {
  handleUpdate(
    'assignee',
    assigneeId === null ? undefined : selectedTask.value?.assignee,
    { assignee: assigneeId },
    '담당자가 변경되었습니다.'
  )
}

/**
 * 재시도 핸들러 (에러 상태)
 */
function handleRetry() {
  if (selectionStore.selectedNodeId) {
    selectionStore.loadTaskDetail(selectionStore.selectedNodeId)
  }
}

/**
 * 요구사항 수정 핸들러 (TSK-05-02)
 * FR-006
 */
async function handleUpdateRequirements(requirements: string[]) {
  if (!selectedTask.value) return

  // 동시성 제어
  if (isUpdating.value) return

  isUpdating.value = true
  const prevRequirements = selectedTask.value.requirements

  try {
    // 낙관적 업데이트
    selectedTask.value.requirements = requirements

    // API 호출
    await $fetch(`/api/tasks/${selectedTask.value.id}`, {
      method: 'PUT',
      body: { requirements }
    })

    await selectionStore.refreshTaskDetail()

    toast.add({
      severity: 'success',
      summary: '저장 완료',
      detail: '요구사항이 업데이트되었습니다.',
      life: 2000
    })
  } catch (e) {
    // 롤백
    if (selectedTask.value) {
      selectedTask.value.requirements = prevRequirements
    }

    toast.add({
      severity: 'error',
      summary: '저장 실패',
      detail: ERROR_MESSAGES.REQUIREMENTS_UPDATE_FAILED,
      life: 3000
    })
  } finally {
    isUpdating.value = false
  }
}

/**
 * 문서 열기 핸들러 (TSK-05-02)
 * FR-009
 * TODO: TSK-05-04에서 DocumentViewer 스토어 연동
 */
function handleOpenDocument(doc: DocumentInfo) {
  // TSK-05-04: documentViewerStore.openDocument(doc)
  console.log('문서 열기:', doc.name)

  toast.add({
    severity: 'info',
    summary: '문서 뷰어',
    detail: `${doc.name} 문서 뷰어는 TSK-05-04에서 구현됩니다.`,
    life: 3000
  })
}

// ============================================================
// TSK-05-03: TaskActions 이벤트 핸들러
// ============================================================

/**
 * Task 업데이트 완료 핸들러
 */
function handleTaskUpdated() {
  // 필요 시 추가 처리 (예: 상위 컴포넌트 알림)
  console.log('Task 업데이트 완료')
}

/**
 * 상태 전이 완료 핸들러
 */
function handleTransitionCompleted(command: string) {
  console.log('상태 전이 완료:', command)
  // 필요 시 추가 처리 (예: 상위 컴포넌트 알림)
}

/**
 * 문서 목록 열기 핸들러
 */
function handleOpenDocuments() {
  // TaskDocuments 컴포넌트로 스크롤 또는 TSK-05-04 뷰어 열기
  notification.info('문서 뷰어는 TSK-05-04에서 구현됩니다.')
}
</script>

<style scoped>
.task-detail-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.task-detail-content {
  padding: 1rem;
}
</style>
