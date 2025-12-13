/**
 * 날짜 포맷팅 (YYYY-MM-DD)
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

/**
 * 날짜/시간 포맷팅 (YYYY-MM-DD HH:mm)
 */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const dateStr = d.toISOString().split('T')[0];
  const timeStr = d.toTimeString().slice(0, 5);
  return `${dateStr} ${timeStr}`;
}

/**
 * 상대 시간 표시
 */
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}일 전`;
  if (hours > 0) return `${hours}시간 전`;
  if (minutes > 0) return `${minutes}분 전`;
  return '방금 전';
}

/**
 * Task ID 파싱
 */
export function parseTaskId(taskId: string): {
  wp: string;
  act?: string;
  task: string;
  level: 3 | 4;
} | null {
  const match4 = taskId.match(/^TSK-(\d{2})-(\d{2})-(\d{2})$/);
  if (match4) {
    return {
      wp: `WP-${match4[1]}`,
      act: `ACT-${match4[1]}-${match4[2]}`,
      task: taskId,
      level: 4,
    };
  }

  const match3 = taskId.match(/^TSK-(\d{2})-(\d{2})$/);
  if (match3) {
    return {
      wp: `WP-${match3[1]}`,
      task: taskId,
      level: 3,
    };
  }

  return null;
}

/**
 * 상태 코드에서 상태명 추출
 */
export function getStatusName(status: string): string {
  const statusMap: Record<string, string> = {
    '[ ]': 'Todo',
    '[bd]': '기본설계',
    '[dd]': '상세설계',
    '[an]': '분석',
    '[ds]': '설계',
    '[im]': '구현',
    '[fx]': '수정',
    '[vf]': '검증',
    '[xx]': '완료',
  };
  return statusMap[status] ?? status;
}

/**
 * 상태 코드에서 칸반 컬럼 추출
 */
export function getKanbanColumn(status: string): string {
  const columnMap: Record<string, string> = {
    '[ ]': 'Todo',
    '[bd]': 'Design',
    '[dd]': 'Detail',
    '[an]': 'Detail',
    '[ds]': 'Detail',
    '[im]': 'Implement',
    '[fx]': 'Implement',
    '[vf]': 'Verify',
    '[xx]': 'Done',
  };
  return columnMap[status] ?? 'Todo';
}

/**
 * 우선순위 레이블 반환
 */
export function getPriorityLabel(priority: string): string {
  const labelMap: Record<string, string> = {
    critical: '긴급',
    high: '높음',
    medium: '보통',
    low: '낮음',
  };
  return labelMap[priority] ?? priority;
}

/**
 * 카테고리 레이블 반환
 */
export function getCategoryLabel(category: string): string {
  const labelMap: Record<string, string> = {
    development: '개발',
    defect: '결함',
    infrastructure: '인프라',
  };
  return labelMap[category] ?? category;
}
