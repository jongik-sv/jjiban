/**
 * 프로젝트 목록 서비스
 * Task: TSK-02-03-03
 *
 * 리팩토링: projects.json 마스터 목록 제거
 * - projects/ 폴더를 스캔하여 프로젝트 목록 생성
 * - 각 project.json에서 정보 읽기
 * - settings.json에 defaultProject만 유지
 *
 * 장점:
 * - 테스트 병렬 실행 시 충돌 없음
 * - 각 테스트가 고유 프로젝트 폴더만 생성하면 됨
 */

import { readFile, writeFile, readdir, mkdir } from 'fs/promises';
import { join } from 'path';
import type { ProjectsConfig, ProjectListItem, ProjectConfig } from './types';
import { getProjectsBasePath, getBasePath, getProjectFilePath } from './paths';
import { createConflictError, createNotFoundError, createInternalError } from '../errors/standardError';

// ============================================================
// Settings (defaultProject만 관리)
// ============================================================

interface GlobalSettings {
  version: string;
  defaultProject: string | null;
}

const DEFAULT_SETTINGS: GlobalSettings = {
  version: '1.0',
  defaultProject: null,
};

/**
 * settings.json 파일 경로
 */
function getSettingsFilePath(): string {
  return join(getBasePath(), '.jjiban', 'settings', 'settings.json');
}

/**
 * 전역 설정 파일 읽기
 */
async function loadSettings(): Promise<GlobalSettings> {
  const filePath = getSettingsFilePath();

  try {
    const content = await readFile(filePath, 'utf-8');
    return JSON.parse(content) as GlobalSettings;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return DEFAULT_SETTINGS;
    }
    if (error instanceof SyntaxError) {
      console.warn('[Settings] Failed to parse settings.json, using defaults');
      return DEFAULT_SETTINGS;
    }
    throw error;
  }
}

/**
 * 전역 설정 파일 쓰기
 */
async function saveSettings(settings: GlobalSettings): Promise<void> {
  const filePath = getSettingsFilePath();
  const dirPath = join(getBasePath(), '.jjiban', 'settings');

  // 폴더가 없으면 생성
  await mkdir(dirPath, { recursive: true });
  await writeFile(filePath, JSON.stringify(settings, null, 2), 'utf-8');
}

// ============================================================
// 프로젝트 목록 (폴더 스캔 방식)
// ============================================================

/**
 * 프로젝트 폴더 스캔하여 목록 생성
 * projects/ 폴더의 하위 폴더를 스캔하고 각 project.json 읽기
 */
async function scanProjects(): Promise<ProjectListItem[]> {
  const projectsBasePath = getProjectsBasePath();
  const projects: ProjectListItem[] = [];

  try {
    const entries = await readdir(projectsBasePath, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const projectId = entry.name;
      const projectJsonPath = getProjectFilePath(projectId, 'project.json');

      try {
        const content = await readFile(projectJsonPath, 'utf-8');
        const projectConfig = JSON.parse(content) as ProjectConfig;

        // ProjectConfig → ProjectListItem 변환
        projects.push({
          id: projectConfig.id,
          name: projectConfig.name,
          path: projectId,  // 폴더명 = ID
          status: projectConfig.status || 'active',
          wbsDepth: projectConfig.wbsDepth || 4,
          createdAt: projectConfig.createdAt,
        });
      } catch (error) {
        // project.json이 없거나 읽기 실패 → 해당 폴더 무시
        console.warn(`[ProjectsList] Skipping ${projectId}: project.json not found or invalid`);
      }
    }
  } catch (error: unknown) {
    // projects 폴더가 없으면 빈 목록 반환
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }

  // 생성일 기준 정렬 (최신순)
  return projects.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * 프로젝트 목록 조회
 * FR-001
 */
export async function getProjectsList(
  statusFilter?: 'active' | 'archived'
): Promise<ProjectsConfig> {
  const [projects, settings] = await Promise.all([
    scanProjects(),
    loadSettings(),
  ]);

  const filteredProjects = statusFilter
    ? projects.filter(p => p.status === statusFilter)
    : projects;

  return {
    version: '1.0',
    projects: filteredProjects,
    defaultProject: settings.defaultProject,
  };
}

/**
 * 프로젝트 ID 중복 확인
 * @param id 프로젝트 ID
 * @returns 중복이면 true
 */
export async function isProjectIdDuplicate(id: string): Promise<boolean> {
  const projects = await scanProjects();
  return projects.some(p => p.id === id);
}

/**
 * 프로젝트 목록에 추가
 * 참고: 폴더 스캔 방식에서는 실제로 폴더와 project.json을 생성하면 자동으로 목록에 포함됨
 * 이 함수는 호환성을 위해 유지하되, 중복 확인만 수행
 *
 * @param project 프로젝트 항목
 */
export async function addProjectToList(project: ProjectListItem): Promise<void> {
  // 중복 확인
  const isDuplicate = await isProjectIdDuplicate(project.id);
  if (isDuplicate) {
    throw createConflictError(
      'DUPLICATE_PROJECT_ID',
      '이미 존재하는 프로젝트 ID입니다'
    );
  }

  // 실제 추가는 projectFacade에서 폴더 생성 시 수행됨
  // 이 함수는 중복 확인 역할만 함
}

/**
 * 프로젝트 목록 항목 수정
 * 참고: 폴더 스캔 방식에서는 project.json을 직접 수정하면 됨
 * 이 함수는 호환성을 위해 유지
 *
 * @param id 프로젝트 ID
 * @param updates 수정 내용
 */
export async function updateProjectInList(
  id: string,
  updates: Partial<ProjectListItem>
): Promise<void> {
  // 프로젝트 존재 확인
  const projects = await scanProjects();
  const exists = projects.some(p => p.id === id);

  if (!exists) {
    throw createNotFoundError('프로젝트를 찾을 수 없습니다');
  }

  // 실제 업데이트는 project.json에 직접 수행됨
  // 이 함수는 존재 확인 역할만 함
}

/**
 * 기본 프로젝트 설정
 * BR-005: 유효한 프로젝트 ID 검증
 * @param projectId 프로젝트 ID
 */
export async function setDefaultProject(projectId: string | null): Promise<void> {
  const settings = await loadSettings();

  // null이면 기본 프로젝트 해제
  if (projectId === null) {
    settings.defaultProject = null;
    await saveSettings(settings);
    return;
  }

  // BR-005: 유효한 프로젝트 ID 검증
  const projects = await scanProjects();
  const exists = projects.some(p => p.id === projectId);

  if (!exists) {
    throw createInternalError(
      'INVALID_PROJECT_ID',
      '존재하지 않는 프로젝트 ID입니다'
    );
  }

  settings.defaultProject = projectId;
  await saveSettings(settings);
}

// ============================================================
// 하위 호환성: projects.json 관련 함수 (deprecated)
// ============================================================

/**
 * @deprecated 폴더 스캔 방식으로 변경됨. getProjectsList() 사용 권장
 */
export async function loadProjectsList(): Promise<ProjectsConfig> {
  return getProjectsList();
}
