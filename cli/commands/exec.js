/**
 * exec 명령어 - 워크플로우 실행 상태 등록/해제
 *
 * Usage:
 *   jjiban exec start <taskId> <command> [--session <id>] [--pid <pid>]
 *   jjiban exec stop <taskId>
 *
 * @see TSK-03-03: 워크플로우 명령어 훅
 * @see PRD 9.6, 9.7
 */

// 상수 정의 (ISS-002 반영)
const DEFAULT_API_TIMEOUT = 5000;
const API_TIMEOUT = parseInt(process.env.JJIBAN_API_TIMEOUT) || DEFAULT_API_TIMEOUT;
const API_BASE_URL = process.env.JJIBAN_API_URL || 'http://localhost:3000';

// taskId 형식 검증 정규식 (ISS-001 반영)
const TASK_ID_REGEX = /^TSK-\d{2}-\d{2}(-\d{2})?$/;

/**
 * taskId 형식 검증
 * @param {string} taskId - Task ID
 * @returns {boolean} 유효 여부
 */
function validateTaskId(taskId) {
  if (!TASK_ID_REGEX.test(taskId)) {
    console.warn(`[exec] 경고: 잘못된 taskId 형식: ${taskId}`);
    return false;
  }
  return true;
}

/**
 * 환경변수/옵션에서 값 추출 (우선순위: CLI 옵션 > 환경변수)
 * @param {string} optionValue - CLI 옵션 값
 * @param {string} envKey - 환경변수 키
 * @returns {string|null} 값 또는 null
 */
function getValueWithFallback(optionValue, envKey) {
  if (optionValue) return optionValue;
  if (process.env[envKey]) return process.env[envKey];
  return null;
}

/**
 * API 호출 with 타임아웃
 * @param {string} endpoint - API 엔드포인트
 * @param {object} body - 요청 본문
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
async function callApi(endpoint, body) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const text = await response.text();
      return { success: false, error: `HTTP ${response.status}: ${text}` };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      return { success: false, error: '타임아웃' };
    }

    return { success: false, error: error.message };
  }
}

/**
 * exec start 서브커맨드 핸들러
 * @param {string} taskId - Task ID
 * @param {string} command - 워크플로우 명령어명
 * @param {object} options - CLI 옵션
 */
async function execStart(taskId, command, options) {
  // 1. taskId 형식 검증
  if (!validateTaskId(taskId)) {
    return; // 경고만 출력하고 종료 (워크플로우 계속)
  }

  // 2. sessionId 추출
  const sessionId = getValueWithFallback(options.session, 'JJIBAN_SESSION_ID');
  if (!sessionId) {
    console.warn('[exec] 경고: sessionId가 없습니다 (--session 또는 $JJIBAN_SESSION_ID)');
  }

  // 3. pid 추출
  const pidStr = getValueWithFallback(options.pid, 'JJIBAN_TERMINAL_PID');
  const pid = pidStr ? parseInt(pidStr, 10) : null;
  if (!pid) {
    console.warn('[exec] 경고: pid가 없습니다 (--pid 또는 $JJIBAN_TERMINAL_PID)');
  }

  // 4-5. API 호출
  const result = await callApi('/api/execution/start', {
    taskId,
    command,
    sessionId,
    pid
  });

  // 6. 결과 출력
  if (result.success) {
    console.log(`[exec] 실행 등록: ${taskId} (${command})`);
  } else {
    console.warn(`[exec] 경고: API 호출 실패 - ${result.error}`);
    // 워크플로우는 계속 진행
  }
}

/**
 * exec stop 서브커맨드 핸들러
 * @param {string} taskId - Task ID
 */
async function execStop(taskId) {
  // taskId 형식 검증 (stop에서도 검증)
  if (!validateTaskId(taskId)) {
    return;
  }

  // API 호출
  const result = await callApi('/api/execution/stop', { taskId });

  // 결과 출력
  if (result.success) {
    console.log(`[exec] 실행 해제: ${taskId}`);
  } else {
    console.warn(`[exec] 경고: API 호출 실패 - ${result.error}`);
    // 워크플로우는 계속 진행
  }
}

/**
 * Commander 프로그램에 exec 명령어 등록
 * @param {import('commander').Command} program - Commander 프로그램 인스턴스
 */
export function register(program) {
  const execCmd = program
    .command('exec')
    .description('워크플로우 실행 상태 관리');

  // exec start 서브커맨드
  execCmd
    .command('start <taskId> <command>')
    .description('워크플로우 실행 시작 등록')
    .option('-s, --session <id>', '터미널 세션 ID')
    .option('-p, --pid <pid>', '터미널 프로세스 PID')
    .action(execStart);

  // exec stop 서브커맨드
  execCmd
    .command('stop <taskId>')
    .description('워크플로우 실행 종료 등록')
    .action(execStop);
}

export default { register };
