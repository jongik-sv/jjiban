# 4. 프론트엔드 설계 (Frontend Design)

## 4.1 개요
JJIban의 프론트엔드는 React 기반의 SPA(Single Page Application)로 구축되며, 복잡한 상태 관리와 실시간 상호작용(Drag & Drop, Terminal Streaming)을 효율적으로 처리하도록 설계됩니다.

## 4.2 디렉토리 구조 (Feature-Sliced Design Lite)

AI가 코드를 생성할 때 컨텍스트를 잃지 않도록 **기능(Feature)** 단위로 응집도를 높인 구조를 채택합니다.

```
/src
├── /app                # 앱 전역 설정 (Provider, Router, Global Styles)
├── /shared             # 공통 모듈 (UI Kit, Utils, Types)
│   ├── /ui             # Shadcn/UI 컴포넌트 (Button, Input, Dialog...)
│   ├── /lib            # 유틸리티 (axios, date-fns...)
│   └── /types          # 전역 타입 정의
├── /entities           # 비즈니스 도메인 모델 (User, Project, Issue)
│   └── /issue          # 예: Issue 타입, 스토어, API
├── /features           # 사용자 기능 단위 (핵심 비즈니스 로직)
│   ├── /auth           # 로그인/회원가입 기능
│   ├── /kanban-board   # 칸반 보드 기능 (Board, Column, Card)
│   ├── /terminal       # 웹 터미널 기능
│   └── /doc-viewer     # 문서 뷰어 기능
├── /widgets            # 페이지를 구성하는 큰 덩어리 (Header, Sidebar)
└── /pages              # 라우팅 페이지 (Page 컴포넌트만 존재)
```

## 4.3 컴포넌트 설계 패턴 (AI Guide)

### 4.3.1 Container-Presentational 패턴 준수
- **Container (`features/**/ui/*.container.tsx`)**:
  - 데이터 Fetching (`useQuery`)
  - 상태 관리 (`useStore`)
  - 이벤트 핸들러 정의
  - **절대 UI 렌더링 로직을 직접 포함하지 않음** (Presentational 컴포넌트 호출만 수행).
- **Presentational (`features/**/ui/*.view.tsx`)**:
  - 오직 `props`로 데이터와 콜백만 받음.
  - `useEffect`, `useQuery` 등 사이드 이펙트 금지.
  - Storybook 등으로 테스트하기 용이한 순수 컴포넌트.

### 4.3.2 Custom Hook 분리 원칙
- 복잡한 로직(10줄 이상)은 반드시 `use{FeatureName}.ts`로 분리.
- 예: `useKanbanDragDrop.ts`, `useTerminalSocket.ts`

### 4.3.3 KanbanBoard 컴포넌트 상세
- **라이브러리**: `@hello-pangea/dnd` (React 18 Strict Mode 호환)
- **구조**:
  - `BoardContext`: 드래그 상태 관리
  - `ColumnList`: 가로 스크롤 가능한 컬럼 컨테이너
  - `KanbanColumn`: 개별 상태 컬럼 (Droppable)
  - `IssueCard`: 개별 이슈 카드 (Draggable)
- **기능**:
  - 이슈 상태 변경 (Drag & Drop)
  - 이슈 순서 변경
  - 컨텍스트 메뉴 (우클릭) 트리거

### 4.3.2 WebTerminal
- **라이브러리**: `xterm.js`, `xterm-addon-fit`, `socket.io-client`
- **기능**:
  - WebSocket 연결 관리
  - ANSI 이스케이프 코드 렌더링
  - 사용자 입력 버퍼링 및 전송
  - 리사이즈 이벤트 처리
  - 테마 적용 (Dark Mode)

### 4.3.3 MarkdownEditor
- **라이브러리**: `react-markdown`, `remark-gfm`, `monaco-editor` (선택적)
- **기능**:
  - 실시간 미리보기 (Split View)
  - 구문 강조 (Syntax Highlighting)
  - Mermaid 다이어그램 렌더링
  - 이미지 붙여넣기 지원

## 4.4 상태 관리 전략 (State Management)

### 4.4.1 Server State (React Query)
- **대상**: 프로젝트 목록, 이슈 목록, 문서 내용 등 서버 데이터.
- **장점**: 캐싱, 자동 리페치, 로딩/에러 상태 관리 용이.

### 4.4.2 Client State (Zustand)
- **대상**:
  - UI 상태 (사이드바 토글, 모달 열림/닫힘)
  - 현재 활성화된 터미널 세션 정보
  - 사용자 인증 정보 (User Session)
  - 칸반 필터링 옵션

## 4.5 라우팅 (Routing)
- `/login`: 로그인 페이지
- `/`: 대시보드 (프로젝트 목록)
- `/projects/:projectId/board`: 칸반 보드 메인
- `/projects/:projectId/backlog`: 백로그 뷰
- `/projects/:projectId/settings`: 프로젝트 설정
- `/issues/:issueId`: 이슈 상세 (모달 또는 별도 페이지)

## 4.6 스타일링 (Styling)
- **Tailwind CSS**: 유틸리티 퍼스트 CSS 프레임워크로 빠른 개발.
- **CSS Variables**: 테마(Light/Dark) 전환 용이성 확보.
- **Shadcn/UI**: 접근성이 보장된 Headless 컴포넌트 기반 디자인 시스템.
