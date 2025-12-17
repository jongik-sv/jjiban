/**
 * ExecutionManager - 워크플로우 실행 상태 관리
 * 서버 메모리에서 실행 중인 Task 상태 추적
 */

export interface ExecutionInfo {
  taskId: string
  command: string
  startedAt: Date
  sessionId?: string
}

export interface ExecutionResult {
  success: boolean
  error?: string
}

// 서버 메모리에 실행 상태 유지
const executingTasks = new Map<string, ExecutionInfo>()

// Stale 타임아웃: 1시간
const STALE_TIMEOUT_MS = 60 * 60 * 1000

/**
 * 실행 시작 등록
 */
export function startExecution(
  taskId: string,
  command: string,
  sessionId?: string
): { success: boolean; error?: string } {
  // 중복 실행 체크
  if (executingTasks.has(taskId)) {
    const existing = executingTasks.get(taskId)!
    return {
      success: false,
      error: `Task ${taskId}는 이미 '${existing.command}' 명령어로 실행 중입니다.`
    }
  }

  executingTasks.set(taskId, {
    taskId,
    command,
    startedAt: new Date(),
    sessionId
  })

  return { success: true }
}

/**
 * 실행 종료 등록
 */
export function stopExecution(
  taskId: string,
  result: ExecutionResult
): { success: boolean; wasExecuting: boolean } {
  const wasExecuting = executingTasks.has(taskId)
  executingTasks.delete(taskId)

  return {
    success: true,
    wasExecuting
  }
}

/**
 * 특정 Task 실행 중 여부 확인
 */
export function isExecuting(taskId: string): boolean {
  return executingTasks.has(taskId)
}

/**
 * 특정 Task 실행 정보 조회
 */
export function getExecution(taskId: string): ExecutionInfo | null {
  return executingTasks.get(taskId) || null
}

/**
 * 전체 실행 중인 Task 목록 조회
 */
export function getAllExecutions(): ExecutionInfo[] {
  return Array.from(executingTasks.values())
}

/**
 * 실행 중인 Task ID 목록 조회
 */
export function getExecutingTaskIds(): string[] {
  return Array.from(executingTasks.keys())
}

/**
 * Stale 실행 정리 (1시간 초과된 실행 제거)
 */
export function cleanupStaleExecutions(): { cleaned: string[] } {
  const now = Date.now()
  const cleaned: string[] = []

  executingTasks.forEach((info, taskId) => {
    if (now - info.startedAt.getTime() > STALE_TIMEOUT_MS) {
      executingTasks.delete(taskId)
      cleaned.push(taskId)
    }
  })

  return { cleaned }
}

/**
 * 전체 실행 상태 초기화 (테스트용)
 */
export function clearAllExecutions(): void {
  executingTasks.clear()
}
