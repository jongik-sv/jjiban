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
    test('converts "bd" to "basic-design" for development', async () => {
      const result = await statusCodeToName('development', 'bd');
      expect(result).toBe('basic-design');
    });

    test('converts "dd" to "detail-design" for development', async () => {
      const result = await statusCodeToName('development', 'dd');
      expect(result).toBe('detail-design');
    });

    test('converts "im" to "implement" for development', async () => {
      const result = await statusCodeToName('development', 'im');
      expect(result).toBe('implement');
    });

    test('converts "vf" to "verify" for development', async () => {
      const result = await statusCodeToName('development', 'vf');
      expect(result).toBe('verify');
    });

    test('converts "xx" to "done" for development', async () => {
      const result = await statusCodeToName('development', 'xx');
      expect(result).toBe('done');
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
      expect(result).toBe('basic-design');
    });

    test('converts "an" to "analyze" for defect category', async () => {
      const result = await statusCodeToName('defect', 'an');
      expect(result).toBe('analyze');
    });

    test('converts "fx" to "fix" for defect category', async () => {
      const result = await statusCodeToName('defect', 'fx');
      expect(result).toBe('fix');
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
    test('converts "basic-design" to "[bd]" for development', async () => {
      const result = await nameToStatusCode('development', 'basic-design');
      expect(result).toBe('[basic-design]');
    });

    test('converts "detail-design" to "[dd]" for development', async () => {
      const result = await nameToStatusCode('development', 'detail-design');
      expect(result).toBe('[detail-design]');
    });

    test('converts "implement" to "[im]" for development', async () => {
      const result = await nameToStatusCode('development', 'implement');
      expect(result).toBe('[implement]');
    });

    test('converts "verify" to "[vf]" for development', async () => {
      const result = await nameToStatusCode('development', 'verify');
      expect(result).toBe('[verify]');
    });

    test('converts "done" to "[xx]" for development', async () => {
      const result = await nameToStatusCode('development', 'done');
      expect(result).toBe('[done]');
    });

    test('converts "todo" to "[ ]"', async () => {
      const result = await nameToStatusCode('development', 'todo');
      expect(result).toBe('[ ]');
    });

    test('converts "analyze" to "[an]" for defect', async () => {
      const result = await nameToStatusCode('defect', 'analyze');
      expect(result).toBe('[analyze]');
    });

    test('converts "fix" to "[fx]" for defect', async () => {
      const result = await nameToStatusCode('defect', 'fix');
      expect(result).toBe('[fix]');
    });

    test('returns "[ ]" for invalid category', async () => {
      const result = await nameToStatusCode('invalid' as TaskCategory, 'basic-design');
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
      expect(mappings['[basic-design]']).toBe('basic-design');
      expect(mappings['[detail-design]']).toBe('detail-design');
      expect(mappings['[implement]']).toBe('implement');
      expect(mappings['[verify]']).toBe('verify');
      expect(mappings['[done]']).toBe('done');
    });

    test('returns all state mappings for defect', async () => {
      const mappings = await getAllStateMappings('defect');

      expect(mappings).toBeDefined();
      expect(mappings['[ ]']).toBe('todo');
      expect(mappings['[analyze]']).toBe('analyze');
      expect(mappings['[fix]']).toBe('fix');
      expect(mappings['[verify]']).toBe('verify');
      expect(mappings['[done]']).toBe('done');
    });

    test('returns all state mappings for infrastructure', async () => {
      const mappings = await getAllStateMappings('infrastructure');

      expect(mappings).toBeDefined();
      expect(mappings['[ ]']).toBe('todo');
      expect(mappings['[design]']).toBe('design');
      expect(mappings['[implement]']).toBe('implement');
      expect(mappings['[done]']).toBe('done');
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
      const testCases = ['ds', 'im', 'xx'];

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
