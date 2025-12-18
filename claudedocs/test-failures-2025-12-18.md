# 테스트 실패 결과 보고서

**날짜**: 2025-12-18
**테스트 명령**: `npm run test`
**최종 업데이트**: 수정 완료 후

---

## 요약

| 구분 | 수량 |
|------|------|
| 총 테스트 파일 | 55개 |
| 실패 파일 | 9개 |
| 통과 파일 | 46개 |
| 총 테스트 케이스 | 893개 |
| 실패 케이스 | 21개 |
| 통과 케이스 | 872개 |

---

## 수정 완료된 테스트 (이전 112개 실패 → 0개)

| 파일 | 이전 실패 | 현재 상태 | 수정 내용 |
|------|----------|---------|----------|
| TaskWorkflow.test.ts | 14개 | ✅ 17 passed | `useWorkflowConfig` stubGlobal mock 추가 |
| useDependencyGraph.test.ts | 21개 | ✅ 33 passed | store composable mock 추가 |
| AppLayout.test.ts | 30개 | ✅ 28 passed | Flex 레이아웃 기반으로 전면 재작성 |
| StatusBadge.test.ts | 6개 | ✅ 8 passed | 영어→한국어 라벨 수정 |
| useGanttDependencies.test.ts | 4개 | ✅ 35 passed | mock 추가 + 구현체 버그 수정 |
| TaskDocuments.test.ts | ~10개 | ✅ 18 passed | DataTable 기반으로 전면 재작성 |
| WpActChildren.test.ts | 3개 | ✅ 22 passed | Badge→StatusBadge 컴포넌트 변경 |

### 구현체 버그 수정
- `useGanttDependencies.ts:169`: `coords.length < 6` → `coords.length < 5` (path 좌표 개수 오류)

---

## 현재 실패 중인 테스트 (21개)

### 1. terminal-packages.test.ts

**파일**: `tests/setup/terminal-packages.test.ts`
**원인**: 터미널 패키지 설정 관련

---

### 2. workflowSteps.test.ts

**파일**: `tests/unit/cli/config/workflowSteps.test.ts`
**원인**: workflow 설정 변경으로 인한 불일치

---

### 3. WorkflowPlanner.test.ts

**파일**: `tests/unit/cli/core/WorkflowPlanner.test.ts`
**원인**: workflow 플래너 로직 변경

---

### 4. [filename].test.ts

**파일**: `tests/unit/server/api/tasks/[id]/documents/[filename].test.ts`
**원인**: API 문서 처리 로직 변경

---

### 5. api-integration.test.ts (2 failures)

**파일**: `tests/utils/projects/api-integration.test.ts`

| 테스트 | 문제 |
|--------|------|
| E2E-003: Project Creation Flow | 프로젝트 생성 플로우 실패 |
| Error Handling: empty project list | 빈 프로젝트 목록 처리 실패 |

---

### 6. paths.test.ts (5 failures)

**파일**: `tests/utils/projects/paths.test.ts`

| 테스트 | 문제 |
|--------|------|
| getProjectDir - uppercase | 대문자 프로젝트 ID 검증 |
| getProjectDir - special characters | 특수문자 프로젝트 ID 검증 |
| validateProjectId - uppercase | 대문자 거부 검증 |
| validateProjectId - special characters | 특수문자 거부 검증 |
| validateProjectId - path with slashes | 슬래시 경로 거부 검증 |

**원인**: 프로젝트 ID 검증 규칙이 완화되었거나 변경됨

---

### 7. integration.test.ts

**파일**: `tests/utils/wbs/integration.test.ts`

| 테스트 | 문제 |
|--------|------|
| Scenario 1: Parse Real WBS File | WP 파싱 실패 |

---

### 8. parser.test.ts (3 failures)

**파일**: `tests/utils/wbs/parser.test.ts`

| 테스트 | 문제 |
|--------|------|
| TC-002-007: depends attribute | depends 속성 파싱 |
| TC-002-014: multiple depends | 다중 depends 파싱 |
| TC-002-015: all attributes together | 전체 속성 파싱 |

