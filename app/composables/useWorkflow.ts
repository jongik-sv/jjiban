/**
 * useWorkflow Composable
 * Task: TSK-02-03
 * 상세설계: 020-detail-design.md 섹션 6
 *
 * 워크플로우 명령어 실행을 위한 편의 함수 제공
 * Terminal Store, Workflow Store, Execution Store를 통합
 */

import { useWorkflowStore } from '~/stores/workflow'
import { useTerminalStore } from '~/stores/terminal'
import { useExecutionStore } from '~/stores/execution'
import { useNotification } from '~/composables/useNotification'
import type { WorkflowCommand, WorkflowExecuteRequest } from '~/types/terminal'
import type { TaskCategory } from '~/types/index'

export interface UseWorkflowOptions {
  /** 알림 표시 여부 */
  useToast?: boolean
}

export interface UseWorkflowResult {
  /** 워크플로우 명령어 실행 */
  executeWorkflowCommand: (
    taskId: string,
    projectId: string,
    command: string,
    options?: WorkflowExecuteRequest['options']
  ) => Promise<boolean>
  /** Task의 사용 가능한 명령어 조회 */
  getAvailableCommands: (taskId: string, projectId: string) => Promise<WorkflowCommand[]>
  /** 명령어 실행 취소 */
  cancelWorkflowCommand: (taskId: string) => Promise<void>
  /** 명령어가 현재 Task에서 사용 가능한지 확인 */
  isCommandAvailable: (command: WorkflowCommand, taskCategory: TaskCategory, taskStatus: string) => boolean
  /** 특정 Task가 실행 중인지 확인 */
  isTaskExecuting: (taskId: string) => boolean
  /** 실행 중 여부 */
  isExecutingAny: ComputedRef<boolean>
  /** 로딩 상태 */
  loading: ComputedRef<boolean>
  /** 에러 메시지 */
  error: ComputedRef<string | null>
  /** 현재 실행 정보 */
  currentExecution: ComputedRef<{ taskId: string; command: string } | null>
  /** Workflow Store 직접 접근 */
  workflowStore: ReturnType<typeof useWorkflowStore>
  /** Execution Store 직접 접근 */
  executionStore: ReturnType<typeof useExecutionStore>
}

export function useWorkflow(options: UseWorkflowOptions = {}): UseWorkflowResult {
  const { useToast = true } = options

  const workflowStore = useWorkflowStore()
  const terminalStore = useTerminalStore()
  const executionStore = useExecutionStore()
  const notification = useNotification()

  /**
   * 워크플로우 명령어 실행
   * 1. 중복 실행 확인
   * 2. 세션 확인/생성
   * 3. 명령어 실행 요청
   * 4. 프롬프트를 터미널에 입력
   * 5. 실행 상태 등록
   */
  async function executeWorkflowCommand(
    taskId: string,
    projectId: string,
    command: string,
    requestOptions?: WorkflowExecuteRequest['options']
  ): Promise<boolean> {
    try {
      // 1. 중복 실행 확인
      if (executionStore.isExecuting(taskId)) {
        if (useToast) {
          notification.warning('이미 실행 중인 명령어가 있습니다')
        }
        return false
      }

      // 2. 터미널 세션 확인/생성
      let sessionId = terminalStore.getSessionByTaskId(taskId)?.id
      if (!sessionId) {
        sessionId = await terminalStore.createSession({
          taskId,
          projectId,
          cols: 80,
          rows: 24
        })
      }

      // 3. 워크플로우 실행 요청 (프롬프트 생성)
      const request: WorkflowExecuteRequest = {
        taskId,
        projectId,
        command,
        options: requestOptions
      }

      const response = await workflowStore.executeCommand(request)

      if (!response.success || !response.prompt) {
        throw new Error(response.error || '명령어 실행 실패')
      }

      // 4. 프롬프트를 터미널에 입력
      await terminalStore.sendInput(sessionId, response.prompt + '\n')

      // 5. 실행 상태 등록
      await executionStore.startExecution(taskId, command, sessionId)

      if (useToast) {
        notification.info(`워크플로우 명령어 '${command}' 실행 시작`)
      }

      return true
    } catch (e) {
      if (useToast) {
        notification.error(e instanceof Error ? e.message : '명령어 실행 실패')
      }
      return false
    }
  }

  /**
   * Task의 사용 가능한 명령어 조회
   */
  async function getAvailableCommands(
    taskId: string,
    projectId: string
  ): Promise<WorkflowCommand[]> {
    try {
      return await workflowStore.fetchAvailableCommands(taskId, projectId)
    } catch (e) {
      console.error('[useWorkflow] getAvailableCommands error:', e)
      return []
    }
  }

  /**
   * 명령어 실행 취소
   */
  async function cancelWorkflowCommand(taskId: string): Promise<void> {
    try {
      await workflowStore.cancelExecution(taskId)
      await executionStore.stopExecution(taskId, false, '사용자 취소')

      if (useToast) {
        notification.info('명령어 실행이 취소되었습니다')
      }
    } catch (e) {
      if (useToast) {
        notification.error(e instanceof Error ? e.message : '취소 실패')
      }
    }
  }

  /**
   * 명령어가 현재 Task에서 사용 가능한지 확인
   */
  function isCommandAvailable(
    command: WorkflowCommand,
    taskCategory: TaskCategory,
    taskStatus: string
  ): boolean {
    const categoryMatch = command.categories.includes(taskCategory)
    const statusMatch = command.availableStatuses.includes(taskStatus)
    return categoryMatch && statusMatch
  }

  /**
   * 특정 Task가 실행 중인지 확인
   */
  function isTaskExecuting(taskId: string): boolean {
    return executionStore.isExecuting(taskId) || workflowStore.isExecuting(taskId)
  }

  // Computed refs from stores
  const isExecutingAny = computed(() => workflowStore.isExecutingAny)
  const loading = computed(() => workflowStore.loading)
  const error = computed(() => workflowStore.error)
  const currentExecution = computed(() => workflowStore.currentExecution)

  return {
    // 워크플로우 함수
    executeWorkflowCommand,
    getAvailableCommands,
    cancelWorkflowCommand,
    isCommandAvailable,
    isTaskExecuting,
    // Computed refs
    isExecutingAny,
    loading,
    error,
    currentExecution,
    // Store 직접 노출
    workflowStore,
    executionStore
  }
}
