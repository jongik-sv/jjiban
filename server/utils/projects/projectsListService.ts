/**
 * 프로젝트 목록 서비스
 * Task: TSK-02-03-03
 * 상세설계: 020-detail-design.md 섹션 5.1
 *
 * 전역 프로젝트 목록 관리 (projects.json)
 */

import { readFile, writeFile } from 'fs/promises';
import type { ProjectsConfig, ProjectListItem } from './types';
import { getProjectsListFilePath } from './paths';
import { createInternalError, createConflictError, createNotFoundError } from '../errors/standardError';

/**
 * 기본 ProjectsConfig
 */
const DEFAULT_PROJECTS_CONFIG: ProjectsConfig = {
  version: '1.0',
  projects: [],
  defaultProject: null,
};

/**
 * 프로젝트 목록 파일 읽기
 * BR-001: 파일 없으면 기본값 사용
 */
async function loadProjectsList(): Promise<ProjectsConfig> {
  const filePath = getProjectsListFilePath();

  try {
    const content = await readFile(filePath, 'utf-8');
    return JSON.parse(content) as ProjectsConfig;
  } catch (error: unknown) {
    // CR-002: 타입 가드를 사용한 안전한 에러 핸들링
    // 파일 없음 - 기본값 사용
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return DEFAULT_PROJECTS_CONFIG;
    }

    // JSON 파싱 오류
    if (error instanceof SyntaxError) {
      console.warn(`[ProjectsList] Failed to parse projects.json, using defaults`);
      return DEFAULT_PROJECTS_CONFIG;
    }

    // 기타 오류
    throw createInternalError(
      'FILE_READ_ERROR',
      '프로젝트 목록을 읽는 중 오류가 발생했습니다'
    );
  }
}

/**
 * 프로젝트 목록 파일 쓰기
 */
async function saveProjectsList(config: ProjectsConfig): Promise<void> {
  const filePath = getProjectsListFilePath();

  try {
    await writeFile(filePath, JSON.stringify(config, null, 2), 'utf-8');
  } catch (error) {
    throw createInternalError(
      'FILE_WRITE_ERROR',
      '프로젝트 목록을 저장하는 중 오류가 발생했습니다'
    );
  }
}

/**
 * 프로젝트 목록 조회
 * FR-001
 */
export async function getProjectsList(
  statusFilter?: 'active' | 'archived'
): Promise<ProjectsConfig> {
  const config = await loadProjectsList();

  if (statusFilter) {
    return {
      ...config,
      projects: config.projects.filter(p => p.status === statusFilter),
    };
  }

  return config;
}

/**
 * 프로젝트 ID 중복 확인
 * @param id 프로젝트 ID
 * @returns 중복이면 true
 */
export async function isProjectIdDuplicate(id: string): Promise<boolean> {
  const config = await loadProjectsList();
  return config.projects.some(p => p.id === id);
}

/**
 * 프로젝트 목록에 추가
 * @param project 프로젝트 항목
 */
export async function addProjectToList(project: ProjectListItem): Promise<void> {
  const config = await loadProjectsList();

  // 중복 확인
  if (config.projects.some(p => p.id === project.id)) {
    throw createConflictError(
      'DUPLICATE_PROJECT_ID',
      '이미 존재하는 프로젝트 ID입니다'
    );
  }

  config.projects.push(project);
  await saveProjectsList(config);
}

/**
 * 프로젝트 목록 항목 수정
 * @param id 프로젝트 ID
 * @param updates 수정 내용
 */
export async function updateProjectInList(
  id: string,
  updates: Partial<ProjectListItem>
): Promise<void> {
  const config = await loadProjectsList();

  const index = config.projects.findIndex(p => p.id === id);
  if (index === -1) {
    // CR-007: PROJECT_NOT_FOUND는 404 에러로 변경
    throw createNotFoundError('프로젝트를 찾을 수 없습니다');
  }

  config.projects[index] = { ...config.projects[index], ...updates };
  await saveProjectsList(config);
}

/**
 * 기본 프로젝트 설정
 * BR-005: 유효한 프로젝트 ID 검증
 * @param projectId 프로젝트 ID
 */
export async function setDefaultProject(projectId: string | null): Promise<void> {
  const config = await loadProjectsList();

  // null이면 기본 프로젝트 해제
  if (projectId === null) {
    config.defaultProject = null;
    await saveProjectsList(config);
    return;
  }

  // BR-005: 유효한 프로젝트 ID 검증
  const exists = config.projects.some(p => p.id === projectId);
  if (!exists) {
    throw createInternalError(
      'INVALID_PROJECT_ID',
      '존재하지 않는 프로젝트 ID입니다'
    );
  }

  config.defaultProject = projectId;
  await saveProjectsList(config);
}
