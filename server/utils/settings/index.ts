/**
 * 설정 서비스 모듈
 * Task: TSK-02-03-01, TSK-02-03-02
 *
 * 설정 파일 로드, 캐싱, 조회 기능을 제공합니다.
 */

import type {
  Settings,
  SettingsFileType,
  ColumnsConfig,
  CategoriesConfig,
  WorkflowsConfig,
  ActionsConfig,
} from '../../../types/settings';
import { SETTINGS_FILE_NAMES } from '../../../types/settings';
import { loadSettings as loadSettingsFromCache, refreshCache } from './_cache';

// Re-export cache functions for testing
export { refreshCache };

// ============================================================
// 서비스 함수
// ============================================================

/**
 * 전체 설정 로드 (캐시 사용)
 * Note: cache.ts의 loadSettings와 중복 방지를 위해 getSettings로 노출
 * @returns Promise<Settings>
 */
export async function getSettings(): Promise<Settings> {
  return loadSettingsFromCache();
}

/**
 * 칸반 컬럼 설정 조회
 * @returns Promise<ColumnsConfig>
 */
export async function getColumns(): Promise<ColumnsConfig> {
  const settings = await getSettings();
  return settings.columns;
}

/**
 * 카테고리 설정 조회
 * @returns Promise<CategoriesConfig>
 */
export async function getCategories(): Promise<CategoriesConfig> {
  const settings = await getSettings();
  return settings.categories;
}

/**
 * 워크플로우 설정 조회
 * @returns Promise<WorkflowsConfig>
 */
export async function getWorkflows(): Promise<WorkflowsConfig> {
  const settings = await getSettings();
  return settings.workflows;
}

/**
 * 액션 설정 조회
 * @returns Promise<ActionsConfig>
 */
export async function getActions(): Promise<ActionsConfig> {
  const settings = await getSettings();
  return settings.actions;
}

/**
 * 타입별 설정 조회
 * @param type 설정 파일 타입
 * @returns 해당 타입의 설정
 */
export async function getSettingsByType(
  type: SettingsFileType
): Promise<ColumnsConfig | CategoriesConfig | WorkflowsConfig | ActionsConfig> {
  const settings = await getSettings();
  return settings[type];
}

/**
 * 설정 타입 유효성 검사
 * BR-004: 설정 타입은 4가지로 제한
 * ISS-CR-006: SETTINGS_FILE_NAMES와 동기화하여 Magic Number 제거
 * @param type 검사할 타입 문자열
 * @returns 유효한 SettingsFileType이면 true
 */
export function isValidSettingsType(type: string): type is SettingsFileType {
  return type in SETTINGS_FILE_NAMES;
}
