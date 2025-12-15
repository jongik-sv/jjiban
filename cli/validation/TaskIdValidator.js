/**
 * Task ID 검증기
 * Task: TSK-07-01
 * 보안: SEC-001 (Task ID 인젝션 방지)
 */

import { ValidationError } from '../errors/JjibanError.js';

/**
 * Task ID 정규식 패턴
 * 3단계: TSK-XX-XX (예: TSK-01-01)
 * 4단계: TSK-XX-XX-XX (예: TSK-01-01-01)
 */
const TASK_ID_PATTERN = /^TSK-\d{2}(-\d{2}){1,2}$/;

/**
 * Task ID 유효성 검증
 * @param {string} taskId - 검증할 Task ID
 * @returns {string} 유효한 Task ID
 * @throws {ValidationError} 유효하지 않은 경우
 */
export function validateTaskId(taskId) {
  if (!taskId || typeof taskId !== 'string') {
    throw new ValidationError('taskId', 'Task ID는 필수입니다');
  }

  const trimmed = taskId.trim();

  if (!TASK_ID_PATTERN.test(trimmed)) {
    throw new ValidationError(
      'taskId',
      `유효하지 않은 Task ID 형식입니다: ${taskId}\n` +
      '형식: TSK-XX-XX 또는 TSK-XX-XX-XX (예: TSK-01-01, TSK-01-01-01)'
    );
  }

  return trimmed;
}

/**
 * Task ID 패턴 테스트 (예외 없이 boolean 반환)
 * @param {string} taskId - 검증할 Task ID
 * @returns {boolean} 유효 여부
 */
export function isValidTaskId(taskId) {
  if (!taskId || typeof taskId !== 'string') {
    return false;
  }
  return TASK_ID_PATTERN.test(taskId.trim());
}

/**
 * Task ID에서 구조 정보 추출
 * @param {string} taskId - Task ID
 * @returns {{ wp: string, act?: string, task: string } | null}
 */
export function parseTaskId(taskId) {
  if (!isValidTaskId(taskId)) {
    return null;
  }

  const parts = taskId.split('-');

  if (parts.length === 3) {
    // 3단계: TSK-01-01
    return {
      wp: `WP-${parts[1]}`,
      task: taskId
    };
  } else if (parts.length === 4) {
    // 4단계: TSK-01-01-01
    return {
      wp: `WP-${parts[1]}`,
      act: `ACT-${parts[1]}-${parts[2]}`,
      task: taskId
    };
  }

  return null;
}
