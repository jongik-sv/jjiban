/**
 * Unit Tests: useDocumentLoader
 * TSK-05-04: Document Viewer
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ref } from 'vue';
import { useDocumentLoader } from '~/composables/useDocumentLoader';

// Mock $fetch
const mockFetch = vi.fn();
global.$fetch = mockFetch;

describe('useDocumentLoader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should load document content successfully', async () => {
    const mockResponse = {
      content: '# 기본설계',
      filename: '010-basic-design.md',
      size: 5242,
      lastModified: '2025-12-15T10:00:00Z'
    };

    mockFetch.mockResolvedValue(mockResponse);

    const { content, loading, error } = useDocumentLoader(
      'TSK-05-04',
      '010-basic-design.md',
      { cache: false }
    );

    // 초기 로딩 상태
    expect(loading.value).toBe(true);

    // Promise 완료 대기
    await vi.runAllTimersAsync();

    expect(content.value).toBe('# 기본설계');
    expect(loading.value).toBe(false);
    expect(error.value).toBe(null);
  });

  it('should handle API errors with 404', async () => {
    const mockError = {
      statusCode: 404,
      data: { code: 'DOCUMENT_NOT_FOUND' },
      statusMessage: '요청한 문서를 찾을 수 없습니다'
    };

    mockFetch.mockRejectedValue(mockError);

    const { content, loading, error } = useDocumentLoader(
      'TSK-05-04',
      'not-found.md',
      { cache: false }
    );

    await vi.runAllTimersAsync();

    expect(content.value).toBe(null);
    expect(loading.value).toBe(false);
    expect(error.value).not.toBe(null);
    expect(error.value?.code).toBe('DOCUMENT_NOT_FOUND');
    expect(error.value?.message).toContain('찾을 수 없습니다');
    expect(error.value?.isRecoverable).toBe(false);
  });

  it('should handle network errors', async () => {
    const mockError = new Error('Network error');

    mockFetch.mockRejectedValue(mockError);

    const { loading, error } = useDocumentLoader(
      'TSK-05-04',
      '010-basic-design.md',
      { cache: false }
    );

    await vi.runAllTimersAsync();

    expect(loading.value).toBe(false);
    expect(error.value).not.toBe(null);
    expect(error.value?.code).toBe('NETWORK_ERROR');
    expect(error.value?.isRecoverable).toBe(true);
  });

  it('should handle timeout errors', async () => {
    // AbortController의 abort를 직접 시뮬레이션
    const abortError = new DOMException('The operation was aborted', 'AbortError');

    mockFetch.mockImplementation(() => Promise.reject(abortError));

    const { loading, error } = useDocumentLoader(
      'TSK-05-04',
      '010-basic-design.md',
      { cache: false, timeout: 1000 }
    );

    await vi.runAllTimersAsync();

    expect(loading.value).toBe(false);
    expect(error.value).not.toBe(null);
    expect(error.value?.code).toBe('TIMEOUT');
    expect(error.value?.isRecoverable).toBe(true);
  });

  it('should use cache when enabled', async () => {
    const mockResponse = {
      content: '# Cached Content',
      filename: '010-basic-design.md',
      size: 100,
      lastModified: '2025-12-15T10:00:00Z'
    };

    mockFetch.mockResolvedValue(mockResponse);

    // 첫 번째 로드
    const { content: content1 } = useDocumentLoader(
      'TSK-05-04',
      '010-basic-design.md',
      { cache: true }
    );

    await vi.runAllTimersAsync();

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(content1.value).toBe('# Cached Content');

    // 두 번째 로드 (캐시에서 가져옴)
    const { content: content2 } = useDocumentLoader(
      'TSK-05-04',
      '010-basic-design.md',
      { cache: true }
    );

    await vi.runAllTimersAsync();

    // 캐시를 사용하므로 fetch는 한 번만 호출됨
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(content2.value).toBe('# Cached Content');
  });

  it('should clear cache on reload', async () => {
    const mockResponse = {
      content: '# New Content',
      filename: '010-basic-design.md',
      size: 100,
      lastModified: '2025-12-15T10:00:00Z'
    };

    mockFetch.mockResolvedValue(mockResponse);

    // 새로운 파일명으로 테스트 (이전 테스트의 캐시 영향 방지)
    const { content, reload } = useDocumentLoader(
      'TSK-05-04',
      '020-new-doc.md',
      { cache: true }
    );

    await vi.runAllTimersAsync();

    // immediate watch로 인해 초기 로드됨
    expect(mockFetch).toHaveBeenCalled();
    expect(content.value).toBe('# New Content');

    const callCountBeforeReload = mockFetch.mock.calls.length;

    // reload 호출
    await reload();
    await vi.runAllTimersAsync();

    // 캐시를 무시하고 다시 fetch
    expect(mockFetch.mock.calls.length).toBeGreaterThan(callCountBeforeReload);
  });

  it('should handle invalid request errors', async () => {
    const mockError = {
      statusCode: 400,
      data: { code: 'INVALID_FILENAME' },
      statusMessage: '유효하지 않은 파일명입니다'
    };

    mockFetch.mockRejectedValue(mockError);

    const { error } = useDocumentLoader(
      'TSK-05-04',
      'invalid_name.md',
      { cache: false }
    );

    await vi.runAllTimersAsync();

    expect(error.value?.code).toBe('INVALID_FILENAME');
    expect(error.value?.isRecoverable).toBe(false);
  });

  it('should watch for taskId and filename changes', async () => {
    const mockResponse1 = {
      content: '# Content 1',
      filename: '010-basic-design.md',
      size: 100,
      lastModified: '2025-12-15T10:00:00Z'
    };

    const mockResponse2 = {
      content: '# Content 2',
      filename: '020-detail-design.md',
      size: 200,
      lastModified: '2025-12-15T11:00:00Z'
    };

    mockFetch
      .mockResolvedValueOnce(mockResponse1)
      .mockResolvedValueOnce(mockResponse2);

    const taskId = ref('TSK-05-04');
    const filename = ref('010-basic-design.md');

    const { content } = useDocumentLoader(taskId, filename, { cache: false });

    await vi.runAllTimersAsync();

    expect(content.value).toBe('# Content 1');

    // filename 변경
    filename.value = '020-detail-design.md';

    await vi.runAllTimersAsync();

    expect(content.value).toBe('# Content 2');
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});
