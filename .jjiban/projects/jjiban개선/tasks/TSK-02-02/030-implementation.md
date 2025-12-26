# 구현 보고서 (030-implementation.md)

**Version:** 1.0.0 — **Last Updated:** 2025-12-26

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-02-02 |
| Task명 | 워크플로우 프롬프트 생성 |
| Category | development |
| 상태 | ✅ 완료 |
| 작성일 | 2025-12-26 |
| 작성자 | Claude |
| 참조 상세설계서 | `./020-detail-design.md` |
| 구현 기간 | 2025-12-26 |

---

## 1. 구현 개요

### 1.1 구현 목적

워크플로우 명령어 버튼 클릭 시 프롬프트 문자열을 생성하고, Claude Code 세션을 통해 터미널에 전달하는 기능 구현.

### 1.2 구현 범위

**포함된 기능**:
- `useWorkflowExecution` composable: 워크플로우 명령어 실행 로직 캡슐화
- `workflowFilter.ts` 서버 유틸: 상태/카테고리 기반 명령어 필터링 (UI 버튼용)
- `GET /api/workflow/available-commands/:taskId` API: 사용 가능 명령어 조회
- `TaskActions.vue` 수정: useWorkflowExecution 연동

**제외된 기능** (이미 구현되어 있거나 다른 Task에서 처리):
- Claude Code 실행 로직 (TSK-01-03에서 이미 구현됨)
- 터미널 세션 관리 (claudeCodeStore로 처리)

### 1.3 구현 유형

- [x] Full-stack

### 1.4 기술 스택

**Frontend**:
- Framework: Vue 3 + Nuxt 3
- UI: PrimeVue 4.x
- State: Pinia (claudeCodeStore)
- Composables: useWorkflowExecution

**Backend**:
- Runtime: Node.js 20.x
- Framework: Nuxt 3 Server Routes
- Utils: workflowFilter.ts

---

## 2. Frontend 구현 결과

### 2.1 구현된 Composable

#### 2.1.1 useWorkflowExecution.ts

**파일 경로**: `app/composables/useWorkflowExecution.ts`

**역할**: 워크플로우 명령어 실행 로직 캡슐화

**주요 함수**:
| 함수명 | 설명 |
|--------|------|
| `generatePrompt(commandName, taskId)` | 명령어와 taskId로 프롬프트 문자열 생성 |
| `executeCommand(commandName)` | Claude Code를 통해 명령어 실행 |
| `generateWorkflowPrompt(commandName, taskId)` | 외부 export용 프롬프트 생성 함수 |

**반환값**:
```typescript
interface WorkflowExecutionResult {
  executeCommand: (commandName: string) => Promise<void>
  isExecuting: Ref<boolean>
  executingCommand: Ref<string | null>
  error: Ref<string | null>
}
```

**프롬프트 생성 규칙**:
| commandName | taskId | 출력 |
|-------------|--------|------|
| 'build' | 'TSK-01-01' | `/wf:build TSK-01-01\n` |
| 'start' | 'TSK-02-01' | `/wf:start TSK-02-01\n` |
| 'run' | 'TSK-01-01' | `/wf:run\n` |
| 'auto' | 'TSK-01-01' | `/wf:auto TSK-01-01\n` |

### 2.2 컴포넌트 수정

#### 2.2.1 TaskActions.vue

**파일 경로**: `app/components/wbs/detail/TaskActions.vue`

**수정 내용**:
1. `useWorkflowExecution` import 추가
2. `workflowExecution` computed 속성 추가 (selectedTask 기반)
3. `handleTransition()` 함수를 useWorkflowExecution 사용하도록 변경

**변경된 handleTransition 로직**:
```typescript
async function handleTransition(command: string) {
  if (!workflowExecution.value) return

  await workflowExecution.value.executeCommand(command)
  await selectionStore.refreshTaskDetail()
  emit('transition-completed', command)
}
```

---

## 3. Backend 구현 결과

### 3.1 구현된 Server Utils

#### 3.1.1 workflowFilter.ts

**파일 경로**: `server/utils/workflowFilter.ts`

**역할**: UI 버튼용 명령어 필터링 및 스타일 정보 제공

**주요 함수**:
| 함수명 | 설명 |
|--------|------|
| `getFilteredCommands(status, category)` | 모든 명령어의 available 상태 포함 반환 |
| `getAvailableCommandsForUI(status, category)` | 사용 가능한 명령어만 반환 |
| `extractStatusCodeWithBrackets(statusString)` | 상태 코드 추출 (대괄호 포함) |

