/**
 * 워크플로우 단계 설정 테스트
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
      expect(WORKFLOW_STEPS.development.length).toBe(10);

      const stepNames = WORKFLOW_STEPS.development.map(s => s.step);
      expect(stepNames).toEqual([
        'start', 'draft', 'review', 'apply', 'build',
        'test', 'audit', 'patch', 'verify', 'done'
      ]);
    });

    it('defect 카테고리의 모든 단계를 포함한다', () => {
      expect(WORKFLOW_STEPS.defect).toBeDefined();
      expect(WORKFLOW_STEPS.defect.length).toBe(7);

      const stepNames = WORKFLOW_STEPS.defect.map(s => s.step);
      expect(stepNames).toEqual([
        'start', 'fix', 'test', 'audit', 'patch', 'verify', 'done'
      ]);
    });

    it('infrastructure 카테고리의 모든 단계를 포함한다', () => {
      expect(WORKFLOW_STEPS.infrastructure).toBeDefined();
      expect(WORKFLOW_STEPS.infrastructure.length).toBe(5);

      const stepNames = WORKFLOW_STEPS.infrastructure.map(s => s.step);
      expect(stepNames).toEqual([
        'start', 'build', 'audit', 'patch', 'done'
      ]);
    });
  });

  describe('TARGET_MAPPING', () => {
    it('모든 target을 정의한다', () => {
      const targets = Object.keys(TARGET_MAPPING);
      expect(targets).toContain('basic-design');
      expect(targets).toContain('detail-design');
      expect(targets).toContain('build');
      expect(targets).toContain('done');
    });

    it('done target은 전체 실행 (null)을 의미한다', () => {
      expect(TARGET_MAPPING.done.targetSteps).toBeNull();
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
      // [bd] 기본설계 완료 → draft부터
      expect(getStartStepIndex('development', '[bd]')).toBe(1);

      // [dd] 상세설계 완료 → review부터
      expect(getStartStepIndex('development', '[dd]')).toBe(2);

      // [im] 구현 완료 → test부터
      expect(getStartStepIndex('development', '[im]')).toBe(5);
    });

    it('존재하지 않는 카테고리에서 -1을 반환한다', () => {
      expect(getStartStepIndex('unknown' as any, '[ ]')).toBe(-1);
    });
  });

  describe('getStepsToTarget', () => {
    it('Todo에서 done까지 전체 단계를 반환한다', () => {
      const steps = getStepsToTarget('development', '[ ]', 'done');
      expect(steps.length).toBe(10);
      expect(steps[0].step).toBe('start');
      expect(steps[steps.length - 1].step).toBe('done');
    });

    it('Todo에서 basic-design까지 start만 반환한다', () => {
      const steps = getStepsToTarget('development', '[ ]', 'basic-design');
      expect(steps.length).toBe(1);
      expect(steps[0].step).toBe('start');
    });

    it('Todo에서 build까지 적절한 단계를 반환한다', () => {
      const steps = getStepsToTarget('development', '[ ]', 'build');
      const stepNames = steps.map(s => s.step);

      expect(stepNames).toContain('start');
      expect(stepNames).toContain('draft');
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
