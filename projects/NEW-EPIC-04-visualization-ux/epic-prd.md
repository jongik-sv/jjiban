# Epic PRD: Visualization & User Experience

## 문서 정보

| 항목 | 내용 |
|------|------|
| Epic ID | NEW-EPIC-04 |
| Epic 이름 | Visualization & User Experience (시각화 & 사용자 경험) |
| 문서 버전 | 1.0 |
| 작성일 | 2024-12-06 |
| 상태 | Draft |
| Epic 유형 | Feature (기능) |
| 예상 기간 | 4-5개월 |
| 상위 프로젝트 | jjiban (찌반) |
| 원본 PRD | `jjiban-prd.md` |

---

## 1. Epic 개요

### 1.1 Epic 비전

**"프로젝트 모니터링 및 작업 관리를 위한 풍부한 시각화 인터페이스"**

프로젝트 데이터를 Kanban, Gantt, Task Detail의 세 가지 방식으로 시각화하여 사용자가 상황에 맞는 최적의 뷰를 선택할 수 있도록 합니다. 실시간 업데이트, 드래그 앤 드롭, 필터링을 통해 직관적이고 강력한 사용자 경험을 제공합니다.

### 1.2 범위 (Scope)

**포함:**
- **Kanban 보드**: 상태별 컬럼, 드래그 앤 드롭, 카드 뷰
- **Gantt 차트**: 타임라인 시각화, 계층 구조, 드래그 일정 조정
- **Task 상세 뷰어**: Task 정보, 문서 목록, Markdown 뷰어, 내장 터미널
- **실시간 업데이트**: WebSocket 기반 실시간 동기화
- **필터링 & 검색**: 담당자, 타입, 상태, 라벨, 날짜 범위
- **컨텍스트 메뉴**: 우클릭 → 상태 전환, LLM 명령어, 문서 열기
- **반응형 디자인**: 데스크탑/태블릿 대응

**제외:**
- 데이터 관리 (NEW-EPIC-02에서 처리)
- LLM 실행 (NEW-EPIC-05에서 처리, UI만 제공)

### 1.3 성공 지표

- ✅ Kanban 로딩 시간 < 1초 (100개 Task 기준)
- ✅ 드래그 앤 드롭 응답성 < 100ms
- ✅ Gantt 렌더링 시간 < 2초 (500개 Task 기준)
- ✅ WebSocket 실시간 업데이트 지연 < 500ms
- ✅ UI 컴포넌트 재사용률 > 70%
- ✅ 모바일 반응형 점수 > 90 (Lighthouse)

---

## 2. Chain (기능) 목록

### CHAIN-04-01: Kanban Board UI (1-2개월)
**비전**: "직관적인 드래그 앤 드롭 작업 관리"

**범위**:
- **Kanban 보드 레이아웃**
  - 상태별 컬럼 (Todo, 기본설계, 상세설계, ..., 완료)
  - 동적 컬럼 추가/삭제
  - 컬럼 너비 조정
- **Task 카드**
  - 제목, 담당자, 우선순위, 라벨, 예상 시간
  - 아바타, 아이콘, 색상 코딩
  - 카드 미리보기 (호버 시 상세 정보)
- **드래그 앤 드롭**
  - react-beautiful-dnd
  - 카드 이동 시 상태 자동 전환
  - 애니메이션 & 피드백
- **필터링 & 검색**
  - 담당자, 타입, 라벨, 우선순위 필터
  - 제목/설명 키워드 검색
  - 필터 조합 (AND/OR)
- **컨텍스트 메뉴**
  - 우클릭 → 상태 전환, 편집, 삭제
  - LLM 명령어 (설계 생성, 리뷰 요청 등)
  - 문서 열기

**기술 스택**:
- React + TypeScript
- react-beautiful-dnd (DnD)
- Ant Design (UI)
- Socket.IO (실시간)

**산출물**:
- Kanban Board 화면 (/kanban)
- Task Card 컴포넌트
- DnD 핸들러

---

### CHAIN-04-02: Gantt Chart UI (1-2개월)
**비전**: "프로젝트 일정을 한눈에 파악하는 타임라인"

**범위**:
- **Gantt 차트 레이아웃**
  - 좌측: 계층 트리 (Epic → Chain → Module → Task)
  - 우측: 타임라인 바
  - 확대/축소 (일/주/월 단위)
- **타임라인 시각화**
  - 시작/종료일 바
  - 진행률 표시 (%, 색상)
  - 마일스톤 마커 (◆)
  - 의존성 화살표
- **드래그 일정 조정**
  - 바 드래그 → 시작/종료일 변경
  - 리사이즈 → 기간 조정
  - 제약 조건 (선행 Task 완료 전 시작 불가)
- **계층 구조**
  - 펼침/접힘 (Expand/Collapse)
  - Epic → Chain → Module → Task 계층
  - 부모 Task의 일정은 자식의 집계
- **필터링 & 내보내기**
  - 타입, 담당자, 날짜 범위 필터
  - PNG, PDF, CSV 내보내기

**기술 스택**:
- DHTMLX Gantt (유료) 또는 Frappe Gantt (오픈소스)
- 또는 D3.js 커스텀 구현
- React + TypeScript

