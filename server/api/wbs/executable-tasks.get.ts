/**
 * GET /api/wbs/executable-tasks - 실행 가능한 Task 목록 조회
 *
 * Query Parameters:
 * - projectId: 프로젝트 ID (기본: 'jjiban')
 * - category: 카테고리 필터 (development|defect|infrastructure)
 */

import { getWbsTree } from '../../utils/wbs/wbsService';
import { getExecutableTasks } from '../../utils/wbs/taskSelector';
import type { TaskSelectorResult } from '../../utils/wbs/taskSelector';
import type { TaskCategory } from '../../../types';

export default defineEventHandler(async (event): Promise<TaskSelectorResult> => {
  const query = getQuery(event);

  const projectId = (query.projectId as string) || 'jjiban';
  const category = query.category as TaskCategory | undefined;

  // WBS 트리 조회
  const { tree } = await getWbsTree(projectId);

  // 실행 가능한 Task 필터링
  const result = getExecutableTasks(tree, {
    category,
    projectId,
  });

  return result;
});
