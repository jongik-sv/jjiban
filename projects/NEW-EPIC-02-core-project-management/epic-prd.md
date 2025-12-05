# Epic PRD: Core Project Management System

## 문서 정보

| 항목 | 내용 |
|------|------|
| Epic ID | NEW-EPIC-02 |
| Epic 이름 | Core Project Management System (핵심 프로젝트 관리 시스템) |
| 문서 버전 | 1.0 |
| 작성일 | 2024-12-06 |
| 상태 | Draft |
| Epic 유형 | Feature (기능) |
| 예상 기간 | 5-6개월 |
| 상위 프로젝트 | jjiban (찌반) |
| 원본 PRD | `jjiban-prd.md` |

---

## 1. Epic 개요

### 1.1 Epic 비전

**"완전한 프로젝트 및 이슈 관리와 WBS 자동화"**

jjiban의 핵심 데이터 관리 시스템으로, Epic → Chain → Module → Task 4단계 계층 구조를 관리하고, WBS 자동 생성, Dashboard 보고, 마일스톤 관리를 통합 제공합니다.

### 1.2 범위 (Scope)

**포함:**
- **4단계 계층 관리**: Epic/Chain/Module/Task 생성, 수정, 삭제, 조회
- **이슈 타입**: Task, Bug, Technical Task, Spike
- **WBS 자동 생성**: PRD 문서 파싱 → DB 동기화
- **이슈 관계**: 상위/하위, 의존성, 블로커
- **Dashboard & 보고**: 프로젝트 요약, 내 할 일, 진행률, 차트
- **마일스톤 관리**: 타임라인 기반 릴리즈 마커
- **프로젝트 분석**: 번다운 차트, 속도 추적, 리소스 분석

**제외:**
- 워크플로우 상태 전환 (NEW-EPIC-03에서 처리)
- Kanban/Gantt UI (NEW-EPIC-04에서 처리)
- 문서 파일 저장 (NEW-EPIC-03에서 처리)
- LLM 통합 (NEW-EPIC-05에서 처리)

### 1.3 성공 지표

- ✅ 이슈 CRUD 성공률 100%
- ✅ WBS 동기화 정확도 100%
- ✅ 평균 API 응답 시간 < 200ms
- ✅ 계층 구조 무결성 유지 (외래 키 제약)
- ✅ Dashboard 데이터 실시간 업데이트 (< 3초)
- ✅ 마일스톤 추적 정확도 > 95%

---

## 2. Chain (기능) 목록

이 Epic은 다음 2개의 주요 Chain으로 구성됩니다:

### CHAIN-02-01: Dashboard & Reporting (1-3개월)
**비전**: "프로젝트 현황을 한눈에 파악하는 대시보드"

**범위**:
- 프로젝트 요약 카드 (진행률, 상태 분포)
- 내 할 일 목록 (담당 Task, 우선순위)
- 최근 활동 피드 (이슈 생성/수정, 댓글)
- 진행률 차트 (Recharts)
  - 상태별 이슈 분포 (파이 차트)
  - 시간별 진행 추이 (라인 차트)
  - Epic별 완료율 (바 차트)
- 필터 및 정렬

**기술 스택**:
- React + TypeScript
- Recharts (차트 라이브러리)
- Ant Design (UI 컴포넌트)
- React Query (데이터 페칭)

**산출물**:
- Dashboard 화면 (/)
- 프로젝트 요약 API (GET /api/dashboard/summary)
- 내 할 일 API (GET /api/dashboard/my-tasks)
- 활동 피드 API (GET /api/dashboard/activity)

---

### CHAIN-02-02: Project & Issue Management (1-3개월)
**비전**: "4단계 계층 구조로 체계적으로 프로젝트 관리"

**범위**:
- **4단계 계층 CRUD**
  - Epic: 프로젝트 레벨 (1-24개월)
  - Chain (Feature): 출시 단위 (1-3개월)
  - Module (User Story): 요구사항 단위 (1-4주)
  - Task: 실제 작업 단위 (1-5일)
- **이슈 타입**
  - Task, Bug, Technical Task, Spike
- **WBS 자동 생성**
  - Epic PRD → Chain 목록 추출
  - Chain PRD → Module 목록 추출
  - Module PRD → Task 목록 추출
  - CLI 명령어: `jjiban wbs sync --epic epic-prd.md`
- **이슈 관계**
  - 부모/자식 (계층 구조)
  - 의존성 (blocks, blocked by)
  - 관련 (related to)
- **마일스톤 관리**
  - 마일스톤 생성/수정/삭제
  - 이슈 연결
  - 타임라인 뷰

**기술 스택**:
- Backend: Node.js + Express + Prisma
- Database: SQLite (Prisma ORM)
- API: RESTful API

