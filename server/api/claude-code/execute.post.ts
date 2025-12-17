import { claudeCodeService } from '../../utils/claudeCodeService'

interface ExecuteRequest {
  command: string
  cwd?: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<ExecuteRequest>(event)

  // 명령어 필수
  if (!body.command || typeof body.command !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'command는 필수입니다',
      data: { code: 'MISSING_COMMAND' }
    })
  }

  // 명령어 길이 제한
  if (body.command.length > 10000) {
    throw createError({
      statusCode: 400,
      statusMessage: 'command가 너무 깁니다 (최대 10000자)',
      data: { code: 'COMMAND_TOO_LONG' }
    })
  }

  // cwd 검증
  if (body.cwd) {
    try {
      const fs = await import('fs/promises')
      await fs.access(body.cwd, fs.constants.R_OK)
    } catch {
      throw createError({
        statusCode: 400,
        statusMessage: '유효하지 않은 작업 디렉토리입니다',
        data: { code: 'INVALID_CWD' }
      })
    }
  }

  try {
    const sessionId = claudeCodeService.execute({
      command: body.command,
      cwd: body.cwd
    })

    const session = claudeCodeService.getSession(sessionId)

    return {
      success: true,
      sessionId,
      status: session?.status ?? 'running',
      createdAt: session?.createdAt.toISOString()
    }
  } catch (err: unknown) {
    const error = err as Error
    if (error.message === 'MAX_SESSIONS_EXCEEDED') {
      throw createError({
        statusCode: 503,
        statusMessage: '최대 세션 수(10개)를 초과했습니다',
        data: { code: 'MAX_SESSIONS_EXCEEDED' }
      })
    }
    throw err
  }
})
