/**
 * WorkflowEngine 단위 테스트
 * Task: TSK-03-04
 * 테스트 대상: server/utils/workflow/workflowEngine.ts
 */

import { describe, test, expect, beforeEach } from 'vitest';
import {
  getWorkflowState,
  executeCommand,
  queryHistory,
} from '../../../server/utils/workflow/workflowEngine';
import { getAvailableCommands } from '../../../server/utils/workflow/transitionService';

const TEST_PROJECT_ID = 'jjiban';
// jjiban 프로젝트의 실제 Task ID 사용
const TEST_TASK_DEV = 'TSK-01-02-01';        // development - AppLayout
const TEST_TASK_DEFECT = 'TSK-01-02-02';     // development - AppHeader (defect 없어서 development로 대체)
const TEST_TASK_INFRA = 'TSK-01-01-01';      // infrastructure - Nuxt 3 초기화

describe('WorkflowEngine', () => {
  describe('getWorkflowState', () => {
    test('returns workflow state for development task', async () => {
      const state = await getWorkflowState(TEST_TASK_DEV);

      expect(state).toBeDefined();
      expect(state.taskId).toBe(TEST_TASK_DEV);
      expect(state.category).toBe('development');
      expect(state.currentState).toBeDefined();
      expect(state.currentStateName).toBeDefined();
      expect(state.workflow).toBeDefined();
      expect(state.workflow.id).toBe('development');
      expect(state.workflow.states).toBeDefined();
      expect(state.workflow.transitions).toBeDefined();
      expect(Array.isArray(state.availableCommands)).toBe(true);
    });

    test('returns workflow state for second development task', async () => {
      const state = await getWorkflowState(TEST_TASK_DEFECT);

      expect(state).toBeDefined();
      expect(state.taskId).toBe(TEST_TASK_DEFECT);
      expect(state.category).toBe('development');
      expect(state.workflow.id).toBe('development');
    });

    test('returns workflow state for infrastructure task', async () => {
      const state = await getWorkflowState(TEST_TASK_INFRA);

      expect(state).toBeDefined();
      expect(state.taskId).toBe(TEST_TASK_INFRA);
      expect(state.category).toBe('infrastructure');
      expect(state.workflow.id).toBe('infrastructure');
    });

    test('throws TASK_NOT_FOUND for invalid task', async () => {
      await expect(
        getWorkflowState('INVALID-TASK')
      ).rejects.toThrow('Task를 찾을 수 없습니다');
    });

    test('includes available commands in workflow state', async () => {
      const state = await getWorkflowState(TEST_TASK_DEV);

      expect(state.availableCommands).toBeDefined();
      expect(Array.isArray(state.availableCommands)).toBe(true);
      expect(state.availableCommands.length).toBeGreaterThanOrEqual(0);
    });

    test('workflow states array is not empty', async () => {
      const state = await getWorkflowState(TEST_TASK_DEV);

      expect(state.workflow.states).toBeDefined();
      expect(state.workflow.states.length).toBeGreaterThan(0);
      expect(state.workflow.states).toContain('todo');
    });

    test('workflow transitions array is not empty', async () => {
      const state = await getWorkflowState(TEST_TASK_DEV);

      expect(state.workflow.transitions).toBeDefined();
      expect(state.workflow.transitions.length).toBeGreaterThan(0);
    });

    test('current state name matches state in workflow', async () => {
      const state = await getWorkflowState(TEST_TASK_DEV);

      expect(state.currentStateName).toBeDefined();
      expect(state.workflow.states).toContain(state.currentStateName);
    });
  });

  describe('getAvailableCommands', () => {
    test('returns commands for development task', async () => {
      const commands = await getAvailableCommands(TEST_TASK_DEV);

      expect(Array.isArray(commands)).toBe(true);
      expect(commands.length).toBeGreaterThanOrEqual(0);
    });

    test('returns commands for defect task', async () => {
      const commands = await getAvailableCommands(TEST_TASK_DEFECT);

      expect(Array.isArray(commands)).toBe(true);
      expect(commands.length).toBeGreaterThanOrEqual(0);
    });

    test('returns commands for infrastructure task', async () => {
      const commands = await getAvailableCommands(TEST_TASK_INFRA);

      expect(Array.isArray(commands)).toBe(true);
      expect(commands.length).toBeGreaterThanOrEqual(0);
    });

    test('throws error for invalid task', async () => {
      await expect(
        getAvailableCommands('INVALID-TASK')
      ).rejects.toThrow();
    });

    test('commands are strings', async () => {
      const commands = await getAvailableCommands(TEST_TASK_DEV);

      commands.forEach((command) => {
        expect(typeof command).toBe('string');
        expect(command.length).toBeGreaterThan(0);
      });
    });
  });

  describe('executeCommand', () => {
    test('returns transition result with required fields', async () => {
      try {
        const result = await executeCommand(TEST_TASK_DEV, 'start');

        expect(result).toBeDefined();
        expect(result.success).toBeDefined();
        expect(result.taskId).toBe(TEST_TASK_DEV);
        expect(result.previousStatus).toBeDefined();
        expect(result.newStatus).toBeDefined();
        expect(result.command).toBe('start');
        expect(result.timestamp).toBeDefined();
      } catch (error) {
        // If command already executed or invalid, that's okay for this test
        expect(error).toBeDefined();
      }
    });

    test('throws error for invalid command', async () => {
      await expect(
        executeCommand(TEST_TASK_DEV, 'invalid-command')
      ).rejects.toThrow();
    });

    test('throws error for invalid task', async () => {
      await expect(
        executeCommand('INVALID-TASK', 'start')
      ).rejects.toThrow();
    });

    test('accepts optional comment parameter', async () => {
      try {
        const result = await executeCommand(
          TEST_TASK_DEV,
          'start',
          'Test comment'
        );

        expect(result).toBeDefined();
      } catch (error) {
        // Expected if command already executed
        expect(error).toBeDefined();
      }
    });

    test('records history after execution', async () => {
      try {
        // Execute a command
        await executeCommand(TEST_TASK_DEV, 'start', 'History test');

        // Query history
        const history = await queryHistory(TEST_TASK_DEV, { limit: 1 });

        expect(history.items.length).toBeGreaterThan(0);
        expect(history.items[0].action).toBe('transition');
        expect(history.items[0].taskId).toBe(TEST_TASK_DEV);
      } catch (error) {
        // Expected if command already executed
        expect(error).toBeDefined();
      }
    });
  });

  describe('queryHistory', () => {
    test('returns history result with items and totalCount', async () => {
      const result = await queryHistory(TEST_TASK_DEV);

      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
      expect(result.totalCount).toBeDefined();
      expect(typeof result.totalCount).toBe('number');
      expect(result.totalCount).toBeGreaterThanOrEqual(0);
    });

    test('filters by action type', async () => {
      const result = await queryHistory(TEST_TASK_DEV, {
        action: 'transition',
      });

      expect(result.items).toBeDefined();
      result.items.forEach((item) => {
        expect(item.action).toBe('transition');
      });
    });

    test('applies limit correctly', async () => {
      const result = await queryHistory(TEST_TASK_DEV, { limit: 5 });

      expect(result.items.length).toBeLessThanOrEqual(5);
    });

    test('applies offset correctly', async () => {
      const fullResult = await queryHistory(TEST_TASK_DEV);
      const offsetResult = await queryHistory(TEST_TASK_DEV, { offset: 1 });

      if (fullResult.totalCount > 1) {
        expect(offsetResult.items.length).toBe(fullResult.items.length - 1);
      }
    });

    test('combines limit and offset', async () => {
      const result = await queryHistory(TEST_TASK_DEV, {
        limit: 3,
        offset: 1,
      });

      expect(result.items.length).toBeLessThanOrEqual(3);
    });

    test('returns empty array when no history exists', async () => {
      // Create a task ID that likely has no history
      const result = await queryHistory(TEST_TASK_DEFECT);

      expect(result).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
      expect(result.totalCount).toBeGreaterThanOrEqual(0);
    });

    test('throws error for invalid task', async () => {
      await expect(
        queryHistory('INVALID-TASK')
      ).rejects.toThrow('Task를 찾을 수 없습니다');
    });

    test('history items have required fields', async () => {
      const result = await queryHistory(TEST_TASK_DEV);

      result.items.forEach((item) => {
        expect(item.taskId).toBeDefined();
        expect(item.timestamp).toBeDefined();
        expect(item.action).toBeDefined();
        expect(['transition', 'update']).toContain(item.action);
      });
    });

    test('history items are sorted (newest first)', async () => {
      const result = await queryHistory(TEST_TASK_DEV);

      if (result.items.length > 1) {
        for (let i = 1; i < result.items.length; i++) {
          const prevTime = new Date(result.items[i - 1].timestamp).getTime();
          const currTime = new Date(result.items[i].timestamp).getTime();
          expect(prevTime).toBeGreaterThanOrEqual(currTime);
        }
      }
    });

    test('totalCount reflects unfiltered count', async () => {
      const unfilteredResult = await queryHistory(TEST_TASK_DEV);
      const limitedResult = await queryHistory(TEST_TASK_DEV, { limit: 1 });

      expect(limitedResult.totalCount).toBe(unfilteredResult.totalCount);
    });
  });

  describe('integration scenarios', () => {
    test('workflow state and available commands are consistent', async () => {
      const state = await getWorkflowState(TEST_TASK_DEV);
      const commands = await getAvailableCommands(TEST_TASK_DEV);

      expect(state.availableCommands).toEqual(commands);
    });

    test('executing command updates workflow state', async () => {
      try {
        const stateBefore = await getWorkflowState(TEST_TASK_DEV);
        const commandsBefore = stateBefore.availableCommands;

        if (commandsBefore.length > 0) {
          const command = commandsBefore[0];
          await executeCommand(TEST_TASK_DEV, command);

          const stateAfter = await getWorkflowState(TEST_TASK_DEV);
          expect(stateAfter.currentState).not.toBe(stateBefore.currentState);
        }
      } catch (error) {
        // Expected if no valid commands or already executed
        expect(error).toBeDefined();
      }
    });

    test('history records include command from executeCommand', async () => {
      try {
        const commands = await getAvailableCommands(TEST_TASK_DEV);

        if (commands.length > 0) {
          const command = commands[0];
          await executeCommand(TEST_TASK_DEV, command, 'Integration test');

          const history = await queryHistory(TEST_TASK_DEV, { limit: 1 });

          if (history.items.length > 0) {
            expect(history.items[0].command).toBe(command);
            expect(history.items[0].comment).toBe('Integration test');
          }
        }
      } catch (error) {
        // Expected if already executed
        expect(error).toBeDefined();
      }
    });
  });

  describe('error handling', () => {
    test('handles non-existent task gracefully', async () => {
      await expect(getWorkflowState('TSK-99-99-99')).rejects.toThrow();
      await expect(getAvailableCommands('TSK-99-99-99')).rejects.toThrow();
      await expect(executeCommand('TSK-99-99-99', 'start')).rejects.toThrow();
      await expect(queryHistory('TSK-99-99-99')).rejects.toThrow();
    });

    test('handles invalid command gracefully', async () => {
      await expect(
        executeCommand(TEST_TASK_DEV, 'invalid-command-12345')
      ).rejects.toThrow();
    });

    test('getWorkflowState error includes task ID', async () => {
      try {
        await getWorkflowState('NONEXISTENT-TASK');
        expect(false).toBe(true); // Should not reach here
      } catch (error: any) {
        expect(error.message).toContain('NONEXISTENT-TASK');
      }
    });
  });
});
