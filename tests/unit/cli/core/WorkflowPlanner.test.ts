/**
 * 워크플로우 계획 생성기 테스트
 * Task: TSK-07-01
 */

import { describe, it, expect } from 'vitest';
import { WorkflowPlanner } from '../../../../cli/core/WorkflowPlanner.js';
import { ValidationError } from '../../../../cli/errors/JjibanError.js';

describe('WorkflowPlanner', () => {
  const planner = new WorkflowPlanner();

  const createTask = (overrides = {}) => ({
    id: 'TSK-07-01',
    category: 'development',
    status: '[ ]',
    priority: 'high',
    projectId: 'jjiban',
    ...overrides
  });

  describe('createPlan', () => {
    it('Todo 상태에서 done까지 전체 계획을 생성한다', () => {
      const task = createTask();
      const plan = planner.createPlan(task, { until: 'done' });

      expect(plan.taskId).toBe('TSK-07-01');
      expect(plan.category).toBe('development');
      expect(plan.isEmpty).toBe(false);
      expect(plan.steps.length).toBe(10);
      expect(plan.steps[0].step).toBe('start');
      expect(plan.steps[0].command).toContain('/wf:start TSK-07-01');
    });

    it('기본 target은 done이다', () => {
      const task = createTask();
      const plan = planner.createPlan(task);

      expect(plan.targetStep).toBe('done');
    });

    it('until 옵션으로 목표 단계를 지정한다', () => {
      const task = createTask();
      const plan = planner.createPlan(task, { until: 'build' });

      expect(plan.targetStep).toBe('build');
      expect(plan.steps.map(s => s.step)).toContain('build');
      expect(plan.steps.map(s => s.step)).not.toContain('verify');
    });

    it('이미 완료된 Task는 빈 계획을 반환한다', () => {
      const task = createTask({ status: '[xx]' });
      const plan = planner.createPlan(task);

      expect(plan.isEmpty).toBe(true);
      expect(plan.steps).toEqual([]);
      expect(plan.reason).toContain('이미 완료된');
    });

    it('중간 상태에서 시작한다', () => {
      const task = createTask({ status: '[bd]' });
      const plan = planner.createPlan(task);

      expect(plan.steps[0].step).toBe('draft');
      expect(plan.steps.map(s => s.step)).not.toContain('start');
    });

    it('잘못된 until 값은 ValidationError를 던진다', () => {
      const task = createTask();

      expect(() => planner.createPlan(task, { until: 'invalid' }))
        .toThrow(ValidationError);
    });

    it('각 단계에 올바른 명령어가 포함된다', () => {
      const task = createTask();
      const plan = planner.createPlan(task, { until: 'basic-design' });

      expect(plan.steps[0].command).toBe('/wf:start TSK-07-01');
    });

    it('defect 카테고리에 맞는 계획을 생성한다', () => {
      const task = createTask({ category: 'defect' });
      const plan = planner.createPlan(task);

      const stepNames = plan.steps.map(s => s.step);
      expect(stepNames).toContain('fix');
      expect(stepNames).not.toContain('draft');
    });

    it('infrastructure 카테고리에 맞는 계획을 생성한다', () => {
      const task = createTask({ category: 'infrastructure' });
      const plan = planner.createPlan(task);

      const stepNames = plan.steps.map(s => s.step);
      expect(stepNames).not.toContain('draft');
      expect(stepNames).not.toContain('review');
    });
  });

  describe('createResumePlan', () => {
    it('저장된 상태에서 재개 계획을 생성한다', () => {
      const savedState = {
        taskId: 'TSK-07-01',
        projectId: 'jjiban',
        category: 'development',
        currentStep: 2,
        targetStep: 'done',
        steps: ['start', 'draft', 'review', 'apply', 'build', 'test', 'audit', 'patch', 'verify', 'done'],
        completedSteps: [
          { step: 'start', status: 'success' },
          { step: 'draft', status: 'success' }
        ]
      };

      const task = createTask({ status: '[dd]' });
      const plan = planner.createResumePlan(savedState, task);

      expect(plan.isResume).toBe(true);
      expect(plan.resumeFromStep).toBe(2);
      expect(plan.steps[0].step).toBe('review');
      expect(plan.completedSteps).toEqual(savedState.completedSteps);
    });

    it('모든 단계가 완료된 경우 빈 계획을 반환한다', () => {
      const savedState = {
        taskId: 'TSK-07-01',
        projectId: 'jjiban',
        category: 'development',
        currentStep: 10,
        targetStep: 'done',
        steps: ['start', 'draft', 'review', 'apply', 'build', 'test', 'audit', 'patch', 'verify', 'done'],
        completedSteps: []
      };

      const task = createTask({ status: '[xx]' });
      const plan = planner.createResumePlan(savedState, task);

      expect(plan.isEmpty).toBe(true);
      expect(plan.isResume).toBe(true);
    });
  });
});
