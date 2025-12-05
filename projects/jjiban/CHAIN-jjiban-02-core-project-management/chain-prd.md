# Chain PRD: Core Project Management

## 문서 정보

| 항목 | 내용 |
|------|------|
| Chain ID | CHAIN-jjiban-02 |
| Chain 이름 | Core Project Management |
| 문서 버전 | 1.0 |
| 작성일 | 2024-12-06 |
| 상태 | Draft |
| Chain 유형 | Feature |
| 예상 기간 | 2-3개월 |
| 상위 EPIC | jjiban - AI-Assisted Development Kanban Tool |
| 원본 PRD | projects/jjiban/jjiban-prd.md |

---

## 1. Chain 개요

### 1.1 Chain 비전
**"직관적이고 효율적인 프로젝트 관리 UI 제공"**

개발팀이 프로젝트 전체를 시각화하고 관리할 수 있는 핵심 기능을 제공합니다. 칸반 보드로 작업 현황을 추적하고, Gantt 차트로 일정을 관리하며, Task 상세 화면에서 문서와 연동하여 작업을 수행합니다.

### 1.2 범위 (Scope)

**포함:**
- 칸반 보드 (드래그 앤 드롭, 필터링, 검색, 컨텍스트 메뉴)
- Gantt 차트 (타임라인 시각화, 계층 구조, 일정 드래그 조정)
- Task 상세 화면 (정보 편집, 문서 연동, 미리보기)
- 백로그 관리 (테이블 뷰, 필터, 정렬)
- 마일스톤 관리 (릴리즈 계획, 진행률 추적)

**제외:**
- 워크플로우 자동화 (CHAIN-03, CHAIN-04)
- LLM 통합 기능 (CHAIN-04)
- 문서 생성 엔진 (CHAIN-03)

### 1.3 성공 지표
- ✅ 칸반 보드에서 드래그 앤 드롭으로 상태 변경 가능
- ✅ Gantt 차트에서 Epic → Task까지 4단계 계층 표시
- ✅ Task 상세 화면에서 문서 실시간 미리보기
- ✅ 필터링 및 검색 응답 시간 < 300ms
- ✅ 사용자 만족도 > 4.0/5.0

---

## 2. Module (기능) 목록

### MODULE-jjiban-02-01: Kanban Board UI (3주)
**비전**: "직관적인 칸반 보드로 작업 현황 실시간 추적"

**기능**:
- 칸반 보드 레이아웃 (컬럼별 카드 그룹핑)
- 드래그 앤 드롭 상태 변경 (react-beautiful-dnd)
- 카드 컴포넌트 (이슈 타입, 제목, 담당자, 라벨)
- 필터링 (담당자, 이슈 타입, 라벨, 날짜 범위)
- 검색 (제목, 설명, ID)
- 카드 컨텍스트 메뉴 (우클릭 → LLM 명령어, 편집, 삭제)

**인수 조건**:
- [ ] 9가지 워크플로우 상태를 컬럼으로 표시
- [ ] 드래그 앤 드롭 시 DB 자동 업데이트
- [ ] 필터 적용 시 < 300ms 응답
- [ ] 컨텍스트 메뉴에서 LLM 명령어 실행 가능

**예상 Task 수**: 7개

---

### MODULE-jjiban-02-02: Gantt Chart Visualization (3주)
**비전**: "프로젝트 일정을 시각적으로 관리하는 타임라인 차트"

**기능**:
- Gantt 차트 라이브러리 통합 (DHTMLX Gantt 또는 Frappe Gantt)
- 4단계 계층 구조 (Epic → Chain → Module → Task)
- 타임라인 바 (시작일, 종료일, 진행률)
- 드래그 일정 조정 (바를 드래그하여 날짜 변경)
- 의존성 표시 (선행 작업 화살표)
- 마일스톤 마커
- 확대/축소 (주간/월간/분기별 뷰)
- 내보내기 (PNG, PDF, CSV)

**인수 조건**:
- [ ] Epic부터 Task까지 계층 구조 표시
- [ ] 바 드래그 시 날짜 자동 업데이트
- [ ] 의존성 화살표 시각화
- [ ] PNG/PDF 내보내기 지원

**예상 Task 수**: 6개

---

### MODULE-jjiban-02-03: Task Detail & Document Integration (3주)
**비전**: "Task 정보와 문서를 하나의 화면에서 통합 관리"

**기능**:
- Task 기본 정보 패널 (담당자, 상태, 우선순위, 브랜치명)
- 설명 편집 (Rich Text Editor)
- 문서 목록 표시 (documentPath 기반)
- 문서 미리보기 패널 (Markdown 렌더링, Mermaid 다이어그램)
- 파일 네비게이션 (트리 뷰)
- 상위 관계 표시 (Module → Chain → Epic)
- 활동 이력 (상태 변경, 담당자 변경 로그)

**인수 조건**:
- [ ] Task 정보 실시간 저장
- [ ] 문서 미리보기 렌더링 (Markdown, Mermaid)
- [ ] 파일 트리 네비게이션
- [ ] 활동 이력 타임라인 표시

**예상 Task 수**: 6개

---

### MODULE-jjiban-02-04: Backlog Management (2주)
**비전**: "전체 이슈를 테이블 형식으로 효율적으로 관리"

