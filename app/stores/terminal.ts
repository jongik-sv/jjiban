/**
 * Terminal Store
 * Task: TSK-02-03
 * 상세설계: 020-detail-design.md 섹션 3
 *
 * 터미널 세션 상태 관리
 * 기존 claudeCodeStore와 연동하여 터미널 세션 추상화
 */

import { defineStore } from 'pinia'
import type {
  TerminalSession,
  TerminalSessionStatus,
  CreateTerminalSessionRequest,
  CreateTerminalSessionResponse
} from '~/types/terminal'

export const useTerminalStore = defineStore('terminal', () => {
  // ============================================================
  // State
  // ============================================================

  /**
   * 터미널 세션 Map
   * Key: sessionId, Value: TerminalSession
   */
  const sessions = ref<Map<string, TerminalSession>>(new Map())

  /**
   * 현재 활성화된 세션 ID (전역 다이얼로그용)
   */
  const activeSessionId = ref<string | null>(null)

  /**
   * 연결 중 여부
   */
  const isConnecting = ref(false)

  /**
   * 에러 메시지
   */
  const error = ref<string | null>(null)

  /**
   * 마지막 동기화 시각
   */
  const lastSyncedAt = ref<Date | null>(null)

  // ============================================================
  // Getters
  // ============================================================

  /**
   * 세션 수
   */
  const sessionCount = computed(() => sessions.value.size)

  /**
   * 실행 중인 세션 수 (배지 표시용)
   */
  const runningSessionCount = computed(() => {
    return Array.from(sessions.value.values()).filter(
      s => s.status === 'running'
    ).length
  })

  /**
   * 현재 활성 세션
   */
  const activeSession = computed((): TerminalSession | null => {
    if (!activeSessionId.value) return null
    return sessions.value.get(activeSessionId.value) || null
  })

  /**
   * 세션 목록 (배열)
   */
  const sessionList = computed((): TerminalSession[] => {
    return Array.from(sessions.value.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  })

  /**
   * 특정 Task의 세션 조회
   */
  function getSessionByTaskId(taskId: string): TerminalSession | null {
    for (const session of sessions.value.values()) {
      if (session.taskId === taskId) {
        return session
      }
    }
    return null
  }

  /**
   * 세션 ID로 세션 조회
   */
  function getSession(sessionId: string): TerminalSession | null {
    return sessions.value.get(sessionId) || null
  }

  // ============================================================
  // Actions
  // ============================================================

  /**
   * 터미널 세션 생성
   */
  async function createSession(
    request: CreateTerminalSessionRequest
  ): Promise<string> {
    try {
      isConnecting.value = true
      error.value = null

      const response = await $fetch<CreateTerminalSessionResponse>(
        '/api/terminal/session',
        {
          method: 'POST',
          body: request
        }
      )

      if (!response.success || !response.sessionId) {
        throw new Error(response.error || '세션 생성 실패')
      }

      // 로컬 상태 업데이트
      const newSession: TerminalSession = {
        id: response.sessionId,
        pid: 0, // 서버에서 할당, 다음 sync에서 업데이트
        taskId: request.taskId,
        projectId: request.projectId,
        status: response.status,
        createdAt: response.createdAt,
        updatedAt: response.createdAt
      }

      sessions.value.set(response.sessionId, newSession)
      activeSessionId.value = response.sessionId

      return response.sessionId
    } catch (e) {
      error.value = e instanceof Error ? e.message : '세션 생성 실패'
      console.error('[terminalStore] createSession error:', e)
      throw e
    } finally {
      isConnecting.value = false
    }
  }

  /**
   * 터미널 세션 종료
   */
  async function closeSession(sessionId: string): Promise<void> {
    try {
      await $fetch(`/api/terminal/session/${sessionId}`, {
        method: 'DELETE'
      })

      // 로컬 상태 업데이트
      sessions.value.delete(sessionId)

      // 활성 세션이 종료되면 null로 설정
      if (activeSessionId.value === sessionId) {
        activeSessionId.value = null
      }
    } catch (e) {
      console.error('[terminalStore] closeSession error:', e)
      // 서버 에러여도 로컬에서 제거
      sessions.value.delete(sessionId)
      if (activeSessionId.value === sessionId) {
        activeSessionId.value = null
      }
    }
  }

  /**
   * 터미널 입력 전송
   */
  async function sendInput(
    sessionId: string,
    input: string
  ): Promise<void> {
    try {
      await $fetch(`/api/terminal/session/${sessionId}/input`, {
        method: 'POST',
        body: { input }
      })
    } catch (e) {
      error.value = e instanceof Error ? e.message : '입력 전송 실패'
      console.error('[terminalStore] sendInput error:', e)
      throw e
    }
  }

  /**
   * 터미널 리사이즈
   */
  async function resize(
    sessionId: string,
    cols: number,
    rows: number
  ): Promise<void> {
    try {
      await $fetch(`/api/terminal/session/${sessionId}/resize`, {
        method: 'POST',
        body: { cols, rows }
      })
    } catch (e) {
      console.error('[terminalStore] resize error:', e)
      // 리사이즈 실패는 치명적이지 않으므로 조용히 실패
    }
  }

  /**
   * 세션 상태 동기화 (서버에서 조회)
   */
  async function syncSessions(): Promise<void> {
    try {
      const response = await $fetch<{ sessions: TerminalSession[]; total: number }>(
        '/api/terminal/session'
      )

      // 기존 Map 업데이트
      const newMap = new Map<string, TerminalSession>()
      response.sessions.forEach(session => {
        newMap.set(session.id, session)
      })
      sessions.value = newMap

      lastSyncedAt.value = new Date()
    } catch (e) {
      console.error('[terminalStore] syncSessions error:', e)
      // 동기화 실패는 조용히 실패 (기존 상태 유지)
    }
  }

  /**
   * 세션 상태 업데이트 (로컬)
   */
  function updateSessionStatus(
    sessionId: string,
    status: TerminalSessionStatus,
    currentCommand?: string
  ): void {
    const session = sessions.value.get(sessionId)
    if (session) {
      session.status = status
      session.currentCommand = currentCommand
      session.updatedAt = new Date().toISOString()
    }
  }

  /**
   * 활성 세션 변경
   */
  function setActiveSession(sessionId: string | null): void {
    activeSessionId.value = sessionId
  }

  /**
   * 세션 추가 (외부에서 생성된 세션 등록)
   */
  function addSession(session: TerminalSession): void {
    sessions.value.set(session.id, session)
  }

  /**
   * 스토어 초기화
   */
  function $reset(): void {
    sessions.value = new Map()
    activeSessionId.value = null
    isConnecting.value = false
    error.value = null
    lastSyncedAt.value = null
  }

  return {
    // State
    sessions,
    activeSessionId,
    isConnecting,
    error,
    lastSyncedAt,
    // Getters
    sessionCount,
    runningSessionCount,
    activeSession,
    sessionList,
    getSessionByTaskId,
    getSession,
    // Actions
    createSession,
    closeSession,
    sendInput,
    resize,
    syncSessions,
    updateSessionStatus,
    setActiveSession,
    addSession,
    $reset
  }
})

// HMR 지원
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTerminalStore, import.meta.hot))
}
