# jjiban (찌반) - 기술 사양서 (TRD)

## 문서 정보

| 항목 | 내용 |
|------|------|
| 문서 버전 | 1.0 |
| 작성일 | 2025-12-06 |
| 상태 | Draft |
| 기반 PRD | jjiban-prd.md v1.7 |

---

## 1. 기술 스택 요약

### 1.1 핵심 스택

| 계층 | 기술 | 버전 | 선정 근거 |
|-----|------|------|----------|
| **Runtime** | Node.js | ^20.x LTS | 장기 지원, node-pty 호환성 |
| **Language** | TypeScript | ^5.6.x | 타입 안전성, DX 향상 |
| **Frontend Framework** | React | ^19.2.x | 최신 안정 버전, Compiler 지원 |
| **UI Library** | Ant Design | ^6.0.x | React 19 네이티브 지원, 풍부한 컴포넌트 |
| **Backend Framework** | Express.js | ^5.1.x | 업계 표준, node-pty 연동 검증 |
| **Database** | SQLite | - | 온프레미스, 파일 기반, 백업 용이 |
| **ORM** | Prisma | ^7.x | TypeScript 최적화, 스키마 관리 |
| **State Management** | Zustand | ^5.x | 경량, React 19 호환 |
| **Real-time** | Socket.IO | ^4.8.x | WebSocket 추상화, 안정성 |

### 1.2 전문화 라이브러리

| 기능 | 기술 | 버전 | 역할 |
|------|------|------|------|
| **칸반 보드** | @dnd-kit/core | ^6.x | react-beautiful-dnd 대체, 활발한 유지보수 |
| **Gantt 차트** | frappe-gantt | ^1.0.x | 오픈소스, 경량, 커스터마이징 용이 |
| **웹 터미널** | @xterm/xterm | ^5.x | VS Code 사용, 성능 최적화 |
| **터미널 백엔드** | node-pty | ^1.x | PTY 바인딩, 크로스 플랫폼 |
| **Markdown 렌더링** | react-markdown | ^9.x | remark-gfm, rehype 플러그인 지원 |
| **다이어그램** | mermaid | ^11.x | 플로우차트, 시퀀스 다이어그램 |

### 1.3 개발 도구

| 도구 | 버전 | 용도 |
|------|------|------|
| **빌드 (Frontend)** | Vite | ^6.x | HMR, 빠른 빌드 |
| **빌드 (Backend)** | esbuild | ^0.24.x | 빠른 번들링, CLI 패키징 |
| **패키지 매니저** | pnpm | ^9.x | 디스크 효율, 워크스페이스 지원 |
| **린팅** | ESLint | ^9.x | Flat config, TypeScript 지원 |
| **포매팅** | Prettier | ^3.x | 코드 스타일 통일 |
| **테스트** | Vitest | ^2.x | Vite 네이티브, 빠른 실행 |
| **E2E 테스트** | Playwright | ^1.49.x | 크로스 브라우저, 안정성 |

---

## 2. 아키텍처 설계

### 2.1 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (Browser)                                │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────────────────┐  │
│  │ 칸반 보드    │ │ Gantt 차트  │ │ 문서 뷰어   │ │ 웹 터미널 (xterm.js)  │  │
│  │ @dnd-kit    │ │ frappe-gantt│ │ react-md    │ │ WebSocket ↔ PTY      │  │
│  └─────────────┘ └─────────────┘ └─────────────┘ └───────────────────────┘  │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                     Zustand Store (State Management)                 │    │
│  │  ├── projectStore    ├── issueStore    ├── terminalStore           │    │
│  │  ├── documentStore   └── uiStore                                    │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │ HTTP (REST)   │ WebSocket     │
                    ▼               ▼               │
