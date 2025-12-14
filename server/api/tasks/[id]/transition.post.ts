/**
 * 상태 전이 API
 * Task: TSK-03-03
 * 상세설계: 020-detail-design.md 섹션 3.1
 *
 * POST /api/tasks/:id/transition
 */

import { defineEventHandler, getRouterParam, readBody, createError, H3Event } from 'h3';
import { executeTransition } from '../../../utils/workflow/transitionService';

export default defineEventHandler(async (event: H3Event) => {
  const taskId = getRouterParam(event, 'id');

  if (!taskId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'INVALID_TASK_ID',
      message: 'Task ID가 제공되지 않았습니다',
      data: { timestamp: new Date().toISOString() },
    });
  }

  const body = await readBody(event);
  const { command, comment } = body;

  if (!command) {
    throw createError({
      statusCode: 400,
      statusMessage: 'INVALID_COMMAND',
      message: '명령어가 제공되지 않았습니다',
      data: { timestamp: new Date().toISOString() },
    });
  }

  try {
    const result = await executeTransition(taskId, command, comment);

    // 201 Created 응답
    event.node.res.statusCode = 201;
    return result;
  } catch (error: unknown) {
    // 표준 에러는 그대로 throw
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'INTERNAL_ERROR',
      message: `상태 전이 실패: ${error instanceof Error ? error.message : 'Unknown error'}`,
      data: { timestamp: new Date().toISOString() },
    });
  }
});
