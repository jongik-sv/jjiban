/**
 * 실행 종료 API
 * POST /api/execution/stop
 *
 * 워크플로우 명령어 종료 시 호출
 */

import { defineEventHandler, readBody, createError, H3Event } from 'h3'
import { stopExecution } from '../../utils/executionManager'

interface StopExecutionBody {
  taskId: string
  success: boolean
  error?: string
}

export default defineEventHandler(async (event: H3Event) => {
  const body = await readBody<StopExecutionBody>(event)

  if (!body.taskId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'INVALID_TASK_ID',
      message: 'taskId가 필요합니다',
      data: { timestamp: new Date().toISOString() }
    })
  }

  const result = stopExecution(body.taskId, {
    success: body.success ?? true,
    error: body.error
  })

  return {
    success: true,
    taskId: body.taskId,
    wasExecuting: result.wasExecuting,
    stoppedAt: new Date().toISOString()
  }
})
