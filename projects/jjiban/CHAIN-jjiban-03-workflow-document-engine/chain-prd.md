# Chain PRD: Workflow & Document Engine

## 문서 정보

| 항목 | 내용 |
|------|------|
| Chain ID | CHAIN-jjiban-03 |
| Chain 이름 | Workflow & Document Engine |
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
**"체계적인 워크플로우와 자동화된 문서 관리 시스템"**

Task의 9단계 워크플로우를 체계적으로 관리하고, 각 단계마다 자동으로 문서를 생성하며, DB와 파일 시스템을 하이브리드 방식으로 통합 관리합니다.

### 1.2 범위 (Scope)

**포함:**
- 워크플로우 상태 전환 엔진 (9단계: Todo → 완료)
- 품질 게이트 구현 (설계 리뷰, 코드 리뷰 사이클)
- 문서 자동 생성 시스템 (각 단계별 템플릿)
- 문서 관리 체계 (하이브리드 DB + File System)
- WBS 자동 생성 및 DB Merge
- 문서 뷰어 (Markdown, Mermaid)

**제외:**
- LLM 실행 로직 (CHAIN-04)
- 칸반/Gantt UI (CHAIN-02)

### 1.3 성공 지표
- ✅ 9단계 워크플로우 자동 전환
- ✅ 각 단계별 문서 자동 생성 (템플릿 기반)
- ✅ 리뷰 사이클 무한 반복 가능 (approved 전까지)
- ✅ WBS 파싱 성공률 > 95%
- ✅ 문서 렌더링 속도 < 500ms

---

## 2. Module (기능) 목록

### MODULE-jjiban-03-01: Workflow State Machine (2주)
**비전**: "엄격하고 체계적인 상태 전환 시스템"

**기능**:
- 9단계 상태 정의 (Todo, 기본설계, 상세설계, 설계리뷰, 구현, 코드리뷰, 통합테스트, 완료)
- 상태 전환 규칙 엔진 (허용된 전환만 가능)
- 명령어 매핑 (start, draft, plan, review, build 등)
- 품질 게이트 구현 (설계 리뷰, 코드 리뷰 사이클)
- 상태 기호 자동 업데이트 (`[ ]`, `[dd]`, `[im]` 등)

**인수 조건**:
- [ ] 9단계 상태 전환 정의
- [ ] 잘못된 전환 시 에러 반환
- [ ] 리뷰 사이클 무한 반복 가능 (approved 전까지)

**예상 Task 수**: 4개

---

### MODULE-jjiban-03-02: Document Template System (3주)
**비전**: "각 단계별 문서를 자동 생성하는 템플릿 엔진"

**기능**:
- 문서 템플릿 관리 (00-prd.md, 01-basic-design.md 등)
- 자동 생성 로직 (상태 전환 시 트리거)
- Working Copy 방식 (02-detail-design.md, 05-implementation.md 직접 수정)
- 백업 시스템 (.archive 폴더에 버전 백업)
- 파일 네이밍 규칙 (번호 prefix, LLM명, 순번)
- 변수 치환 (프로젝트명, 날짜, 담당자 등)

**인수 조건**:
- [ ] 10가지 문서 템플릿 정의
- [ ] 상태 전환 시 자동 생성
- [ ] Working Copy 수정 및 백업
- [ ] 변수 치환 정확도 100%

**예상 Task 수**: 6개

---

### MODULE-jjiban-03-03: Hybrid Document Management (2주)
**비전**: "DB와 파일 시스템을 결합한 하이브리드 관리"

**기능**:
- DB에 메타데이터 저장 (documentPath, 상태, 일정)
- 파일 시스템에 실제 문서 저장 (Markdown, 로그)
- 폴더 구조 자동 생성 (Epic → Chain → Module → Task)
- 파일 읽기/쓰기 API
- 버전 관리 (Git 통합)

