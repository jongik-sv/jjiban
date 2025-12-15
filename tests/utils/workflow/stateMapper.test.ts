/**
 * StateMapper 단위 테스트
 * Task: TSK-03-04
 * 테스트 대상: server/utils/workflow/stateMapper.ts
 */

import { describe, test, expect } from 'vitest';
import {
  statusCodeToName,
  nameToStatusCode,
  getAllStateMappings,
} from '../../../server/utils/workflow/stateMapper';
import type { TaskCategory } from '../../../types';

describe('StateMapper', () => {
  describe('statusCodeToName', () => {
    test('converts "bd" to "bd" for development', async () => {
      const result = await statusCodeToName('development', 'bd');
      expect(result).toBe('bd');
    });

    test('converts "dd" to "dd" for development', async () => {
      const result = await statusCodeToName('development', 'dd');
      expect(result).toBe('dd');
    });

    test('converts "im" to "im" for development', async () => {
      const result = await statusCodeToName('development', 'im');
      expect(result).toBe('im');
    });

    test('converts "vf" to "vf" for development', async () => {
      const result = await statusCodeToName('development', 'vf');
      expect(result).toBe('vf');
    });

    test('converts "xx" to "xx" for development', async () => {
      const result = await statusCodeToName('development', 'xx');
      expect(result).toBe('xx');
    });

    test('converts "[ ]" to "todo"', async () => {
      const result = await statusCodeToName('development', '[ ]');
      expect(result).toBe('todo');
    });

    test('converts empty string to "todo"', async () => {
      const result = await statusCodeToName('development', '');
      expect(result).toBe('todo');
    });

    test('handles brackets in status code "[bd]"', async () => {
      const result = await statusCodeToName('development', '[bd]');
      expect(result).toBe('bd');
    });

    test('converts "an" to "an" for defect category', async () => {
      const result = await statusCodeToName('defect', 'an');
      expect(result).toBe('an');
    });

    test('converts "fx" to "fx" for defect category', async () => {
      const result = await statusCodeToName('defect', 'fx');
      expect(result).toBe('fx');
    });

    test('returns null for invalid category', async () => {
      const result = await statusCodeToName('invalid' as TaskCategory, 'bd');
      expect(result).toBeNull();
    });

    test('returns null for unknown status code', async () => {
      const result = await statusCodeToName('development', 'unknown');
      expect(result).toBeNull();
    });
  });

  describe('nameToStatusCode', () => {
    test('converts "bd" to "[bd]" for development', async () => {
      const result = await nameToStatusCode('development', 'bd');
      expect(result).toBe('[bd]');
    });

    test('converts "dd" to "[dd]" for development', async () => {
      const result = await nameToStatusCode('development', 'dd');
      expect(result).toBe('[dd]');
    });

    test('converts "im" to "[im]" for development', async () => {
      const result = await nameToStatusCode('development', 'im');
      expect(result).toBe('[im]');
    });

    test('converts "vf" to "[vf]" for development', async () => {
      const result = await nameToStatusCode('development', 'vf');
      expect(result).toBe('[vf]');
    });

    test('converts "xx" to "[xx]" for development', async () => {
      const result = await nameToStatusCode('development', 'xx');
      expect(result).toBe('[xx]');
    });

    test('converts "todo" to "[ ]"', async () => {
      const result = await nameToStatusCode('development', 'todo');
      expect(result).toBe('[ ]');
    });

    test('converts "an" to "[an]" for defect', async () => {
      const result = await nameToStatusCode('defect', 'an');
      expect(result).toBe('[an]');
    });

    test('converts "fx" to "[fx]" for defect', async () => {
      const result = await nameToStatusCode('defect', 'fx');
      expect(result).toBe('[fx]');
    });

    test('returns "[ ]" for invalid category', async () => {
      const result = await nameToStatusCode('invalid' as TaskCategory, 'bd');
      expect(result).toBe('[ ]');
    });

    test('returns "[ ]" for unknown state name', async () => {
      const result = await nameToStatusCode('development', 'unknown-state');
      expect(result).toBe('[ ]');
    });
  });

  describe('getAllStateMappings', () => {
    test('returns all state mappings for development', async () => {
      const mappings = await getAllStateMappings('development');

      expect(mappings).toBeDefined();
      expect(mappings['[ ]']).toBe('todo');
      expect(mappings['[bd]']).toBe('bd');
      expect(mappings['[dd]']).toBe('dd');
      expect(mappings['[im]']).toBe('im');
      expect(mappings['[vf]']).toBe('vf');
      expect(mappings['[xx]']).toBe('xx');
    });

    test('returns all state mappings for defect', async () => {
      const mappings = await getAllStateMappings('defect');

      expect(mappings).toBeDefined();
      expect(mappings['[ ]']).toBe('todo');
      expect(mappings['[an]']).toBe('an');
      expect(mappings['[fx]']).toBe('fx');
      expect(mappings['[vf]']).toBe('vf');
      expect(mappings['[xx]']).toBe('xx');
    });

    test('returns all state mappings for infrastructure', async () => {
      const mappings = await getAllStateMappings('infrastructure');

      expect(mappings).toBeDefined();
      expect(mappings['[ ]']).toBe('todo');
      expect(mappings['[dd]']).toBe('dd');
      expect(mappings['[im]']).toBe('im');
      expect(mappings['[xx]']).toBe('xx');
    });

    test('returns empty object for invalid category', async () => {
      const mappings = await getAllStateMappings('invalid' as TaskCategory);
      expect(mappings).toEqual({});
    });

    test('all mappings include todo state', async () => {
      const categories: TaskCategory[] = ['development', 'defect', 'infrastructure'];

      for (const category of categories) {
        const mappings = await getAllStateMappings(category);
        expect(mappings['[ ]']).toBe('todo');
      }
    });
  });

  describe('round-trip conversions', () => {
    test('development: statusCode -> name -> statusCode', async () => {
      const testCases = ['bd', 'dd', 'im', 'vf', 'xx'];

      for (const code of testCases) {
        const name = await statusCodeToName('development', code);
        expect(name).not.toBeNull();

        if (name) {
          const backToCode = await nameToStatusCode('development', name);
          expect(backToCode).toBe(`[${name}]`);
        }
      }
    });

    test('defect: statusCode -> name -> statusCode', async () => {
      const testCases = ['an', 'fx', 'vf', 'xx'];

      for (const code of testCases) {
        const name = await statusCodeToName('defect', code);
        expect(name).not.toBeNull();

        if (name) {
          const backToCode = await nameToStatusCode('defect', name);
          expect(backToCode).toBe(`[${name}]`);
        }
      }
    });

    test('infrastructure: statusCode -> name -> statusCode', async () => {
      const testCases = ['dd', 'im', 'xx'];

      for (const code of testCases) {
        const name = await statusCodeToName('infrastructure', code);
        expect(name).not.toBeNull();

        if (name) {
          const backToCode = await nameToStatusCode('infrastructure', name);
          expect(backToCode).toBe(`[${name}]`);
        }
      }
    });
  });
});
