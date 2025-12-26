/**
 * useTerminal Composable
 * Task: TSK-02-03
 * 상세설계: 020-detail-design.md 섹션 5
 *
 * 터미널 세션 관리를 위한 편의 함수 제공
 */

import { useTerminalStore } from '~/stores/terminal'
import { useNotification } from '~/composables/useNotification'
import type { CreateTerminalSessionRequest, TerminalSession } from '~/types/terminal'

export interface UseTerminalOptions {
  /** 알림 표시 여부 */
  useToast?: boolean
}

export interface UseTerminalResult {
  /** 터미널 세션 생성 (편의 함수) */
  createTerminalSession: (
    taskId?: string,
    projectId?: string,
    cols?: number,
    rows?: number
  ) => Promise<string | null>
  /** 터미널 세션 종료 (편의 함수) */
  closeTerminalSession: (sessionId: string) => Promise<void>
  /** Task에 연결된 세션 가져오기 또는 생성 */
  getOrCreateSession: (taskId: string, projectId: string) => Promise<string | null>
  /** 터미널 입력 전송 (편의 함수) */
  sendTerminalInput: (sessionId: string, input: string) => Promise<boolean>
  /** 터미널 리사이즈 (편의 함수) */
  resizeTerminal: (sessionId: string, cols: number, rows: number) => Promise<void>
  /** Store 직접 접근 */
  terminalStore: ReturnType<typeof useTerminalStore>
  /** 연결 중 여부 */
  isConnecting: ComputedRef<boolean>
  /** 에러 메시지 */
  error: ComputedRef<string | null>
  /** 세션 목록 */
  sessionList: ComputedRef<TerminalSession[]>
  /** 활성 세션 */
  activeSession: ComputedRef<TerminalSession | null>
  /** 세션 수 */
  sessionCount: ComputedRef<number>
  /** 실행 중인 세션 수 */
  runningSessionCount: ComputedRef<number>
}

export function useTerminal(options: UseTerminalOptions = {}): UseTerminalResult {
  const { useToast = true } = options

  const terminalStore = useTerminalStore()
  const notification = useNotification()

  /**
   * 터미널 세션 생성 (편의 함수)
   */
  async function createTerminalSession(
    taskId?: string,
    projectId?: string,
    cols: number = 80,
    rows: number = 24
  ): Promise<string | null> {
    try {
      const request: CreateTerminalSessionRequest = {
        taskId,
        projectId,
        cols,
        rows
      }

      const sessionId = await terminalStore.createSession(request)

      if (useToast) {
        notification.success('터미널 세션이 생성되었습니다')
      }

      return sessionId
    } catch (e) {
      if (useToast) {
        notification.error(e instanceof Error ? e.message : '세션 생성 실패')
      }
      return null
    }
  }

  /**
   * 터미널 세션 종료 (편의 함수)
   */
  async function closeTerminalSession(sessionId: string): Promise<void> {
    try {
      await terminalStore.closeSession(sessionId)

      if (useToast) {
        notification.info('터미널 세션이 종료되었습니다')
      }
    } catch (e) {
      if (useToast) {
        notification.error(e instanceof Error ? e.message : '세션 종료 실패')
      }
    }
  }

  /**
   * Task에 연결된 세션 가져오기 또는 생성
   */
  async function getOrCreateSession(
    taskId: string,
    projectId: string
  ): Promise<string | null> {
    // 기존 세션 확인
    const existingSession = terminalStore.getSessionByTaskId(taskId)
    if (existingSession) {
      return existingSession.id
    }

    // 새 세션 생성
    return await createTerminalSession(taskId, projectId)
  }

  /**
   * 터미널 입력 전송 (편의 함수)
   */
  async function sendTerminalInput(
    sessionId: string,
    input: string
  ): Promise<boolean> {
    try {
      await terminalStore.sendInput(sessionId, input)
      return true
    } catch (e) {
      if (useToast) {
        notification.error(e instanceof Error ? e.message : '입력 전송 실패')
      }
      return false
    }
  }

  /**
   * 터미널 리사이즈 (편의 함수)
   */
  async function resizeTerminal(
    sessionId: string,
    cols: number,
    rows: number
  ): Promise<void> {
    await terminalStore.resize(sessionId, cols, rows)
  }

  // Computed refs from store
  const isConnecting = computed(() => terminalStore.isConnecting)
  const error = computed(() => terminalStore.error)
  const sessionList = computed(() => terminalStore.sessionList)
  const activeSession = computed(() => terminalStore.activeSession)
  const sessionCount = computed(() => terminalStore.sessionCount)
  const runningSessionCount = computed(() => terminalStore.runningSessionCount)

  return {
    // 편의 함수
    createTerminalSession,
    closeTerminalSession,
    getOrCreateSession,
    sendTerminalInput,
    resizeTerminal,
    // Store 직접 노출
    terminalStore,
    // Computed refs
    isConnecting,
    error,
    sessionList,
    activeSession,
    sessionCount,
    runningSessionCount
  }
}
