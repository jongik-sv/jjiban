/**
 * Workflow Store
 * Task: TSK-02-03
 * 상세설계: 020-detail-design.md 섹션 4
 *
 * 워크플로우 실행 상태 관리
 * 명령어 실행, 가용 명령어 조회 등
 */

import { defineStore } from 'pinia'
import type {
  WorkflowCommand,
  WorkflowExecuteRequest,
  WorkflowExecuteResponse,
  AvailableCommandsResponse
} from '~/types/terminal'
import { WORKFLOW_COMMANDS, filterWorkflowCommands } from '~/types/terminal'
import type { TaskCategory } from '~/types/index'

export const useWorkflowStore = defineStore('workflow', () => {
  // ============================================================
  // State
  // ============================================================

  /**
   * 현재 실행 중인 명령어
   */
  const executingCommand = ref<string | null>(null)

  /**
   * 현재 실행 중인 Task ID
   */
  const executingTaskId = ref<string | null>(null)

  /**
   * Task별 사용 가능한 명령어 캐시
   * Key: taskId, Value: WorkflowCommand[]
   */
  const availableCommands = ref<Record<string, WorkflowCommand[]>>({})

  /**
   * 마지막 실행 결과
   */
  const lastExecutionResult = ref<WorkflowExecuteResponse | null>(null)

  /**
   * 로딩 상태
   */
  const loading = ref(false)

  /**
   * 에러 메시지
   */
  const error = ref<string | null>(null)

  // ============================================================
  // Getters
  // ============================================================

  /**
   * 전체 실행 중 여부
   */
  const isExecutingAny = computed(() => executingTaskId.value !== null)

  /**
   * 특정 Task가 실행 중인지 확인
   */
  function isExecuting(taskId: string): boolean {
    return executingTaskId.value === taskId
  }

  /**
   * 현재 실행 정보
   */
  const currentExecution = computed(() => {
    if (!executingTaskId.value || !executingCommand.value) return null
    return {
      taskId: executingTaskId.value,
      command: executingCommand.value
    }
  })

  /**
   * 특정 Task의 사용 가능한 명령어 조회 (캐시)
   */
  function getAvailableCommands(taskId: string): WorkflowCommand[] {
    return availableCommands.value[taskId] || []
  }

  // ============================================================
  // Actions
  // ============================================================

  /**
   * 워크플로우 명령어 실행
   * 프롬프트 생성 → 터미널 입력
   */
  async function executeCommand(
    request: WorkflowExecuteRequest
  ): Promise<WorkflowExecuteResponse> {
    try {
      loading.value = true
      error.value = null

      // 중복 실행 방지
      if (executingTaskId.value === request.taskId) {
        throw new Error('이미 실행 중인 명령어가 있습니다')
      }

      const response = await $fetch<WorkflowExecuteResponse>(
        '/api/workflow/execute',
        {
          method: 'POST',
          body: request
        }
      )

      if (!response.success) {
        throw new Error(response.error || '명령어 실행 실패')
      }

      // 로컬 상태 업데이트
      executingTaskId.value = request.taskId
      executingCommand.value = request.command
      lastExecutionResult.value = response

      return response
    } catch (e) {
      error.value = e instanceof Error ? e.message : '명령어 실행 실패'
      console.error('[workflowStore] executeCommand error:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Task별 사용 가능한 명령어 조회
   * 서버 API 호출 → 캐시 저장
   */
  async function fetchAvailableCommands(
    taskId: string,
    projectId: string
  ): Promise<WorkflowCommand[]> {
    try {
      const response = await $fetch<AvailableCommandsResponse>(
        `/api/workflow/available-commands/${taskId}`,
        {
          query: { project: projectId }
        }
      )

      if (!response.success) {
        console.warn('[workflowStore] fetchAvailableCommands failed:', response.error)
        return []
      }

      // 캐시 저장
      availableCommands.value[taskId] = response.commands

      return response.commands
    } catch (e) {
      console.error('[workflowStore] fetchAvailableCommands error:', e)
      // 서버 실패 시 빈 배열 반환
      return []
    }
  }

  /**
   * 로컬 필터링으로 사용 가능한 명령어 조회
   * 서버 API 없이 클라이언트에서 필터링
   */
  function getFilteredCommandsLocal(
    category: TaskCategory,
    status: string
  ): WorkflowCommand[] {
    return filterWorkflowCommands(WORKFLOW_COMMANDS, category, status)
  }

  /**
   * 실행 종료 (로컬 상태 정리)
   * ExecutionManager에서 stop API 호출 후 호출됨
   */
  function clearExecution(taskId: string): void {
    if (executingTaskId.value === taskId) {
      executingTaskId.value = null
      executingCommand.value = null
    }
  }

  /**
   * 실행 취소 (강제 종료)
   * 서버에 stop 요청 + 로컬 상태 정리
   */
  async function cancelExecution(taskId: string): Promise<void> {
    try {
      await $fetch('/api/execution/stop', {
        method: 'POST',
        body: { taskId, success: false, error: '사용자 취소' }
      })

      clearExecution(taskId)
    } catch (e) {
      console.error('[workflowStore] cancelExecution error:', e)
      // 에러여도 로컬 상태 정리
      clearExecution(taskId)
    }
  }

  /**
   * 캐시된 명령어 무효화
   */
  function invalidateCommandsCache(taskId?: string): void {
    if (taskId) {
      delete availableCommands.value[taskId]
    } else {
      availableCommands.value = {}
    }
  }

  /**
   * 실행 시작 마킹 (외부에서 호출)
   */
  function markExecuting(taskId: string, command: string): void {
    executingTaskId.value = taskId
    executingCommand.value = command
  }

  /**
   * 스토어 초기화
   */
  function $reset(): void {
    executingCommand.value = null
    executingTaskId.value = null
    availableCommands.value = {}
    lastExecutionResult.value = null
    loading.value = false
    error.value = null
  }

  return {
    // State
    executingCommand,
    executingTaskId,
    availableCommands,
    lastExecutionResult,
    loading,
    error,
    // Getters
    isExecutingAny,
    isExecuting,
    currentExecution,
    getAvailableCommands,
    // Actions
    executeCommand,
    fetchAvailableCommands,
    getFilteredCommandsLocal,
    clearExecution,
    cancelExecution,
    invalidateCommandsCache,
    markExecuting,
    $reset
  }
})

// HMR 지원
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useWorkflowStore, import.meta.hot))
}
