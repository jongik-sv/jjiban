# 구현 문서 (030-implementation.md)

**Template Version:** 1.0.0 — **Last Updated:** 2025-12-26

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-04-01 |
| Task명 | 전역 터미널 및 워크플로우 통합 |
| Category | development |
| 상태 | [im] 구현 |
| 작성일 | 2025-12-26 |
| 작성자 | Claude |

### 상위 문서 참조

| 문서 유형 | 경로 | 참조 섹션 |
|----------|------|----------|
| 기본설계 | `010-basic-design.md` | 전체 |
| 화면설계 | `011-ui-design.md` | 전체 |
| 상세설계 | `020-detail-design.md` | 전체 |

---

## 1. 구현 개요

### 1.1 목표

UI 버튼 클릭 시 실제로 Claude Code가 실행되도록 터미널 ↔ 워크플로우 연동

### 1.2 핵심 변경사항

| 파일 | 변경 유형 | 설명 |
|-----|---------|-----|
| `app/components/wbs/detail/TaskProgress.vue` | 수정 | useWorkflowExecution 연동 |
| `app/components/terminal/TerminalHeaderIcon.vue` | 수정 | 스텁 → 실제 기능 구현 |
| `app/components/terminal/TerminalDialog.vue` | 신규 | 전역 터미널 다이얼로그 |

---

## 2. 구현 상세

### 2.1 TaskProgress.vue 수정

**변경 목적**: 워크플로우 버튼 클릭 시 Claude Code 실행

**핵심 코드**:

```typescript
// 워크플로우 실행 composable (Claude Code 연동) - TSK-04-01
const workflowExecution = computed(() => useWorkflowExecution({
  taskId: props.task.id,
  projectId: selectionStore.selectedProjectId || '',
  useToast: true
}))

/**
 * 액션 실행 - TSK-04-01: Claude Code 연동
 */
async function executeAction(action: string) {
  if (executingCommand.value) return
  executingCommand.value = action

  try {
    // Claude Code로 워크플로우 명령어 실행
    await workflowExecution.value.executeCommand(action)

    // 상태 새로고침 (Claude Code가 완료되면 상태가 변경됨)
    await selectionStore.refreshTaskDetail()
    notification.success(`'${getActionLabel(action)}' 실행 완료`)
  } catch (error) {
    errorHandler.handle(error, 'TaskProgress.executeAction')
  } finally {
    executingCommand.value = null
  }
}
```

**프롬프트 생성**: `/wf:{command} {taskId}` 형식

### 2.2 TerminalHeaderIcon.vue 수정

**변경 목적**: 스텁 상태에서 실제 기능으로 전환

**핵심 기능**:
- claudeCodeStore 연동
- 세션 개수 배지 표시
- 실행 중 상태 시각화 (pulse 애니메이션)
- TerminalDialog 트리거

**핵심 코드**:

```typescript
const claudeCodeStore = useClaudeCodeStore()
const dialogVisible = ref(false)

const sessionCount = computed(() => Object.keys(claudeCodeStore.sessions).length)
const hasRunningSession = computed(() => claudeCodeStore.isRunning)

function handleClick(): void {
  dialogVisible.value = true
}
```

### 2.3 TerminalDialog.vue 신규 생성

**목적**: 전역 Claude Code 터미널 다이얼로그

**구조**:
```
TerminalDialog
├── 세션 목록 (sidebar)
│   ├── 세션 ID
│   ├── 상태 태그
│   └── 삭제 버튼
└── 출력 뷰 (main)
    ├── 출력 영역 (pre)
    └── 입력 영역
        ├── InputText
        ├── 실행/중지 버튼
        └── 클리어 버튼
```

**핵심 기능**:
- 세션 목록 표시 및 선택
- 활성 세션 출력 실시간 표시
- 명령어 입력 및 실행
- 세션 취소/삭제
- 출력 자동 스크롤

---

## 3. 데이터 흐름

```
TaskProgress 버튼 클릭
    ↓
useWorkflowExecution.executeCommand(action)
    ↓
generatePrompt() → "/wf:{action} {taskId}\n"
    ↓
claudeCodeStore.execute(prompt)
    ↓
POST /api/claude-code/execute
    ↓
SSE 연결 (/api/claude-code/session/{id}/stream)
    ↓
실시간 출력 스트리밍
    ↓
완료 시 Task 상태 새로고침
```

---

## 4. CSS 클래스

### 4.1 TerminalDialog

| 클래스 | 용도 |
|-------|-----|
| `.terminal-content` | 플렉스 레이아웃 컨테이너 |
| `.terminal-sidebar` | 세션 목록 사이드바 |
| `.session-item` | 세션 아이템 |
| `.session-item-active` | 활성 세션 하이라이트 |
| `.terminal-output` | 출력 영역 |

### 4.2 TerminalHeaderIcon

| 클래스 | 용도 |
|-------|-----|
| `.terminal-icon-running` | 실행 중 상태 (text-sky-500) |
| `.terminal-badge` | 세션 개수 배지 |

---

## 5. 의존성

### 5.1 사용된 컴포넌트/Composables

| 항목 | 출처 |
|-----|-----|
| useWorkflowExecution | TSK-02-02 |
| useClaudeCodeStore | 기존 구현 |
| Dialog, Badge, Tag, Button | PrimeVue |

### 5.2 선행 Task

| Task | 상태 | 역할 |
|------|-----|-----|
| TSK-01-02 | 완료 | 터미널 UI 컴포넌트 |
| TSK-02-01 | 완료 | 워크플로우 액션 UI |
| TSK-02-02 | 완료 | 워크플로우 프롬프트 생성 |

---

## 6. 검증 결과

### 6.1 타입 체크

```
npx nuxi typecheck
→ TSK-04-01 관련 파일 에러 없음
```

### 6.2 빌드

```
npm run build
→ 성공 (.output 폴더 생성)
```

---

## 7. 인수 기준 체크리스트

- [x] AC-01: AppHeader에 터미널 아이콘이 표시된다
- [x] AC-02: 터미널 아이콘 클릭 시 TerminalDialog가 열린다
- [x] AC-03: 실행 중인 세션 개수가 배지로 표시된다
- [x] AC-04: TaskDetailPanel에 워크플로우 버튼이 표시된다
- [x] AC-05: 워크플로우 버튼 클릭 시 Claude Code 세션이 생성된다
- [x] AC-06: 워크플로우 프롬프트가 터미널에 자동 입력된다

---

## 8. 관련 문서

- 기본설계: `010-basic-design.md`
- 화면설계: `011-ui-design.md`
- 상세설계: `020-detail-design.md`
- 테스트 명세: `026-test-specification.md`

---

<!--
author: Claude
Template Version: 1.0.0
-->
