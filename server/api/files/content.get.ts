/**
 * GET /api/files/content?path={filePath}
 * Task: TSK-09-01
 * 상세설계: 020-detail-design.md 섹션 1.2
 *
 * 파일 컨텐츠 조회
 * 보안: Path Traversal 방어, 파일 크기 제한, .jjiban 폴더 내로 제한
 */

import { defineEventHandler, getQuery } from 'h3';
import { readFile, stat } from 'fs/promises';
import { resolve } from 'path';
import type { FileContentResponse } from '../../../types';
import { fileExists } from '../../utils/file';
import {
  createBadRequestError,
  createForbiddenError,
  createNotFoundError,
  createInternalError,
} from '../../utils/errors/standardError';

// 파일 크기 제한 (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default defineEventHandler(async (event): Promise<FileContentResponse> => {
  const query = getQuery(event);
  const filePath = query.path as string;

  // 1. 경로 검증 (필수)
  if (!filePath || typeof filePath !== 'string') {
    throw createBadRequestError('FILE_PATH_REQUIRED', '파일 경로가 필요합니다');
  }

  // 2. 보안: Path Traversal 방어
  const normalizedPath = resolve(filePath);
  const jjibanRoot = resolve(process.cwd(), '.jjiban');

  if (!normalizedPath.startsWith(jjibanRoot)) {
    throw createForbiddenError('ACCESS_DENIED', '.jjiban 폴더 외부 접근 불가');
  }

  // 3. 파일 존재 확인
  const exists = await fileExists(normalizedPath);
  if (!exists) {
    throw createNotFoundError('파일을 찾을 수 없습니다');
  }

  // 4. 파일 크기 제한
  try {
    const stats = await stat(normalizedPath);
    if (stats.size > MAX_FILE_SIZE) {
      throw createBadRequestError('FILE_TOO_LARGE', '파일 크기가 10MB를 초과합니다');
    }
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }
    throw createInternalError(
      'FILE_STAT_ERROR',
      '파일 정보를 읽을 수 없습니다'
    );
  }

  // 5. 파일 읽기
  try {
    const content = await readFile(normalizedPath, 'utf-8');
    return { content };
  } catch (error) {
    throw createInternalError(
      'FILE_READ_ERROR',
      `파일을 읽을 수 없습니다: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
});
