<template>
  <Card
    class="task-actions"
    data-testid="task-actions"
    role="region"
    aria-label="Task 작업"
  >
    <template #content>
      <!-- 편집 섹션 -->
      <div class="edit-section mb-4">
        <div class="flex justify-between items-center mb-3">
          <span class="font-semibold text-lg">작업</span>
          <Button
            v-if="!editMode"
            label="편집"
            icon="pi pi-pencil"
            severity="secondary"
            size="small"
            data-testid="task-actions-edit-btn"
            aria-label="Task 편집 모드 시작"
            @click="enterEditMode"
          />
        </div>

        <!-- 편집 모드 -->
        <div
          v-if="editMode"
          class="edit-fields"
          data-testid="task-actions-edit-fields"
          role="form"
          aria-label="Task 편집 폼"
        >
          <!-- 제목 -->
          <div class="field mb-3">
            <label for="edit-title" class="block mb-1 font-medium">제목</label>
            <InputText
              id="edit-title"
              v-model="editedValues.title"
              class="w-full"
              placeholder="Task 제목 입력"
              data-testid="task-actions-title-input"
              aria-label="Task 제목"
              aria-describedby="title-help"
              @keyup.enter="handleSave"
              @keyup.escape="cancelEdit"
            />
            <small id="title-help" class="text-surface-500">1-200자</small>
          </div>

          <!-- 우선순위 -->
          <div class="field mb-3">
            <label for="edit-priority" class="block mb-1 font-medium">우선순위</label>
            <Select
              id="edit-priority"
              v-model="editedValues.priority"
              :options="priorityOptions"
              option-label="label"
              option-value="value"
              placeholder="우선순위 선택"
              class="w-full"
              data-testid="task-actions-priority-dropdown"
              aria-label="우선순위"
            />
          </div>

          <!-- 담당자 -->
          <div class="field mb-3">
            <label for="edit-assignee" class="block mb-1 font-medium">담당자</label>
            <Select
              id="edit-assignee"
              v-model="editedValues.assigneeId"
              :options="assigneeOptions"
              option-label="label"
              option-value="value"
              placeholder="담당자 선택"
              class="w-full"
              show-clear
              data-testid="task-actions-assignee-dropdown"
              aria-label="담당자"
            >
              <template #value="slotProps">
                <div v-if="slotProps.value" class="flex items-center gap-2">
                  <Avatar
                    :label="getAssigneeName(slotProps.value)?.charAt(0)"
                    size="small"
                    shape="circle"
                  />
                  <span>{{ getAssigneeName(slotProps.value) }}</span>
                </div>
                <span v-else>{{ slotProps.placeholder }}</span>
              </template>
              <template #option="slotProps">
                <div class="flex items-center gap-2">
                  <Avatar
                    :label="slotProps.option.label?.charAt(0)"
                    size="small"
                    shape="circle"
                  />
                  <span>{{ slotProps.option.label }}</span>
                </div>
              </template>
            </Select>
          </div>

          <!-- 저장/취소 버튼 -->
          <div class="flex justify-end gap-2 mt-4">
            <Button
              label="취소"
              severity="secondary"
              size="small"
              data-testid="task-actions-cancel-btn"
              aria-label="편집 취소"
              @click="cancelEdit"
            />
            <Button
              label="저장"
              icon="pi pi-check"
              size="small"
              :loading="isUpdating"
              data-testid="task-actions-save-btn"
              aria-label="변경사항 저장"
              @click="handleSave"
            />
          </div>
        </div>
      </div>

      <Divider />

      <!-- 상태 전이 섹션 -->
      <div
        v-if="availableActions.length > 0"
        class="workflow-section mb-4"
        data-testid="task-actions-workflow-section"
      >
        <div class="font-semibold mb-3">상태 전이</div>
        <div class="flex flex-wrap gap-2" role="group" aria-label="워크플로우 명령어">
          <Button
            v-for="action in availableActions"
            :key="action"
            :label="getActionLabel(action)"
            :icon="getActionIcon(action)"
            :severity="getActionSeverity(action)"
            size="small"
            :loading="transitioningCommand === action"
            :disabled="isUpdating || transitioningCommand !== null"
            :data-testid="`task-actions-${action}-btn`"
            :aria-label="`${getActionLabel(action)} 실행`"
            @click="handleTransition(action)"
          />
        </div>
      </div>

      <Divider v-if="availableActions.length > 0" />

      <!-- 문서 섹션 -->
      <div class="documents-section">
        <div class="font-semibold mb-3">문서</div>
        <Button
          :label="`문서 보기 (${documentCount})`"
          icon="pi pi-file"
          severity="secondary"
          size="small"
          :disabled="documentCount === 0"
          data-testid="task-actions-documents-btn"
          aria-label="관련 문서 보기"
          @click="handleOpenDocuments"
        />
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
/**
 * TaskActions - Task 액션 컴포넌트
 * Task: TSK-05-03
 * 상세설계: 020-detail-design.md
 *
 * 책임:
 * - 편집 모드 상태 관리
 * - 인라인 편집 UI 렌더링
 * - useOptimisticUpdate를 통한 API 호출
 * - useErrorHandler를 통한 에러 처리
 * - 상태 전이 버튼 렌더링
 */

