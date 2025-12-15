/**
 * Playwright Global Setup
 *
 * 서버 시작 전에 테스트 데이터를 준비합니다.
 * playwright.config.ts의 globalSetup에서 호출됩니다.
 *
 * 주요 변경사항:
 * - 실제 .jjiban 폴더 대신 임시 디렉토리 사용
 * - 테스트 간 격리 보장
 * - 프로덕션 데이터 보호
 */

import { mkdir, writeFile, rm } from 'fs/promises';
import { join } from 'path';
import { E2E_TEST_ROOT, TEST_PROJECT_ID, TEST_PROJECT_NAME } from './test-constants';

async function globalSetup() {
  console.log('[Global Setup] Preparing E2E test environment...');

  // 기존 테스트 디렉토리가 있으면 삭제 (이전 테스트 잔여물 정리)
  try {
    await rm(E2E_TEST_ROOT, { recursive: true, force: true });
  } catch {
    // 폴더가 없으면 무시
  }

  const jjibanRoot = join(E2E_TEST_ROOT, '.jjiban');

  console.log('[Global Setup] Test root directory:', E2E_TEST_ROOT);

  // 테스트 프로젝트 폴더 생성
  const projectPath = join(jjibanRoot, 'projects', TEST_PROJECT_ID);
  await mkdir(projectPath, { recursive: true });

  // Task 폴더 생성
  const taskPath = join(projectPath, 'tasks', 'TSK-01-01-01');
  await mkdir(taskPath, { recursive: true });

  // project.json 생성 (폴더 스캔 방식이므로 projects.json 불필요)
  const projectConfig = {
    id: TEST_PROJECT_ID,
    name: TEST_PROJECT_NAME,
    description: 'E2E 테스트용 프로젝트',
    version: '0.1.0',
    status: 'active',
    wbsDepth: 4,  // 폴더 스캔 시 필요
    createdAt: '2025-12-14T00:00:00.000Z',
    updatedAt: '2025-12-14T00:00:00.000Z',
    scheduledStart: '2025-01-01',
    scheduledEnd: '2025-12-31',
  };

  await writeFile(
    join(projectPath, 'project.json'),
    JSON.stringify(projectConfig, null, 2),
    'utf-8'
  );

  // team.json 생성
  const teamConfig = {
    version: '1.0',
    members: [
      {
        id: 'dev-001',
        name: 'Developer 1',
        email: 'dev1@test.com',
        role: 'Backend Developer',
        active: true,
      },
    ],
  };

  await writeFile(
    join(projectPath, 'team.json'),
    JSON.stringify(teamConfig, null, 2),
    'utf-8'
  );

  // wbs.md 생성 (상태 코드 형식: [bd] - 대괄호만 사용)
  const wbsContent = `# WBS - ${TEST_PROJECT_NAME}

> version: 1.0
> depth: 4
> updated: 2025-12-14
> start: 2025-12-13

---

## WP-01: Test Work Package
- status: planned
- priority: high

### ACT-01-01: Test Activity
- status: todo

#### TSK-01-01-01: Test Task
- category: development
- status: [bd]
- priority: critical
- assignee: dev-001
`;

  await writeFile(join(projectPath, 'wbs.md'), wbsContent, 'utf-8');

  // Task 문서 생성
  await writeFile(
    join(taskPath, '010-basic-design.md'),
    '# Basic Design\n\nTest content',
    'utf-8'
  );

  console.log('[Global Setup] E2E test data prepared at:', jjibanRoot);
  console.log('[Global Setup] Environment ready. JJIBAN_BASE_PATH:', E2E_TEST_ROOT);
}

export default globalSetup;