**원인**: depends 속성 파싱 로직 변경

---

### 9. taskService.test.ts (4 failures)

**파일**: `tests/utils/wbs/taskService.test.ts`

| 테스트 | 문제 |
|--------|------|
| UT-TASK-01-01: 존재하는 Task ID | TaskDetail 반환 실패 |
| UT-TASK-01-03: history 배열 포함 | history 배열 누락 |
| UT-TASK-03-01: Task 수정 시 이력 기록 | 이력 기록 실패 |
| UT-TASK-03-03: timestamp ISO 8601 형식 | timestamp 형식 불일치 |

---

### 10. stateMapper.test.ts (2 failures)

**파일**: `tests/utils/workflow/stateMapper.test.ts`

| 테스트 | 문제 |
|--------|------|
| getAllStateMappings - infrastructure | infrastructure 상태 매핑 |
| round-trip: statusCode -> name -> statusCode | infrastructure 왕복 변환 |

**원인**: infrastructure 카테고리의 상태 매핑 변경

---

### 11. transitionService.test.ts (4 failures)

**파일**: `tests/utils/workflow/transitionService.test.ts`

| 테스트 | 기대값 | 실제값 |
|--------|--------|--------|
| TC-001: development [ ] → [bd] | valid=true | valid=false |
| TC-004-1: development [ ] → [start] | ['start'] | [] |
| TC-005-1: defect [ ] → [start] | ['start'] | [] |
| TC-006-1: infrastructure [ ] → [start, skip] | length > 0 | length = 0 |

**원인**: workflow 전환 규칙이 변경됨 (유연한 워크플로우 적용)

---

## 심각도별 분류

| 심각도 | 파일 수 | 테스트 수 | 설명 |
|--------|---------|----------|------|
| 🟡 High | 3 | 10 | workflow 서비스 관련 (transitionService, stateMapper, WorkflowPlanner) |
| 🟢 Medium | 4 | 8 | 데이터 파싱/검증 (parser, taskService, paths, integration) |
| ⚪ Low | 2 | 3 | 설정/API 관련 (terminal-packages, api-integration, documents) |

---

## 권장 조치

### 🟡 Workflow 관련 (우선순위 높음)

최근 "유연한 워크플로우" 변경사항이 적용되어 테스트 기대값과 실제 동작이 불일치합니다.

1. **transitionService.test.ts** - 전환 규칙 테스트 업데이트 필요
   - `workflows.json` 설정 확인
   - 새로운 전환 규칙에 맞게 테스트 수정

2. **stateMapper.test.ts** - infrastructure 상태 매핑 확인
   - infrastructure 카테고리의 상태 코드 매핑 검토

3. **WorkflowPlanner.test.ts** - 플래너 로직 동기화
   - 새로운 workflow 규칙 반영

### 🟢 데이터 관련 (일반 우선순위)

4. **parser.test.ts** - depends 속성 파싱 로직 확인
   - WBS 파싱 규칙 변경 여부 확인

5. **paths.test.ts** - 프로젝트 ID 검증 규칙 확인
   - 한글 프로젝트 ID 지원으로 규칙 완화 여부 확인

6. **taskService.test.ts** - Task 서비스 로직 검토
   - history 기능 구현 상태 확인

---

## 참고: Git 상태

현재 수정된 파일들:
```
M .jjiban/docs/jjiban/jjiban-prd.md
M .jjiban/projects/jjiban/prd.md
M app/server/api/settings/workflows.get.ts
M server/utils/settings/_cache.ts
M server/utils/settings/defaults.ts
M server/utils/settings/index.ts
M server/utils/workflow/documentService.ts
M server/utils/workflow/transitionService.ts
M server/utils/workflow/workflowEngine.ts
M tests/unit/workflow/transition-completed.test.ts
M types/settings.ts
```

workflow 관련 파일들이 수정되어 있어 테스트 실패와 연관이 있을 수 있습니다.
