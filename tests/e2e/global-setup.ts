/**
 * Playwright Global Setup
 *
 * 서버 시작 전에 테스트 데이터를 준비합니다.
 * playwright.config.ts의 globalSetup에서 호출됩니다.
 */

import { mkdir, writeFile, rm } from 'fs/promises';
import { join } from 'path';

export const TEST_BASE = join(process.cwd(), 'tests', 'fixtures', 'projects-e2e');

async function globalSetup() {
  console.log('[Global Setup] Preparing E2E test data...');

  // 기존 테스트 데이터 정리
  try {
    await rm(TEST_BASE, { recursive: true, force: true });
  } catch {
    // 폴더가 없으면 무시
  }

  // 테스트 폴더 구조 생성
  await mkdir(join(TEST_BASE, '.jjiban', 'settings'), { recursive: true });
  await mkdir(join(TEST_BASE, '.jjiban', 'projects', 'test-project'), { recursive: true });

  // 초기 프로젝트 목록 설정
  const projectsConfig = {
    version: '1.0',
    projects: [
      {
        id: 'test-project',
        name: '테스트 프로젝트',
        path: 'test-project',
        status: 'active',
        wbsDepth: 4,
        createdAt: '2025-12-14T00:00:00.000Z',
      },
    ],
    defaultProject: 'test-project',
  };

  await writeFile(
    join(TEST_BASE, '.jjiban', 'settings', 'projects.json'),
    JSON.stringify(projectsConfig, null, 2),
    'utf-8'
  );

  // project.json 생성
  const projectConfig = {
    id: 'test-project',
    name: '테스트 프로젝트',
    description: 'E2E 테스트용 프로젝트',
    version: '0.1.0',
    status: 'active',
    createdAt: '2025-12-14T00:00:00.000Z',
    updatedAt: '2025-12-14T00:00:00.000Z',
    scheduledStart: '2025-01-01',
    scheduledEnd: '2025-12-31',
  };

  await writeFile(
    join(TEST_BASE, '.jjiban', 'projects', 'test-project', 'project.json'),
    JSON.stringify(projectConfig, null, 2),
    'utf-8'
  );

  // team.json 생성
  const teamConfig = {
    version: '1.0',
    members: [
      {
        id: 'hong',
        name: '홍길동',
        email: 'hong@test.com',
        role: 'Developer',
        active: true,
      },
    ],
  };

  await writeFile(
    join(TEST_BASE, '.jjiban', 'projects', 'test-project', 'team.json'),
    JSON.stringify(teamConfig, null, 2),
    'utf-8'
  );

  console.log('[Global Setup] E2E test data prepared at:', TEST_BASE);
}

export default globalSetup;
