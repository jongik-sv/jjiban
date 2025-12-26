# 사용자 매뉴얼 (080-manual.md)

**Version:** 1.0.0 — **Last Updated:** 2025-12-26

---

## 1. 개요

### 1.1 기능 소개

워크플로우 타입 및 스토어는 jjiban 프로젝트의 터미널 세션 관리와 워크플로우 명령어 실행을 위한 클라이언트 측 상태 관리 체계를 제공합니다.

**주요 기능**:
- 터미널 세션 생성/종료/관리
- 워크플로우 명령어 실행 및 상태 추적
- Task별 사용 가능한 명령어 필터링
- 실시간 세션 상태 동기화

### 1.2 대상 사용자

| 대상 | 역할 |
|------|------|
| 프론트엔드 개발자 | Store/Composable 사용 |
| 컴포넌트 개발자 | 터미널/워크플로우 UI 구현 |

---

## 2. 시작하기

### 2.1 사전 요구사항

- Vue 3 + Nuxt 3 환경
- Pinia 상태 관리 라이브러리
- TypeScript 지원

### 2.2 파일 구조

```
app/
├── types/
│   └── terminal.ts          # 타입 정의
├── stores/
│   ├── terminal.ts          # 터미널 세션 Store
│   └── workflow.ts          # 워크플로우 Store
└── composables/
    ├── useTerminal.ts       # 터미널 편의 함수
    └── useWorkflow.ts       # 워크플로우 편의 함수
```

---

## 3. 사용 방법

### 3.1 터미널 세션 관리

#### Store 직접 사용

```typescript
import { useTerminalStore } from '~/stores/terminal'

const terminalStore = useTerminalStore()

// 세션 생성
const sessionId = await terminalStore.createSession({
  taskId: 'TSK-01-01',
  projectId: 'jjiban',
  cols: 80,
  rows: 24
})

// 세션 목록 조회
const sessions = terminalStore.sessionList

// 활성 세션 설정
terminalStore.setActiveSession(sessionId)

// 입력 전송
await terminalStore.sendInput(sessionId, 'npm run build\n')

// 세션 종료
await terminalStore.closeSession(sessionId)
```

#### Composable 사용 (권장)

```typescript
import { useTerminal } from '~/composables/useTerminal'

const {
  createTerminalSession,
  closeTerminalSession,
  getOrCreateSession,
  sendTerminalInput,
  terminalStore
} = useTerminal()

// Task에 연결된 세션 가져오기 (없으면 생성)
const sessionId = await getOrCreateSession('TSK-01-01', 'jjiban')

// 입력 전송 (Toast 알림 포함)
await sendTerminalInput(sessionId, '/wf:build TSK-01-01\n')
```

### 3.2 워크플로우 명령어 실행

#### Store 직접 사용

```typescript
import { useWorkflowStore } from '~/stores/workflow'

const workflowStore = useWorkflowStore()

// 명령어 실행
const response = await workflowStore.executeCommand({
  taskId: 'TSK-01-01',
  projectId: 'jjiban',
  command: 'build',
  options: {
    skipReview: false
  }
})

// 실행 중 확인
const isRunning = workflowStore.isExecuting('TSK-01-01')

// 사용 가능한 명령어 조회
const commands = await workflowStore.fetchAvailableCommands(
  'TSK-01-01',
  'jjiban'
)
```

#### Composable 사용 (권장)

```typescript
import { useWorkflow } from '~/composables/useWorkflow'

const {
  executeWorkflowCommand,
  getAvailableCommands,
  cancelWorkflowCommand,
  isCommandAvailable,
  workflowStore,
  executionStore
} = useWorkflow()

// 워크플로우 명령어 실행 (세션 자동 관리)
const success = await executeWorkflowCommand(
  'TSK-01-01',
  'jjiban',
  'build'
)

// 명령어 가용성 확인
const canBuild = isCommandAvailable(
  WORKFLOW_COMMANDS.find(c => c.name === 'build'),
  'development',
  '[dd]'
)

// 실행 취소
await cancelWorkflowCommand('TSK-01-01')
```

### 3.3 워크플로우 명령어 목록

```typescript
import { WORKFLOW_COMMANDS, filterWorkflowCommands } from '~/types/terminal'

// 전체 명령어 목록 (15개)
console.log(WORKFLOW_COMMANDS)

// 카테고리/상태로 필터링
const availableCommands = filterWorkflowCommands(
  WORKFLOW_COMMANDS,
  'development',  // category
  '[dd]'          // status
)
```

---

## 4. FAQ

### Q1: 세션이 자동으로 종료되나요?

A: 아니요. 세션은 명시적으로 `closeSession()`을 호출하거나 서버가 재시작될 때 종료됩니다. 오래된 세션은 `syncSessions()`로 동기화할 수 있습니다.

### Q2: 여러 Task에서 동시에 워크플로우를 실행할 수 있나요?

A: 예. 각 Task는 독립적인 터미널 세션을 가지며, 병렬 실행이 가능합니다. 단, 동일 Task에서 중복 실행은 방지됩니다.

### Q3: 명령어 캐시는 언제 갱신되나요?

A: `fetchAvailableCommands()`를 호출할 때마다 서버에서 최신 정보를 가져와 캐시를 갱신합니다. `invalidateCommandsCache()`로 캐시를 수동 삭제할 수도 있습니다.

---

## 5. 문제 해결

### 세션 생성 실패

```
Error: 세션 생성 실패
```

**원인**: 서버가 실행 중이지 않거나 네트워크 오류

**해결**:
1. 서버 실행 상태 확인
2. `/api/terminal/session` 엔드포인트 접근 가능 여부 확인
3. 콘솔에서 상세 에러 메시지 확인

### 중복 실행 에러

```
Error: 이미 실행 중인 명령어가 있습니다
```

**원인**: 동일 Task에서 워크플로우가 이미 실행 중

**해결**:
1. 기존 실행 완료 대기
2. 필요시 `cancelExecution()` 호출하여 취소
3. 또는 `clearExecution()` 호출하여 로컬 상태만 정리

---

## 6. 참고 자료

| 문서 | 경로 |
|------|------|
| 상세설계 | `020-detail-design.md` |
| 구현 보고서 | `030-implementation.md` |
| 통합테스트 | `070-integration-test.md` |
| Terminal Store | `app/stores/terminal.ts` |
| Workflow Store | `app/stores/workflow.ts` |

---

## 부록: 변경 이력

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0.0 | 2025-12-26 | Claude | 최초 작성 |

---

<!--
TSK-02-03 사용자 매뉴얼
author: Claude
Version: 1.0.0
-->