**기능**:
- 테이블 뷰 (Epic, Chain, Module, Task 모두 표시)
- 컬럼 선택 및 정렬
- 필터링 (타입, 상태, 담당자, 날짜)
- 인라인 편집 (셀 클릭 → 즉시 수정)
- 벌크 작업 (여러 이슈 선택 → 일괄 상태 변경, 담당자 할당)
- 페이지네이션 (무한 스크롤 또는 페이지 번호)

**인수 조건**:
- [ ] 1000개 이상 이슈 표시 시 성능 유지
- [ ] 인라인 편집 즉시 저장
- [ ] 벌크 작업 지원 (10개 이상 동시 선택)
- [ ] 컬럼 정렬 및 필터링

**예상 Task 수**: 5개

---

### MODULE-jjiban-02-05: Milestone & Release Management (2주)
**비전**: "릴리즈 마일스톤 관리 및 진행률 추적"

**기능**:
- 마일스톤 생성 및 편집
- 마일스톤별 이슈 할당
- 진행률 계산 (완료된 이슈 / 전체 이슈)
- 타임라인 뷰 (마일스톤별 목표일 시각화)
- 번다운 차트 (남은 작업량 추이)
- 릴리즈 노트 생성 (마일스톤 완료 시)

**인수 조건**:
- [ ] 마일스톤 생성 및 이슈 할당
- [ ] 진행률 실시간 계산
- [ ] 번다운 차트 시각화
- [ ] 릴리즈 노트 자동 생성

**예상 Task 수**: 4개

---

## 3. 의존성

### 3.1 선행 Chains
- CHAIN-jjiban-01: Platform Foundation (Portal, DB, 인증)

### 3.2 후행 Chains (이 Chain에 의존)
- CHAIN-jjiban-03: Workflow & Document Engine
- CHAIN-jjiban-04: LLM Integration & Automation

### 3.3 외부 의존성
- react-beautiful-dnd (드래그 앤 드롭)
- DHTMLX Gantt 또는 Frappe Gantt (Gantt 차트)
- react-markdown + remark-gfm (Markdown 렌더링)
- mermaid (다이어그램 렌더링)
- recharts 또는 Chart.js (번다운 차트)

---

## 4. 주요 화면/API 목록

### 4.1 화면 목록
| 화면 이름 | 경로 | 설명 | 관련 Module |
|----------|------|------|-------------|
| 칸반 보드 | `/board/:projectId` | 칸반 뷰 | MODULE-02-01 |
| Gantt 차트 | `/gantt/:projectId` | Gantt 뷰 | MODULE-02-02 |
| Task 상세 | `/task/:taskId` | Task 상세 및 문서 | MODULE-02-03 |
| 백로그 | `/backlog/:projectId` | 테이블 뷰 | MODULE-02-04 |
| 마일스톤 | `/milestones/:projectId` | 릴리즈 관리 | MODULE-02-05 |

### 4.2 API 목록
| API | Method | 경로 | 설명 | 관련 Module |
|-----|--------|------|------|-------------|
| 이슈 목록 조회 | GET | `/api/issues?epicId={id}&status={status}` | 필터링된 이슈 목록 | MODULE-02-01 |
| 이슈 상태 변경 | PATCH | `/api/issues/:id/status` | 상태 업데이트 | MODULE-02-01 |
| Gantt 데이터 조회 | GET | `/api/gantt/:projectId` | Gantt 차트 데이터 | MODULE-02-02 |
| 일정 업데이트 | PATCH | `/api/issues/:id/schedule` | 시작일/종료일 변경 | MODULE-02-02 |
| Task 상세 조회 | GET | `/api/tasks/:id` | Task 정보 및 문서 | MODULE-02-03 |
| Task 수정 | PUT | `/api/tasks/:id` | Task 정보 업데이트 | MODULE-02-03 |
| 마일스톤 목록 | GET | `/api/milestones?projectId={id}` | 마일스톤 목록 | MODULE-02-05 |
| 마일스톤 생성 | POST | `/api/milestones` | 새 마일스톤 | MODULE-02-05 |

---

## 5. 기술 스택

| 레이어 | 기술 | 비고 |
|--------|------|------|
| Frontend | React 18 + TypeScript | SPA |
| Drag & Drop | react-beautiful-dnd | 칸반 드래그 |
| Gantt Chart | DHTMLX Gantt 또는 Frappe Gantt | 타임라인 시각화 |
| Markdown | react-markdown + remark-gfm | 문서 렌더링 |
| Diagram | mermaid | 다이어그램 렌더링 |
| Charts | recharts 또는 Chart.js | 번다운 차트 |
| Backend | Node.js (Express/Fastify) | REST API |
| Database | SQLite (Prisma) | 메타데이터 저장 |

---

## 6. 마일스톤

| 마일스톤 | 목표일 | 산출물 |
|----------|--------|--------|
| M1: 칸반 보드 | Week 3 | 칸반 UI, 드래그 앤 드롭 |
| M2: Gantt 차트 | Week 6 | Gantt 시각화, 일정 조정 |
| M3: Task 상세 & 백로그 | Week 9 | Task 상세, 백로그 테이블 |
| M4: 마일스톤 & 통합 | Week 12 | 마일스톤 관리, 전체 통합 |

---

## 7. 참조 문서

- 원본 EPIC PRD: `projects/jjiban/jjiban-prd.md`
- Section 3.1: 칸반 보드
- Section 3.2: Gantt 차트
- Section 3.3: Task 상세 및 문서 연동

---

## 8. 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2024-12-06 | 초안 작성 |
