/**
 * Playwright Global Setup
 *
 * 서버 시작 전에 테스트 데이터를 준비합니다.
 * playwright.config.ts의 globalSetup에서 호출됩니다.
 */

import { mkdir, writeFile, rm, access } from 'fs/promises';
import { join } from 'path';

const JJIBAN_ROOT = join(process.cwd(), '.jjiban');
const TEST_PROJECT_ID = 'project';

async function globalSetup() {
  console.log('[Global Setup] Preparing E2E test data...');

  // settings 폴더 생성
  const settingsPath = join(JJIBAN_ROOT, 'settings');
  await mkdir(settingsPath, { recursive: true });

  // 테스트 프로젝트 폴더 생성
  const projectPath = join(JJIBAN_ROOT, 'projects', TEST_PROJECT_ID);
  await mkdir(projectPath, { recursive: true });

  // Task 폴더 생성
  const taskPath = join(projectPath, 'tasks', 'TSK-01-01-01');
  await mkdir(taskPath, { recursive: true });

  // projects.json 생성
  const projectsConfig = {
    version: '1.0',
    projects: [
      {
        id: TEST_PROJECT_ID,
        name: '테스트 프로젝트',
        path: TEST_PROJECT_ID,
        status: 'active',
        wbsDepth: 4,
        createdAt: '2025-12-14T00:00:00.000Z',
      },
    ],
    defaultProject: TEST_PROJECT_ID,
  };

  await writeFile(
    join(settingsPath, 'projects.json'),
    JSON.stringify(projectsConfig, null, 2),
    'utf-8'
  );

  // project.json 생성
  const projectConfig = {
    id: TEST_PROJECT_ID,
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

  // wbs.md 생성
  const wbsContent = `# WBS - Test Project

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
- status: basic-design [bd]
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

  console.log('[Global Setup] E2E test data prepared at:', projectPath);
}

export default globalSetup;
