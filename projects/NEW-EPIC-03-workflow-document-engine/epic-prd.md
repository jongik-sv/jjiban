# Epic PRD: Workflow & Document Engine

## 문서 정보

| 항목 | 내용 |
|------|------|
| Epic ID | NEW-EPIC-03 |
| Epic 이름 | Workflow & Document Engine (워크플로우 & 문서 엔진) |
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

**"지능형 워크플로우 자동화와 통합 문서 생명주기 관리"**

Task의 9단계 워크플로우 (Todo → 설계 → 구현 → 테스트 → 완료)를 자동화하고, 각 단계마다 자동으로 문서를 생성/관리하는 통합 엔진입니다. 워크플로우와 문서가 긴밀하게 결합되어 프로세스 자동화를 실현합니다.

### 1.2 범위 (Scope)

**포함:**
- **9단계 워크플로우 상태 머신**
  - Todo → 기본설계 → 상세설계 → 설계리뷰 → 구현 → 코드리뷰 → 통합테스트 → 완료
- **품질 게이트 (Quality Gates)**
  - 설계 리뷰 게이트 (Design Review)
  - 코드 리뷰 게이트 (Code Review)
- **문서 자동 생성 & 버전 관리**
  - 각 워크플로우 단계별 문서 자동 생성
  - Working Copy 방식 (02-detail-design.md, 05-implementation.md)
  - Git 기반 버전 관리
  - 선택적 .archive 백업
- **문서 템플릿 시스템**
  - Epic/Chain/Module/Task PRD 템플릿
  - 설계/리뷰/구현 템플릿
  - 테스트/매뉴얼 템플릿
- **하이브리드 파일 시스템 (DB + FS)**
  - SQLite: 메타데이터 (상태, 담당자, 일정)
  - File System: 문서 컨텐츠 (PRD, 설계서, 코드)
  - Git: 버전 관리
- **워크플로우 히스토리 & 롤백**
  - 상태 전환 이력 추적
  - 이전 단계로 롤백

**제외:**
- LLM 실행 (NEW-EPIC-05에서 처리)
- UI 시각화 (NEW-EPIC-04에서 처리)

### 1.3 성공 지표

- ✅ 워크플로우 전환 성공률 > 99%
- ✅ 문서 자동 생성 정확도 100%
- ✅ 품질 게이트 통과율 추적
- ✅ 문서-이슈 동기화 정확도 100%
- ✅ Git 커밋 자동화 성공률 > 95%

---

## 2. Chain (기능) 목록

### CHAIN-03-01: Workflow Engine (2-3개월)
**비전**: "9단계 자동화 워크플로우로 품질 보장"

**범위**:
- **9단계 워크플로우 구현**
  - 상태: todo, bd(기본설계), dd(상세설계), dr(설계리뷰), im(구현), cr(코드리뷰), ts(통합테스트), xx(완료)
  - 명령어: start, draft, plan, review, revise, approved, build, audit, patch, verify, done
- **상태 전환 로직**
  - 유효성 검증 (잘못된 전환 방지)
  - 조건부 전환 (품질 게이트)
  - 자동 문서 생성 트리거
- **품질 게이트**
  - 설계 리뷰 게이트: 설계 완전성, 일치성, 타당성 검증
  - 코드 리뷰 게이트: 코드 품질, 설계-구현 일치성 검증
  - LLM 기반 자동 리뷰 (NEW-EPIC-05와 연동)
- **워크플로우 히스토리**
  - 상태 전환 이력 저장
  - 타임스탬프, 실행자, 변경 내용
  - 롤백 지원

**산출물**:
- Workflow Service (Backend)
- 상태 전환 API (POST /api/workflow/transition)
- 히스토리 API (GET /api/workflow/history/:taskId)

---

### CHAIN-03-02: Document Management (2-3개월)
**비전**: "자동 문서 생성과 Git 기반 버전 관리"

**범위**:
- **문서 자동 생성**
  - 00-prd.md (Task PRD)
  - 01-basic-design.md (기본설계)
  - 02-detail-design.md (상세설계, Working Copy)
  - 03-detail-design-review-{llm}-{n}.md (설계 리뷰)
  - 05-implementation.md (구현, Working Copy)
  - 05-tdd-test-results.md (TDD 테스트 결과)
  - 05-e2e-test-results.md (E2E 테스트 결과)
  - 06-code-review-{llm}-{n}.md (코드 리뷰)
  - 08-integration-test.md (통합 테스트)
  - 09-manual.md (매뉴얼)
