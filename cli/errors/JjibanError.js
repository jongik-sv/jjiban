/**
 * Jjiban CLI 기본 에러 클래스
 * Task: TSK-07-01
 */

export class JjibanError extends Error {
  /**
   * @param {string} code - 에러 코드
   * @param {string} message - 에러 메시지
   * @param {Object} [details] - 추가 정보
   */
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'JjibanError';
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class TaskNotFoundError extends JjibanError {
  /**
   * @param {string} taskId - 찾을 수 없는 Task ID
   */
  constructor(taskId) {
    super('TASK_NOT_FOUND', `Task를 찾을 수 없습니다: ${taskId}`, { taskId });
    this.name = 'TaskNotFoundError';
  }
}

export class ValidationError extends JjibanError {
  /**
   * @param {string} field - 유효성 검증 실패 필드
   * @param {string} message - 상세 메시지
   */
  constructor(field, message) {
    super('VALIDATION_ERROR', message, { field });
    this.name = 'ValidationError';
  }
}

export class ClaudeExecutionError extends JjibanError {
  /**
   * @param {string} message - 에러 메시지
   * @param {number} [exitCode] - 종료 코드
   * @param {string} [output] - 출력 내용
   */
  constructor(message, exitCode, output) {
    super('CLAUDE_EXEC_FAILED', message, { exitCode, output });
    this.name = 'ClaudeExecutionError';
  }
}

export class WbsNotFoundError extends JjibanError {
  /**
   * @param {string} projectId - 프로젝트 ID
   */
  constructor(projectId) {
    super('WBS_NOT_FOUND', `프로젝트 WBS를 찾을 수 없습니다: ${projectId}`, { projectId });
    this.name = 'WbsNotFoundError';
  }
}

export class LockError extends JjibanError {
  /**
   * @param {string} taskId - 잠긴 Task ID
   */
  constructor(taskId) {
    super('LOCK_ERROR', `Task가 이미 실행 중입니다: ${taskId}`, { taskId });
    this.name = 'LockError';
  }
}

export class StateCorruptedError extends JjibanError {
  /**
   * @param {string} path - 상태 파일 경로
   */
  constructor(path) {
    super('STATE_CORRUPTED', `상태 파일이 손상되었습니다: ${path}`, { path });
    this.name = 'StateCorruptedError';
  }
}

export class TimeoutError extends JjibanError {
  /**
   * @param {string} step - 타임아웃 발생 단계
   * @param {number} timeout - 타임아웃 시간 (ms)
   */
  constructor(step, timeout) {
    super('STEP_TIMEOUT', `단계 실행 시간 초과: ${step} (${Math.round(timeout / 60000)}분)`, { step, timeout });
    this.name = 'TimeoutError';
  }
}
