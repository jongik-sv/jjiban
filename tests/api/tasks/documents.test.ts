/**
 * Documents API 통합 테스트
 * Task: TSK-03-03
 * 테스트 명세: 026-test-specification.md 섹션 3.2 (TC-024~025)
 */

import { describe, test, expect } from 'vitest';
import { setup, $fetch } from '@nuxt/test-utils';

describe('GET /api/tasks/:id/documents', async () => {
  await setup({
    server: true,
  });

  test('TC-024: GET /api/tasks/:id/documents - success', async () => {
    // When: GET with valid taskId
    const response = await $fetch('/api/tasks/TSK-01-01-01/documents', {
      method: 'GET',
    });

    // Then: response.taskId = 'TSK-01-01-01'
    expect(response).toBeDefined();
    expect(response.taskId).toBe('TSK-01-01-01');
    expect(Array.isArray(response.documents)).toBe(true);
  });

  test('TC-025: GET /api/tasks/:id/documents - Task not found', async () => {
    // When: GET with invalid taskId
    try {
      await $fetch('/api/tasks/INVALID/documents', {
        method: 'GET',
      });
      // Should not reach here
      expect(true).toBe(false);
    } catch (error: any) {
      // Then: status = 404
      expect(error.statusCode).toBe(404);
      expect(error.statusMessage).toBe('TASK_NOT_FOUND');
    }
  });
});
