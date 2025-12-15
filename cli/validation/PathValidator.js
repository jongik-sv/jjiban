/**
 * 경로 검증기
 * Task: TSK-07-01
 * 보안: SEC-002 (경로 순회 방지)
 */

import { resolve, normalize } from 'path';
import { ValidationError } from '../errors/JjibanError.js';

/**
 * 경로가 허용된 기본 디렉토리 내부인지 검증
 * @param {string} targetPath - 검증할 경로
 * @param {string} baseDir - 허용된 기본 디렉토리
 * @returns {string} 검증된 절대 경로
 * @throws {ValidationError} 기본 디렉토리 외부 경로인 경우
 */
export function validatePath(targetPath, baseDir) {
  if (!targetPath || typeof targetPath !== 'string') {
    throw new ValidationError('path', '경로는 필수입니다');
  }

  if (!baseDir || typeof baseDir !== 'string') {
    throw new ValidationError('baseDir', '기본 디렉토리는 필수입니다');
  }

  // 절대 경로로 변환
  const resolvedBase = resolve(baseDir);
  const resolvedTarget = resolve(baseDir, normalize(targetPath));

  // 기본 디렉토리 내부인지 확인
  if (!resolvedTarget.startsWith(resolvedBase)) {
    throw new ValidationError(
      'path',
      `경로가 허용된 디렉토리 외부입니다: ${targetPath}`
    );
  }

  return resolvedTarget;
}

/**
 * .jjiban 디렉토리 내부 경로인지 검증
 * @param {string} targetPath - 검증할 경로
 * @param {string} projectRoot - 프로젝트 루트 디렉토리
 * @returns {string} 검증된 절대 경로
 * @throws {ValidationError} .jjiban 외부 경로인 경우
 */
export function validateJjibanPath(targetPath, projectRoot) {
  const jjibanDir = resolve(projectRoot, '.jjiban');
  return validatePath(targetPath, jjibanDir);
}

/**
 * 경로가 안전한지 테스트 (예외 없이 boolean 반환)
 * @param {string} targetPath - 검증할 경로
 * @param {string} baseDir - 허용된 기본 디렉토리
 * @returns {boolean} 안전 여부
 */
export function isPathSafe(targetPath, baseDir) {
  try {
    validatePath(targetPath, baseDir);
    return true;
  } catch {
    return false;
  }
}
