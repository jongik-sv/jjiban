/**
 * 상태 관리자
 * Task: TSK-07-01
 * 책임: workflow-state.json 저장/로드
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { StateCorruptedError } from '../errors/JjibanError.js';

/**
 * 워크플로우 상태 관리
 */
export class StateManager {
  /**
   * @param {string} stateDir - 상태 파일 저장 디렉토리
   */
  constructor(stateDir) {
    this.stateDir = stateDir;
  }

  /**
   * 상태 파일 경로 생성
   * @param {string} taskId - Task ID
   * @returns {string} 상태 파일 경로
   */
  getStatePath(taskId) {
    return join(this.stateDir, `workflow-state-${taskId}.json`);
  }

  /**
   * 상태 저장
   * @param {Object} state - 저장할 상태
   * @returns {Promise<void>}
   */
  async save(state) {
    const path = this.getStatePath(state.taskId);

    // 디렉토리 생성
    await fs.mkdir(dirname(path), { recursive: true });

    // 상태 업데이트 시간 갱신
    state.updatedAt = new Date().toISOString();

    // 파일 쓰기 (권한 600)
    await fs.writeFile(path, JSON.stringify(state, null, 2), {
      mode: 0o600
    });
  }

  /**
   * 상태 로드
   * @param {string} taskId - Task ID
   * @returns {Promise<Object|null>} 상태 객체 또는 null
   */
  async load(taskId) {
    const path = this.getStatePath(taskId);

    try {
      const content = await fs.readFile(path, 'utf-8');
      const state = JSON.parse(content);

      // 기본 검증
      if (!state.taskId || state.taskId !== taskId) {
        throw new StateCorruptedError(path);
      }

      return state;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return null;
      }
      if (error instanceof SyntaxError) {
        throw new StateCorruptedError(path);
      }
      throw error;
    }
  }

  /**
   * 상태 존재 여부 확인
   * @param {string} taskId - Task ID
   * @returns {Promise<boolean>}
   */
  async exists(taskId) {
    const path = this.getStatePath(taskId);
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 상태 삭제
   * @param {string} taskId - Task ID
   * @returns {Promise<void>}
   */
  async clear(taskId) {
    const path = this.getStatePath(taskId);
    try {
      await fs.unlink(path);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  /**
   * 초기 상태 생성
   * @param {string} taskId - Task ID
   * @param {string} projectId - 프로젝트 ID
   * @param {string} category - 카테고리
   * @param {string} target - 목표 단계
   * @param {Array} steps - 실행할 단계 목록
   * @returns {Object} 초기 상태
   */
  createInitialState(taskId, projectId, category, target, steps) {
    return {
      taskId,
      projectId,
      category,
      currentStep: 0,
      targetStep: target,
      steps: steps.map(s => s.step),
      completedSteps: [],
      status: 'pending',
      startedAt: null,
      updatedAt: new Date().toISOString(),
      error: null
    };
  }

  /**
   * 단계 완료 기록
   * @param {Object} state - 현재 상태
   * @param {string} step - 완료된 단계
   * @param {Object} result - 실행 결과
   * @returns {Object} 업데이트된 상태
   */
  markStepCompleted(state, step, result) {
    const completedStep = {
      step,
      status: result.success ? 'success' : 'failed',
      startedAt: result.startedAt,
      finishedAt: result.finishedAt,
      duration: result.duration,
      exitCode: result.exitCode
    };

    state.completedSteps.push(completedStep);
    state.currentStep++;

    // 모든 단계 완료 시 status 업데이트
    if (state.currentStep >= state.steps.length) {
      state.status = 'completed';
    }

    return state;
  }

  /**
   * 실패 기록
   * @param {Object} state - 현재 상태
   * @param {string} errorMessage - 에러 메시지
   * @returns {Object} 업데이트된 상태
   */
  markFailed(state, errorMessage) {
    state.status = 'failed';
    state.error = errorMessage;
    return state;
  }
}
