/**
 * 워크플로우 오케스트레이터
 * Task: TSK-07-01
 * 책임: 조율만 (Planner/Executor 위임) - SRP-001
 */

import { JjibanError } from '../errors/JjibanError.js';

/**
 * 워크플로우 실행 조율자
 * 의존성 주입으로 모든 컴포넌트 연결 (DIP-001)
 */
export class WorkflowRunner {
  /**
   * @param {Object} deps - 의존성 주입
   * @param {Object} deps.planner - IWorkflowPlanner
   * @param {Object} deps.executor - Claude 실행기
   * @param {Object} deps.stateManager - 상태 관리자
   * @param {Object} deps.lockManager - 락 관리자
   * @param {Object} deps.logger - 로거
   */
  constructor({ planner, executor, stateManager, lockManager, logger }) {
    this.planner = planner;
    this.executor = executor;
    this.stateManager = stateManager;
    this.lockManager = lockManager;
    this.logger = logger || console;
  }

  /**
   * 워크플로우 실행
   * @param {Object} task - Task 정보
   * @param {Object} options - 실행 옵션
   * @param {string} [options.until='done'] - 목표 단계
   * @param {boolean} [options.dryRun=false] - dry-run 모드
   * @param {boolean} [options.resume=false] - 재개 모드
   * @returns {Promise<Object>} 실행 결과
   */
  async execute(task, options = {}) {
    const { dryRun = false, resume = false } = options;

    // 락 획득
    if (!dryRun) {
      await this.lockManager.acquire(task.id);
    }

    try {
      // 계획 생성
      let plan;
      let state;

      if (resume) {
        // 재개 모드: 저장된 상태에서 계획 생성
        const savedState = await this.stateManager.load(task.id);
        if (!savedState) {
          throw new JjibanError(
            'STATE_NOT_FOUND',
            `저장된 상태가 없습니다. --resume 없이 다시 실행하세요.`
          );
        }
        plan = this.planner.createResumePlan(savedState, task);
        state = savedState;
      } else {
        // 새로 시작
        plan = this.planner.createPlan(task, options);
        state = this.stateManager.createInitialState(
          task.id,
          task.projectId,
          task.category,
          options.until || 'done',
          plan.steps
        );
      }

      // 실행할 단계가 없으면 종료
      if (plan.isEmpty) {
        this.logger.log(`\n[jjiban] ${plan.reason}\n`);
        return { success: true, plan, skipped: true };
      }

      // dry-run 모드
      if (dryRun) {
        this.printDryRunPlan(plan, task);
        return { success: true, plan, dryRun: true };
      }

      // 실행 시작
      this.printHeader(task, plan);
      state.status = 'running';
      state.startedAt = new Date().toISOString();
      await this.stateManager.save(state);

      // 단계별 실행
      const results = [];
      for (const step of plan.steps) {
        const result = await this.executeStep(step, plan.totalSteps, state);
        results.push(result);

        // 실패 시 중단
        if (!result.success) {
          state = this.stateManager.markFailed(state, result.error);
          await this.stateManager.save(state);

          this.printFailure(step, result);
          return { success: false, plan, results, failedAt: step.step };
        }

        // 상태 업데이트
        state = this.stateManager.markStepCompleted(state, step.step, result);
        await this.stateManager.save(state);
      }

      // 완료
      this.printSuccess(results);

      // 상태 파일 정리 (완료 시)
      await this.stateManager.clear(task.id);

      return { success: true, plan, results };

    } finally {
      // 락 해제
      if (!dryRun) {
        await this.lockManager.release(task.id);
      }
    }
  }

  /**
   * 단일 단계 실행
   * @param {Object} step - 단계 정보
   * @param {number} totalSteps - 전체 단계 수
   * @param {Object} state - 현재 상태
   * @returns {Promise<Object>} 실행 결과
   */
  async executeStep(step, totalSteps, state) {
    const stepNum = step.index + 1;
    this.logger.log(`\n[${stepNum}/${totalSteps}] ${step.step}: Running ${step.command}`);

    try {
      const result = await this.executor.run(step.command);

      this.logger.log(`      ✓ Completed (${this.formatDuration(result.duration)})`);

      return {
        success: true,
        ...result
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        exitCode: error.details?.exitCode,
        startedAt: new Date().toISOString(),
        finishedAt: new Date().toISOString(),
        duration: 0
      };
    }
  }

  /**
   * dry-run 계획 출력
   * @param {Object} plan - 실행 계획
   * @param {Object} task - Task 정보
   */
  printDryRunPlan(plan, task) {
    this.logger.log('\n[jjiban] Workflow Plan (dry-run)\n');
    this.logger.log(`Task: ${task.id}`);
    this.logger.log(`Category: ${task.category}`);
    this.logger.log(`Current Status: ${plan.currentStatus}`);
    this.logger.log(`Target: ${plan.targetStep}`);
    this.logger.log('\nExecution Plan:');

    for (const step of plan.steps) {
      this.logger.log(`  ${step.index + 1}. ${step.step.padEnd(8)} → ${step.command}`);
    }

    this.logger.log('\nNo changes were made.\n');
  }

  /**
   * 실행 시작 헤더 출력
   * @param {Object} task - Task 정보
   * @param {Object} plan - 실행 계획
   */
  printHeader(task, plan) {
    this.logger.log(`\n[jjiban] Workflow started for ${task.id}`);
    this.logger.log(`[jjiban] Category: ${task.category}`);
    this.logger.log(`[jjiban] Target: ${plan.targetStep}`);

    if (plan.isResume) {
      this.logger.log(`[jjiban] Resuming from step ${plan.resumeFromStep + 1}`);
    }
  }

  /**
   * 실패 메시지 출력
   * @param {Object} step - 실패한 단계
   * @param {Object} result - 실행 결과
   */
  printFailure(step, result) {
    this.logger.log(`      ✗ Failed: ${result.error}`);
    this.logger.log('\n[jjiban] Workflow failed!');
    this.logger.log(`[jjiban] Use --resume to continue from step "${step.step}"\n`);
  }

  /**
   * 성공 메시지 출력
   * @param {Array} results - 실행 결과 배열
   */
  printSuccess(results) {
    const totalDuration = results.reduce((sum, r) => sum + (r.duration || 0), 0);

    this.logger.log('\n[jjiban] Workflow completed successfully!');
    this.logger.log(`[jjiban] Total time: ${this.formatDuration(totalDuration)}\n`);
  }

  /**
   * 시간 포맷팅
   * @param {number} seconds - 초
   * @returns {string} 포맷된 시간
   */
  formatDuration(seconds) {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  }
}
