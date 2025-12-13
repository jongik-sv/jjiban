import { defineEventHandler } from 'h3';
import { ensureJjibanStructure, checkJjibanStructure } from '../utils/file';

/**
 * POST /api/init
 * .jjiban 디렉토리 구조 초기화 API
 *
 * 멱등성 보장: 이미 존재하는 폴더는 건너뜀
 */
export default defineEventHandler(async () => {
  // 현재 상태 확인
  const beforeStatus = await checkJjibanStructure();

  // 구조 생성
  const result = await ensureJjibanStructure();

  // 생성 후 상태 확인
  const afterStatus = await checkJjibanStructure();

  return {
    success: result.success,
    message: result.success
      ? 'JJIBAN structure initialized successfully'
      : 'JJIBAN structure initialization completed with errors',
    data: {
      created: result.created,
      errors: result.errors,
      status: {
        before: beforeStatus,
        after: afterStatus,
      },
    },
  };
});
