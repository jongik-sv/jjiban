/**
 * POST /api/projects - 프로젝트 생성
 * Task: TSK-02-03-03
 * FR-003, BR-001, BR-004
 */

import { createProjectWithRegistration } from '../../utils/projects/projectFacade';
import { createProjectSchema } from '../../utils/validators/projectValidators';
import { createBadRequestError } from '../../utils/errors/standardError';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  // Zod 검증
  const validation = createProjectSchema.safeParse(body);
  if (!validation.success) {
    const firstError = validation.error.errors[0];
    throw createBadRequestError('VALIDATION_ERROR', firstError.message);
  }

  const dto = validation.data;

  // Facade를 통한 프로젝트 생성 + 목록 등록
  const result = await createProjectWithRegistration(dto);

  return result;
});
