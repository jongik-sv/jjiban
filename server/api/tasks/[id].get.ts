/**
 * GET /api/tasks/:id - Task 상세 조회
 * Task: TSK-03-02
 * FR-003
 */

import { getTaskDetail } from '../../utils/wbs/taskService';
import type { TaskDetail } from '../../../types';

export default defineEventHandler(async (event): Promise<TaskDetail> => {
  const taskId = getRouterParam(event, 'id') as string;

  const task = await getTaskDetail(taskId);
  return task;
});
