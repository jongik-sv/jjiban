/**
 * 테마 설정 (TSK-05-02 M-02: 스타일 상수 추출)
 *
 * 워크플로우 및 UI 컴포넌트의 스타일 설정을 중앙 관리
 */

/**
 * 워크플로우 노드 스타일 테마
 * TaskWorkflow.vue에서 사용
 */
export const WORKFLOW_THEME = {
  /** 완료 상태 스타일 */
  completed: {
    backgroundColor: '#22c55e', // green-500
    color: '#ffffff',
    border: 'none'
  },
  /** 현재 상태 스타일 */
  current: {
    backgroundColor: '#3b82f6', // blue-500
    color: '#ffffff',
    fontWeight: 'bold',
    transform: 'scale(1.1)',
    boxShadow: '0 4px 6px rgba(59, 130, 246, 0.3)'
  },
  /** 미완료/대기 상태 스타일 */
  pending: {
    backgroundColor: '#e5e7eb', // gray-200
    color: '#6b7280', // gray-500
    border: '2px dashed #9ca3af' // gray-400
  }
} as const;

/**
 * 이력 항목 색상 테마 (TSK-05-02 M-03: 중복 제거)
 * TaskHistory.vue에서 사용
 */
export const HISTORY_THEME = {
  /** 상태 전이 - 파란색 */
  transition: {
    color: '#3b82f6', // blue-500
    icon: 'pi pi-arrow-right'
  },
  /** 액션 실행 - 보라색 */
  action: {
    color: '#8b5cf6', // purple-500
    icon: 'pi pi-bolt'
  },
  /** 업데이트 - 초록색 */
  update: {
    color: '#22c55e', // green-500
    icon: 'pi pi-pencil'
  },
  /** 기본값 - 회색 */
  default: {
    color: '#6b7280', // gray-500
    icon: 'pi pi-circle'
  }
} as const;

/**
 * 문서 타입별 색상 (documentConfig.ts와 일관성 유지)
 */
export const DOCUMENT_THEME = {
  design: '#3b82f6', // blue-500
  implementation: '#22c55e', // green-500
  test: '#f59e0b', // amber-500
  manual: '#8b5cf6', // purple-500
  analysis: '#ef4444', // red-500
  review: '#06b6d4' // cyan-500
} as const;

export type WorkflowThemeKey = keyof typeof WORKFLOW_THEME;
export type HistoryThemeKey = keyof typeof HISTORY_THEME;
export type DocumentThemeKey = keyof typeof DOCUMENT_THEME;
