/**
 * PUT /api/projects/:id - 프로젝트 수정
 * Task: TSK-02-03-03
 * FR-004, BR-002
 */

import { updateProject } from '../../utils/projects/projectService';
import { updateProjectSchema } from '../../utils/validators/projectValidators';
import { createBadRequestError } from '../../utils/errors/standardError';

export default defineEventHandler(async (event) => {
  const projectId = getRouterParam(event, 'id') as string;
  const body = await readBody(event);

  // Zod 검증
  const validation = updateProjectSchema.safeParse(body);
  if (!validation.success) {
    const firstError = validation.error.errors[0];
    throw createBadRequestError('VALIDATION_ERROR', firstError.message);
  }

  const dto = validation.data;
  const project = await updateProject(projectId, dto);

  return { project };
});
