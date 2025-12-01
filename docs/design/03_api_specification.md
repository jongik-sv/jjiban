# 3. API 명세서 (API Specification)

## 3.1 개요
JJIban은 RESTful API를 통해 리소스를 관리하고, WebSocket(Socket.io)을 통해 실시간 터미널 스트리밍 및 칸반 보드 업데이트를 처리합니다.

## 3.2 REST API

### 3.2.1 Projects
- `GET /api/projects`: 프로젝트 목록 조회
- `POST /api/projects`: 새 프로젝트 생성
- `GET /api/projects/:id`: 프로젝트 상세 정보 조회
- `PUT /api/projects/:id`: 프로젝트 설정 수정
- `DELETE /api/projects/:id`: 프로젝트 삭제

### 3.2.2 Issues (Tasks)
- `GET /api/projects/:projectId/issues`: 프로젝트의 이슈 목록 조회 (필터링 지원)
- `POST /api/projects/:projectId/issues`: 새 이슈 생성
- `GET /api/issues/:id`: 이슈 상세 조회
- `PUT /api/issues/:id`: 이슈 정보 수정
- `PATCH /api/issues/:id/status`: 이슈 상태 변경 (Drag & Drop 시 호출)
  - Body: `{ "status": "In Progress", "order": 1 }`
- `DELETE /api/issues/:id`: 이슈 삭제

### 3.2.3 Prompt Templates
- `GET /api/projects/:projectId/templates`: 프로젝트에서 사용 가능한 템플릿 목록
- `POST /api/projects/:projectId/templates`: 템플릿 생성
- `PUT /api/templates/:id`: 템플릿 수정
- `DELETE /api/templates/:id`: 템플릿 삭제

### 3.2.4 Documents
- `GET /api/issues/:issueId/documents`: 이슈와 연결된 문서 목록 조회
- `GET /api/documents/content`: 문서 내용 조회 (Query param: `path`)
- `POST /api/documents`: 새 문서 생성 또는 업데이트
  - Body: `{ "path": "docs/tasks/TASK-1/design.md", "content": "..." }`

### 3.2.5 Terminal
- `GET /api/issues/:issueId/terminal-logs`: 이슈 관련 터미널 실행 이력 조회
- `GET /api/terminal/logs/:logId`: 특정 로그 상세 조회

### 3.2.6 Automation (Auto-Pilot)
- `POST /api/automation/jobs`: 자동화 작업 시작
  - Body: `{ "issueId": "uuid", "pipeline": ["design", "review", "implement"], "autoMode": true }`
- `GET /api/automation/jobs/:jobId`: 작업 상태 조회
- `POST /api/automation/jobs/:jobId/approve`: 현재 단계 승인 및 다음 단계 진행 (반자동 모드)
- `POST /api/automation/jobs/:jobId/stop`: 작업 강제 중단

## 3.3 WebSocket Events (Socket.io)

### 3.3.1 Terminal Namespace (`/terminal`)

#### Client -> Server
- `terminal:start`: 터미널 세션 시작 요청
  ```json
  {
    "issueId": "uuid",
    "templateId": "uuid",
    "variables": { ... }
  }
  ```
- `terminal:input`: 사용자 입력 전송
  ```json
  {
    "sessionId": "string",
    "data": "ls -la\r"
  }
  ```
- `terminal:resize`: 터미널 크기 조절
  ```json
  {
    "sessionId": "string",
    "cols": 80,
    "rows": 24
  }
  ```
- `terminal:kill`: 세션 종료 요청

#### Server -> Client
- `terminal:created`: 세션 생성 완료 및 ID 발급
- `terminal:output`: 터미널 출력 스트림 (xterm.js 호환 데이터)
- `terminal:exit`: 프로세스 종료 알림 (exit code 포함)
- `terminal:error`: 에러 발생 알림

### 3.3.2 Kanban Namespace (`/kanban`)

#### Server -> Client (Broadcast)
- `issue:created`: 새 이슈 생성됨
- `issue:updated`: 이슈 정보 변경됨 (제목, 담당자 등)
- `issue:moved`: 이슈 상태/순서 변경됨 (다른 사용자의 화면 동기화용)
- `issue:deleted`: 이슈 삭제됨

### 3.3.3 Automation Namespace (`/automation`)

#### Server -> Client
- `job:updated`: 작업 전체 상태 변경 (progress, status)
- `step:started`: 특정 단계 시작
- `step:completed`: 특정 단계 완료 (결과 요약 포함)
- `step:waiting_approval`: 사용자 승인 대기 중

## 3.4 API 공통 응답 포맷
```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```
