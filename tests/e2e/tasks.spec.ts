/**
 * Task API E2E 테스트
 * Task: TSK-03-02
 * 테스트 명세: 026-test-specification.md 섹션 4.6-4.7
 */

import { test, expect } from '@playwright/test';
import { promises as fs } from 'fs';
import { join } from 'path';

const TEST_PROJECT_ID = 'test-tasks-e2e';
const TEST_TASK_ID = 'TSK-01-01-01';
const JJIBAN_ROOT = '.jjiban';

test.describe('Task API', () => {
  test.beforeEach(async () => {
    // 설정 폴더 생성
    const settingsPath = join(JJIBAN_ROOT, 'settings');
    await fs.mkdir(settingsPath, { recursive: true });

    // projects.json 생성
    const projectsJsonPath = join(settingsPath, 'projects.json');
    await fs.writeFile(
      projectsJsonPath,
      JSON.stringify({
        projects: [{ id: TEST_PROJECT_ID }],
      }),
      'utf-8'
    );

    // 테스트 프로젝트 생성
    const projectPath = join(JJIBAN_ROOT, 'projects', TEST_PROJECT_ID);
    await fs.mkdir(projectPath, { recursive: true });

    // team.json 생성
    const teamJsonPath = join(projectPath, 'team.json');
    await fs.writeFile(
      teamJsonPath,
      JSON.stringify({
        members: [
          {
            id: 'dev-001',
            name: 'Developer 1',
            role: 'Backend Developer',
          },
        ],
      }),
      'utf-8'
    );

    // WBS 파일 생성
    const wbsPath = join(projectPath, 'wbs.md');
    const wbsContent = `# WBS - Test Project

> version: 1.0
> depth: 4
> updated: 2025-12-14
> start: 2025-12-13

---

## WP-01: Test Work Package
- status: planned

### ACT-01-01: Test Activity
- status: todo

#### ${TEST_TASK_ID}: Test Task
- category: development
- status: basic-design [bd]
- priority: critical
- assignee: dev-001
`;

    await fs.writeFile(wbsPath, wbsContent, 'utf-8');

    // Task 폴더 및 문서 생성
    const taskFolderPath = join(projectPath, 'tasks', TEST_TASK_ID);
    await fs.mkdir(taskFolderPath, { recursive: true });
    await fs.writeFile(
      join(taskFolderPath, '010-basic-design.md'),
      '# Basic Design\n\nTest content',
      'utf-8'
    );
  });

  test.afterEach(async () => {
    // 테스트 데이터 삭제
    const projectPath = join(JJIBAN_ROOT, 'projects', TEST_PROJECT_ID);
    await fs.rm(projectPath, { recursive: true, force: true });

    const settingsPath = join(JJIBAN_ROOT, 'settings');
    await fs.rm(settingsPath, { recursive: true, force: true }).catch(() => {});
  });

  test('E2E-TASK-01: GET /api/tasks/:id - Task 조회 성공', async ({ request }) => {
    // Act
    const response = await request.get(`/api/tasks/${TEST_TASK_ID}`);

    // Assert
    expect(response.status()).toBe(200);

    const task = await response.json();
    expect(task.id).toBe(TEST_TASK_ID);
    expect(task.title).toBe('Test Task');
    expect(task.category).toBe('development');
    expect(task.status).toBe('bd');
    expect(task.priority).toBe('critical');
    expect(task.documents).toBeInstanceOf(Array);
    expect(task.documents.length).toBeGreaterThan(0);
    expect(task.history).toBeInstanceOf(Array);
    expect(task.availableActions).toBeInstanceOf(Array);
    expect(task.assignee).toBeTruthy();
    expect(task.assignee.id).toBe('dev-001');
  });

  test('E2E-TASK-02: PUT /api/tasks/:id - Task 수정 및 이력 기록', async ({ request }) => {
    // Arrange: 현재 Task 조회
    let response = await request.get(`/api/tasks/${TEST_TASK_ID}`);
    const task = await response.json();
    const oldTitle = task.title;

    // Act: Task 수정
    response = await request.put(`/api/tasks/${TEST_TASK_ID}`, {
      data: { title: 'New Title', priority: 'high' },
    });

    // Assert
    expect(response.status()).toBe(200);

    const result = await response.json();
    expect(result.success).toBe(true);
    expect(result.task.title).toBe('New Title');
    expect(result.task.priority).toBe('high');

    // 재조회하여 이력 확인
    response = await request.get(`/api/tasks/${TEST_TASK_ID}`);
    const updatedTask = await response.json();

    expect(updatedTask.title).toBe('New Title');
    expect(updatedTask.history.length).toBeGreaterThan(0);
    expect(updatedTask.history[0].action).toBe('update');
    expect(updatedTask.history[0].timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);

    // 이력에 변경 내용 포함 확인
    const historyEntry = updatedTask.history[0];
    expect(historyEntry.from).toBeTruthy();
    expect(historyEntry.to).toBeTruthy();
  });

  test('E2E-TASK-03: GET /api/tasks/:id - 존재하지 않는 Task', async ({ request }) => {
    // Act
    const response = await request.get('/api/tasks/TSK-99-99-99');

    // Assert
    expect(response.status()).toBe(404);

    const error = await response.json();
    expect(error.statusMessage).toBe('PROJECT_NOT_FOUND');
  });

  test('E2E-TASK-04: PUT /api/tasks/:id - 유효성 검증 실패', async ({ request }) => {
    // Act: 유효하지 않은 priority
    const response = await request.put(`/api/tasks/${TEST_TASK_ID}`, {
      data: { priority: 'invalid' },
    });

    // Assert
    expect(response.status()).toBe(400);

    const error = await response.json();
    expect(error.statusMessage).toBe('VALIDATION_ERROR');
    expect(error.message).toContain('유효하지 않은 우선순위');
  });
});