┌─────────────────────────────────────────────────────────────────────────────┐
│                          SERVER (Express.js + TypeScript)                    │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         Middleware Layer                             │    │
│  │  ├── CORS    ├── Auth (JWT)    ├── Error Handler    ├── Logger      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────────────────┐  │
│  │ Project     │ │ Issue       │ │ Document    │ │ Terminal Service      │  │
│  │ Service     │ │ Service     │ │ Service     │ │ (node-pty + Socket.IO)│  │
│  └─────────────┘ └─────────────┘ └─────────────┘ └───────────────────────┘  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                            │
│  │ Template    │ │ Workflow    │ │ WBS         │                            │
│  │ Service     │ │ Service     │ │ Service     │                            │
│  └─────────────┘ └─────────────┘ └─────────────┘                            │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    Prisma ORM (Data Access Layer)                    │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              ▼                     ▼                     ▼
┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐
│     SQLite DB       │ │    File System      │ │     LLM CLI         │
│   (.jjiban/jjiban.db)│ │   (projects/)       │ │ (claude, gemini...) │
│                     │ │   (templates/)      │ │                     │
│ ├── Epic            │ │ ├── *.md 문서       │ │ ├── stdin/stdout    │
│ ├── Chain           │ │ ├── 설계서          │ │ ├── PTY 세션        │
│ ├── Module          │ │ └── 로그            │ │ └── 명령어 실행      │
│ └── Task            │ │                     │ │                     │
└─────────────────────┘ └─────────────────────┘ └─────────────────────┘
```

### 2.2 모노레포 디렉토리 구조

```
jjiban/
├── package.json                      # 루트 (pnpm workspace)
├── pnpm-workspace.yaml
├── turbo.json                        # Turborepo 설정 (선택)
├── .gitignore
├── .eslintrc.js                      # ESLint Flat Config
├── .prettierrc
├── tsconfig.base.json                # 공통 TypeScript 설정
│
├── packages/
│   ├── cli/                          # ✅ CLI 도구 (npm 배포 대상)
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── bin/
│   │   │   └── jjiban.ts             # CLI 진입점
│   │   ├── src/
│   │   │   ├── commands/
│   │   │   │   ├── init.ts           # jjiban init
│   │   │   │   ├── start.ts          # jjiban start
│   │   │   │   ├── stop.ts           # jjiban stop
│   │   │   │   ├── migrate.ts        # jjiban migrate
│   │   │   │   └── status.ts         # jjiban status
│   │   │   └── utils/
│   │   │       ├── config.ts         # 설정 관리
│   │   │       ├── logger.ts         # CLI 로깅
│   │   │       └── process.ts        # 프로세스 관리
│   │   ├── templates/                # 프로젝트 템플릿
│   │   │   ├── .jjiban/
│   │   │   ├── projects/
│   │   │   └── templates/
│   │   ├── server/                   # 번들된 백엔드 (빌드 결과)
│   │   └── web/                      # 번들된 프론트엔드 (빌드 결과)
│   │
│   ├── server/                       # ✅ 백엔드 소스
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── prisma/
│   │   │   ├── schema.prisma         # DB 스키마
│   │   │   └── migrations/
│   │   └── src/
│   │       ├── index.ts              # 서버 진입점
│   │       ├── app.ts                # Express 앱 설정
│   │       ├── config/
│   │       │   ├── database.ts
│   │       │   └── env.ts
│   │       ├── middleware/
│   │       │   ├── auth.ts
│   │       │   ├── cors.ts
│   │       │   ├── error.ts
│   │       │   └── logger.ts
│   │       ├── routes/
│   │       │   ├── index.ts
│   │       │   ├── epic.routes.ts
│   │       │   ├── chain.routes.ts
│   │       │   ├── module.routes.ts
│   │       │   ├── task.routes.ts
│   │       │   ├── document.routes.ts
│   │       │   └── terminal.routes.ts
│   │       ├── services/
│   │       │   ├── epic.service.ts
│   │       │   ├── chain.service.ts
│   │       │   ├── module.service.ts
│   │       │   ├── task.service.ts
│   │       │   ├── document.service.ts
│   │       │   ├── terminal.service.ts
│   │       │   ├── workflow.service.ts
│   │       │   └── wbs.service.ts
│   │       ├── socket/
│   │       │   ├── index.ts          # Socket.IO 설정
│   │       │   └── terminal.handler.ts
│   │       └── types/
│   │           └── index.ts
│   │
│   ├── web/                          # ✅ 프론트엔드 소스
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   ├── index.html
│   │   └── src/
│   │       ├── main.tsx              # 앱 진입점
│   │       ├── App.tsx
│   │       ├── vite-env.d.ts
│   │       ├── assets/
│   │       │   └── styles/
│   │       │       └── global.css
│   │       ├── components/
│   │       │   ├── common/
│   │       │   │   ├── Header.tsx
│   │       │   │   ├── Sidebar.tsx
│   │       │   │   └── Loading.tsx
│   │       │   ├── kanban/
│   │       │   │   ├── KanbanBoard.tsx
│   │       │   │   ├── KanbanColumn.tsx
│   │       │   │   ├── KanbanCard.tsx
│   │       │   │   └── CardContextMenu.tsx
│   │       │   ├── gantt/
│   │       │   │   ├── GanttChart.tsx
│   │       │   │   └── GanttWrapper.tsx
│   │       │   ├── task/
│   │       │   │   ├── TaskDetail.tsx
│   │       │   │   ├── TaskForm.tsx
│   │       │   │   └── TaskDocuments.tsx
│   │       │   ├── document/
│   │       │   │   ├── DocumentViewer.tsx
│   │       │   │   ├── MarkdownRenderer.tsx
│   │       │   │   └── MermaidDiagram.tsx
│   │       │   └── terminal/
│   │       │       ├── WebTerminal.tsx
│   │       │       ├── TerminalPanel.tsx
│   │       │       └── TerminalToolbar.tsx
│   │       ├── hooks/
│   │       │   ├── useKanban.ts
│   │       │   ├── useGantt.ts
│   │       │   ├── useTerminal.ts
│   │       │   └── useDocument.ts
│   │       ├── pages/
│   │       │   ├── Dashboard.tsx
│   │       │   ├── ProjectList.tsx
│   │       │   ├── KanbanPage.tsx
│   │       │   ├── GanttPage.tsx
│   │       │   ├── TaskPage.tsx
│   │       │   └── SettingsPage.tsx
│   │       ├── stores/
│   │       │   ├── projectStore.ts
│   │       │   ├── issueStore.ts
│   │       │   ├── documentStore.ts
│   │       │   ├── terminalStore.ts
│   │       │   └── uiStore.ts
│   │       ├── services/
│   │       │   ├── api.ts            # Axios 인스턴스
│   │       │   ├── epicApi.ts
│   │       │   ├── chainApi.ts
│   │       │   ├── moduleApi.ts
│   │       │   ├── taskApi.ts
│   │       │   └── documentApi.ts
│   │       ├── types/
│   │       │   └── index.ts
│   │       └── utils/
│   │           ├── format.ts
│   │           └── constants.ts
│   │
│   └── shared/                       # ✅ 공유 타입/유틸
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── types/
│           │   ├── epic.ts
│           │   ├── chain.ts
│           │   ├── module.ts
│           │   ├── task.ts
│           │   └── workflow.ts
│           └── constants/
│               ├── status.ts
│               └── workflow.ts
│
├── docs/                             # 문서
│   ├── PRD.md
│   ├── TRD.md
│   └── KICKOFF.md
│
└── tests/                            # 통합 테스트
    ├── e2e/
    └── integration/
