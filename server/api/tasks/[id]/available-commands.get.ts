/**
 * Task 가능한 명령어 조회 API
 * Task: TSK-03-04
 * 상세설계: 020-detail-design.md 섹션 6.1
 */

import { getAvailableCommands } from '../../../utils/workflow/transitionService';
import { findTaskById } from '../../../utils/wbs/taskService';
import { createNotFoundError } from '../../../utils/errors/standardError';

export default defineEventHandler(async (event) => {
  const taskId = getRouterParam(event, 'id');

  if (!taskId) {
    throw createNotFoundError('Task ID가 필요합니다');
  }

  // Task 존재 확인
  const taskResult = await findTaskById(taskId);
  if (!taskResult) {
    throw createNotFoundError(`Task를 찾을 수 없습니다: ${taskId}`);
  }

  const { task } = taskResult;

  // 가능한 명령어 조회
  const commands = await getAvailableCommands(taskId);

  // 현재 상태 코드 추출
  const statusCodeMatch = task.status?.match(/\[([^\]]+)\]/);
  const currentStatus = statusCodeMatch ? `[${statusCodeMatch[1]}]` : '[ ]';

  return {
    taskId,
    category: task.category,
    currentStatus,
    commands,
  };
});
