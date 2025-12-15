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
    // Zod v4: .issues 사용
    const firstError = validation.error.issues?.[0];
    throw createBadRequestError('VALIDATION_ERROR', firstError?.message || '유효성 검증 실패');
  }

  const dto = validation.data;

  // Facade를 통한 프로젝트 생성 + 목록 등록
  const result = await createProjectWithRegistration(dto);

  // 201 Created 상태 코드 설정
  setResponseStatus(event, 201);
  return result;
});
