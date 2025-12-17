/**
 * 설정 서비스 함수 테스트
 * Task: TSK-02-03-02
 * 테스트 명세: 026-test-specification.md
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readFile } from 'fs/promises';
import {
  getColumns,
  getCategories,
  getWorkflows,
  isValidSettingsType,
} from '../../../server/utils/settings';
import { refreshCache, loadSettings } from '../../../server/utils/settings/_cache';
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

describe('Settings Service', () => {
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

  describe('type-specific getters', () => {
    it('UT-007: should return columns config', async () => {
      // When: getColumns 호출
      const columns = await getColumns();

      // Then: ColumnsConfig 반환
      expect(columns).toHaveProperty('version');
      expect(columns).toHaveProperty('columns');
      expect(Array.isArray(columns.columns)).toBe(true);
    });

    it('UT-008: should return categories config', async () => {
      // When: getCategories 호출
      const categories = await getCategories();

      // Then: CategoriesConfig 반환
      expect(categories).toHaveProperty('version');
      expect(categories).toHaveProperty('categories');
      expect(Array.isArray(categories.categories)).toBe(true);
    });

    it('UT-009: should return workflows and actions config', async () => {
      // When: getWorkflows, getActions 호출
      const workflows = await getWorkflows();
      const actions = await getActions();

      // Then: 각 config 반환
      expect(workflows).toHaveProperty('version');
      expect(workflows).toHaveProperty('workflows');
      expect(actions).toHaveProperty('version');
      expect(actions).toHaveProperty('actions');
    });
  });

  describe('getSettingsByType', () => {
    it('should return columns when type is columns', async () => {
      const result = await getSettingsByType('columns');
      expect(result).toEqual(DEFAULT_COLUMNS);
    });

    it('should return categories when type is categories', async () => {
      const result = await getSettingsByType('categories');
      expect(result).toEqual(DEFAULT_CATEGORIES);
    });

    it('should return workflows when type is workflows', async () => {
      const result = await getSettingsByType('workflows');
      expect(result).toEqual(DEFAULT_WORKFLOWS);
    });

    it('should return actions when type is actions', async () => {
      const result = await getSettingsByType('actions');
      expect(result).toEqual(DEFAULT_ACTIONS);
    });
  });

  describe('isValidSettingsType', () => {
    it('should return true for valid types', () => {
      expect(isValidSettingsType('columns')).toBe(true);
      expect(isValidSettingsType('categories')).toBe(true);
      expect(isValidSettingsType('workflows')).toBe(true);
      expect(isValidSettingsType('actions')).toBe(true);
    });

    it('UT-010: should return false for invalid types', () => {
      expect(isValidSettingsType('invalid')).toBe(false);
      expect(isValidSettingsType('')).toBe(false);
      expect(isValidSettingsType('column')).toBe(false);
      expect(isValidSettingsType('COLUMNS')).toBe(false);
    });
  });
});
