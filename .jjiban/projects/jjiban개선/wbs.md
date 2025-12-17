> version: 2.0
> depth: 3
> updated: 2025-12-17
> start: 2025-12-17

---

## WP-01: 터미널 시스템
- priority: critical
- schedule: 2025-12-17 ~ 2025-12-28
- progress: 13%

### TSK-01-01: 터미널 패키지 설치 및 설정
- category: infrastructure
- status: [dd]
- priority: critical
- schedule: 2025-12-17 ~ 2025-12-18
- tags: xterm, node-pty, setup
- requirements:
  - xterm ^5.x, @xterm/addon-fit 설치
  - node-pty ^1.0.x 설치
  - Nuxt 3 nitro 통합 확인
- ref: PRD 7.1

### TSK-01-02: 터미널 UI 컴포넌트
- category: development
- status: detail-design [dd]
- priority: critical
- schedule: 2025-12-18 ~ 2025-12-22
- tags: xterm, component, dialog
- depends: TSK-01-01
- requirements:
  - TerminalHeaderIcon (헤더 아이콘 + 세션 배지)
  - TerminalDialog (전역 다이얼로그, 좌우 분할)
  - TerminalSessionList (왼쪽 세션 목록)
  - TerminalView (xterm.js 래퍼, SSE 연결, 키 입력)
- ref: PRD 5.1, 5.2
- completed:
  - ui: 2025-12-17
  - dd: 2025-12-17

### TSK-01-03: 서버 터미널 세션 API
- category: development
- status: detail-design [dd]
- priority: critical
- schedule: 2025-12-20 ~ 2025-12-26
- tags: api, session, sse
- depends: TSK-01-01
- requirements:
  - TerminalService (node-pty spawn, 세션 관리)
  - POST/DELETE /api/terminal/session
  - GET /api/terminal/session/:id/output (SSE)
  - POST /api/terminal/session/:id/input, resize
- ref: PRD 4.1, 4.3
- completed:
  - dd: 2025-12-17

---

## WP-02: 워크플로우 시스템
- priority: high
- schedule: 2025-12-22 ~ 2025-12-30
- progress: 7%

### TSK-02-01: 워크플로우 액션 UI
- category: development
- status: basic-design [bd]
- priority: high
- schedule: 2025-12-22 ~ 2025-12-26
- tags: workflow, button, actions
- requirements:
  - WorkflowButton (상태별 스타일)
  - WorkflowActions (15개 명령어 버튼)
  - WorkflowAutoActions (run, auto, 중지)
  - 카테고리/상태별 가용성 필터링
- ref: PRD 2.2, 3.5
- completed:
  - bd: 2025-12-17
  - ui: 2025-12-17

### TSK-02-02: 워크플로우 프롬프트 생성
- category: development
- status: [ ]
- priority: high
- schedule: 2025-12-24 ~ 2025-12-28
- tags: workflow, prompt
- depends: TSK-01-03,TSK-02-01
- requirements:
  - 버튼 클릭 → 프롬프트 문자열 생성 ("/wf:build TSK-01-01")
  - 터미널 세션에 프롬프트 입력 전송
  - GET /api/workflow/available-commands/:taskId (상태/카테고리 기반 필터링)
- ref: PRD 1.4, 2.2

### TSK-02-03: 워크플로우 타입 및 스토어
- category: development
- status: [ ]
- priority: medium
- schedule: 2025-12-28 ~ 2025-12-30
- tags: types, pinia
- depends: TSK-02-02
- requirements:
  - types/terminal.ts (인터페이스 정의)
  - stores/terminal.ts, stores/workflow.ts
  - composables (useTerminal, useWorkflow)
- ref: PRD 4.5, 5.4

---

## WP-03: 실행 상태 관리
- priority: high
- schedule: 2025-12-17 ~ 2025-12-20
- progress: 67%

### TSK-03-01: 실행 상태 서버/API
- category: development
- status: [xx]  
- priority: critical
- schedule: 2025-12-17 ~ 2025-12-17
- tags: execution, api
- requirements:
  - server/utils/executionManager.ts
  - POST /api/execution/start, stop
  - GET /api/execution/status
