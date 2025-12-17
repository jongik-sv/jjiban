/**
 * Claude Code 세션 상태
 */
export type ClaudeCodeStatus = 'idle' | 'running' | 'completed' | 'error' | 'cancelled'

/**
 * 세션 정보
 */
export interface ClaudeCodeSession {
  sessionId: string
  status: ClaudeCodeStatus
  command: string
  cwd: string
  output: string
  exitCode: number | null
  createdAt: string
  updatedAt: string
}

/**
 * 실행 요청
 */
export interface ExecuteRequest {
  command: string
  cwd?: string
}

/**
 * 실행 응답
 */
export interface ExecuteResponse {
  success: boolean
  sessionId: string
  status: ClaudeCodeStatus
  createdAt: string
}

/**
 * SSE 출력 이벤트
 */
export interface OutputEvent {
  text: string
  stream: 'stdout' | 'stderr'
}

/**
 * SSE 완료 이벤트
 */
export interface CompleteEvent {
  exitCode: number
  success: boolean
  cancelled?: boolean
}