import { storeToRefs } from 'pinia'
import type { TaskDetail, Priority, TeamMember } from '~/types/index'

// ============================================================
// Props & Emits
// ============================================================
interface Props {
  task: TaskDetail
  teamMembers?: TeamMember[]
}

const props = withDefaults(defineProps<Props>(), {
  teamMembers: () => [],
})

const emit = defineEmits<{
  (e: 'task-updated'): void
  (e: 'transition-completed', command: string): void
  (e: 'open-documents'): void
}>()

// ============================================================
// Composables & Stores
// ============================================================
const selectionStore = useSelectionStore()
const { selectedTask } = storeToRefs(selectionStore)
const optimisticUpdate = useOptimisticUpdate()
const errorHandler = useErrorHandler()
const notification = useNotification()

// ============================================================
// State
// ============================================================
const editMode = ref(false)
const transitioningCommand = ref<string | null>(null)
const editedValues = ref({
  title: '',
  priority: '' as Priority,
  assigneeId: null as string | null,
})

// ============================================================
// Computed
// ============================================================
const isUpdating = computed(() => optimisticUpdate.isUpdating.value)

const availableActions = computed(() => props.task.availableActions || [])

const documentCount = computed(() => props.task.documents?.filter((d: { exists: boolean }) => d.exists).length || 0)

const priorityOptions = [
  { label: 'Critical', value: 'critical' },
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' },
]

const assigneeOptions = computed(() => [
  ...props.teamMembers.map(m => ({ label: m.name, value: m.id })),
])

// ============================================================
// Workflow Button Config
// ============================================================
const workflowButtonConfig: Record<string, { label: string; icon: string; severity: string }> = {
  start: { label: '시작', icon: 'pi pi-play', severity: 'primary' },
  draft: { label: '초안 작성', icon: 'pi pi-pencil', severity: 'info' },
  build: { label: '구현', icon: 'pi pi-cog', severity: 'success' },
  verify: { label: '검증', icon: 'pi pi-check-circle', severity: 'warn' },
  done: { label: '완료', icon: 'pi pi-flag', severity: 'success' },
  review: { label: '리뷰', icon: 'pi pi-eye', severity: 'info' },
  apply: { label: '적용', icon: 'pi pi-check', severity: 'success' },
  test: { label: '테스트', icon: 'pi pi-bolt', severity: 'warn' },
  audit: { label: '감사', icon: 'pi pi-search', severity: 'info' },
  patch: { label: '패치', icon: 'pi pi-wrench', severity: 'success' },
  skip: { label: '건너뛰기', icon: 'pi pi-forward', severity: 'secondary' },
  fix: { label: '수정', icon: 'pi pi-wrench', severity: 'warn' },
}

// ============================================================
// Methods
// ============================================================

function getActionLabel(action: string): string {
  return workflowButtonConfig[action]?.label || action
}

function getActionIcon(action: string): string {
  return workflowButtonConfig[action]?.icon || 'pi pi-arrow-right'
}

function getActionSeverity(action: string): string {
  return (workflowButtonConfig[action]?.severity || 'secondary') as 'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'contrast'
}

function getAssigneeName(assigneeId: string): string {
  const member = props.teamMembers.find(m => m.id === assigneeId)
  return member?.name || assigneeId
}

/**
 * 편집 모드 진입
 */
function enterEditMode() {
  editedValues.value = {
    title: props.task.title,
    priority: props.task.priority,
    assigneeId: props.task.assignee?.id || null,
  }
  editMode.value = true
}

