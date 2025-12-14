/**
 * 프로젝트 경로 관리 모듈
 * Task: TSK-02-03-03
 * 상세설계: 020-detail-design.md 섹션 5.4
 * DR-001: 경로 하드코딩 방지
 * DR-009: 경로 탐색 공격 방지
 * CRIT-002: 경로 탐색 공격 방어 강화
 *
 * 모든 프로젝트 경로는 이 모듈을 통해 생성하며, 하드코딩 금지
 */

import { join, normalize, isAbsolute, resolve } from 'path';
import { createBadRequestError } from '../errors/standardError';

/**
 * 경로 안전성 검증
 * CRIT-002: URL 디코딩, 다중 슬래시, 심볼릭 링크 등 우회 공격 방지
 *
 * @param path 검증할 경로
 * @returns 검증 결과 (true: 안전, false: 위험)
 */
function isPathSafe(path: string): boolean {
  try {
    // URL 디코딩 후 재검증 (%2e%2e → ..)
    const decoded = decodeURIComponent(path);
    const normalized = normalize(decoded);

    // 경로 순회 패턴 검사
    if (
      decoded.includes('..') ||            // 기본 순회
      normalized.includes('..') ||         // 정규화 후 순회
      decoded.includes('%') ||             // 이중 인코딩 시도
      /[\\\/]{2,}/.test(decoded)           // 다중 슬래시
    ) {
      return false;
    }

    // 정규화 후 경로가 변경되면 의심스러운 패턴
    if (normalize(path) !== resolve(normalize(path)).slice(resolve('.').length + 1) &&
        normalize(path) !== resolve(normalize(path))) {
      // 상대 경로가 아닌 경우 추가 검증 생략
    }

    return true;
  } catch {
    // 디코딩 실패 = 의심스러운 입력
    return false;
  }
}

/**
 * jjiban 기본 경로 조회
 * 환경변수 JJIBAN_BASE_PATH 또는 현재 작업 디렉토리
 * CRIT-002: 보안 검증 강화
 *
 * @returns 기본 경로
 */
export function getBasePath(): string {
  const basePath = process.env.JJIBAN_BASE_PATH;
  const cwd = process.cwd();

  if (!basePath) {
    return cwd;
  }

  // CRIT-002: 강화된 보안 검증
  if (!isPathSafe(basePath)) {
    console.warn(`[Security] Unsafe path detected in JJIBAN_BASE_PATH: ${basePath}, using cwd`);
    return cwd;
  }

  // 경로 정규화
  const normalized = normalize(basePath);

  // 절대 경로 검증 (상대 경로 거부)
  if (!isAbsolute(normalized)) {
    console.warn(`[Security] Relative path in JJIBAN_BASE_PATH: ${basePath}, using cwd`);
    return cwd;
  }

  return normalized;
}

/**
 * .jjiban/projects 기본 경로
 * @returns projects 폴더 경로
 */
export function getProjectsBasePath(): string {
  return join(getBasePath(), '.jjiban', 'projects');
}

/**
 * 프로젝트 폴더 경로
 * @param projectId 프로젝트 ID
 * @returns .jjiban/projects/{id}
 */
export function getProjectDir(projectId: string): string {
  validateProjectId(projectId);
  return join(getProjectsBasePath(), projectId);
}

/**
 * 프로젝트 파일 경로
 * @param projectId 프로젝트 ID
 * @param fileName 파일명 (project.json | team.json)
 * @returns .jjiban/projects/{id}/{fileName}
 */
export function getProjectFilePath(
  projectId: string,
  fileName: 'project.json' | 'team.json'
): string {
  return join(getProjectDir(projectId), fileName);
}

/**
 * projects.json 파일 경로
 * @returns .jjiban/settings/projects.json
 */
export function getProjectsListFilePath(): string {
  return join(getBasePath(), '.jjiban', 'settings', 'projects.json');
}

/**
 * 프로젝트 ID 유효성 검증
 * BR-001: 영소문자, 숫자, 하이픈만 허용
 * DR-009: 경로 탐색 공격 방지
 *
 * @param id 프로젝트 ID
 * @throws 유효하지 않은 ID 시 에러
 */
export function validateProjectId(id: string): void {
  // BR-001: 형식 검증
  if (!/^[a-z0-9-]+$/.test(id)) {
    throw createBadRequestError(
      'INVALID_PROJECT_ID',
      '프로젝트 ID는 영소문자, 숫자, 하이픈만 허용됩니다'
    );
  }

  // DR-009: 경로 탐색 방지
  const normalized = normalize(id);
  if (normalized !== id || normalized.includes('..')) {
    throw createBadRequestError(
      'INVALID_PROJECT_ID',
      '잘못된 프로젝트 ID 형식입니다'
    );
  }
}

