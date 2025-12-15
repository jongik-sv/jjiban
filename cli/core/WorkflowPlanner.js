/**
 * 워크플로우 계획 생성기
 * Task: TSK-07-01
 * 책임: 현재 상태 → 목표까지 단계 목록 생성 (SRP-001)
 */

import { getStepsToTarget, TARGET_MAPPING } from '../config/workflowSteps.js';
import { ValidationError } from '../errors/JjibanError.js';

/**
 * 워크플로우 실행 계획 생성
 */
export class WorkflowPlanner {
  /**
   * 실행 계획 생성
   * @param {Object} task - Task 정보
   * @param {string} task.id - Task ID
   * @param {string} task.category - 카테고리
   * @param {string} task.status - 현재 상태 코드
   * @param {Object} options - 실행 옵션
   * @param {string} [options.until='done'] - 목표 단계
   * @returns {Object} 실행 계획
   */
  createPlan(task, options = {}) {
    const target = options.until || 'done';

    // Target 유효성 검증
    if (!TARGET_MAPPING[target]) {
      throw new ValidationError(
        'until',
        `유효하지 않은 목표 단계: ${target}\n` +
        `가능한 값: ${Object.keys(TARGET_MAPPING).join(', ')}`
      );
    }

    // 이미 완료된 경우
    if (task.status === '[xx]') {
      return {
        taskId: task.id,
        category: task.category,
        currentStatus: task.status,
        targetStep: target,
        steps: [],
        isEmpty: true,
        reason: '이미 완료된 Task입니다'
      };
    }

    // 실행할 단계 목록 생성
    const steps = getStepsToTarget(task.category, task.status, target);

    // 실행할 단계가 없는 경우
    if (steps.length === 0) {
      return {
        taskId: task.id,
        category: task.category,
        currentStatus: task.status,
        targetStep: target,
        steps: [],
        isEmpty: true,
        reason: `현재 상태(${task.status})에서 목표(${target})까지 실행할 단계가 없습니다`
      };
    }

    return {
      taskId: task.id,
      category: task.category,
      currentStatus: task.status,
      targetStep: target,
      steps: steps.map((s, i) => ({
        index: i,
        step: s.step,
        command: `${s.command} ${task.id}`
      })),
      isEmpty: false,
      totalSteps: steps.length
    };
  }

  /**
   * 재개 계획 생성
   * @param {Object} savedState - 저장된 상태
   * @param {Object} task - 현재 Task 정보
   * @returns {Object} 재개 계획
   */
  createResumePlan(savedState, task) {
    const remainingSteps = savedState.steps.slice(savedState.currentStep);

    if (remainingSteps.length === 0) {
      return {
        taskId: task.id,
        category: task.category,
        currentStatus: task.status,
        targetStep: savedState.targetStep,
        steps: [],
        isEmpty: true,
        reason: '모든 단계가 이미 완료되었습니다',
        isResume: true,
        completedSteps: savedState.completedSteps
      };
    }

    // 남은 단계에 대한 명령어 생성
    const steps = remainingSteps.map((stepName, i) => {
      const command = this.getCommandForStep(task.category, stepName);
      return {
        index: savedState.currentStep + i,
        step: stepName,
        command: `${command} ${task.id}`
      };
    });

    return {
      taskId: task.id,
      category: task.category,
      currentStatus: task.status,
      targetStep: savedState.targetStep,
      steps,
      isEmpty: false,
      totalSteps: savedState.steps.length,
      isResume: true,
      completedSteps: savedState.completedSteps,
      resumeFromStep: savedState.currentStep
    };
  }

  /**
   * 단계 이름으로 명령어 가져오기
   * @param {string} category - 카테고리
   * @param {string} stepName - 단계 이름
   * @returns {string} 명령어
   */
  getCommandForStep(category, stepName) {
    const commandMap = {
      start: '/wf:start',
      draft: '/wf:draft',
      review: '/wf:review',
      apply: '/wf:apply',
      build: '/wf:build',
      test: '/wf:test',
      audit: '/wf:audit',
      patch: '/wf:patch',
      verify: '/wf:verify',
      done: '/wf:done',
      fix: '/wf:fix',
      skip: '/wf:skip'
    };

    return commandMap[stepName] || `/wf:${stepName}`;
  }
}
