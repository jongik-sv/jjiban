import { spawn, ChildProcess } from 'child_process'
import { randomUUID } from 'crypto'

/**
 * 세션 상태
 */
type SessionStatus = 'idle' | 'running' | 'completed' | 'error' | 'cancelled'

/**
 * SSE Writer 인터페이스
 */
interface SSEWriter {
  write(data: string): void
  close(): void
}

/**
 * 세션 정보
 */
interface ClaudeCodeSession {
  id: string
  process: ChildProcess | null
  status: SessionStatus
  command: string
  cwd: string
  outputBuffer: string[]
  exitCode: number | null
  sseClients: Set<SSEWriter>
  createdAt: Date
  updatedAt: Date
}

/**
 * 실행 옵션
 */
interface ExecuteOptions {
  command: string
  cwd?: string
}

/**
 * ClaudeCodeService 클래스
 * Claude Code CLI 실행 및 출력 스트리밍 관리
 */
class ClaudeCodeService {
  private readonly MAX_SESSIONS = 10
  private readonly BUFFER_SIZE = 10000
  private readonly SESSION_TIMEOUT_MS = 30 * 60 * 1000 // 30분

  private sessions: Map<string, ClaudeCodeSession> = new Map()

  /**
   * 새 세션 생성 및 명령 실행
   */
  execute(options: ExecuteOptions): string {
    if (this.sessions.size >= this.MAX_SESSIONS) {
      throw new Error('MAX_SESSIONS_EXCEEDED')
    }

    const sessionId = randomUUID()
    const cwd = options.cwd ?? process.cwd()

    // 세션 생성
    const session: ClaudeCodeSession = {
      id: sessionId,
      process: null,
      status: 'idle',
      command: options.command,
      cwd,
      outputBuffer: [],
      exitCode: null,
      sseClients: new Set(),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.sessions.set(sessionId, session)

    // 비동기로 프로세스 시작
    this.startProcess(session)

    return sessionId
  }

  /**
   * 프로세스 시작
   */
  private startProcess(session: ClaudeCodeSession): void {
    session.status = 'running'
    session.updatedAt = new Date()

    // Claude Code CLI 실행
    // -p 옵션: print mode (비대화형)
    const proc = spawn('claude', ['-p', session.command], {
      cwd: session.cwd,
      shell: true,
      env: {
        ...process.env,
        FORCE_COLOR: '1' // ANSI 색상 유지
      }
    })

    session.process = proc

    // stdout 핸들러
    proc.stdout?.on('data', (data: Buffer) => {
      const text = data.toString()
      this.appendOutput(session, text, 'stdout')
    })

    // stderr 핸들러
    proc.stderr?.on('data', (data: Buffer) => {
      const text = data.toString()
      this.appendOutput(session, text, 'stderr')
    })

    // 종료 핸들러
    proc.on('close', (code) => {
      session.exitCode = code
      session.status = code === 0 ? 'completed' : 'error'
      session.updatedAt = new Date()
      session.process = null

      // 완료 이벤트 전송
      this.broadcastSSE(session, 'complete', {
        exitCode: code,
        success: code === 0
      })
    })

    // 에러 핸들러
    proc.on('error', (err) => {
      session.status = 'error'
      session.updatedAt = new Date()
      this.appendOutput(session, `Error: ${err.message}`, 'stderr')
    })

    // 타임아웃 설정
    setTimeout(() => {
      if (session.status === 'running') {
        this.cancel(session.id)
        this.appendOutput(session, '\n[Timeout: 30분 초과로 자동 종료됨]', 'stderr')
      }
    }, this.SESSION_TIMEOUT_MS)
  }

  /**
   * 출력 추가 및 SSE 전송
   */
  private appendOutput(session: ClaudeCodeSession, text: string, stream: 'stdout' | 'stderr'): void {
    // 버퍼에 추가
    session.outputBuffer.push(text)
    while (session.outputBuffer.length > this.BUFFER_SIZE) {
      session.outputBuffer.shift()
    }
    session.updatedAt = new Date()

    // SSE 전송
    this.broadcastSSE(session, 'output', { text, stream })
  }

  /**
   * SSE 브로드캐스트
   */
  private broadcastSSE(session: ClaudeCodeSession, event: string, data: object): void {
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
    const failedClients: SSEWriter[] = []

    session.sseClients.forEach(client => {
      try {
        client.write(message)
      } catch {
        failedClients.push(client)
      }
    })

    // 실패한 클라이언트 정리
    failedClients.forEach(client => session.sseClients.delete(client))
  }

  /**
   * 실행 취소
   */
  cancel(sessionId: string): boolean {
    const session = this.sessions.get(sessionId)
    if (!session || !session.process) return false

    session.status = 'cancelled'
    session.updatedAt = new Date()

    // 프로세스 종료
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', session.process.pid!.toString(), '/f', '/t'])
    } else {
      session.process.kill('SIGTERM')
      setTimeout(() => {
        try {
          session.process?.kill('SIGKILL')
        } catch {
          // ignore
        }
      }, 2000)
    }

    // 취소 이벤트 전송
    this.broadcastSSE(session, 'complete', {
      exitCode: -1,
      success: false,
      cancelled: true
    })

    return true
  }