```

---

## 3. 핵심 모듈 설계

### 3.1 데이터베이스 스키마 (Prisma)

PRD의 `4.3.1 Prisma Schema` 섹션을 그대로 사용합니다.

**주요 관계:**
```
Epic (1) ─┬─ (N) Chain (1) ─┬─ (N) Module (1) ─┬─ (N) Task
          │                 │                   │
          │                 │                   ├── Bug
          │                 │                   └── Technical Task
          │                 └── Technical Task
          └── Spike
```

**Prisma 7.x 변경사항:**
- `prisma.config.ts` 사용 (새로운 설정 방식)
- `@prisma/adapter-better-sqlite3` 드라이버 어댑터 필수
- TypeScript/WASM 기반 Query Compiler (기존 Rust 엔진 대체)

### 3.2 API 설계 (RESTful)

#### 3.2.1 Epic API
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/epics` | Epic 목록 조회 |
| GET | `/api/epics/:id` | Epic 상세 조회 (하위 Chain 포함) |
| POST | `/api/epics` | Epic 생성 |
| PUT | `/api/epics/:id` | Epic 수정 |
| DELETE | `/api/epics/:id` | Epic 삭제 |

#### 3.2.2 Chain API
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/chains` | Chain 목록 조회 (필터: epicId) |
| GET | `/api/chains/:id` | Chain 상세 조회 |
| POST | `/api/chains` | Chain 생성 |
| PUT | `/api/chains/:id` | Chain 수정 |
| DELETE | `/api/chains/:id` | Chain 삭제 |

#### 3.2.3 Module API
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/modules` | Module 목록 조회 (필터: chainId) |
| GET | `/api/modules/:id` | Module 상세 조회 |
| POST | `/api/modules` | Module 생성 |
| PUT | `/api/modules/:id` | Module 수정 |
| DELETE | `/api/modules/:id` | Module 삭제 |

