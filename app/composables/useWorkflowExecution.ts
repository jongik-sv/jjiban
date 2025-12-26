/**
 * useWorkflowExecution - 워크플로우 명령어 실행 로직
 * Task: TSK-02-02
 * 상세설계: 020-detail-design.md 섹션 3
 *
 * 책임:
 * - 워크플로우 명령어 프롬프트 생성
 * - Claude Code 세션 관리 및 실행
 * - 실행 상태 추적
 * - 에러 처리 및 Toast 알림
 */

import { useClaudeCodeStore } from '~/stores/claudeCode'
import { useToast } from 'primevue/usetoast'

// ============================================================
// Types
// ============================================================

export interface WorkflowExecutionOptions {
  /** Task ID */
  taskId: string
  /** 프로젝트 ID */
  projectId: string
  /** Toast 사용 여부 */
  useToast?: boolean
}

export interface WorkflowExecutionResult {
  /** 명령어 실행 함수 */
  executeCommand: (commandName: string) => Promise<void>
  /** 실행 중 여부 */
  isExecuting: Ref<boolean>
  /** 현재 실행 중인 명령어 */
  executingCommand: Ref<string | null>
  /** 에러 메시지 */
  error: Ref<string | null>
}

// ============================================================
// Error Messages
// ============================================================

const ERROR_MESSAGES = {
  SESSION_CREATE_FAILED: '터미널 세션 생성에 실패했습니다.',
  INPUT_SEND_FAILED: '명령어 전송에 실패했습니다.',
  TASK_NOT_FOUND: 'Task를 찾을 수 없습니다.',
  INVALID_TASK_ID: '잘못된 Task ID입니다.',
  ALREADY_EXECUTING: '이미 실행 중인 명령어가 있습니다.',
} as const

// ============================================================
// Composable
// ============================================================

/**
 * 워크플로우 명령어 실행 composable
 *
 * @param options - 실행 옵션 (taskId, projectId, useToast)
 * @returns 실행 함수 및 상태
 *
 * @example
 * ```typescript
 * const { executeCommand, isExecuting } = useWorkflowExecution({
 *   taskId: 'TSK-01-01',
 *   projectId: 'jjiban'
 * })
 *
 * await executeCommand('build')
 * ```
 */
export function useWorkflowExecution(
  options: WorkflowExecutionOptions
): WorkflowExecutionResult {
  const claudeCodeStore = useClaudeCodeStore()
  const toast = useToast()

  // ============================================================
  // State
  // ============================================================

  const isExecuting = ref(false)
  const executingCommand = ref<string | null>(null)
  const error = ref<string | null>(null)

  // ============================================================
  // Helper Functions
  // ============================================================

  /**
   * 프롬프트 문자열 생성
   * 상세설계 섹션 3.1.3
   *
   * @param commandName - 명령어 이름 (예: 'build', 'start')
   * @param taskId - Task ID
   * @returns 프롬프트 문자열
   */
  function generatePrompt(commandName: string, taskId: string): string {
    // run 명령어는 taskId 불필요
    if (commandName === 'run') {
      return '/wf:run\n'
    }

    // auto 명령어
    if (commandName === 'auto') {
      return `/wf:auto ${taskId}\n`
    }

    // 일반 명령어
    return `/wf:${commandName} ${taskId}\n`
  }

  /**
   * 성공 Toast 표시
   */
  function showSuccessToast(commandName: string) {
    if (options.useToast !== false) {
      toast.add({
        severity: 'info',
        summary: '명령어 실행 중',
        detail: `워크플로우 ${commandName} 실행 중...`,
        life: 3000
      })
    }
  }

  /**
   * 에러 Toast 표시
   */
  function showErrorToast(message: string) {
    if (options.useToast !== false) {
      toast.add({
        severity: 'error',
        summary: '실행 실패',
        detail: message,
        life: 5000
      })
    }
  }

  // ============================================================
  // Main Function
  // ============================================================

  /**
   * 명령어 실행
   * 상세설계 섹션 3.1.5
   *
   * @param commandName - 실행할 명령어 (예: 'build', 'start', 'run')
   */
  async function executeCommand(commandName: string): Promise<void> {
    // 1. 이미 실행 중이면 무시
    if (isExecuting.value) {
      console.warn('Already executing a command')
      showErrorToast(ERROR_MESSAGES.ALREADY_EXECUTING)
      return
    }

    // 2. 상태 설정
    isExecuting.value = true
    executingCommand.value = commandName
    error.value = null

    try {
      // 3. 프롬프트 생성
      const prompt = generatePrompt(commandName, options.taskId)

      // 4. Claude Code 실행 (cwd는 서버에서 자동 설정)
      await claudeCodeStore.execute(prompt)

      // 5. 성공 Toast
      showSuccessToast(commandName)

    } catch (err) {
      // 6. 에러 처리
      const errorMessage = err instanceof Error ? err.message : ERROR_MESSAGES.INPUT_SEND_FAILED
      error.value = errorMessage
      showErrorToast(errorMessage)
      console.error('[useWorkflowExecution] Error:', err)

    } finally {
      // 7. 상태 초기화
      isExecuting.value = false
      executingCommand.value = null
    }
  }

  return {
    executeCommand,
    isExecuting,
    executingCommand,
    error
  }
}

// ============================================================
// Utility Functions (Exported)
// ============================================================

/**
 * 프롬프트 생성 함수 (테스트용 export)
 */
export function generateWorkflowPrompt(commandName: string, taskId: string): string {
  if (commandName === 'run') {
    return '/wf:run\n'
  }
  if (commandName === 'auto') {
    return `/wf:auto ${taskId}\n`
  }
  return `/wf:${commandName} ${taskId}\n`
}
