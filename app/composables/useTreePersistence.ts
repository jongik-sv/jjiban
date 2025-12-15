/**
 * 트리 영속성 Composable
 * 로컬 스토리지에 펼침/접기 상태 저장 및 복원
 * Task: TSK-04-03
 * Priority: P2
 */

import { ref, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { useWbsStore } from '~/stores/wbs'

/**
 * 트리 영속성 Composable
 * 로컬 스토리지에 펼침/접기 상태 저장 및 복원
 */
export interface UseTreePersistenceOptions {
  /**
   * 프로젝트 ID (로컬 스토리지 키 생성용)
   */
  projectId: string
}

export interface UseTreePersistenceReturn {
  /**
   * 저장된 상태 복원 (페이지 로드 시 호출)
   */
  restoreExpandedState: () => void

  /**
   * 현재 상태 저장 (자동 watch 또는 수동 호출)
   * @param expandedNodes - 펼쳐진 노드 ID Set
   */
  saveExpandedState: (expandedNodes: Set<string>) => void

  /**
   * 저장된 상태 초기화 (프로젝트 삭제 시 호출)
   */
  clearExpandedState: () => void

  /**
   * 자동 저장 활성화 여부
   */
  autoSave: Ref<boolean>
}

/**
 * 로컬 스토리지 스키마
 */
interface ExpandedStateStorage {
  version: '1.0'
  timestamp: string  // ISO 8601 형식
  expandedNodes: string[]  // 노드 ID 배열
}

// 상수 정의
const STORAGE_VERSION = '1.0'
const STORAGE_PREFIX = 'jjiban:tree'
const MAX_STORAGE_SIZE = 1024 * 1024 // 1MB

function getStorageKey(projectId: string): string {
  return `${STORAGE_PREFIX}:${projectId}:expanded`
}

export function useTreePersistence(
  options: UseTreePersistenceOptions
): UseTreePersistenceReturn {
  const wbsStore = useWbsStore()
  const autoSave = ref(true)

  /**
   * 저장된 상태 복원
   */
  function restoreExpandedState(): void {
    const storageKey = getStorageKey(options.projectId)

    try {
      // 로컬 스토리지에서 읽기
      const stored = localStorage.getItem(storageKey)
      if (!stored) {
        console.info('[useTreePersistence] No saved state found')
        return
      }

      // JSON 파싱
      const data: ExpandedStateStorage = JSON.parse(stored)

      // 버전 체크
      if (data.version !== STORAGE_VERSION) {
        console.warn('[useTreePersistence] Version mismatch, clearing state')
        clearExpandedState()
        return
      }

      // Set으로 복원
      const expandedNodes = new Set(data.expandedNodes || [])

      // 유효한 노드만 필터링 (존재하지 않는 노드 제거)
      const validNodes = new Set<string>()
      expandedNodes.forEach(nodeId => {
        if (wbsStore.getNode(nodeId)) {
          validNodes.add(nodeId)
        }
      })

      // 스토어 상태 업데이트
      wbsStore.expandedNodes = validNodes

      console.info('[useTreePersistence] Restored state:', validNodes.size, 'nodes')
    } catch (error) {
      console.error('[useTreePersistence] Failed to restore state:', error)
      clearExpandedState()
    }
  }

  /**
   * 현재 상태 저장
   */
  function saveExpandedState(expandedNodes: Set<string>): void {
    const storageKey = getStorageKey(options.projectId)

    try {
      // 데이터 준비
      const data: ExpandedStateStorage = {
        version: STORAGE_VERSION,
        timestamp: new Date().toISOString(),
        expandedNodes: Array.from(expandedNodes)
      }

      // JSON 직렬화
      const json = JSON.stringify(data)

      // 크기 체크
      if (json.length > MAX_STORAGE_SIZE) {
        console.warn('[useTreePersistence] Storage size exceeds limit, skipping save')
        return
      }

      // 로컬 스토리지에 저장
      localStorage.setItem(storageKey, json)
      console.debug('[useTreePersistence] Saved state:', expandedNodes.size, 'nodes')
    } catch (error) {
      // Quota 초과 등의 에러 처리
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.error('[useTreePersistence] Storage quota exceeded')
        // 오래된 데이터 정리 시도
        cleanupOldStorage()
      } else {
        console.error('[useTreePersistence] Failed to save state:', error)
      }
    }
  }

  /**
   * 저장된 상태 초기화
   */
  function clearExpandedState(): void {
    const storageKey = getStorageKey(options.projectId)
    try {
      localStorage.removeItem(storageKey)
      console.info('[useTreePersistence] Cleared state')
    } catch (error) {
      console.error('[useTreePersistence] Failed to clear state:', error)
    }
  }

  /**
   * 오래된 데이터 정리
   */
  function cleanupOldStorage(): void {
    const keysToRemove: string[] = []
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - 30) // 30일 이전 데이터 삭제

    // 로컬 스토리지 전체 스캔
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(STORAGE_PREFIX)) {
        try {
          const stored = localStorage.getItem(key)
          if (stored) {
            const data = JSON.parse(stored)
            const timestamp = new Date(data.timestamp)
            if (timestamp < cutoffDate) {
              keysToRemove.push(key)
            }
          }
        } catch {
          // 파싱 실패한 데이터도 삭제 대상
          keysToRemove.push(key)
        }
      }
    }

    // 오래된 키 삭제
    keysToRemove.forEach(key => {
      localStorage.removeItem(key)
    })

    console.info('[useTreePersistence] Cleaned up', keysToRemove.length, 'old entries')
  }

  // Debounce 적용 (300ms) - ISS-DR-003
  const debouncedSave = useDebounceFn((expandedNodes: Set<string>) => {
    saveExpandedState(expandedNodes)
  }, 300)

  // WbsStore의 expandedNodes 변경 감지
  watch(
    () => wbsStore.expandedNodes,
    (expandedNodes) => {
      if (autoSave.value) {
        debouncedSave(expandedNodes)  // debounce 적용
      }
    },
    { deep: true }
  )

  return {
    restoreExpandedState,
    saveExpandedState,
    clearExpandedState,
    autoSave
  }
}