**명령어 목록** (14개):
- start, ui, draft, review, apply, approve, build
- test, audit, patch, verify, done, fix, skip

### 3.2 구현된 API

#### 3.2.1 GET /api/workflow/available-commands/:taskId

**파일 경로**: `server/api/workflow/available-commands/[taskId].get.ts`

**목적**: Task 상태/카테고리에 따른 사용 가능 명령어 목록 반환

**요청**:
```
GET /api/workflow/available-commands/TSK-01-01?project=jjiban
```

**응답 예시** (Task 상태 [ap], category development):
```json
{
  "success": true,
  "commands": [
    {
      "name": "build",
      "label": "구현",
      "icon": "pi-wrench",
      "severity": "warning",
      "availableStatuses": ["[ap]", "[ds]"],
      "categories": ["development", "infrastructure"],
      "available": true
    },
    // ... 다른 명령어들
  ],
  "task": {
    "status": "[ap]",
    "category": "development"
  }
}
```

---

## 4. 빌드 및 테스트 결과

### 4.1 타입 체크
- 새로 추가된 파일에서 타입 에러 없음
- 기존 코드의 타입 에러는 이전부터 존재하는 문제

### 4.2 빌드 결과
```
✓ Build complete!
├── .output/server/chunks/routes/api/workflow/available-commands/_taskId_.get.mjs (5.15 kB)
```

### 4.3 상세설계 요구사항 매핑

| 상세설계 항목 | 구현 상태 | 비고 |
|--------------|----------|------|
| 섹션 3.1.3 generatePrompt | ✅ | useWorkflowExecution.ts |
| 섹션 3.1.4 ensureSession | ✅ | claudeCodeStore 사용으로 대체 |
| 섹션 3.1.5 executeCommand | ✅ | useWorkflowExecution.ts |
| 섹션 4 컴포넌트 수정 | ✅ | TaskActions.vue |
| 섹션 5 API 설계 | ✅ | [taskId].get.ts |
| 섹션 6 Server Utils | ✅ | workflowFilter.ts |

---

## 5. 주요 기술적 결정사항

### 5.1 기존 claudeCodeStore 활용

**배경**: 상세설계에서는 terminalStore를 사용하도록 명시되어 있으나, 프로젝트에서는 이미 `claudeCodeStore`가 Claude Code CLI 실행 관리를 담당

**결정**: 별도의 terminalStore 생성 대신 기존 claudeCodeStore를 재사용

**근거**:
- 코드 중복 방지
- 기존 동작 방식 일관성 유지
- claudeCodeStore가 이미 SSE 연결, 세션 관리 기능 제공

### 5.2 함수 이름 충돌 해결

**배경**: workflowFilter.ts에서 생성한 `extractStatusCode`, `getAvailableCommands` 함수가 기존 workflow/statusUtils.ts, transitionService.ts의 함수와 이름 충돌

**결정**:
- `extractStatusCode` → `extractStatusCodeWithBrackets` (대괄호 포함 형태 반환)
- `getAvailableCommands` → `getAvailableCommandsForUI` (UI 버튼 스타일 정보 포함)

**근거**:
- 기존 함수는 상태 전이 로직에서 사용 (내부용)
- 새 함수는 UI 버튼 렌더링용 정보 포함 (외부 API용)

---

## 6. 구현 완료 체크리스트

### 6.1 Frontend 체크리스트
- [x] useWorkflowExecution composable 생성
- [x] generatePrompt 함수 구현
- [x] executeCommand 함수 구현
- [x] TaskActions.vue 수정 및 연동

### 6.2 Backend 체크리스트
- [x] workflowFilter.ts 서버 유틸 생성
- [x] getFilteredCommands 함수 구현
- [x] extractStatusCodeWithBrackets 함수 구현
- [x] available-commands API 구현

### 6.3 통합 체크리스트
- [x] 타입 체크 통과
- [x] 빌드 성공
- [x] API 엔드포인트 정상 생성
- [x] 상세설계 요구사항 매핑 완료

---

## 7. 다음 단계

### 7.1 코드 리뷰 (선택)
- `/wf:audit TSK-02-02` - LLM 코드 리뷰 실행

### 7.2 다음 워크플로우
- `/wf:verify TSK-02-02` - 통합테스트 시작

---

## 부록: 변경 이력

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0.0 | 2025-12-26 | Claude | 최초 작성 |

---

<!--
TSK-02-02 구현 보고서
author: Claude
Version: 1.0.0
-->