#### 3.2.4 Task API
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/tasks` | Task 목록 조회 (필터: moduleId, status) |
| GET | `/api/tasks/:id` | Task 상세 조회 (문서 목록 포함) |
| POST | `/api/tasks` | Task 생성 |
| PUT | `/api/tasks/:id` | Task 수정 |
| DELETE | `/api/tasks/:id` | Task 삭제 |
| POST | `/api/tasks/:id/workflow/:action` | 워크플로우 상태 전환 |

#### 3.2.5 Document API
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/documents/:taskId` | Task 문서 목록 |
| GET | `/api/documents/:taskId/:filename` | 문서 내용 조회 |
| POST | `/api/documents/:taskId` | 문서 생성 |
| PUT | `/api/documents/:taskId/:filename` | 문서 수정 |
| DELETE | `/api/documents/:taskId/:filename` | 문서 삭제 |

#### 3.2.6 WBS API
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/wbs/sync` | PRD 문서에서 WBS 동기화 |
| GET | `/api/wbs/export/:epicId` | WBS 내보내기 |

#### 3.2.7 Health Check API
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/health` | 서버 기본 상태 (ready/not ready) |
| GET | `/api/health/detailed` | DB, 파일시스템, 메모리 상태 상세 |

#### 3.2.8 Notification API
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/notifications` | 내 알림 목록 조회 |
| PUT | `/api/notifications/:id/read` | 알림 읽음 처리 |
| DELETE | `/api/notifications/:id` | 알림 삭제 |

#### 3.2.9 Dashboard API
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/dashboard/summary` | 프로젝트 요약 정보 (진행률 등) |
| GET | `/api/dashboard/my-tasks` | 내 할 일 및 우선순위 작업 |
| GET | `/api/dashboard/activities` | 최근 프로젝트 활동 로그 |

### 3.3 WebSocket 이벤트 (Terminal)

```typescript
// 클라이언트 → 서버
interface TerminalClientEvents {
  'terminal:create': { taskId: string; llmType: 'claude' | 'gemini' | 'codex' };
  'terminal:input': { sessionId: string; data: string };
  'terminal:resize': { sessionId: string; cols: number; rows: number };
  'terminal:close': { sessionId: string };
}

// 서버 → 클라이언트
interface TerminalServerEvents {
  'terminal:created': { sessionId: string; taskId: string };
  'terminal:output': { sessionId: string; data: string };
  'terminal:exit': { sessionId: string; code: number };
  'terminal:error': { sessionId: string; error: string };
  'terminal:files': { sessionId: string; files: FileChange[] };
}
```

### 3.4 워크플로우 상태 머신

```typescript
enum TaskStatus {
  TODO = 'todo',                    // [ ]
  BASIC_DESIGN = 'basic-design',    // [bd]
  DETAIL_DESIGN = 'detail-design',  // [dd]
  DESIGN_REVIEW = 'design-review',  // [dr]
  IMPLEMENTATION = 'implementation', // [im]
  CODE_REVIEW = 'code-review',      // [cr]
  INTEGRATION_TEST = 'integration-test', // [ts]
  DONE = 'done'                     // [xx]
}

// 상태 전환 규칙
const transitions: Record<string, TaskStatus[]> = {
  [TaskStatus.TODO]: [TaskStatus.BASIC_DESIGN],
  [TaskStatus.BASIC_DESIGN]: [TaskStatus.DETAIL_DESIGN],
  [TaskStatus.DETAIL_DESIGN]: [TaskStatus.DESIGN_REVIEW],
  [TaskStatus.DESIGN_REVIEW]: [TaskStatus.DETAIL_DESIGN, TaskStatus.IMPLEMENTATION], // review/revise 또는 approved
  [TaskStatus.IMPLEMENTATION]: [TaskStatus.CODE_REVIEW],
  [TaskStatus.CODE_REVIEW]: [TaskStatus.IMPLEMENTATION, TaskStatus.INTEGRATION_TEST], // audit/patch 또는 approved
  [TaskStatus.INTEGRATION_TEST]: [TaskStatus.DONE],
  [TaskStatus.DONE]: []
};
```

