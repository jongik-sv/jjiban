/**
 * GET /api/tasks/:id/documents/:filename
 * TSK-05-04: Document Viewer
 *
 * Task 문서 조회 API
 */

// server/utils는 Nuxt에서 자동 import됨
// validateDocument: ~/server/utils/validators/documentValidator.ts
// readTaskDocument: ~/server/utils/documentService.ts
import { safeDecodePathSegment } from '~~/app/utils/urlPath';

export default defineEventHandler(async (event) => {
  const taskIdRaw = getRouterParam(event, 'id');
  const filenameRaw = getRouterParam(event, 'filename');

  if (!taskIdRaw || !filenameRaw) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Task ID와 파일명이 필요합니다',
      data: { code: 'MISSING_PARAMETERS' }
    });
  }

  // URL 인코딩된 파라미터 디코딩 (한글, 공백, 괄호 등 지원)
  const taskId = safeDecodePathSegment(taskIdRaw);
  const filename = safeDecodePathSegment(filenameRaw);

  if (!taskId || !filename) {
    throw createError({
      statusCode: 400,
      statusMessage: '잘못된 경로 형식입니다',
      data: { code: 'INVALID_PATH_SEGMENT' }
    });
  }

  // 파일 경로 구성 (검증용)
  const filePath = `${process.cwd()}/.jjiban/projects/jjiban/tasks/${taskId}/${filename}`;

  // 문서 검증 (파일명 패턴, 경로 탐색, 파일 크기)
  const validationResult = await validateDocument(filename, filePath);

  if (!validationResult.valid) {
    throw createError({
      statusCode: 400,
      statusMessage: validationResult.error,
      data: { code: validationResult.code }
    });
  }

  try {
    // projectId는 현재 하드코딩 (향후 프로젝트 선택 기능 추가 시 변경)
    const projectId = 'jjiban';
    const document = await readTaskDocument(projectId, taskId, filename);

    return {
      content: document.content,
      filename: document.filename,
      size: document.size,
      lastModified: document.lastModified
    };
  } catch (error: any) {
    if (error.message === 'DOCUMENT_NOT_FOUND') {
      throw createError({
        statusCode: 404,
        statusMessage: '요청한 문서를 찾을 수 없습니다',
        data: { code: 'DOCUMENT_NOT_FOUND' }
      });
    }

    if (error.message === 'FILE_READ_ERROR') {
      throw createError({
        statusCode: 500,
        statusMessage: '문서를 불러올 수 없습니다',
        data: { code: 'FILE_READ_ERROR' }
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: '서버 오류가 발생했습니다',
      data: { code: 'INTERNAL_ERROR' }
    });
  }
});
