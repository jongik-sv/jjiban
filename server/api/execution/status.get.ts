/**
 * 실행 상태 조회 API
 * GET /api/execution/status
 * GET /api/execution/status?taskId=TSK-01-01
 *
 * 전체 또는 특정 Task의 실행 상태 조회
 */

import { defineEventHandler, getQuery, H3Event } from 'h3'
import {
  getAllExecutions,
  getExecution,
  getExecutingTaskIds,
  cleanupStaleExecutions
} from '../../utils/executionManager'

export default defineEventHandler((event: H3Event) => {
  const query = getQuery(event)
  const taskId = query.taskId as string | undefined

  // 조회 전 stale 정리 (자동 정리)
  const cleanupResult = cleanupStaleExecutions()

  if (taskId) {
    // 특정 Task 조회
    const execution = getExecution(taskId)
    return {
      taskId,
      isExecuting: !!execution,
      execution: execution ? {
        ...execution,
        startedAt: execution.startedAt.toISOString()
      } : null,
      cleanedStale: cleanupResult.cleaned.length
    }
  }

  // 전체 조회
  const executions = getAllExecutions()
  return {
    executingTaskIds: getExecutingTaskIds(),
    executions: executions.map(e => ({
      ...e,
      startedAt: e.startedAt.toISOString()
    })),
    count: executions.length,
    cleanedStale: cleanupResult.cleaned.length
  }
})
