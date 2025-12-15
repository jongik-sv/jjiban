/**
 * useDocumentLoader Composable
 * TSK-05-04: Document Viewer
 *
 * 책임: API 호출, LRU 캐싱, 에러 처리, 로딩 상태 관리
 */

import { ref, computed, watch, toRef, unref } from 'vue';
import type { Ref, ComputedRef } from 'vue';
import type { DocumentContent, DocumentError } from '~/types';

interface LRUCacheEntry {
  content: string;
  timestamp: number;
}

class LRUCache {
  private cache = new Map<string, LRUCacheEntry>();
  private maxSize: number;
  private ttl: number; // Time to live in milliseconds

  constructor(maxSize = 10, ttl = 5 * 60 * 1000) {
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  get(key: string): string | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    // TTL 체크
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    // LRU: 접근한 항목을 맨 뒤로 이동
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.content;
  }

  set(key: string, content: string): void {
    // 이미 존재하면 삭제 (재삽입으로 순서 갱신)
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    // 최대 크기 초과 시 가장 오래된 항목 제거
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      content,
      timestamp: Date.now()
    });
  }

  clear(): void {
    this.cache.clear();
  }
}

// 전역 LRU 캐시 인스턴스
const documentCache = new LRUCache(10, 5 * 60 * 1000);

export interface UseDocumentLoaderOptions {
  cache?: boolean;   // 캐싱 활성화 (기본: true)
  timeout?: number;  // 타임아웃 ms (기본: 5000)
}

export function useDocumentLoader(
  taskId: Ref<string> | string,
  filename: Ref<string> | string,
  options: UseDocumentLoaderOptions = {}
) {
  const {
    cache = true,
    timeout = 5000
  } = options;

  const content = ref<string | null>(null);
  const loading = ref(false);
  const error = ref<DocumentError | null>(null);

  // Reactive taskId, filename
  const taskIdRef = toRef(taskId);
  const filenameRef = toRef(filename);

  // 캐시 키 생성
  const cacheKey = computed(() => `${taskIdRef.value}/${filenameRef.value}`);

  /**
   * 문서 로드
   */
  async function load(): Promise<void> {
    if (!taskIdRef.value || !filenameRef.value) {
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      // 캐시 확인
      if (cache) {
        const cached = documentCache.get(cacheKey.value);
        if (cached) {
          content.value = cached;
          loading.value = false;
          return;
        }
      }

      // API 호출 (타임아웃 설정)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await $fetch<DocumentContent>(
          `/api/tasks/${taskIdRef.value}/documents/${filenameRef.value}`,
          { signal: controller.signal }
        );

        clearTimeout(timeoutId);

        content.value = response.content;

        // 캐시 저장
        if (cache) {
          documentCache.set(cacheKey.value, response.content);
        }
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
    } catch (err: any) {
      console.error('Document load error:', err);

      // 에러 타입 분류
      if (err.name === 'AbortError') {
        error.value = {
          code: 'TIMEOUT',
          message: '문서 로드 시간이 초과되었습니다',
          isRecoverable: true
        };
      } else if (err.statusCode === 404 || err.data?.code === 'DOCUMENT_NOT_FOUND') {
        error.value = {
          code: 'DOCUMENT_NOT_FOUND',
          message: '요청한 문서를 찾을 수 없습니다',
          isRecoverable: false
        };
      } else if (err.statusCode === 400) {
        error.value = {
          code: err.data?.code || 'INVALID_REQUEST',
          message: err.statusMessage || '잘못된 요청입니다',
          isRecoverable: false
        };
      } else {
        error.value = {
          code: 'NETWORK_ERROR',
          message: '네트워크 연결을 확인해주세요',
          isRecoverable: true,
          originalError: err
        };
      }
    } finally {
      loading.value = false;
    }
  }

  /**
   * 강제 재로드 (캐시 무시)
   */
  async function reload(): Promise<void> {
    documentCache.clear();
    await load();
  }

  // taskId, filename 변경 감지 시 자동 로드
  watch([taskIdRef, filenameRef], () => {
    load();
  }, { immediate: true });

  return {
    content,
    loading,
    error,
    load,
    reload
  };
}
