/**
 * DocumentService 단위 테스트
 * Task: TSK-03-03
 * 테스트 명세: 026-test-specification.md 섹션 2.2 (TC-011~015)
 */

import { describe, test, expect } from 'vitest';
import {
  getExistingDocuments,
  getExpectedDocuments,
  getTaskDocuments,
} from '../../../server/utils/workflow/documentService';

const TEST_PROJECT_ID = 'project';
const TEST_TASK_ID = 'TSK-01-01-01';

describe('DocumentService', () => {
  describe('getExistingDocuments', () => {
    test('TC-011: returns .md files', async () => {
      // Given: Task folder with .md files
      const documents = await getExistingDocuments(TEST_PROJECT_ID, TEST_TASK_ID);

      // Then: documents is array
      expect(Array.isArray(documents)).toBe(true);

      // All should have exists = true and stage = 'current'
      documents.forEach((doc) => {
        expect(doc.exists).toBe(true);
        expect(doc.stage).toBe('current');
        expect(doc.name).toMatch(/\.md$/);
      });
    });

    test('TC-012: empty when folder not found', async () => {
      // Given: Task folder does not exist
      const documents = await getExistingDocuments(TEST_PROJECT_ID, 'NONEXISTENT-TASK');

      // Then: documents = []
      expect(documents).toEqual([]);
    });
  });

  describe('getExpectedDocuments', () => {
    test('TC-013: returns workflow-based docs', async () => {
      // Given: Task status [bd], development category
      const documents = await getExpectedDocuments(TEST_PROJECT_ID, TEST_TASK_ID, '[bd]');

      // Then: documents may include expected docs
      expect(Array.isArray(documents)).toBe(true);

      // All should have exists = false and stage = 'expected'
      documents.forEach((doc) => {
        expect(doc.exists).toBe(false);
        expect(doc.stage).toBe('expected');
        expect(doc.command).toBeDefined();
        expect(doc.expectedAfter).toBeDefined();
      });
    });
  });

  describe('getTaskDocuments', () => {
    test('TC-014: merges existing and expected', async () => {
      // Given: Task with existing + expected docs
      const documents = await getTaskDocuments(TEST_PROJECT_ID, TEST_TASK_ID);

      // Then: documents is array with both types
      expect(Array.isArray(documents)).toBe(true);

      // Should be sorted with 'current' first
      let seenExpected = false;
      documents.forEach((doc) => {
        if (doc.stage === 'expected') {
          seenExpected = true;
        } else if (doc.stage === 'current' && seenExpected) {
          // If we see 'current' after 'expected', sorting is wrong
          throw new Error('Documents not sorted correctly');
        }
      });
    });

    test('TC-015: classifies document types', async () => {
      // Given: files with different naming patterns
      const documents = await getTaskDocuments(TEST_PROJECT_ID, TEST_TASK_ID);

      // Then: types should be assigned
      expect(Array.isArray(documents)).toBe(true);

      documents.forEach((doc) => {
        expect(['design', 'implementation', 'test', 'manual', 'analysis', 'review']).toContain(doc.type);
      });
    });
  });
});
