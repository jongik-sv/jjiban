/**
 * Unit Tests: Server Route - GET /api/tasks/:id/documents/:filename
 * TSK-05-04: Document Viewer
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFile, stat } from 'fs/promises';

// Mock fs/promises
vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
  stat: vi.fn()
}));

describe('GET /api/tasks/:id/documents/:filename', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return document content successfully', async () => {
    const mockContent = '# 기본설계\n\n## 1. 목적';
    const mockStats = {
      size: 5242,
      mtime: new Date('2025-12-15T10:00:00Z')
    };

    (readFile as any).mockResolvedValue(mockContent);
    (stat as any).mockResolvedValue(mockStats);

    // Server Route는 E2E 테스트에서 더 잘 테스트됨
    // 여기서는 비즈니스 로직만 검증

    const { validateDocument } = await import('~/server/utils/validators/documentValidator');
    const { readTaskDocument } = await import('~/server/utils/documentService');

    // 유효한 파일명 검증
    const validationResult = await validateDocument(
      '010-basic-design.md',
      '.jjiban/projects/jjiban/tasks/TSK-05-04/010-basic-design.md'
    );

    expect(validationResult.valid).toBe(true);

    // 문서 읽기
    const document = await readTaskDocument('jjiban', 'TSK-05-04', '010-basic-design.md');

    expect(document.content).toBe(mockContent);
    expect(document.filename).toBe('010-basic-design.md');
    expect(document.size).toBe(5242);
  });

  it('should reject invalid filename', async () => {
    const { validateFilename } = await import('~/server/utils/validators/documentValidator');

    const result = validateFilename('invalid_name.md');

    expect(result.valid).toBe(false);
    expect(result.code).toBe('INVALID_FILENAME');
  });

  it('should reject path traversal attempts', async () => {
    const { validatePathTraversal } = await import('~/server/utils/validators/documentValidator');

    const result = validatePathTraversal('../../../etc/passwd');

    expect(result.valid).toBe(false);
    expect(result.code).toBe('INVALID_PATH');
  });

  it('should reject files larger than 1MB', async () => {
    const mockStats = {
      size: 2 * 1024 * 1024 // 2MB
    };

    (stat as any).mockResolvedValue(mockStats);

    const { validateFileSize } = await import('~/server/utils/validators/documentValidator');

    const result = await validateFileSize('large-file.md');

    expect(result.valid).toBe(false);
    expect(result.code).toBe('FILE_TOO_LARGE');
  });

  it('should handle file not found error', async () => {
    const error: any = new Error('ENOENT');
    error.code = 'ENOENT';

    (readFile as any).mockRejectedValue(error);
    (stat as any).mockResolvedValue({ size: 100, mtime: new Date() });

    const { readTaskDocument } = await import('~/server/utils/documentService');

    await expect(
      readTaskDocument('jjiban', 'TSK-05-04', 'not-found.md')
    ).rejects.toThrow('DOCUMENT_NOT_FOUND');
  });

  it('should handle file read errors', async () => {
    const error = new Error('Permission denied');

    (readFile as any).mockRejectedValue(error);
    (stat as any).mockResolvedValue({ size: 100, mtime: new Date() });

    const { readTaskDocument } = await import('~/server/utils/documentService');

    await expect(
      readTaskDocument('jjiban', 'TSK-05-04', '010-basic-design.md')
    ).rejects.toThrow('FILE_READ_ERROR');
  });

  it('should validate correct filename patterns', async () => {
    const { validateFilename } = await import('~/server/utils/validators/documentValidator');

    const validFilenames = [
      '010-basic-design.md',
      '020-detail-design.md',
      '030-implementation.md',
      '070-integration-test.md',
      '999-any-name-with-dashes.md'
    ];

    validFilenames.forEach(filename => {
      const result = validateFilename(filename);
      expect(result.valid).toBe(true);
    });
  });

  it('should reject incorrect filename patterns', async () => {
    const { validateFilename } = await import('~/server/utils/validators/documentValidator');

    const invalidFilenames = [
      'no-number.md',
      '10-too-short.md',
      '0100-too-long.md',
      '010-file.txt',
      '010_underscore.md'
    ];

    invalidFilenames.forEach(filename => {
      const result = validateFilename(filename);
      expect(result.valid).toBe(false);
      expect(result.code).toBe('INVALID_FILENAME');
    });
  });
});
