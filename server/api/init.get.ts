import { defineEventHandler } from 'h3';
import { checkJjibanStructure } from '../utils/file';

/**
 * GET /api/init
 * .jjiban 디렉토리 구조 상태 확인 API
 */
export default defineEventHandler(async () => {
  const status = await checkJjibanStructure();

  const allExists = status.root && status.settings && status.templates && status.projects;

  return {
    success: true,
    data: {
      initialized: allExists,
      status,
    },
  };
});