**데이터베이스 스키마**:
```prisma
model Epic {
  id          String   @id @default(cuid())
  name        String
  description String?
  prdPath     String?
  startDate   DateTime?
  targetDate  DateTime?
  status      String   @default("active")
  chains      Chain[]
}

model Chain {
  id              String   @id @default(cuid())
  epicId          String
  name            String
  prdPath         String?
  basicDesignPath String?
  epic            Epic     @relation(fields: [epicId], references: [id])
  modules         Module[]
}

model Module {
  id                  String   @id @default(cuid())
  chainId             String
  name                String
  prdPath             String?
  basicDesignPath     String?
  chain               Chain    @relation(fields: [chainId], references: [id])
  tasks               Task[]
}

model Task {
  id              String   @id @default(cuid())
  moduleId        String
  name            String
  type            String   @default("task")
  status          String   @default("todo")
  assignee        String?
  priority        String   @default("medium")
  documentPath    String?
  module          Module   @relation(fields: [moduleId], references: [id])
}

model Milestone {
  id          String   @id @default(cuid())
  name        String
  targetDate  DateTime
  status      String   @default("planning")
}
```

**산출물**:
- 이슈 CRUD API
  - GET /api/epics, POST /api/epics, PUT /api/epics/:id, DELETE /api/epics/:id
  - GET /api/chains, POST /api/chains, PUT /api/chains/:id, DELETE /api/chains/:id
  - GET /api/modules, POST /api/modules, PUT /api/modules/:id, DELETE /api/modules/:id
  - GET /api/tasks, POST /api/tasks, PUT /api/tasks/:id, DELETE /api/tasks/:id
- WBS 동기화 API
  - POST /api/wbs/sync (PRD 파싱 → DB 생성/업데이트)
- 마일스톤 API
  - GET /api/milestones, POST /api/milestones, PUT /api/milestones/:id, DELETE /api/milestones/:id

---

## 3. 통합된 기존 EPICs

| 기존 EPIC | 새 위치 | 변경사항 |
|----------|---------|---------|
| **EPIC-001** (Dashboard & Reporting) | **CHAIN-02-01** | EPIC → Chain으로 강등 |
| **EPIC-002** (프로젝트 & 이슈 관리) | **CHAIN-02-02** | EPIC → Chain으로 강등 |

**통합 근거**: Dashboard는 프로젝트 데이터를 UI로 표시하는 보고 기능이며, 프로젝트 관리 시스템과 긴밀하게 결합되어 있음. 두 기능을 하나의 EPIC으로 통합하면 데이터 흐름과 의존성이 명확해짐.

---

## 4. 의존성 및 일정

### 4.1 선행 EPICs
- **NEW-EPIC-01** (Platform Foundation) - 인증, DB 인프라 필요

### 4.2 후행 EPICs (이 EPIC에 의존)
- **NEW-EPIC-03** (Workflow & Document Engine) - 이슈 데이터 필요
- **NEW-EPIC-04** (Visualization & UX) - 이슈 데이터를 시각화
- **NEW-EPIC-05** (AI-Powered Automation) - Task 정보 필요

### 4.3 주요 마일스톤

| 마일스톤 | 목표일 | 산출물 |
|----------|--------|--------|
| M1: 계층 구조 완료 | Month 2 | Epic/Chain/Module/Task CRUD, Prisma 스키마 |
| M2: WBS 자동화 완료 | Month 3 | PRD 파싱, DB 동기화, CLI 명령어 |
| M3: 이슈 관계 완료 | Month 4 | 부모/자식, 의존성, 블로커 |
| M4: Dashboard 완료 | Month 5 | 요약, 내 할 일, 차트 |
| M5: 마일스톤 완료 | Month 6 | 마일스톤 CRUD, 타임라인 |

---

## 5. 기술 스택

| 레이어 | 기술 | 비고 |
|--------|------|------|
| **Frontend** | React + TypeScript | Dashboard UI |
| 차트 | Recharts | 파이, 라인, 바 차트 |
| UI 컴포넌트 | Ant Design | 테이블, 폼, 카드 |
| 상태 관리 | React Query | 서버 상태 관리 |
| **Backend** | Node.js + Express | RESTful API |
| **Database** | SQLite (Prisma ORM) | 이슈 메타데이터 |
| 파싱 | markdown-it | PRD 파일 파싱 |

---

## 6. 참조 문서

- 원본 PRD: `C:\project\jjiban\jjiban-prd.md`
- 기존 EPIC PRD:
  - `C:\project\jjiban\.archive\epic-restructure-backup-20241206\projects\EPIC-001-dashboard\epic-prd.md`
  - `C:\project\jjiban\.archive\epic-restructure-backup-20241206\projects\EPIC-002-project-issue-management\epic-prd.md`
- 재구조화 계획: `C:\Users\sviso\.claude\plans\parallel-petting-pike.md`

---

## 7. 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2024-12-06 | EPIC 재구조화 - EPIC-001 + EPIC-002 → NEW-EPIC-02 통합 |