/**
 * 편집 취소
 */
function cancelEdit() {
  editMode.value = false
  editedValues.value = {
    title: '',
    priority: '' as Priority,
    assigneeId: null,
  }
}

// ============================================================
// handleSave 헬퍼 함수 (코드리뷰 제안 4.1: 복잡도 개선)
// ============================================================

/**
 * 편집 값 유효성 검증
 */
function validateEditedValues(): { valid: boolean; errorMessage?: string } {
  const { title } = editedValues.value

  if (title.length < 1) {
    return { valid: false, errorMessage: '제목을 입력해주세요.' }
  }

  if (title.length > 200) {
    return { valid: false, errorMessage: '제목은 200자 이하여야 합니다.' }
  }

  return { valid: true }
}

/**
 * API 요청 페이로드 생성
 */
function buildUpdatePayload() {
  return {
    title: editedValues.value.title,
    priority: editedValues.value.priority,
    assignee: editedValues.value.assigneeId,
  }
}

/**
 * 로컬 상태에 낙관적 업데이트 적용
 */
function applyLocalUpdates() {
  if (!selectedTask.value) return

  selectedTask.value.title = editedValues.value.title
  selectedTask.value.priority = editedValues.value.priority

  if (editedValues.value.assigneeId) {
    const member = props.teamMembers.find(m => m.id === editedValues.value.assigneeId)
    selectedTask.value.assignee = member
  } else {
    selectedTask.value.assignee = undefined
  }
}

/**
 * 로컬 상태 롤백
 */
function rollbackLocalUpdates(prevTask: TaskDetail) {
  if (!selectedTask.value) return

  selectedTask.value.title = prevTask.title
  selectedTask.value.priority = prevTask.priority
  selectedTask.value.assignee = prevTask.assignee
}

/**
 * 저장 핸들러
 * 낙관적 업데이트 + 롤백 + 에러 처리
 */
async function handleSave() {
  if (!selectedTask.value) return

  // 1. 유효성 검증
  const validation = validateEditedValues()
  if (!validation.valid) {
    notification.error(validation.errorMessage!)
    return
  }

  // 2. 이전 상태 백업
  const prevTask = { ...selectedTask.value } as TaskDetail

  // 3. 낙관적 업데이트 실행
  const result = await optimisticUpdate.execute({
    getCurrentValue: () => prevTask,
    updateLocal: (value) => {
      if (value === prevTask) {
        rollbackLocalUpdates(prevTask)
      } else {
        applyLocalUpdates()
      }
    },
    newValue: prevTask,
    apiCall: async () => {
      await $fetch(`/api/tasks/${props.task.id}`, {
        method: 'PUT',
        body: buildUpdatePayload(),
      })
    },
    refreshData: () => selectionStore.refreshTaskDetail(),
    onSuccess: () => {
      editMode.value = false
      notification.success('변경사항이 저장되었습니다.')
      emit('task-updated')
    },
    onError: (error) => {
      errorHandler.handle(error, 'TaskActions.handleSave')
    },
  })

  return result
}

/**
 * 상태 전이 핸들러
 */
async function handleTransition(command: string) {
  if (!selectedTask.value) return
  if (transitioningCommand.value) return

  transitioningCommand.value = command

  try {
    await $fetch(`/api/tasks/${props.task.id}/transition`, {
      method: 'POST',
      body: { command },
    })

    await selectionStore.refreshTaskDetail()
    notification.success(`'${getActionLabel(command)}' 명령이 실행되었습니다.`)
    emit('transition-completed', command)
  } catch (error) {
    errorHandler.handle(error, 'TaskActions.handleTransition')
  } finally {
    transitioningCommand.value = null
  }
}

/**
 * 문서 열기 핸들러
 */
function handleOpenDocuments() {
  emit('open-documents')
}

// ============================================================
// Watch
// ============================================================

// Task 변경 시 편집 모드 종료
watch(() => props.task.id, () => {
  if (editMode.value) {
    cancelEdit()
  }
})
</script>

<style scoped>
.task-actions {
  background-color: var(--p-surface-0);
}

.edit-fields {
  padding: 0.5rem;
  background-color: var(--p-surface-50);
  border-radius: var(--p-border-radius);
}

.field label {
  color: var(--p-text-color);
}

.workflow-section .p-button {
  min-width: 80px;
}
</style>
