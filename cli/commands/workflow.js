/**
 * workflow 명령어 핸들러
 * Task: TSK-07-01
 */

import { resolve } from 'path';
import { validateTaskId } from '../validation/TaskIdValidator.js';
import { WbsReader } from '../core/WbsReader.js';
import { StateManager } from '../core/StateManager.js';
import { LockManager } from '../core/LockManager.js';
import { ClaudeExecutor } from '../core/ClaudeExecutor.js';
import { WorkflowPlanner } from '../core/WorkflowPlanner.js';
import { WorkflowRunner } from '../core/WorkflowRunner.js';
import { JjibanError } from '../errors/JjibanError.js';

/**
 * workflow 명령어 실행
 * @param {string} taskId - Task ID
 * @param {Object} options - commander 옵션
 */
export async function workflowCommand(taskId, options) {
  try {
    // Task ID 검증 (SEC-001)
    const validTaskId = validateTaskId(taskId);

    // 프로젝트 루트 결정
    const projectRoot = process.cwd();

    // 의존성 생성
    const wbsReader = new WbsReader(projectRoot);
    const stateDir = resolve(projectRoot, '.jjiban', 'workflow-state');
    const lockDir = resolve(projectRoot, '.jjiban', 'locks');

    const stateManager = new StateManager(stateDir);
    const lockManager = new LockManager(lockDir);
    const executor = new ClaudeExecutor({
      timeout: 30 * 60 * 1000, // 30분
      verbose: options.verbose
    });
    const planner = new WorkflowPlanner();

    // 워크플로우 러너 조립 (DIP-001)
    const runner = new WorkflowRunner({
      planner,
      executor,
      stateManager,
      lockManager,
      logger: console
    });

    // Signal 핸들러 설정 (Ctrl+C 등 정상 정리)
    setupSignalHandlers(stateManager, lockManager);

    // Task 정보 조회
    const projectId = options.project || null;
    const task = await wbsReader.getTask(validTaskId, projectId);

    // 워크플로우 실행
    const result = await runner.execute(task, {
      until: options.until || 'done',
      dryRun: options.dryRun || false,
      resume: options.resume || false
    });

    // 종료 코드 결정
    process.exitCode = result.success ? 0 : 1;

  } catch (error) {
    handleError(error);
  }
}

/**
 * 에러 핸들링
 * @param {Error} error - 에러 객체
 */
function handleError(error) {
  if (error instanceof JjibanError) {
    console.error(`\n[jjiban] Error: ${error.message}`);

    // 에러 코드별 종료 코드
    const exitCodes = {
      'TASK_NOT_FOUND': 2,
      'WBS_NOT_FOUND': 2,
      'VALIDATION_ERROR': 1,
      'CLAUDE_EXEC_FAILED': 3,
      'LOCK_ERROR': 1,
      'STATE_CORRUPTED': 1,
      'STEP_TIMEOUT': 3
    };

    process.exitCode = exitCodes[error.code] || 1;
  } else {
    console.error(`\n[jjiban] Unexpected error: ${error.message}`);
    if (process.env.DEBUG) {
      console.error(error.stack);
    }
    process.exitCode = 1;
  }
}

/**
 * SIGINT 핸들러 설정
 * @param {StateManager} stateManager - 상태 관리자
 * @param {LockManager} lockManager - 락 관리자
 */
export function setupSignalHandlers(stateManager, lockManager) {
  const cleanup = async () => {
    console.log('\n[jjiban] Interrupted. Cleaning up...');

    try {
      await lockManager.releaseAll();
      console.log('[jjiban] Locks released. Use --resume to continue.\n');
    } catch (error) {
      console.error('[jjiban] Cleanup error:', error.message);
    }

    process.exit(4);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}
