import { defineStore } from 'pinia'
import type { ClaudeCodeSession, ClaudeCodeStatus, ExecuteResponse, OutputEvent, CompleteEvent } from '~/types/claudeCode'

interface ExecuteOptions {
  onComplete?: (success: boolean) => void
}

interface ClaudeCodeState {
  sessions: Record<string, ClaudeCodeSession>
  activeSessionId: string | null
  eventSources: Record<string, EventSource>
  sessionCallbacks: Record<string, ExecuteOptions>
}

export const useClaudeCodeStore = defineStore('claudeCode', {
  state: (): ClaudeCodeState => ({
    sessions: {},
    activeSessionId: null,
    eventSources: {},
    sessionCallbacks: {}
  }),

  getters: {
    activeSession: (state): ClaudeCodeSession | null => {
      if (!state.activeSessionId) return null
      return state.sessions[state.activeSessionId] ?? null
    },
    isRunning: (state): boolean => {
      if (!state.activeSessionId) return false
      return state.sessions[state.activeSessionId]?.status === 'running'
    }
  },

  actions: {
    /**
     * 명령 실행
     * @param command - 실행할 명령어
     * @param cwd - 작업 디렉토리
     * @param options - 콜백 옵션 (onComplete)
     */
    async execute(command: string, cwd?: string, options?: ExecuteOptions): Promise<string> {
      const response = await $fetch<ExecuteResponse>('/api/claude-code/execute', {
        method: 'POST',
        body: { command, cwd }
      })

      const session: ClaudeCodeSession = {
        sessionId: response.sessionId,
        status: response.status,
        command,
        cwd: cwd ?? '',
        output: '',
        exitCode: null,
        createdAt: response.createdAt,
        updatedAt: response.createdAt
      }

      this.sessions[response.sessionId] = session
      this.activeSessionId = response.sessionId

      // 콜백 저장
      if (options) {
        this.sessionCallbacks[response.sessionId] = options
      }

      // SSE 연결
      this.connectSSE(response.sessionId)

      return response.sessionId
    },

    /**
     * SSE 연결
     */
    connectSSE(sessionId: string): void {
      // 기존 연결 정리
      if (this.eventSources[sessionId]) {
        this.eventSources[sessionId].close()
      }

      const eventSource = new EventSource(`/api/claude-code/session/${sessionId}/stream`)

      eventSource.addEventListener('connected', () => {
        console.log(`[ClaudeCode] SSE connected: ${sessionId}`)
      })

      eventSource.addEventListener('output', (event) => {
        const data = JSON.parse(event.data) as OutputEvent
        const session = this.sessions[sessionId]
        if (session) {
          session.output += data.text
          session.updatedAt = new Date().toISOString()
        }
      })

      eventSource.addEventListener('status', (event) => {
        const data = JSON.parse(event.data) as { status: ClaudeCodeStatus }
        const session = this.sessions[sessionId]
        if (session) {
          session.status = data.status
          session.updatedAt = new Date().toISOString()
        }
      })

      eventSource.addEventListener('complete', (event) => {
        const data = JSON.parse(event.data) as CompleteEvent
        const session = this.sessions[sessionId]
        if (session) {
          session.status = data.cancelled ? 'cancelled' : (data.success ? 'completed' : 'error')
          session.exitCode = data.exitCode
          session.updatedAt = new Date().toISOString()
        }

        // 콜백 호출
        const callbacks = this.sessionCallbacks[sessionId]
        if (callbacks?.onComplete) {
          callbacks.onComplete(data.success)
        }
        delete this.sessionCallbacks[sessionId]

        // SSE 연결 종료
        eventSource.close()
        delete this.eventSources[sessionId]
      })

      eventSource.onerror = () => {
        console.error(`[ClaudeCode] SSE error: ${sessionId}`)
        eventSource.close()
        delete this.eventSources[sessionId]
      }

      this.eventSources[sessionId] = eventSource
    },

    /**
     * 실행 취소
     */
    async cancel(sessionId: string): Promise<void> {
      await $fetch(`/api/claude-code/session/${sessionId}/cancel`, {
        method: 'POST'
      })
    },

    /**
     * 세션 삭제
     */
    async deleteSession(sessionId: string): Promise<void> {
      // SSE 연결 종료
      if (this.eventSources[sessionId]) {
        this.eventSources[sessionId].close()
        delete this.eventSources[sessionId]
      }

      await $fetch(`/api/claude-code/session/${sessionId}`, {
        method: 'DELETE'
      })

      delete this.sessions[sessionId]

      if (this.activeSessionId === sessionId) {
        this.activeSessionId = null
      }
    },

    /**
     * 출력 초기화
     */
    clearOutput(sessionId: string): void {
      const session = this.sessions[sessionId]
      if (session) {
        session.output = ''
      }
    },

    /**
     * 활성 세션 설정
     */
    setActiveSession(sessionId: string | null): void {
      this.activeSessionId = sessionId
    }
  }
})
