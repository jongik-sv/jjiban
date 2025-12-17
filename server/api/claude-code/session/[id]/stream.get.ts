import { claudeCodeService } from '../../../../utils/claudeCodeService'

export default defineEventHandler(async (event) => {
  const sessionId = getRouterParam(event, 'id')

  if (!sessionId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'sessionId가 필요합니다',
      data: { code: 'MISSING_SESSION_ID' }
    })
  }

  const session = claudeCodeService.getSession(sessionId)
  if (!session) {
    throw createError({
      statusCode: 404,
      statusMessage: '세션을 찾을 수 없습니다',
      data: { code: 'SESSION_NOT_FOUND' }
    })
  }

  // SSE 응답 설정
  setResponseHeaders(event, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no'
  })

  // Node.js response 객체 직접 사용
  const res = event.node.res

  // SSE Writer 생성
  const writer = {
    write: (data: string) => {
      if (!res.writableEnded) {
        res.write(data)
      }
    },
    close: () => {
      if (!res.writableEnded) {
        res.end()
      }
    }
  }

  // SSE 클라이언트 등록
  claudeCodeService.registerSSEClient(sessionId, writer)

  // 연결 종료 시 정리
  event.node.req.on('close', () => {
    claudeCodeService.unregisterSSEClient(sessionId, writer)
  })

  // 초기 연결 확인 메시지
  writer.write(`event: connected\ndata: ${JSON.stringify({ sessionId })}\n\n`)

  // 응답 스트림 유지 (Promise never resolves)
  return new Promise(() => {
    // SSE 연결 유지
  })
})