---

## 4. 개발 표준

### 4.1 코드 스타일

**ESLint 설정 (Flat Config):**
```javascript
// eslint.config.js
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.tsx'],
    plugins: { react, 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
];
```

**Prettier 설정:**
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

### 4.2 네이밍 컨벤션

| 대상 | 컨벤션 | 예시 |
|------|--------|------|
| 파일 (컴포넌트) | PascalCase | `KanbanBoard.tsx` |
| 파일 (유틸/훅) | camelCase | `useTerminal.ts` |
| 폴더 | kebab-case | `kanban-board/` |
| 컴포넌트 | PascalCase | `<KanbanCard />` |
| 함수/변수 | camelCase | `handleDragEnd()` |
| 상수 | UPPER_SNAKE_CASE | `MAX_RETRIES` |
| 타입/인터페이스 | PascalCase | `TaskStatus` |
| API 엔드포인트 | kebab-case | `/api/task-documents` |

### 4.3 테스트 전략

| 유형 | 커버리지 목표 | 도구 | 대상 |
|-----|-------------|------|------|
| 단위 테스트 | 70% | Vitest | 서비스, 유틸, 훅 |
| 통합 테스트 | 50% | Vitest + Supertest | API 엔드포인트 |
| E2E 테스트 | 핵심 경로 | Playwright | 주요 사용자 시나리오 |

### 4.4 보안 요구사항

- [ ] JWT 기반 인증 (HS256)
- [ ] CORS 설정 (화이트리스트 방식)
- [ ] 파일 업로드 크기 제한 (10MB)
- [ ] SQL Injection 방지 (Prisma ORM 사용)
- [ ] XSS 방지 (React 기본 이스케이핑 + DOMPurify)
- [ ] Rate Limiting (express-rate-limit)
- [ ] Helmet.js 적용 (보안 헤더)

---

## 5. AI 코딩 가이드라인

### 5.1 해야 할 것 (DO)

1. **타입 우선**: 모든 함수에 명시적 타입 선언
2. **Prisma 쿼리**: Raw SQL 대신 Prisma Client 사용
3. **에러 처리**: 모든 async 함수에 try-catch 적용
4. **컴포넌트 분리**: 250줄 초과 시 분할
5. **Zustand 패턴**: 셀렉터 사용으로 불필요한 리렌더링 방지
6. **Socket.IO 정리**: 컴포넌트 언마운트 시 리스너 해제

### 5.2 하지 말아야 할 것 (DON'T)

1. **any 타입 금지**: `unknown` 또는 명시적 타입 사용
2. **직접 DOM 조작 금지**: React ref 또는 라이브러리 API 사용
3. **동기적 파일 I/O 금지**: `fs.promises` 사용
4. **console.log 남기기 금지**: 프로덕션 코드에서 제거
5. **node-pty 직접 노출 금지**: TerminalService를 통해서만 접근
6. **PRD 외 기능 추가 금지**: 명시된 요구사항만 구현

---

## 6. 의존성 및 버전

### 6.1 packages/web/package.json

```json
{
  "name": "@jjiban/web",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx",
    "test": "vitest"
  },
  "dependencies": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-router-dom": "^7.1.0",
    "antd": "^6.0.1",
    "@ant-design/icons": "^6.0.0",
    "zustand": "^5.0.2",
    "@dnd-kit/core": "^6.3.1",
    "@dnd-kit/sortable": "^10.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    "frappe-gantt": "^1.0.4",
    "@xterm/xterm": "^5.5.0",
    "@xterm/addon-fit": "^0.10.0",
    "@xterm/addon-web-links": "^0.11.0",
    "react-markdown": "^9.0.1",
    "remark-gfm": "^4.0.0",
    "rehype-highlight": "^7.0.0",
    "mermaid": "^11.4.0",
    "socket.io-client": "^4.8.1",
    "axios": "^1.7.9",
    "dayjs": "^1.11.13"
  },
  "devDependencies": {
    "@types/react": "^19.0.1",
    "@types/react-dom": "^19.0.1",
    "@vitejs/plugin-react": "^4.3.4",
    "typescript": "^5.6.3",
    "vite": "^6.0.3",
    "vitest": "^2.1.8",
    "@testing-library/react": "^16.1.0",
    "eslint": "^9.16.0",
    "prettier": "^3.4.2"
  }
}
```