**인수 조건**:
- [ ] Task 생성 시 폴더 자동 생성
- [ ] documentPath DB 저장
- [ ] 파일 읽기/쓰기 API 제공
- [ ] Git 커밋 가능

**예상 Task 수**: 4개

---

### MODULE-jjiban-03-04: WBS Auto-Generation & DB Merge (2주)
**비전**: "PRD 문서에서 WBS를 자동 추출하여 DB에 동기화"

**기능**:
- PRD 문서 파싱 (Markdown 체크리스트, 번호 목록)
- Epic PRD → Chain 목록 추출
- Chain PRD → Module 목록 추출
- Module PRD → Task 목록 추출
- Merge 전략 (INSERT/UPDATE/DELETE)
- Conflict 해결 (문서 vs DB 우선순위)

**인수 조건**:
- [ ] 체크리스트 파싱 성공률 > 95%
- [ ] Merge 시 충돌 감지 및 해결
- [ ] Epic/Chain/Module 3단계 파싱 지원

**예상 Task 수**: 5개

---

### MODULE-jjiban-03-05: Document Viewer (2주)
**비전**: "Markdown 문서를 아름답게 렌더링하는 뷰어"

**기능**:
- Markdown 렌더링 (GitHub Flavored Markdown)
- 코드 하이라이팅 (Prism.js 또는 Highlight.js)
- 다이어그램 렌더링 (Mermaid.js)
- 수식 렌더링 (KaTeX)
- 체크리스트 지원
- 파일 네비게이션 (트리 뷰)
- 검색 기능

**인수 조건**:
- [ ] Markdown 완전 렌더링
- [ ] Mermaid 다이어그램 표시
- [ ] 코드 하이라이팅
- [ ] 렌더링 속도 < 500ms

**예상 Task 수**: 5개

---

## 3. 의존성

### 3.1 선행 Chains
- CHAIN-jjiban-01: Platform Foundation

### 3.2 후행 Chains
- CHAIN-jjiban-04: LLM Integration & Automation

### 3.3 외부 의존성
- react-markdown + remark-gfm
- mermaid.js
- KaTeX
- Prism.js 또는 Highlight.js
- gray-matter (Frontmatter 파싱)

---

## 4. 주요 API 목록

| API | Method | 경로 | 설명 |
|-----|--------|------|------|
| 상태 전환 | POST | `/api/workflow/:taskId/:command` | 명령어로 상태 전환 (start, draft, plan 등) |
| 문서 생성 | POST | `/api/documents/generate` | 템플릿 기반 문서 자동 생성 |
| 문서 읽기 | GET | `/api/documents/read?path={path}` | 파일 시스템에서 문서 읽기 |
| WBS 동기화 | POST | `/api/wbs/sync` | PRD 파싱 및 DB Merge |

---

## 5. 기술 스택

| 레이어 | 기술 | 비고 |
|--------|------|------|
| Workflow Engine | State Machine (FSM) | 상태 전환 규칙 |
| Template Engine | Handlebars 또는 EJS | 문서 템플릿 |
| Markdown Parser | gray-matter + unified | Frontmatter + AST |
| Document Renderer | react-markdown + Mermaid | 클라이언트 렌더링 |
| File System | fs-extra | Node.js 파일 I/O |

---

## 6. 마일스톤

| 마일스톤 | 목표일 | 산출물 |
|----------|--------|--------|
| M1: Workflow Engine | Week 2 | 상태 전환 규칙 엔진 |
| M2: Document Templates | Week 5 | 10가지 템플릿 및 자동 생성 |
| M3: WBS & Viewer | Week 9 | WBS 파싱, 문서 뷰어 |
| M4: 통합 테스트 | Week 12 | 전체 워크플로우 통합 |

---

## 7. 참조 문서

- 원본 EPIC PRD: `projects/jjiban/jjiban-prd.md`
- Section 2.2: 워크플로우 체계
- Section 2.3: 문서 관리 체계

---

## 8. 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2024-12-06 | 초안 작성 |
