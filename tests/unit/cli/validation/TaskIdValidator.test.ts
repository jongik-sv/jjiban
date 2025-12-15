/**
 * Task ID 검증기 테스트
 * Task: TSK-07-01
 */

import { describe, it, expect } from 'vitest';
import {
  validateTaskId,
  isValidTaskId,
  parseTaskId
} from '../../../../cli/validation/TaskIdValidator.js';
import { ValidationError } from '../../../../cli/errors/JjibanError.js';

describe('TaskIdValidator', () => {
  describe('validateTaskId', () => {
    it('3단계 Task ID (TSK-XX-XX) 를 유효하게 검증한다', () => {
      expect(validateTaskId('TSK-01-01')).toBe('TSK-01-01');
      expect(validateTaskId('TSK-99-99')).toBe('TSK-99-99');
    });

    it('4단계 Task ID (TSK-XX-XX-XX) 를 유효하게 검증한다', () => {
      expect(validateTaskId('TSK-01-01-01')).toBe('TSK-01-01-01');
      expect(validateTaskId('TSK-07-01-01')).toBe('TSK-07-01-01');
      expect(validateTaskId('TSK-99-99-99')).toBe('TSK-99-99-99');
    });

    it('앞뒤 공백을 제거한다', () => {
      expect(validateTaskId('  TSK-01-01  ')).toBe('TSK-01-01');
      expect(validateTaskId('\tTSK-01-01-01\n')).toBe('TSK-01-01-01');
    });

    it('빈 문자열은 ValidationError를 던진다', () => {
      expect(() => validateTaskId('')).toThrow(ValidationError);
      expect(() => validateTaskId('   ')).toThrow(ValidationError);
    });

    it('null/undefined는 ValidationError를 던진다', () => {
      expect(() => validateTaskId(null as any)).toThrow(ValidationError);
      expect(() => validateTaskId(undefined as any)).toThrow(ValidationError);
    });

    it('잘못된 형식은 ValidationError를 던진다', () => {
      // 잘못된 접두사
      expect(() => validateTaskId('TASK-01-01')).toThrow(ValidationError);
      expect(() => validateTaskId('WP-01')).toThrow(ValidationError);
      expect(() => validateTaskId('ACT-01-01')).toThrow(ValidationError);

      // 잘못된 숫자 형식
      expect(() => validateTaskId('TSK-1-1')).toThrow(ValidationError);
      expect(() => validateTaskId('TSK-001-01')).toThrow(ValidationError);
      expect(() => validateTaskId('TSK-01-001')).toThrow(ValidationError);

      // 너무 긴 형식
      expect(() => validateTaskId('TSK-01-01-01-01')).toThrow(ValidationError);

      // 특수문자/인젝션 시도 (SEC-001)
      expect(() => validateTaskId('TSK-01-01; rm -rf /')).toThrow(ValidationError);
      expect(() => validateTaskId('TSK-01-01 && cat /etc/passwd')).toThrow(ValidationError);
      expect(() => validateTaskId('../../../etc/passwd')).toThrow(ValidationError);
    });
  });

  describe('isValidTaskId', () => {
    it('유효한 Task ID에 true를 반환한다', () => {
      expect(isValidTaskId('TSK-01-01')).toBe(true);
      expect(isValidTaskId('TSK-01-01-01')).toBe(true);
    });

    it('유효하지 않은 Task ID에 false를 반환한다', () => {
      expect(isValidTaskId('')).toBe(false);
      expect(isValidTaskId('invalid')).toBe(false);
      expect(isValidTaskId('TSK-1-1')).toBe(false);
      expect(isValidTaskId(null as any)).toBe(false);
    });
  });

  describe('parseTaskId', () => {
    it('3단계 Task ID를 파싱한다', () => {
      const result = parseTaskId('TSK-01-01');
      expect(result).toEqual({
        wp: 'WP-01',
        task: 'TSK-01-01'
      });
    });

    it('4단계 Task ID를 파싱한다', () => {
      const result = parseTaskId('TSK-07-01-01');
      expect(result).toEqual({
        wp: 'WP-07',
        act: 'ACT-07-01',
        task: 'TSK-07-01-01'
      });
    });

    it('유효하지 않은 Task ID에 null을 반환한다', () => {
      expect(parseTaskId('invalid')).toBeNull();
      expect(parseTaskId('')).toBeNull();
    });
  });
});
