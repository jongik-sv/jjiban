/**
 * Task 워크플로우 이력 조회 API
 * Task: TSK-03-04
 * 상세설계: 020-detail-design.md 섹션 6.2
 */

import { queryHistory } from '../../../utils/workflow/workflowEngine';
import { createNotFoundError, createBadRequestError } from '../../../utils/errors/standardError';

export default defineEventHandler(async (event) => {
  const taskId = getRouterParam(event, 'id');

  if (!taskId) {
    throw createNotFoundError('Task ID가 필요합니다');
  }

  // 쿼리 파라미터 파싱
  const query = getQuery(event);
  const action = query.action as 'transition' | 'update' | undefined;
  const limit = query.limit ? parseInt(query.limit as string, 10) : 50;
  const offset = query.offset ? parseInt(query.offset as string, 10) : 0;

  // 유효성 검증
  if (action && !['transition', 'update'].includes(action)) {
    throw createBadRequestError(
      'INVALID_PARAMETER',
      'action은 "transition" 또는 "update"여야 합니다'
    );
  }

  if (limit < 1 || limit > 100) {
    throw createBadRequestError(
      'INVALID_PARAMETER',
      'limit은 1-100 사이여야 합니다'
    );
  }

  if (offset < 0) {
    throw createBadRequestError(
      'INVALID_PARAMETER',
      'offset은 0 이상이어야 합니다'
    );
  }

  // 이력 조회 (queryHistory가 이제 QueryHistoryResult 반환)
  const result = await queryHistory(taskId, {
    action,
    limit,
    offset,
  });

  return {
    taskId,
    history: result.items,
    total: result.totalCount,
    limit,
    offset,
  };
});
