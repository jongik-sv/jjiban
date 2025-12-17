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

  const cancelled = claudeCodeService.cancel(sessionId)

  return {
    success: cancelled,
    sessionId,
    status: cancelled ? 'cancelled' : session.status
  }
})
