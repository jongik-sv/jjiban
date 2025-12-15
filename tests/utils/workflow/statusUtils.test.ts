/**
 * StatusUtils 단위 테스트
 * Task: TSK-03-04
 * 테스트 대상: server/utils/workflow/statusUtils.ts
 */

import { describe, test, expect } from 'vitest';
import {
  extractStatusCode,
  formatStatusCode,
  isTodoStatus,
} from '../../../server/utils/workflow/statusUtils';

describe('StatusUtils', () => {
  describe('extractStatusCode', () => {
    test('extracts code from "[bd]"', () => {
      const result = extractStatusCode('[bd]');
      expect(result).toBe('bd');
    });

    test('extracts code from "detail-design [dd]"', () => {
      const result = extractStatusCode('detail-design [dd]');
      expect(result).toBe('dd');
    });

    test('extracts code from "[im]"', () => {
      const result = extractStatusCode('[im]');
      expect(result).toBe('im');
    });

    test('extracts code from "[ ]"', () => {
      const result = extractStatusCode('[ ]');
      expect(result).toBe('');
    });

    test('returns empty string for status without brackets', () => {
      const result = extractStatusCode('basic-design');
      expect(result).toBe('');
    });

    test('returns empty string for undefined', () => {
      const result = extractStatusCode(undefined);
      expect(result).toBe('');
    });

    test('returns empty string for empty string', () => {
      const result = extractStatusCode('');
      expect(result).toBe('');
    });

    test('handles code with spaces "[  bd  ]"', () => {
      const result = extractStatusCode('[  bd  ]');
      expect(result).toBe('bd');
    });

    test('extracts multi-character code "[vf]"', () => {
      const result = extractStatusCode('[vf]');
      expect(result).toBe('vf');
    });

    test('extracts code from complex status string', () => {
      const result = extractStatusCode('some text [xx] more text');
      expect(result).toBe('xx');
    });
  });

  describe('formatStatusCode', () => {
    test('formats "bd" to "[bd]"', () => {
      const result = formatStatusCode('bd');
      expect(result).toBe('[bd]');
    });

    test('formats "dd" to "[dd]"', () => {
      const result = formatStatusCode('dd');
      expect(result).toBe('[dd]');
    });

    test('formats "im" to "[im]"', () => {
      const result = formatStatusCode('im');
      expect(result).toBe('[im]');
    });

    test('formats empty string to "[ ]"', () => {
      const result = formatStatusCode('');
      expect(result).toBe('[ ]');
    });

    test('formats whitespace to "[ ]"', () => {
      const result = formatStatusCode('   ');
      expect(result).toBe('[ ]');
    });

    test('trims whitespace before formatting', () => {
      const result = formatStatusCode('  bd  ');
      expect(result).toBe('[bd]');
    });

    test('handles multi-character codes', () => {
      const result = formatStatusCode('vf');
      expect(result).toBe('[vf]');
    });

    test('handles long codes', () => {
      const result = formatStatusCode('basic-design');
      expect(result).toBe('[basic-design]');
    });
  });

  describe('isTodoStatus', () => {
    test('returns true for "[ ]"', () => {
      const result = isTodoStatus('[ ]');
      expect(result).toBe(true);
    });

    test('returns true for undefined', () => {
      const result = isTodoStatus(undefined);
      expect(result).toBe(true);
    });

    test('returns true for empty string', () => {
      const result = isTodoStatus('');
      expect(result).toBe(true);
    });

    test('returns true for status without brackets', () => {
      const result = isTodoStatus('todo');
      expect(result).toBe(true);
    });

    test('returns false for "[bd]"', () => {
      const result = isTodoStatus('[bd]');
      expect(result).toBe(false);
    });

    test('returns false for "detail-design [dd]"', () => {
      const result = isTodoStatus('detail-design [dd]');
      expect(result).toBe(false);
    });

    test('returns false for "[im]"', () => {
      const result = isTodoStatus('[im]');
      expect(result).toBe(false);
    });

    test('returns false for "[vf]"', () => {
      const result = isTodoStatus('[vf]');
      expect(result).toBe(false);
    });

    test('returns false for "[xx]"', () => {
      const result = isTodoStatus('[xx]');
      expect(result).toBe(false);
    });

    test('returns true for whitespace-only brackets "[   ]"', () => {
      const result = isTodoStatus('[   ]');
      expect(result).toBe(true);
    });
  });

  describe('integration: extract and format', () => {
    test('extract then format returns original for simple codes', () => {
      const testCases = ['[bd]', '[dd]', '[im]', '[vf]', '[xx]'];

      for (const testCase of testCases) {
        const extracted = extractStatusCode(testCase);
        const formatted = formatStatusCode(extracted);
        expect(formatted).toBe(testCase);
      }
    });

    test('extract from complex string and format', () => {
      const status = 'detail-design [dd]';
      const extracted = extractStatusCode(status);
      const formatted = formatStatusCode(extracted);
      expect(formatted).toBe('[dd]');
    });

    test('handles todo status round-trip', () => {
      const status = '[ ]';
      const extracted = extractStatusCode(status);
      const formatted = formatStatusCode(extracted);
      expect(formatted).toBe('[ ]');
    });
  });

  describe('edge cases', () => {
    test('handles multiple brackets (uses first match)', () => {
      const result = extractStatusCode('[bd] [dd]');
      expect(result).toBe('bd');
    });

    test('handles nested-like patterns', () => {
      const result = extractStatusCode('[[bd]]');
      expect(result).toBe('[bd');
    });

    test('handles special characters in code', () => {
      const result = extractStatusCode('[test-code]');
      expect(result).toBe('test-code');
    });

    test('formatStatusCode handles already-bracketed input gracefully', () => {
      const result = formatStatusCode('[bd]');
      expect(result).toBe('[[bd]]');
    });
  });
});
