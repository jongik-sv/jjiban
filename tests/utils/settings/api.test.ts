/**
 * 설정 API 핸들러 테스트
 * Task: TSK-02-03-02
 * 테스트 명세: 026-test-specification.md
 *
 * Note: 이 테스트는 API 핸들러의 유닛 테스트입니다.
 * 실제 Nuxt 서버를 띄우는 E2E 테스트는 별도로 진행합니다.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readFile } from 'fs/promises';
import { isValidSettingsType } from '../../../server/utils/settings';
import { refreshCache } from '../../../server/utils/settings/_cache';
import {
  DEFAULT_COLUMNS,
  DEFAULT_CATEGORIES,
  DEFAULT_WORKFLOWS,
  DEFAULT_ACTIONS,
} from '../../../server/utils/settings/defaults';

// Mock fs/promises
vi.mock('fs/promises');

// Mock paths module
vi.mock('../../../server/utils/settings/paths', () => ({
  getSettingsFilePath: vi.fn((type: string) => `/mock/path/${type}.json`),
}));

describe('Settings API Handler', () => {
  beforeEach(() => {
    refreshCache();
    vi.clearAllMocks();
    // 기본: 파일 없음 → 기본값 사용
    const error = new Error('ENOENT') as NodeJS.ErrnoException;
    error.code = 'ENOENT';
    vi.mocked(readFile).mockRejectedValue(error);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('type validation', () => {
    it('AT-001: should accept columns type', () => {
      expect(isValidSettingsType('columns')).toBe(true);
    });

    it('AT-002: should accept categories type', () => {
      expect(isValidSettingsType('categories')).toBe(true);
    });

    it('AT-003: should accept workflows type', () => {
      expect(isValidSettingsType('workflows')).toBe(true);
    });

    it('AT-004: should accept actions type', () => {
      expect(isValidSettingsType('actions')).toBe(true);
    });

    it('should reject invalid type', () => {
      expect(isValidSettingsType('invalid')).toBe(false);
      expect(isValidSettingsType('')).toBe(false);
      expect(isValidSettingsType('COLUMNS')).toBe(false);
      expect(isValidSettingsType('column')).toBe(false);
    });
  });

  describe('default settings structure', () => {
    it('should have correct columns structure', () => {
      expect(DEFAULT_COLUMNS).toHaveProperty('version');
      expect(DEFAULT_COLUMNS).toHaveProperty('columns');
      expect(Array.isArray(DEFAULT_COLUMNS.columns)).toBe(true);
      expect(DEFAULT_COLUMNS.columns.length).toBeGreaterThan(0);

      // Check column structure
      const column = DEFAULT_COLUMNS.columns[0];
      expect(column).toHaveProperty('id');
      expect(column).toHaveProperty('name');
      expect(column).toHaveProperty('order');
      expect(column).toHaveProperty('color');
    });

    it('should have correct categories structure', () => {
      expect(DEFAULT_CATEGORIES).toHaveProperty('version');
      expect(DEFAULT_CATEGORIES).toHaveProperty('categories');
      expect(Array.isArray(DEFAULT_CATEGORIES.categories)).toBe(true);
      expect(DEFAULT_CATEGORIES.categories.length).toBe(3); // development, defect, infrastructure

      // Check category structure
      const category = DEFAULT_CATEGORIES.categories[0];
      expect(category).toHaveProperty('id');
      expect(category).toHaveProperty('name');
      expect(category).toHaveProperty('workflowId');
    });

    it('should have correct workflows structure', () => {
      expect(DEFAULT_WORKFLOWS).toHaveProperty('version');
      expect(DEFAULT_WORKFLOWS).toHaveProperty('workflows');
      expect(Array.isArray(DEFAULT_WORKFLOWS.workflows)).toBe(true);
      expect(DEFAULT_WORKFLOWS.workflows.length).toBe(3); // development, defect, infrastructure

      // Check workflow structure
      const workflow = DEFAULT_WORKFLOWS.workflows[0];
      expect(workflow).toHaveProperty('id');
      expect(workflow).toHaveProperty('states');
      expect(workflow).toHaveProperty('transitions');
      expect(Array.isArray(workflow.transitions)).toBe(true);
    });

    it('should have correct actions structure', () => {
      expect(DEFAULT_ACTIONS).toHaveProperty('version');
      expect(DEFAULT_ACTIONS).toHaveProperty('actions');
      expect(Array.isArray(DEFAULT_ACTIONS.actions)).toBe(true);
      expect(DEFAULT_ACTIONS.actions.length).toBeGreaterThan(0);

      // Check action structure
      const action = DEFAULT_ACTIONS.actions[0];
      expect(action).toHaveProperty('id');
      expect(action).toHaveProperty('command');
      expect(action).toHaveProperty('allowedStates');
      expect(action).toHaveProperty('allowedCategories');
    });
  });
});