### 6.2 packages/server/package.json

```json
{
  "name": "@jjiban/server",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "esbuild src/index.ts --bundle --platform=node --outfile=dist/main.js",
    "start": "node dist/main.js",
    "db:migrate": "prisma migrate dev",
    "db:generate": "prisma generate",
    "lint": "eslint . --ext ts",
    "test": "vitest"
  },
  "dependencies": {
    "express": "^5.1.0",
    "@prisma/client": "^7.1.0",
    "@prisma/adapter-better-sqlite3": "^7.1.0",
    "better-sqlite3": "^12.4.0",
    "socket.io": "^4.8.1",
    "node-pty": "^1.0.0",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "helmet": "^8.0.0",
    "express-rate-limit": "^7.4.1",
    "winston": "^3.17.0",
    "zod": "^3.24.1"
  },
  "devDependencies": {
    "@types/express": "^5.0.0",
    "@types/better-sqlite3": "^7.6.12",
    "@types/jsonwebtoken": "^9.0.7",
    "@types/bcryptjs": "^2.4.6",
    "@types/cors": "^2.8.17",
    "prisma": "^7.1.0",
    "tsx": "^4.19.2",
    "esbuild": "^0.24.0",
    "typescript": "^5.6.3",
    "vitest": "^2.1.8",
    "supertest": "^7.0.0"
  }
}
```

### 6.3 packages/cli/package.json

```json
{
  "name": "jjiban",
  "version": "1.0.0",
  "description": "AI-Assisted Development Kanban Tool",
  "type": "module",
  "bin": {
    "jjiban": "./bin/jjiban.js"
  },
  "files": [
    "bin",
    "commands",
    "templates",
    "server",
    "web"
  ],
  "scripts": {
    "build": "esbuild bin/jjiban.ts --bundle --platform=node --outfile=bin/jjiban.js"
  },
  "keywords": ["kanban", "llm", "ai", "project-management", "claude", "gemini"],
  "repository": {
    "type": "git",
    "url": "https://github.com/yourname/jjiban.git"
  },
  "engines": {
    "node": ">=20.0.0"
  },
  "dependencies": {
    "commander": "^12.1.0",
    "chalk": "^5.3.0",
    "inquirer": "^12.2.0",
    "ora": "^8.1.1",
    "fs-extra": "^11.2.0"
  }
}
```

---

## 7. 배포 체크리스트

### 7.1 개발 환경 설정

- [ ] Node.js 20.x LTS 설치
- [ ] pnpm 9.x 설치 (`npm install -g pnpm`)
- [ ] 저장소 클론 후 `pnpm install`
- [ ] 환경 변수 설정 (`.env.local`)
- [ ] Prisma 마이그레이션 (`pnpm db:migrate`)
- [ ] 개발 서버 시작 (`pnpm dev`)

### 7.2 빌드 및 패키징

- [ ] 프론트엔드 빌드 (`pnpm --filter @jjiban/web build`)
- [ ] 백엔드 빌드 (`pnpm --filter @jjiban/server build`)
- [ ] CLI 패키지 번들링 (빌드 결과 복사)
- [ ] npm pack 테스트
- [ ] 로컬 설치 테스트 (`npm link`)

### 7.3 npm 배포

- [ ] package.json 버전 업데이트
- [ ] CHANGELOG.md 작성
- [ ] `npm publish` 실행
- [ ] GitHub 릴리즈 생성
- [ ] 설치 테스트 (`npm install -g jjiban`)

---

## 참고 자료

### 버전 검증 소스

- [React 19.2 Release Notes](https://react.dev/blog/2025/10/01/react-19-2)
- [Ant Design 6.0 Announcement](https://github.com/ant-design/ant-design/issues/55804)
- [Prisma 7.1.0 Release](https://github.com/prisma/prisma/releases)
- [Express 5.1.0 LTS Timeline](https://expressjs.com/2025/03/31/v5-1-latest-release.html)
- [Socket.IO npm](https://www.npmjs.com/package/socket.io)
- [xterm.js Migration to @xterm scope](https://www.npmjs.com/package/xterm)
- [dnd-kit vs react-beautiful-dnd](https://github.com/clauderic/dnd-kit/discussions/481)
- [Frappe Gantt](https://frappe.io/gantt)
- [Zustand React 19 Compatibility](https://github.com/pmndrs/zustand/discussions/2686)
