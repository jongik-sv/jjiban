import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { JJIBAN_PATHS, SETTINGS_FILES } from '../../types';

const JJIBAN_ROOT = '.jjiban';

// 커스텀 에러 타입
export class FileNotFoundError extends Error {
  constructor(filePath: string) {
    super(`File not found: ${filePath}`);
    this.name = 'FileNotFoundError';
  }
}

export class FileWriteError extends Error {
  constructor(filePath: string, cause?: Error) {
    super(`Failed to write file: ${filePath}`);
    this.name = 'FileWriteError';
    this.cause = cause;
  }
}

export class JsonParseError extends Error {
  constructor(filePath: string, cause?: Error) {
    super(`Failed to parse JSON: ${filePath}`);
    this.name = 'JsonParseError';
    this.cause = cause;
  }
}

/**
 * JSON 파일 읽기
 */
export async function readJsonFile<T>(path: string): Promise<T | null> {
  try {
    const content = await fs.readFile(path, 'utf-8');
    return JSON.parse(content) as T;
  } catch (error) {
    console.error(`Failed to read JSON file: ${path}`, error);
    return null;
  }
}

/**
 * JSON 파일 쓰기
 */
export async function writeJsonFile<T>(path: string, data: T): Promise<boolean> {
  try {
    await ensureDir(dirname(path));
    await fs.writeFile(path, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error(`Failed to write JSON file: ${path}`, error);
    return false;
  }
}

/**
 * Markdown 파일 읽기
 */
export async function readMarkdownFile(path: string): Promise<string | null> {
  try {
    return await fs.readFile(path, 'utf-8');
  } catch (error) {
    console.error(`Failed to read Markdown file: ${path}`, error);
    return null;
  }
}

/**
 * Markdown 파일 쓰기
 */
export async function writeMarkdownFile(path: string, content: string): Promise<boolean> {
  try {
    await ensureDir(dirname(path));
    await fs.writeFile(path, content, 'utf-8');
    return true;
  } catch (error) {
    console.error(`Failed to write Markdown file: ${path}`, error);
    return false;
  }
}

/**
 * 파일 존재 확인
 */
export async function fileExists(path: string): Promise<boolean> {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * 디렉토리 존재 확인
 */
export async function dirExists(path: string): Promise<boolean> {
  try {
    const stat = await fs.stat(path);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

/**
 * 디렉토리 생성 (재귀)
 */
export async function ensureDir(path: string): Promise<boolean> {
  try {
    await fs.mkdir(path, { recursive: true });
    return true;
  } catch (error) {
    console.error(`Failed to create directory: ${path}`, error);
    return false;
  }
}

/**
 * 디렉토리 내 파일 목록 조회
 */
export async function listFiles(dirPath: string, extension?: string): Promise<string[]> {
  try {
    const files = await fs.readdir(dirPath);
    if (extension) {
      return files.filter(f => f.endsWith(extension));
    }
    return files;
  } catch {
    return [];
  }
}

/**
 * 디렉토리 내 하위 디렉토리 목록 조회
 */
export async function listDirs(dirPath: string): Promise<string[]> {
  try {
    const items = await fs.readdir(dirPath, { withFileTypes: true });
    return items.filter(item => item.isDirectory()).map(item => item.name);
  } catch {
    return [];
  }
}

/**
 * jjiban 루트 경로 반환
 */
export function getJjibanRoot(): string {
  return JJIBAN_ROOT;
}

/**
 * 설정 폴더 경로
 */
export function getSettingsPath(): string {
  return join(JJIBAN_ROOT, 'settings');
}

/**
 * 프로젝트 목록 경로
 */
export function getProjectsPath(): string {
  return join(JJIBAN_ROOT, 'projects');
}

/**
 * 특정 프로젝트 경로
 */
export function getProjectPath(projectId: string): string {
  return join(JJIBAN_ROOT, 'projects', projectId);
}

/**
 * 프로젝트 WBS 파일 경로
 */
export function getWbsPath(projectId: string): string {
  return join(getProjectPath(projectId), 'wbs.md');
}

/**
 * 프로젝트 메타데이터 파일 경로
 */
export function getProjectJsonPath(projectId: string): string {
  return join(getProjectPath(projectId), 'project.json');
}

/**
 * 프로젝트 팀 파일 경로
 */
export function getTeamJsonPath(projectId: string): string {
  return join(getProjectPath(projectId), 'team.json');
}

/**
 * Task 문서 폴더 경로
 */
export function getTaskFolderPath(projectId: string, taskId: string): string {
  return join(getProjectPath(projectId), 'tasks', taskId);
}

/**
 * Task 문서 파일 경로
 */
export function getTaskDocPath(projectId: string, taskId: string, docName: string): string {
  return join(getTaskFolderPath(projectId, taskId), docName);
}

/**
 * 설정 파일 경로
 */
export function getSettingFilePath(settingType: string): string {
  return join(getSettingsPath(), `${settingType}.json`);
}

/**
 * 템플릿 폴더 경로
 */
export function getTemplatesPath(): string {
  return join(JJIBAN_ROOT, 'templates');
}

/**
 * .jjiban 기본 디렉토리 구조 생성 (멱등성 보장)
 * - settings/, templates/, projects/ 폴더 생성
 * - 이미 존재하는 폴더는 건너뜀
 */
export async function ensureJjibanStructure(): Promise<{ success: boolean; created: string[]; errors: string[] }> {
  const created: string[] = [];
  const errors: string[] = [];

  const directories = [
    JJIBAN_PATHS.ROOT,
    JJIBAN_PATHS.SETTINGS,
    JJIBAN_PATHS.TEMPLATES,
    JJIBAN_PATHS.PROJECTS,
  ];

  for (const dir of directories) {
    try {
      const exists = await dirExists(dir);
      if (!exists) {
        await fs.mkdir(dir, { recursive: true });
        created.push(dir);
      }
    } catch (error) {
      errors.push(`${dir}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return {
    success: errors.length === 0,
    created,
    errors,
  };
}

/**
 * 프로젝트 디렉토리 구조 생성
 * - projects/{projectId}/ 폴더 생성
 * - tasks/ 하위 폴더 생성
 */
export async function ensureProjectStructure(projectId: string): Promise<{ success: boolean; created: string[]; errors: string[] }> {
  const created: string[] = [];
  const errors: string[] = [];

  const projectPath = getProjectPath(projectId);
  const tasksPath = join(projectPath, 'tasks');

  const directories = [projectPath, tasksPath];

  for (const dir of directories) {
    try {
      const exists = await dirExists(dir);
      if (!exists) {
        await fs.mkdir(dir, { recursive: true });
        created.push(dir);
      }
    } catch (error) {
      errors.push(`${dir}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return {
    success: errors.length === 0,
    created,
    errors,
  };
}

/**
 * .jjiban 구조 상태 확인
 */
export async function checkJjibanStructure(): Promise<{
  root: boolean;
  settings: boolean;
  templates: boolean;
  projects: boolean;
}> {
  return {
    root: await dirExists(JJIBAN_PATHS.ROOT),
    settings: await dirExists(JJIBAN_PATHS.SETTINGS),
    templates: await dirExists(JJIBAN_PATHS.TEMPLATES),
    projects: await dirExists(JJIBAN_PATHS.PROJECTS),
  };
}
