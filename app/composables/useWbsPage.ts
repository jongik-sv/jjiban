/**
 * WBS 페이지 로직
 * - 프로젝트 및 WBS 로딩
 * - 에러 핸들링
 * - Toast 메시지
 *
 * @task TSK-06-01
 */

import type { ToastMessageOptions } from 'primevue/toast'

/**
 * 에러 코드 → 사용자 친화적 메시지 변환
 */
export const ERROR_MESSAGES: Record<string, string> = {
  PROJECT_NOT_FOUND: '프로젝트를 찾을 수 없습니다.',
  WBS_NOT_FOUND: 'WBS 데이터가 없습니다.',
  FILE_READ_ERROR: '데이터를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.',
  PARSE_ERROR: '데이터 형식이 올바르지 않습니다.',
  NETWORK_ERROR: '네트워크 연결을 확인해주세요.',
  UNKNOWN_ERROR: '알 수 없는 오류가 발생했습니다.'
}

/**
 * FetchError 타입 정의 (Nuxt $fetch 에러)
 */
interface FetchError {
  statusCode: number
  message: string
}

/**
 * FetchError 타입 가드
 */
function isFetchError(error: unknown): error is FetchError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'statusCode' in error &&
    typeof (error as FetchError).statusCode === 'number'
  )
}

/**
 * 에러에서 에러 코드 추출
 */
function extractErrorCode(error: unknown): string {
  // FetchError 처리 (타입 가드 사용)
  if (isFetchError(error)) {
    if (error.statusCode === 404) return 'PROJECT_NOT_FOUND'
    if (error.statusCode >= 500) return 'FILE_READ_ERROR'
  }

  // 일반 Error 객체
  if (error instanceof Error) {
    const message = error.message.toUpperCase()
    if (message.includes('NETWORK') || message.includes('FETCH')) {
      return 'NETWORK_ERROR'
    }
    // 메시지에서 코드 추출 시도
    for (const code of Object.keys(ERROR_MESSAGES)) {
      if (message.includes(code)) return code
    }
  }

  return 'UNKNOWN_ERROR'
}

/**
 * useWbsPage composable
 */
export function useWbsPage() {
  const toast = useToast()
  const projectStore = useProjectStore()
  const wbsStore = useWbsStore()

  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * 프로젝트 및 WBS 순차 로딩
   * @returns true if successful, false if failed
   * @note 에러 발생 시 내부에서 Toast 표시 및 error 상태 설정
   */
  async function loadProjectAndWbs(projectId: string): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      // 1. 프로젝트 로드
      await projectStore.loadProject(projectId)

      // 2. WBS 로드
      await wbsStore.fetchWbs(projectId)

      return true
    } catch (e) {
      // 에러 핸들링 (Toast 표시 포함)
      const errorMessage = handleError(e)
      error.value = errorMessage
      return false // throw 대신 false 반환하여 중복 Toast 방지
    } finally {
      loading.value = false
    }
  }

  /**
   * 에러 핸들링 및 Toast 표시
   * @returns 사용자 친화적 에러 메시지
   */
  function handleError(e: unknown): string {
    const errorCode = extractErrorCode(e)
    const errorMessage = ERROR_MESSAGES[errorCode] || ERROR_MESSAGES.UNKNOWN_ERROR

    // Toast 에러 메시지 표시
    showToast('error', '오류', errorMessage)

    return errorMessage
  }

  /**
   * Toast 메시지 표시
   */
  function showToast(
    severity: 'success' | 'info' | 'warn' | 'error',
    summary: string,
    detail: string,
    life: number = 3000
  ) {
    toast.add({
      severity,
      summary,
      detail,
      life
    })
  }

  /**
   * 재시도 가능 여부 확인
   */
  function isRetryableError(errorCode: string): boolean {
    return ['FILE_READ_ERROR', 'NETWORK_ERROR', 'UNKNOWN_ERROR'].includes(errorCode)
  }

  return {
    loading,
    error,
    loadProjectAndWbs,
    handleError,
    showToast,
    isRetryableError
  }
}
