/**
 * Document Service
 * TSK-05-04: Document Viewer
 *
 * 책임: 파일 시스템 접근, 파일 읽기, 에러 처리
 */

import { readFile, stat } from 'fs/promises';
import path from 'path';
import type { DocumentContent } from '~/types';

/**
 * Task 문서 읽기
 */
export async function readTaskDocument(
  projectId: string,
  taskId: string,
  filename: string
): Promise<DocumentContent> {
  // 파일 경로 구성
  const filePath = path.join(
    process.cwd(),
    '.jjiban',
    'projects',
    projectId,
    'tasks',
    taskId,
    filename
  );

  try {
    // 파일 읽기
    const content = await readFile(filePath, 'utf-8');

    // 파일 통계 정보
    const stats = await stat(filePath);

    return {
      content,
      filename,
      size: stats.size,
      lastModified: stats.mtime.toISOString()
    };
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      throw new Error('DOCUMENT_NOT_FOUND');
    }
    throw new Error('FILE_READ_ERROR');
  }
}