  /**
   * 세션 조회
   */
  getSession(sessionId: string): ClaudeCodeSession | null {
    return this.sessions.get(sessionId) ?? null
  }

  /**
   * 모든 세션 목록
   */
  getAllSessions(): Array<{
    sessionId: string
    status: SessionStatus
    command: string
    cwd: string
    exitCode: number | null
    createdAt: string
    updatedAt: string
  }> {
    return Array.from(this.sessions.values()).map(s => ({
      sessionId: s.id,
      status: s.status,
      command: s.command,
      cwd: s.cwd,
      exitCode: s.exitCode,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString()
    }))
  }

  /**
   * SSE 클라이언트 등록
   */
  registerSSEClient(sessionId: string, writer: SSEWriter): void {
    const session = this.sessions.get(sessionId)
    if (!session) {
      throw new Error('SESSION_NOT_FOUND')
    }

    session.sseClients.add(writer)

    // 기존 버퍼 전송
    if (session.outputBuffer.length > 0) {
      const historyText = session.outputBuffer.join('')
      writer.write(`event: output\ndata: ${JSON.stringify({ text: historyText, stream: 'stdout' })}\n\n`)
    }

    // 현재 상태 전송
    writer.write(`event: status\ndata: ${JSON.stringify({ status: session.status })}\n\n`)

    // 이미 완료된 경우 complete 이벤트 전송
    if (session.status === 'completed' || session.status === 'error' || session.status === 'cancelled') {
      writer.write(`event: complete\ndata: ${JSON.stringify({
        exitCode: session.exitCode,
        success: session.status === 'completed',
        cancelled: session.status === 'cancelled'
      })}\n\n`)
    }
  }

  /**
   * SSE 클라이언트 해제
   */
  unregisterSSEClient(sessionId: string, writer: SSEWriter): void {
    const session = this.sessions.get(sessionId)
    if (session) {
      session.sseClients.delete(writer)
    }
  }

  /**
   * 세션 삭제
   */
  deleteSession(sessionId: string): void {
    const session = this.sessions.get(sessionId)
    if (!session) return

    // 실행 중이면 취소
    if (session.process) {
      this.cancel(sessionId)
    }

    // SSE 클라이언트 정리
    session.sseClients.forEach(client => {
      try {
        client.close()
      } catch {
        // ignore
      }
    })

    this.sessions.delete(sessionId)
  }

  /**
   * 모든 세션 정리
   */
  cleanup(): void {
    for (const sessionId of this.sessions.keys()) {
      this.deleteSession(sessionId)
    }
  }
}

// 싱글톤 인스턴스
export const claudeCodeService = new ClaudeCodeService()

// 서버 종료 시 정리
process.on('SIGTERM', () => claudeCodeService.cleanup())
process.on('SIGINT', () => claudeCodeService.cleanup())
