/**
 * 문서 목록 조회 API
 * Task: TSK-03-03
 * 상세설계: 020-detail-design.md 섹션 3.2
 *
 * GET /api/tasks/:id/documents
 */

import { defineEventHandler, getRouterParam, createError, H3Event } from 'h3';
import { getTaskDocuments } from '../../../utils/workflow/documentService';
import { findTaskById } from '../../../utils/wbs/taskService';

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

  try {
    // Task 존재 확인
    const taskResult = await findTaskById(taskId);
    if (!taskResult) {
      throw createError({
        statusCode: 404,
        statusMessage: 'TASK_NOT_FOUND',
        message: `Task를 찾을 수 없습니다: ${taskId}`,
        data: { timestamp: new Date().toISOString() },
      });
    }

    const documents = await getTaskDocuments(taskResult.projectId, taskId);

    return {
      taskId,
      documents,
    };
  } catch (error: unknown) {
    // 표준 에러는 그대로 throw
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'INTERNAL_ERROR',
      message: `문서 목록 조회 실패: ${error instanceof Error ? error.message : 'Unknown error'}`,
      data: { timestamp: new Date().toISOString() },
    });
  }
});
