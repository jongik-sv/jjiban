/**
 * useWbsPage composable 단위 테스트
 * @task TSK-06-01
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useWbsPage, ERROR_MESSAGES } from '~/composables/useWbsPage'

// Get mock toast function from global setup
const mockToastAdd = (globalThis.useToast as any)().add

describe('useWbsPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('TC-005: 에러 메시지 한글 변환', () => {
    it('PROJECT_NOT_FOUND 에러 코드를 한글 메시지로 변환', () => {
      const { handleError } = useWbsPage()

      const error = {
        statusCode: 404,
        message: 'PROJECT_NOT_FOUND'
      }

      const result = handleError(error)

      expect(result).toBe('프로젝트를 찾을 수 없습니다.')
      expect(mockToastAdd).toHaveBeenCalledWith({
        severity: 'error',
        summary: '오류',
        detail: '프로젝트를 찾을 수 없습니다.',
        life: 3000
      })
    })

    it('WBS_NOT_FOUND 에러 코드를 한글 메시지로 변환', () => {
      const { handleError } = useWbsPage()

      const error = new Error('WBS_NOT_FOUND')
      const result = handleError(error)

      expect(result).toBe('WBS 데이터가 없습니다.')
    })

    it('FILE_READ_ERROR 에러 코드를 한글 메시지로 변환', () => {
      const { handleError } = useWbsPage()

      const error = {
        statusCode: 500,
        message: 'Internal Server Error'
      }

      const result = handleError(error)

      expect(result).toBe('데이터를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.')
    })

    it('NETWORK_ERROR 에러 코드를 한글 메시지로 변환', () => {
      const { handleError } = useWbsPage()

      const error = new Error('Network fetch failed')
      const result = handleError(error)

      expect(result).toBe('네트워크 연결을 확인해주세요.')
    })

    it('알 수 없는 에러는 기본 메시지로 변환', () => {
      const { handleError } = useWbsPage()

      const error = new Error('Unknown error')
      const result = handleError(error)

      expect(result).toBe('알 수 없는 오류가 발생했습니다.')
    })
  })

  describe('loadProjectAndWbs', () => {
    it('프로젝트와 WBS를 순차적으로 로드', async () => {
      const mockLoadProject = vi.fn().mockResolvedValue(undefined)
      const mockFetchWbs = vi.fn().mockResolvedValue(undefined)

      // Override global mock
      ;(globalThis.useProjectStore as any).mockReturnValue({
        loadProject: mockLoadProject,
        currentProject: { id: 'test-project', name: 'Test' },
        clearProject: vi.fn()
      })

      ;(globalThis.useWbsStore as any).mockReturnValue({
        fetchWbs: mockFetchWbs,
        clearWbs: vi.fn(),
        tree: [],
        loading: false
      })

      const { loadProjectAndWbs, loading } = useWbsPage()

      expect(loading.value).toBe(false)

      const promise = loadProjectAndWbs('test-project')

      expect(loading.value).toBe(true)

      await promise

      expect(loading.value).toBe(false)
      expect(mockLoadProject).toHaveBeenCalledWith('test-project')
      expect(mockFetchWbs).toHaveBeenCalledWith('test-project')
      // 순서 검증: loadProject가 먼저 호출되어야 함
      expect(mockLoadProject.mock.invocationCallOrder[0])
        .toBeLessThan(mockFetchWbs.mock.invocationCallOrder[0])
    })

    it('프로젝트 로드 실패 시 WBS 로딩 중단', async () => {
      const mockLoadProject = vi.fn().mockRejectedValue(new Error('PROJECT_NOT_FOUND'))
      const mockFetchWbs = vi.fn()

      ;(globalThis.useProjectStore as any).mockReturnValue({
        loadProject: mockLoadProject,
        currentProject: null,
        clearProject: vi.fn()
      })

      ;(globalThis.useWbsStore as any).mockReturnValue({
        fetchWbs: mockFetchWbs,
        clearWbs: vi.fn(),
        tree: [],
        loading: false
      })

      const { loadProjectAndWbs, error } = useWbsPage()

      // P0-02 수정: throw 대신 false 반환
      const result = await loadProjectAndWbs('test-project')
      expect(result).toBe(false)

      expect(mockLoadProject).toHaveBeenCalled()
      expect(mockFetchWbs).not.toHaveBeenCalled()
      // PROJECT_NOT_FOUND 에러 발생 시 해당 에러 메시지가 반환됨
      expect(error.value).toBe('프로젝트를 찾을 수 없습니다.')
      expect(mockToastAdd).toHaveBeenCalled()
    })

    it('WBS 로드 실패 시 에러 처리', async () => {
      const mockLoadProject = vi.fn().mockResolvedValue(undefined)
      const mockFetchWbs = vi.fn().mockRejectedValue({
        statusCode: 500,
        message: 'FILE_READ_ERROR'
      })

      ;(globalThis.useProjectStore as any).mockReturnValue({
        loadProject: mockLoadProject,
        currentProject: { id: 'test-project' },
        clearProject: vi.fn()
      })

      ;(globalThis.useWbsStore as any).mockReturnValue({
        fetchWbs: mockFetchWbs,
        clearWbs: vi.fn(),
        tree: [],
        loading: false
      })

      const { loadProjectAndWbs, error } = useWbsPage()

      // P0-02 수정: throw 대신 false 반환
      const result = await loadProjectAndWbs('test-project')
      expect(result).toBe(false)

      expect(error.value).toBe('데이터를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.')
    })
  })

  describe('showToast', () => {
    it('Toast 메시지를 올바르게 표시', () => {
      const { showToast } = useWbsPage()

      showToast('success', '성공', '작업이 완료되었습니다.', 5000)

      expect(mockToastAdd).toHaveBeenCalledWith({
        severity: 'success',
        summary: '성공',
        detail: '작업이 완료되었습니다.',
        life: 5000
      })
    })

    it('기본 life 값은 3000ms', () => {
      const { showToast } = useWbsPage()

      showToast('info', '알림', '정보 메시지')

      expect(mockToastAdd).toHaveBeenCalledWith({
        severity: 'info',
        summary: '알림',
        detail: '정보 메시지',
        life: 3000
      })
    })
  })

  describe('isRetryableError', () => {
    it('재시도 가능한 에러 코드 확인', () => {
      const { isRetryableError } = useWbsPage()

      expect(isRetryableError('FILE_READ_ERROR')).toBe(true)
      expect(isRetryableError('NETWORK_ERROR')).toBe(true)
      expect(isRetryableError('UNKNOWN_ERROR')).toBe(true)
    })

    it('재시도 불가능한 에러 코드 확인', () => {
      const { isRetryableError } = useWbsPage()

      expect(isRetryableError('PROJECT_NOT_FOUND')).toBe(false)
      expect(isRetryableError('WBS_NOT_FOUND')).toBe(false)
      expect(isRetryableError('PARSE_ERROR')).toBe(false)
    })
  })
})
