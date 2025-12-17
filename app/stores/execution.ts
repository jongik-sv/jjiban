/**
 * 실행 상태 스토어
 * 워크플로우 명령어 실행 중인 Task 추적
 * Task: jjiban개선 PRD 섹션 9
 */

export interface ExecutionInfo {
  taskId: string
  command: string
  startedAt: string
  sessionId?: string
}

export const useExecutionStore = defineStore('execution', () => {
  // ============================================================
  // State
  // ============================================================
  const executingTasks = ref<Map<string, ExecutionInfo>>(new Map())
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastSyncedAt = ref<Date | null>(null)

  // 폴링 인터벌 ID
  let pollingInterval: ReturnType<typeof setInterval> | null = null

  // ============================================================
  // Getters
  // ============================================================

  /**
   * 특정 Task가 실행 중인지 확인
   */
  function isExecuting(taskId: string): boolean {
    return executingTasks.value.has(taskId)
  }

  /**
   * 특정 Task의 실행 정보 조회
   */
  function getExecution(taskId: string): ExecutionInfo | null {
    return executingTasks.value.get(taskId) || null
  }

  /**
   * 실행 중인 Task ID 목록
   */
  const executingTaskIds = computed((): string[] => {
    return Array.from(executingTasks.value.keys())
  })

  /**
   * 실행 중인 Task 수
   */
  const executingCount = computed((): number => {
    return executingTasks.value.size
  })

  // ============================================================
  // Actions
  // ============================================================

  /**
   * 서버에서 실행 상태 동기화
   */
  async function syncFromServer(): Promise<void> {
    try {
      loading.value = true
      error.value = null

      const response = await $fetch<{
        executingTaskIds: string[]
        executions: ExecutionInfo[]
        count: number
        cleanedStale: number
      }>('/api/execution/status')

      // 새 Map 생성하여 반응성 보장
      const newMap = new Map<string, ExecutionInfo>()
      response.executions.forEach((exec) => {
        newMap.set(exec.taskId, exec)
      })
      executingTasks.value = newMap
      lastSyncedAt.value = new Date()
    } catch (e) {
      error.value = e instanceof Error ? e.message : '실행 상태 동기화 실패'
      console.error('[executionStore] sync error:', e)
    } finally {
      loading.value = false
    }
  }

  /**
   * 실행 시작 요청 (로컬에서 직접 호출 시)
   */
  async function startExecution(
    taskId: string,
    command: string,
    sessionId?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await $fetch<{
        success: boolean
        taskId: string
        command: string
        startedAt: string
      }>('/api/execution/start', {
        method: 'POST',
        body: { taskId, command, sessionId }
      })

      // 로컬 상태 즉시 업데이트
      executingTasks.value.set(taskId, {
        taskId,
        command,
        startedAt: response.startedAt,
        sessionId
      })

      return { success: true }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : '실행 시작 실패'
      return { success: false, error: errorMessage }
    }
  }

  /**
   * 실행 종료 요청 (로컬에서 직접 호출 시)
   */
  async function stopExecution(
    taskId: string,
    success: boolean = true,
    errorMsg?: string
  ): Promise<void> {
    try {
      await $fetch('/api/execution/stop', {
        method: 'POST',
        body: { taskId, success, error: errorMsg }
      })

      // 로컬 상태 즉시 업데이트
      executingTasks.value.delete(taskId)
    } catch (e) {
      console.error('[executionStore] stop error:', e)
      // 서버 에러여도 로컬에서 제거
      executingTasks.value.delete(taskId)
    }
  }

  /**
   * 폴링 시작 (30초 간격)
   */
  function startPolling(intervalMs: number = 30000): void {
    if (pollingInterval) return

    // 즉시 한 번 동기화
    syncFromServer()

    pollingInterval = setInterval(() => {
      syncFromServer()
    }, intervalMs)
  }

  /**
   * 폴링 중지
   */
  function stopPolling(): void {
    if (pollingInterval) {
      clearInterval(pollingInterval)
      pollingInterval = null
    }
  }

  /**
   * 스토어 초기화
   */
  function $reset(): void {
    stopPolling()
    executingTasks.value = new Map()
    loading.value = false
    error.value = null
    lastSyncedAt.value = null
  }

  return {
    // State
    executingTasks,
    loading,
    error,
    lastSyncedAt,
    // Getters
    isExecuting,
    getExecution,
    executingTaskIds,
    executingCount,
    // Actions
    syncFromServer,
    startExecution,
    stopExecution,
    startPolling,
    stopPolling,
    $reset
  }
})

// HMR 지원
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useExecutionStore, import.meta.hot))
}
