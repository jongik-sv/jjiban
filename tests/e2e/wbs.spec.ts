/**
 * WBS API E2E 테스트
 * Task: TSK-03-02
 * 테스트 명세: 026-test-specification.md 섹션 4.1-4.5
 */

import { test, expect } from '@playwright/test';
import { promises as fs } from 'fs';
import { join } from 'path';

const TEST_PROJECT_ID = 'test-wbs-e2e';
const JJIBAN_ROOT = '.jjiban';

test.describe('WBS API', () => {
  test.beforeEach(async () => {
    // 테스트 프로젝트 생성
    const projectPath = join(JJIBAN_ROOT, 'projects', TEST_PROJECT_ID);
    await fs.mkdir(projectPath, { recursive: true });

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
- priority: high

### ACT-01-01: Test Activity
- status: todo

#### TSK-01-01-01: Test Task
- category: development
- status: basic-design [bd]
- priority: critical
`;

    await fs.writeFile(wbsPath, wbsContent, 'utf-8');
  });

  test.afterEach(async () => {
    // 테스트 프로젝트 삭제
    const projectPath = join(JJIBAN_ROOT, 'projects', TEST_PROJECT_ID);
    await fs.rm(projectPath, { recursive: true, force: true });
  });

  test('E2E-WBS-01: GET /api/projects/:id/wbs - WBS 조회 성공', async ({ request }) => {
    // Act
    const response = await request.get(`/api/projects/${TEST_PROJECT_ID}/wbs`);

    // Assert
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.metadata.version).toBe('1.0');
    expect(data.metadata.depth).toBe(4);
    expect(data.tree).toBeInstanceOf(Array);
    expect(data.tree.length).toBeGreaterThan(0);
  });

  test('E2E-WBS-02-01: PUT /api/projects/:id/wbs - WBS 저장 성공', async ({ request }) => {
    // Arrange: 현재 WBS 조회
    let response = await request.get(`/api/projects/${TEST_PROJECT_ID}/wbs`);
    const data = await response.json();

    // 수정
    data.tree[0].title = 'Modified Work Package';

    // Act: 저장
    response = await request.put(`/api/projects/${TEST_PROJECT_ID}/wbs`, { data });

    // Assert
    expect(response.status()).toBe(200);

    const result = await response.json();
    expect(result.success).toBe(true);
    expect(result.updated).toBeTruthy();

    // 재조회하여 변경 확인
    response = await request.get(`/api/projects/${TEST_PROJECT_ID}/wbs`);
    const savedData = await response.json();
    expect(savedData.tree[0].title).toBe('Modified Work Package');
  });

  test('E2E-WBS-02-02: PUT /api/projects/:id/wbs - 동시성 충돌', async ({ request }) => {
    // Arrange: 현재 WBS 조회
    let response = await request.get(`/api/projects/${TEST_PROJECT_ID}/wbs`);
    const data = await response.json();

    // 과거 날짜로 변경
    data.metadata.updated = '2025-12-01';

    // Act: 저장 시도
    response = await request.put(`/api/projects/${TEST_PROJECT_ID}/wbs`, { data });

    // Assert
    expect(response.status()).toBe(409);

    const error = await response.json();
    expect(error.statusMessage).toBe('CONFLICT_ERROR');
  });

  test('E2E-WBS-04: PUT /api/projects/:id/wbs - 중복 ID 유효성 검증 실패', async ({ request }) => {
    // Arrange: 현재 WBS 조회
    let response = await request.get(`/api/projects/${TEST_PROJECT_ID}/wbs`);
    const data = await response.json();

    // 중복 ID 추가
    data.tree[0].children.push({
      id: 'TSK-01-01-01', // 이미 존재하는 ID
      type: 'task',
      title: 'Duplicate Task',
      category: 'development',
      children: [],
    });

    // Act: 저장 시도
    response = await request.put(`/api/projects/${TEST_PROJECT_ID}/wbs`, { data });

    // Assert
    expect(response.status()).toBe(400);

    const error = await response.json();
    expect(error.statusMessage).toBe('VALIDATION_ERROR');
    expect(error.message).toContain('유효하지 않습니다');
  });

  test('E2E-WBS-05: PUT → GET - 데이터 무결성', async ({ request }) => {
    // Arrange: 복잡한 WBS 트리 생성
    const complexTree = {
      metadata: {
        version: '1.0',
        depth: 4,
        updated: '2025-12-14',
        start: '2025-12-13',
      },
      tree: [
        {
          id: 'WP-01',
          type: 'wp',
          title: 'Work Package 1',
          priority: 'high',
          schedule: { start: '2025-12-13', end: '2025-12-20' },
          children: [
            {
              id: 'ACT-01-01',
              type: 'act',
              title: 'Activity 1',
              children: [
                {
                  id: 'TSK-01-01-01',
                  type: 'task',
                  title: 'Task 1',
                  category: 'development',
                  status: '[bd]',
                  priority: 'critical',
                  tags: ['test', 'unit'],
                  requirements: ['REQ-001', 'REQ-002'],
                  children: [],
                },
              ],
            },
          ],
        },
      ],
    };

    // Act: 저장
    let response = await request.put(`/api/projects/${TEST_PROJECT_ID}/wbs`, {
      data: complexTree,
    });
    expect(response.status()).toBe(200);

    // 재조회
    response = await request.get(`/api/projects/${TEST_PROJECT_ID}/wbs`);
    const savedData = await response.json();

    // Assert: 데이터 무결성 확인
    expect(savedData.tree[0].id).toBe('WP-01');
    expect(savedData.tree[0].title).toBe('Work Package 1');
    expect(savedData.tree[0].priority).toBe('high');
    expect(savedData.tree[0].schedule).toEqual({ start: '2025-12-13', end: '2025-12-20' });

    const task = savedData.tree[0].children[0].children[0];
    expect(task.id).toBe('TSK-01-01-01');
    expect(task.category).toBe('development');
    expect(task.tags).toEqual(['test', 'unit']);
    expect(task.requirements).toEqual(['REQ-001', 'REQ-002']);
  });
});