**산출물**:
- Gantt Chart 화면 (/gantt)
- Gantt 컴포넌트
- 내보내기 기능

---

### CHAIN-04-03: Task Detail Viewer (1-2개월)
**비전**: "Task의 모든 정보를 한 곳에서 관리"

**범위**:
- **Task 정보 패널**
  - 제목, 설명, 상태, 담당자, 우선순위
  - 일정 (시작일, 마감일, 예상 시간, 실제 시간)
  - 브랜치명, 라벨, 상위 Module
  - 편집 모드 (인라인 편집)
- **문서 목록 & 뷰어**
  - Task 폴더의 모든 문서 표시
  - 트리 뷰 (00-prd.md, 01-basic-design.md, ...)
  - 문서 클릭 → Markdown 뷰어로 미리보기
  - GitHub Flavored Markdown 렌더링
  - 코드 하이라이팅 (highlight.js)
  - Mermaid 다이어그램 렌더링
  - 수식 렌더링 (KaTeX)
- **내장 터미널 (UI만)**
  - xterm.js 기반 터미널 UI
  - LLM 실행은 NEW-EPIC-05에서 처리
  - 전체화면/분할화면 모드
- **히스토리 & 액티비티**
  - 상태 전환 이력
  - 댓글/메모
  - 파일 변경 이력

**기술 스택**:
- React + TypeScript
- react-markdown (Markdown 렌더링)
- highlight.js (코드 하이라이팅)
- mermaid (다이어그램)
- KaTeX (수식)
- xterm.js (터미널 UI)

**산출물**:
- Task Detail 화면 (/tasks/:id)
- Markdown Viewer 컴포넌트
- Terminal UI 컴포넌트

---

## 3. 통합된 기존 EPICs

| 기존 EPIC | 새 위치 | 변경사항 |
|----------|---------|---------|
| **EPIC-005** (Kanban Board UI) | **CHAIN-04-01** | EPIC → Chain으로 강등 |
| **EPIC-006** (Gantt Chart UI) | **CHAIN-04-02** | EPIC → Chain으로 강등 |
| **EPIC-007** (Task Detail Viewer) | **CHAIN-04-03** | EPIC → Chain으로 강등 |

**통합 근거**: 세 가지 모두 프로젝트 데이터를 다른 방식으로 시각화하는 UI 컴포넌트입니다. Kanban은 상태 중심, Gantt는 일정 중심, Task Detail은 개별 Task 중심 뷰를 제공하며, 공통 요소(필터, 검색, 실시간 업데이트)를 공유합니다.

---

## 4. 의존성 및 일정

### 4.1 선행 EPICs
- **NEW-EPIC-01** (Platform Foundation) - Portal, 디자인 시스템
- **NEW-EPIC-02** (Core Project Management) - Task 데이터
- **NEW-EPIC-03** (Workflow & Document Engine) - 워크플로우 상태, 문서

### 4.2 후행 EPICs (이 EPIC에 의존)
- **NEW-EPIC-05** (AI-Powered Automation) - 터미널 UI 사용

### 4.3 주요 마일스톤

| 마일스톤 | 목표일 | 산출물 |
|----------|--------|--------|
| M1: Kanban 완료 | Month 2 | Kanban Board, DnD, 필터링 |
| M2: Gantt 완료 | Month 3 | Gantt Chart, 타임라인, 드래그 일정 |
| M3: Task Detail 완료 | Month 4 | Task 정보, 문서 뷰어 |
| M4: 실시간 업데이트 완료 | Month 5 | WebSocket, 실시간 동기화 |

---

## 5. 기술 스택

| 레이어 | 기술 | 비고 |
|--------|------|------|
| **Frontend** | React + TypeScript | SPA |
| UI 라이브러리 | Ant Design | 테이블, 폼, 카드 |
| DnD | react-beautiful-dnd | Kanban 드래그 앤 드롭 |
| Gantt | DHTMLX / Frappe / D3.js | 타임라인 시각화 |
| Markdown | react-markdown + remark-gfm | GFM 렌더링 |
| 다이어그램 | mermaid | 시퀀스, 플로우차트 |
| 터미널 | xterm.js | 웹 터미널 UI |
| 실시간 | Socket.IO | WebSocket |

---

## 6. 참조 문서

- 원본 PRD: `C:\project\jjiban\jjiban-prd.md`
- 기존 EPIC PRD:
  - `C:\project\jjiban\.archive\epic-restructure-backup-20241206\projects\EPIC-005-kanban-board\epic-prd.md`
  - `C:\project\jjiban\.archive\epic-restructure-backup-20241206\projects\EPIC-006-gantt-chart\epic-prd.md`
  - `C:\project\jjiban\.archive\epic-restructure-backup-20241206\projects\EPIC-007-task-detail-viewer\epic-prd.md`
- 재구조화 계획: `C:\Users\sviso\.claude\plans\parallel-petting-pike.md`

---

## 7. 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2024-12-06 | EPIC 재구조화 - EPIC-005 + EPIC-006 + EPIC-007 → NEW-EPIC-04 통합 |
