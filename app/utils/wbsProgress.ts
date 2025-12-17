/**
 * WBS 진행률 계산 유틸리티 함수 (TSK-05-05)
 * WP/ACT 노드의 하위 Task 통계를 재귀적으로 계산
 */

import type { WbsNode, ProgressStats } from '~/types'

/**
 * WP/ACT 노드의 하위 Task 진행률 통계 계산
 * 재귀적으로 모든 하위 Task를 수집하여 상태별 카운트 집계
 *
 * @param node - WP 또는 ACT 노드
 * @returns 진행률 통계 객체
 *
 * @example
 * const stats = calculateProgressStats(wpNode)
 * console.log(stats.total)       // 10
 * console.log(stats.completed)   // 5
 * console.log(stats.byStatus)    // { '[ ]': 2, '[bd]': 1, '[xx]': 5 }
 */
export function calculateProgressStats(node: WbsNode): ProgressStats {
  const allTasks: WbsNode[] = []

  /**
   * 재귀적으로 모든 Task 수집
   * - Task 타입이면 배열에 추가
   * - WP/ACT 타입이면 children 재귀 탐색
   */
  function collectTasks(n: WbsNode): void {
    // null/undefined 방어
    if (!n) return

    if (n.type === 'task') {
      allTasks.push(n)
      return  // Early return (자식 탐색 불필요)
    }

    // children 유효성 검증
    if (n.children && Array.isArray(n.children) && n.children.length > 0) {
      n.children.forEach(collectTasks)
    }
  }

  // 재귀 탐색 시작
  collectTasks(node)

  // 초기화
  const byStatus: Record<string, number> = {}
  let completed = 0
  let inProgress = 0
  let todo = 0

  // H-02: 상태 카테고리 매핑 (확장 용이)
  // 새로운 워크플로우 상태 추가 시 이 매핑만 수정하면 됨
  const STATUS_CATEGORY: Record<string, 'completed' | 'inProgress' | 'todo'> = {
    '[xx]': 'completed',  // 완료
    '[ ]': 'todo',        // 대기
    // 나머지 상태([bd], [dd], [im], [vf], [an], [fx], [ds])는 inProgress로 분류
  }

  // Task별 상태 카운팅
  allTasks.forEach(task => {
    const status = task.status || '[ ]'
    byStatus[status] = (byStatus[status] || 0) + 1

    // 카테고리 분류 (확장 가능한 구조)
    const category = STATUS_CATEGORY[status] || 'inProgress'
    if (category === 'completed') {
      completed++
    } else if (category === 'todo') {
      todo++
    } else {
      inProgress++
    }
  })

  return {
    total: allTasks.length,
    completed,
    inProgress,
    todo,
    byStatus
  }
}

/**
 * Task 상태 코드에 따른 PrimeVue Badge severity 반환
 * WpActProgress, WpActChildren에서 공통 사용
 *
 * @param status - Task 상태 코드 ('[ ]', '[bd]', '[dd]', '[im]', '[vf]', '[xx]', 등)
 * @returns PrimeVue Badge severity ('secondary' | 'info' | 'warning' | 'success')
 *
 * @example
 * const severity = getStatusSeverity('[xx]')  // 'success'
 * const severity = getStatusSeverity('[bd]')  // 'info'
 */
export function getStatusSeverity(status: string): string {
  const severityMap: Record<string, string> = {
    '[ ]': 'secondary',   // 회색 - 대기
    '[bd]': 'info',       // 파란색 - 기본설계
    '[dd]': 'info',       // 파란색 - 상세설계
    '[an]': 'warning',    // 주황색 - 분석 (defect)
    '[ds]': 'info',       // 파란색 - 설계 (infrastructure)
    '[im]': 'warning',    // 주황색 - 구현
    '[fx]': 'warning',    // 주황색 - 수정 (defect)
    '[vf]': 'success',    // 초록색 - 검증
    '[xx]': 'success',    // 초록색 - 완료
  }
  return severityMap[status] || 'secondary'
}

/**
 * Task 상태 코드에 따른 한국어 레이블 반환
 *
 * @param status - Task 상태 코드 ('[ ]', '[bd]', '[dd]', '[im]', '[vf]', '[xx]', 등)
 * @returns 한국어 레이블
 *
 * @example
 * const label = getStatusLabel('[xx]')  // '완료'
 * const label = getStatusLabel('[bd]')  // '기본설계'
 */
export function getStatusLabel(status: string): string {
  const labelMap: Record<string, string> = {
    '[ ]': '대기',
    '[bd]': '기본설계',
    '[dd]': '상세설계',
    '[an]': '분석',
    '[ds]': '설계',
    '[im]': '구현',
    '[fx]': '수정',
    '[vf]': '검증',
    '[xx]': '완료',
  }
  return labelMap[status] || status
}