- ref: PRD 9.4, 9.5

### TSK-03-02: 실행 상태 클라이언트
- category: development
- status: [xx]
- priority: high
- schedule: 2025-12-17 ~ 2025-12-17
- tags: pinia, spinner
- depends: TSK-03-01
- requirements:
  - app/stores/execution.ts (30초 폴링)
  - WbsTreePanel.vue 스피너 표시
- ref: PRD 5.4, 9.2

### TSK-03-03: 워크플로우 명령어 훅
- category: development
- status: [ ]
- priority: medium
- schedule: 2025-12-18 ~ 2025-12-20
- tags: workflow, hook, cli
- depends: TSK-03-01
- requirements:
  - cli/commands/exec.js 신규 생성 (start/stop 서브커맨드)
  - bin/jjiban.js에 exec 명령어 등록
  - .claude/commands/wf/*.md 시작/종료 시 스크립트 추가:
  - 시작: `npx jjiban exec start $TASK_ID $CMD --session $JJIBAN_SESSION_ID --pid $JJIBAN_TERMINAL_PID`
  - 종료: `npx jjiban exec stop $TASK_ID`
  - 15개 wf 명령어 파일 수정
- ref: PRD 9.6, 9.7

---

## WP-04: 전역 통합
- priority: high
- schedule: 2025-12-30 ~ 2026-01-03
- progress: 0%

### TSK-04-01: 전역 터미널 및 워크플로우 통합
- category: development
- status: [ ]
- priority: critical
- schedule: 2025-12-30 ~ 2026-01-03
- tags: integration, header, workflow
- depends: TSK-01-02,TSK-02-01,TSK-02-03
- requirements:
  - AppHeader에 TerminalHeaderIcon 추가
  - TaskDetailPanel에 WorkflowActions 추가
  - 터미널 ↔ 워크플로우 연동 (세션 생성/실행)
- ref: PRD 3.1, 5.3

---

## WP-05: 워크플로우 유연화
- priority: medium
- schedule: 2026-01-03 ~ 2026-01-10
- progress: 0%

### TSK-05-01: CLI 설정 로더 생성
- category: infrastructure
- status: [ ]
- priority: high
- schedule: 2026-01-03 ~ 2026-01-04
- tags: cli, settings, loader
- requirements:
  - cli/config/settingsLoader.js 신규 생성
  - cli/config/defaultWorkflows.js 신규 생성
  - cli/config/workflowBuilder.js 신규 생성
  - workflows.json 로드 및 폴백 로직
- ref: PRD 10.3

### TSK-05-02: workflowSteps 리팩토링
- category: development
- status: [ ]
- priority: high
- schedule: 2026-01-04 ~ 2026-01-06
- tags: cli, refactoring, workflow
- depends: TSK-05-01
- requirements:
  - cli/config/workflowSteps.js 동적 로드 전환
  - cli/core/WorkflowPlanner.js 설정 주입 방식
  - WORKFLOW_STEPS → getWorkflowSteps() 함수화
- ref: PRD 10.3

### TSK-05-03: 상태 코드 통일
- category: development
- status: [ ]
- priority: medium
- schedule: 2026-01-06 ~ 2026-01-08
- tags: status-code, migration
- depends: TSK-05-02
- requirements:
  - cli/core/WbsReader.js 상태 코드 정규화 레이어
  - 슬래시 명령어 상태 코드 수정 ([ts]→[vf])
  - .claude/includes/wf-common-lite.md 수정
- ref: PRD 10.5

### TSK-05-04: 통합 테스트
- category: development
- status: [ ]
- priority: medium
- schedule: 2026-01-08 ~ 2026-01-10
- tags: test, integration
- depends: TSK-05-03
- requirements:
  - development/defect/infrastructure 전체 흐름 검증
  - 기존 WBS 파일 ([ts] 상태) 호환성 검증
  - 설정 파일 로드 실패 시 폴백 검증
- ref: PRD 10.5
