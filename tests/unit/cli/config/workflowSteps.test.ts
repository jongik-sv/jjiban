/**
 * 워크플로우 단계 설정 테스트 (설정 파일 기반)
 * Task: TSK-07-01
 */

import { describe, it, expect } from 'vitest';
import {
  WORKFLOW_STEPS,
  TARGET_MAPPING,
  getStartStepIndex,
  getStepsToTarget,
  getCommandForStep
} from '../../../../cli/config/workflowSteps.js';

describe('workflowSteps', () => {
  describe('WORKFLOW_STEPS', () => {
    it('development 카테고리의 모든 단계를 포함한다', () => {
      expect(WORKFLOW_STEPS.development).toBeDefined();
      expect(WORKFLOW_STEPS.development.length).toBeGreaterThan(0);

      const stepNames = WORKFLOW_STEPS.development.map(s => s.step);
      // 주요 전환 단계 확인
      expect(stepNames).toContain('start');
      expect(stepNames).toContain('draft');
      expect(stepNames).toContain('approve');
      expect(stepNames).toContain('build');
      expect(stepNames).toContain('verify');
      expect(stepNames).toContain('done');
      // 액션 확인
      expect(stepNames).toContain('review');
      expect(stepNames).toContain('apply');
      expect(stepNames).toContain('test');
      expect(stepNames).toContain('audit');
      expect(stepNames).toContain('patch');
    });

    it('defect 카테고리의 모든 단계를 포함한다', () => {
      expect(WORKFLOW_STEPS.defect).toBeDefined();
      expect(WORKFLOW_STEPS.defect.length).toBeGreaterThan(0);

      const stepNames = WORKFLOW_STEPS.defect.map(s => s.step);
      // 주요 전환 단계 확인
      expect(stepNames).toContain('start');
      expect(stepNames).toContain('fix');
      expect(stepNames).toContain('verify');
      expect(stepNames).toContain('done');
      // 액션 확인
      expect(stepNames).toContain('test');
      expect(stepNames).toContain('audit');
      expect(stepNames).toContain('patch');
    });

    it('infrastructure 카테고리의 모든 단계를 포함한다', () => {
      expect(WORKFLOW_STEPS.infrastructure).toBeDefined();
      expect(WORKFLOW_STEPS.infrastructure.length).toBeGreaterThan(0);

      const stepNames = WORKFLOW_STEPS.infrastructure.map(s => s.step);
      // 주요 전환 단계 확인
      expect(stepNames).toContain('start');
      expect(stepNames).toContain('skip');
      expect(stepNames).toContain('build');
      expect(stepNames).toContain('done');
      // 액션 확인
      expect(stepNames).toContain('test');
      expect(stepNames).toContain('audit');
      expect(stepNames).toContain('patch');
    });
  });

  describe('TARGET_MAPPING', () => {
    it('모든 target을 정의한다', () => {
      const targets = Object.keys(TARGET_MAPPING);
      // 설정 파일의 상태 ID 기반으로 확인
      expect(targets).toContain('basic-design');
      expect(targets).toContain('detail-design');
      expect(targets).toContain('approve');
      expect(targets).toContain('implement');
      expect(targets).toContain('verify');
      expect(targets).toContain('done');
    });

    it('done target은 전체 실행 (null)을 의미한다', () => {
      expect(TARGET_MAPPING.done.targetSteps).toBeNull();
      expect(TARGET_MAPPING.done.targetStatus).toBe('[xx]');
    });

    it('각 target은 올바른 상태 코드를 가진다', () => {
      expect(TARGET_MAPPING['basic-design'].targetStatus).toBe('[bd]');
      expect(TARGET_MAPPING['detail-design'].targetStatus).toBe('[dd]');
      expect(TARGET_MAPPING['approve'].targetStatus).toBe('[ap]');
      expect(TARGET_MAPPING['implement'].targetStatus).toBe('[im]');
      expect(TARGET_MAPPING['verify'].targetStatus).toBe('[vf]');
    });
  });

  describe('getStartStepIndex', () => {
    it('Todo 상태 [ ]에서 0을 반환한다', () => {
      expect(getStartStepIndex('development', '[ ]')).toBe(0);
      expect(getStartStepIndex('defect', '[ ]')).toBe(0);
      expect(getStartStepIndex('infrastructure', '[ ]')).toBe(0);
    });

    it('완료 상태 [xx]에서 -1을 반환한다', () => {
      expect(getStartStepIndex('development', '[xx]')).toBe(-1);
      expect(getStartStepIndex('defect', '[xx]')).toBe(-1);
    });

    it('중간 상태에서 올바른 인덱스를 반환한다', () => {
      // [bd] 기본설계 완료 → draft부터 (설정 기반)
      const bdIndex = getStartStepIndex('development', '[bd]');
      expect(bdIndex).toBeGreaterThanOrEqual(0);
      expect(WORKFLOW_STEPS.development[bdIndex].step).toBe('draft');

      // [dd] 상세설계 완료 → approve부터 (v2.0 스키마 기준)
      const ddIndex = getStartStepIndex('development', '[dd]');
      expect(ddIndex).toBeGreaterThanOrEqual(0);

      // [im] 구현 완료 → verify부터
      const imIndex = getStartStepIndex('development', '[im]');
      expect(imIndex).toBeGreaterThanOrEqual(0);
    });

    it('존재하지 않는 카테고리에서 -1을 반환한다', () => {
      expect(getStartStepIndex('unknown' as any, '[ ]')).toBe(-1);
    });
  });

  describe('getStepsToTarget', () => {
    it('Todo에서 done까지 전체 단계를 반환한다', () => {
      const steps = getStepsToTarget('development', '[ ]', 'done');
      expect(steps.length).toBeGreaterThan(0);
      expect(steps[0].step).toBe('start');

      // 'done' 단계가 포함되어 있는지 확인 (마지막이 아닐 수 있음 - 액션 포함 시)
      const stepNames = steps.map(s => s.step);
      expect(stepNames).toContain('done');
    });

    it('Todo에서 basic-design까지 start만 반환한다', () => {
      const steps = getStepsToTarget('development', '[ ]', 'basic-design');
      expect(steps.length).toBeGreaterThanOrEqual(1);
      expect(steps[0].step).toBe('start');
    });

    it('Todo에서 implement까지 적절한 단계를 반환한다', () => {
      const steps = getStepsToTarget('development', '[ ]', 'implement');
      const stepNames = steps.map(s => s.step);

      expect(stepNames).toContain('start');
      expect(stepNames).toContain('draft');
      expect(stepNames).toContain('approve');
      expect(stepNames).toContain('build');
      expect(stepNames).not.toContain('verify');
      expect(stepNames).not.toContain('done');
    });

    it('[bd] 상태에서 done까지 draft부터 시작한다', () => {
      const steps = getStepsToTarget('development', '[bd]', 'done');
      expect(steps[0].step).toBe('draft');
      expect(steps).not.toContainEqual(expect.objectContaining({ step: 'start' }));
    });

    it('완료 상태에서 빈 배열을 반환한다', () => {
      const steps = getStepsToTarget('development', '[xx]', 'done');
      expect(steps).toEqual([]);
    });

    it('명령어가 올바르게 포함된다', () => {
      const steps = getStepsToTarget('development', '[ ]', 'basic-design');
      expect(steps[0].command).toBe('/wf:start');
    });
  });

  describe('getCommandForStep', () => {
    it('단계에 해당하는 명령어를 반환한다', () => {
      expect(getCommandForStep('development', 'start')).toBe('/wf:start');
      expect(getCommandForStep('development', 'build')).toBe('/wf:build');
      expect(getCommandForStep('defect', 'fix')).toBe('/wf:fix');
    });

    it('존재하지 않는 단계에 null을 반환한다', () => {
      expect(getCommandForStep('development', 'unknown')).toBeNull();
    });

    it('존재하지 않는 카테고리에 null을 반환한다', () => {
      expect(getCommandForStep('unknown' as any, 'start')).toBeNull();
    });
  });
});
