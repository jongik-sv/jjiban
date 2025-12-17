/**
 * 실행 시작 API
 * POST /api/execution/start
 *
 * 워크플로우 명령어 시작 시 호출
 */

import { defineEventHandler, readBody, createError, H3Event } from 'h3'
import { startExecution } from '../../utils/executionManager'

interface StartExecutionBody {
  taskId: string
  command: string
  sessionId?: string
}

export default defineEventHandler(async (event: H3Event) => {
  const body = await readBody<StartExecutionBody>(event)

  if (!body.taskId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'INVALID_TASK_ID',
      message: 'taskId가 필요합니다',
      data: { timestamp: new Date().toISOString() }
    })
  }

  if (!body.command) {
    throw createError({
      statusCode: 400,
      statusMessage: 'INVALID_COMMAND',
      message: 'command가 필요합니다',
      data: { timestamp: new Date().toISOString() }
    })
  }

  const result = startExecution(body.taskId, body.command, body.sessionId)

  if (!result.success) {
    throw createError({
      statusCode: 409,
      statusMessage: 'ALREADY_EXECUTING',
      message: result.error || '이미 실행 중입니다',
      data: { taskId: body.taskId, timestamp: new Date().toISOString() }
    })
  }

  event.node.res.statusCode = 201
  return {
    success: true,
    taskId: body.taskId,
    command: body.command,
    startedAt: new Date().toISOString()
  }
})