- **Working Copy 방식**
  - 최신 파일 항상 02-detail-design.md, 05-implementation.md
  - revise/patch 시 직접 수정
  - .archive/에 이전 버전 백업 (선택적)
- **템플릿 시스템**
  - Markdown 템플릿 관리
  - 변수 치환 ({{taskName}}, {{description}})
  - 템플릿 CRUD
- **파일 시스템 통합**
  - 폴더 구조: `projects/{epic}/{chain}/{module}/{task}/`
  - DB의 documentPath 필드와 연동
  - Git 자동 커밋 (옵션)
- **문서 검색 & 필터**
  - 전체 문서 검색
  - 키워드, 태그 필터
  - 최근 수정 문서

**산출물**:
- Document Service (Backend)
- 문서 생성 API (POST /api/documents/generate)
- 문서 CRUD API (GET/PUT/DELETE /api/documents/:path)
- 템플릿 CRUD API (GET/POST/PUT/DELETE /api/templates)

---

## 3. 통합된 기존 EPICs

| 기존 EPIC | 새 위치 | 변경사항 |
|----------|---------|---------|
| **EPIC-003** (Workflow Engine) | **CHAIN-03-01** | EPIC → Chain으로 강등 |
| **EPIC-004** (Document Management) | **CHAIN-03-02** | EPIC → Chain으로 강등 |

**통합 근거**: 워크플로우 단계마다 특정 문서가 생성되고, 문서 상태가 워크플로우 전환을 트리거합니다. 두 시스템은 불가분의 관계이므로 하나의 EPIC으로 통합하여 프로세스 자동화를 실현합니다.

---

## 4. 의존성 및 일정

### 4.1 선행 EPICs
- **NEW-EPIC-01** (Platform Foundation) - DB, 파일 시스템
- **NEW-EPIC-02** (Core Project Management) - Task 데이터

### 4.2 후행 EPICs (이 EPIC에 의존)
- **NEW-EPIC-04** (Visualization & UX) - 워크플로우 상태 표시
- **NEW-EPIC-05** (AI-Powered Automation) - LLM 리뷰, 자동 생성

### 4.3 주요 마일스톤

| 마일스톤 | 목표일 | 산출물 |
|----------|--------|--------|
| M1: 상태 머신 완료 | Month 2 | 9단계 워크플로우, 상태 전환 API |
| M2: 품질 게이트 완료 | Month 3 | 설계/코드 리뷰 게이트 |
| M3: 문서 생성 완료 | Month 4 | 자동 문서 생성, 템플릿 시스템 |
| M4: 파일 시스템 완료 | Month 5 | 하이브리드 DB+FS, Git 통합 |
| M5: 히스토리 & 롤백 완료 | Month 6 | 워크플로우 이력, 롤백 기능 |

---

## 5. 기술 스택

| 레이어 | 기술 | 비고 |
|--------|------|------|
| **Backend** | Node.js + Express | Workflow & Document Service |
| 상태 머신 | XState (선택) | 또는 자체 구현 |
| 문서 파싱 | markdown-it | Markdown 파싱 |
| 템플릿 엔진 | Handlebars | 변수 치환 |
| **File System** | Node.js fs 모듈 | 문서 읽기/쓰기 |
| 버전 관리 | simple-git | Git 자동화 |
| **Database** | SQLite (Prisma) | 워크플로우 상태, 히스토리 |

---

## 6. 참조 문서

- 원본 PRD: `C:\project\jjiban\jjiban-prd.md`
- 기존 EPIC PRD:
  - `C:\project\jjiban\.archive\epic-restructure-backup-20241206\projects\EPIC-003-workflow-engine\epic-prd.md`
  - `C:\project\jjiban\.archive\epic-restructure-backup-20241206\projects\EPIC-004-document-management\epic-prd.md`
- 재구조화 계획: `C:\Users\sviso\.claude\plans\parallel-petting-pike.md`

---

## 7. 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2024-12-06 | EPIC 재구조화 - EPIC-003 + EPIC-004 → NEW-EPIC-03 통합 |
