# PRD를 전략적 Epic으로 분리하는 범용 명령어

현재 프로젝트의 PRD 문서를 분석하여 **전략적 Epic 단위 (3-6개월)**로 분리하고, projects 폴더 구조를 생성합니다.

## ⚠️ 중요 지침

**이 명령어는 문서화 작업 전용입니다:**
- ✅ PRD 문서 분석 및 전략적 Epic 분할
- ✅ Epic PRD 문서 생성
- ✅ Chain (Feature) 구조 정의
- ✅ 폴더 구조 생성
- ✅ 의존성 분석 및 매핑
- ❌ **코드 작성 금지** - 구현은 별도 명령어 사용
- ❌ **코드 생성 금지** - 설계 문서만 작성

---

## 📊 전략적 EPIC 개념

### True EPIC-Level vs Chain-Level

**⚠️ 핵심 원칙: EPIC은 전략적 비즈니스 역량 (3-6개월 단위)**

| 레벨 | 크기 | 목적 | 예시 |
|------|------|------|------|
| **EPIC-Level** | 3-6개월 | 전략적 비즈니스 역량 | "Core Project Management System" |
| **Chain-Level** | 1-3개월 | 실행 가능한 Feature | "Dashboard & Reporting" |
| **Module-Level** | 1-4주 | User Story | "프로젝트 요약 카드" |
| **Task-Level** | 1-5일 | 구현 작업 | "API 엔드포인트 구현" |

### EPIC 크기 가이드라인

**너무 세분화된 경우 (❌ Chain-Level을 EPIC으로 오해)**:
```
❌ EPIC-001: Dashboard (1-3개월)
❌ EPIC-002: Kanban Board (1-2개월)
❌ EPIC-003: Gantt Chart (1-2개월)
→ 문제: EPIC이 Chain 수준으로 너무 작음
```

**적절한 전략적 EPIC (✅ True EPIC-Level)**:
```
✅ NEW-EPIC-02: Visualization & User Experience (4-5개월)
   ├── CHAIN-02-01: Dashboard & Reporting (1-3개월)
   ├── CHAIN-02-02: Kanban Board UI (1-2개월)
   └── CHAIN-02-03: Gantt Chart UI (1-2개월)
→ 해결: 관련 기능들을 전략적 EPIC으로 통합
```

---

## 비즈니스 요구사항 중심 분할 원칙

### 1. 전략적 그룹핑 우선
**기능적 유사성이 아닌 비즈니스 역량으로 그룹핑**

❌ **잘못된 분할 (기능별 세분화)**:
- EPIC-001: Dashboard
- EPIC-002: Kanban
- EPIC-003: Gantt
→ 각각 1-2개월 규모, 너무 작음

✅ **올바른 분할 (전략적 통합)**:
- NEW-EPIC: Visualization & UX (4-5개월)
  - 세 가지 기능 모두 "프로젝트 데이터 시각화"라는 전략적 역량

### 2. 도메인 중심 사고
**비즈니스 도메인과 기능 영역을 우선 고려**

예시:
- 도메인: "프로젝트 관리" → EPIC: Core Project Management
- 도메인: "AI 자동화" → EPIC: AI-Powered Automation
- 도메인: "워크플로우 & 문서" → EPIC: Workflow & Document Engine

### 3. 독립적 가치 제공
**각 EPIC이 3-6개월 동안 독립적인 비즈니스 가치를 제공**

### 4. 사용자 시나리오 기반
**사용자 여정과 워크플로우를 고려한 분할**

### 5. EPIC 개수 제한
**⚠️ 중요: 최소 3개, 최대 7개 전략적 EPIC**
- 너무 많으면 → 포트폴리오 관리 복잡
- 너무 적으면 → EPIC이 너무 거대해져 관리 어려움

---

## 사전 요구사항

사용자에게 다음 정보를 요청하세요:
1. **PRD 파일 경로** (예: `./jjiban-prd.md`)
2. **Epic 분류 방식** (자동 추론 또는 수동 지정)
3. **프로젝트 루트 폴더** (기본값: `./projects/`)

---

## 실행 단계

### 1단계: PRD 문서 분석

1. PRD 파일 읽기
2. 문서 구조 파악 (섹션, 헤더 레벨)
3. 주요 **비즈니스 도메인** 식별:
   - 섹션 헤더 (## 또는 ###)
   - 키워드 패턴 (관리, UI, 자동화, 워크플로우 등)
   - 논리적 그룹핑 (유사 기능 묶기)

### 2단계: 전략적 EPIC 추출

**⚠️ 핵심: 세분화가 아닌 통합 (Consolidation) 접근**

#### 2-1. 초기 기능 그룹 추출

다음 기준으로 **초기 기능 그룹**을 추출:

**기능 영역 키워드:**
- **관리**: "관리", "Management", "CRUD"
- **UI/시각화**: "UI", "화면", "View", "Board", "Chart", "Dashboard"
- **워크플로우**: "워크플로우", "Workflow", "프로세스", "상태"
- **문서**: "문서", "Document", "템플릿"
- **자동화**: "자동화", "Automation", "LLM", "AI"
- **배포**: "배포", "Deployment", "CLI", "설치"
- **통합**: "통합", "Integration", "연동", "API"

#### 2-2. 통합 및 그룹핑 (Consolidation)

**통합 원칙:**
```
1. 기능적 유사성: 비슷한 기능들을 하나의 EPIC으로
   예: Kanban + Gantt + Task Detail → Visualization EPIC

2. 데이터 흐름: 같은 데이터를 사용하는 기능들
   예: Dashboard + Project Management → Core PM EPIC

3. 워크플로우 연계: 단계적으로 연결된 기능들
   예: Workflow Engine + Document Management → Workflow & Doc EPIC

4. 기술적 결합도: 긴밀하게 결합된 시스템
   예: LLM Terminal + Automation + CLI → AI Automation EPIC
```

#### 2-3. EPIC 크기 검증

각 EPIC 후보를 다음 기준으로 검증:

**✅ True EPIC-Level 기준:**
- 예상 기간: 3-6개월
- 포함 Chain 수: 2-4개 (각 1-3개월)
- 비즈니스 가치: 전략적 역량 제공
- 독립성: 다른 EPIC 없이도 가치 제공 가능

**❌ Chain-Level로 강등 기준:**
- 예상 기간: 1-3개월 (너무 작음)
- 단일 기능: 하나의 Feature만 포함
- 의존성: 다른 EPIC의 일부로 동작

**통합 필요 신호:**
```
만약 다음 패턴이 보이면 통합 고려:
- UI 컴포넌트 3개 이상이 개별 EPIC → Visualization EPIC으로 통합
- 관리 기능 3개 이상이 개별 EPIC → Management EPIC으로 통합
- 자동화 관련 3개 이상 → Automation EPIC으로 통합
```

### 2-4. 플랫폼 EPIC (EPIC-P01) 자동 생성

**⚠️ 중요: 비기능 요구사항은 모두 하나의 EPIC (EPIC-P01)으로 통합**

**플랫폼 EPIC 정의:**
- 시스템이 작동하기 위해 반드시 필요한 모든 비기능 요구사항
- 여러 개의 플랫폼 EPIC으로 분리하지 말고 **단일 EPIC**으로 관리
- 세부 기능은 Chain으로 분해

**EPIC-P01에 포함되어야 하는 필수 시스템 기능:**

1. **Portal & 레이아웃 시스템**
   - 전역 헤더, 사이드바, 네비게이션, 레이아웃 템플릿

2. **디자인 시스템 & 공통 컴포넌트**
   - 색상, 타이포그래피, 공통 컴포넌트 라이브러리

3. **데이터베이스 스키마**
   - Prisma Schema, 마이그레이션

4. **사용자 관리**
   - User 테이블, 로그인, JWT, RBAC

5. **시스템 설정, 로깅, 에러 처리 & 보안**
   - 환경 변수, config 파일, 로깅, CORS, Helmet, XSS 방지

6. **DevOps**
   - Git 전략, CI/CD 파이프라인

**플랫폼 EPIC 체크리스트:**
```
PRD 분석 시 다음을 자동으로 체크하고 누락 시 EPIC-P01에 추가:
- [ ] Portal & 레이아웃
- [ ] 디자인 시스템
- [ ] 데이터베이스 스키마
- [ ] 사용자 관리
- [ ] 시스템 설정 & 로깅
- [ ] 보안
- [ ] DevOps
```

---

## EPIC 네이밍 규칙

### 전략적 EPIC
- **ID 형식**: `NEW-EPIC-{01-99}`
- **폴더명**: `NEW-EPIC-{ID}-{kebab-case-name}`
- **예시**:
  - `NEW-EPIC-01-platform-foundation`
  - `NEW-EPIC-02-core-project-management`
  - `NEW-EPIC-03-workflow-document-engine`

### 플랫폼 EPIC (특수)
- **ID 형식**: `NEW-EPIC-01` 또는 `EPIC-P01` (레거시)
- **폴더명**: `NEW-EPIC-01-platform-foundation`

### Chain (Feature)
- **ID 형식**: `CHAIN-{epic-id}-{01-99}-{name}`
- **폴더명**: `CHAIN-{epic-id}-{num}-{kebab-case-name}`
- **예시**:
  - `CHAIN-02-01-dashboard-reporting`
  - `CHAIN-04-03-task-detail-viewer`

---

## 폴더 구조

```
projects/
├── NEW-EPIC-01-platform-foundation/
│   ├── epic-prd.md
│   └── (Chain 폴더는 필요시 생성)
│
├── NEW-EPIC-02-core-project-management/
│   ├── epic-prd.md
│   ├── CHAIN-02-01-dashboard-reporting/
│   │   └── chain-prd.md
│   └── CHAIN-02-02-project-issue-management/
│       └── chain-prd.md
│
├── NEW-EPIC-03-workflow-document-engine/
│   ├── epic-prd.md
│   ├── CHAIN-03-01-workflow-engine/
│   │   └── chain-prd.md
│   └── CHAIN-03-02-document-management/
│       └── chain-prd.md
│
├── NEW-EPIC-04-visualization-ux/
│   ├── epic-prd.md
│   ├── CHAIN-04-01-kanban-board/
│   ├── CHAIN-04-02-gantt-chart/
│   └── CHAIN-04-03-task-detail-viewer/
│
└── NEW-EPIC-05-ai-automation/
    ├── epic-prd.md
    ├── CHAIN-05-01-llm-terminal/
    ├── CHAIN-05-02-workflow-automation/
    └── CHAIN-05-03-cli-deployment/
```

---

## Epic PRD 템플릿

```markdown
# Epic PRD: {Epic 이름}

## 문서 정보

| 항목 | 내용 |
|------|------|
| Epic ID | NEW-EPIC-{번호} |
| Epic 이름 | {이름} |
| 문서 버전 | 1.0 |
| 작성일 | {오늘 날짜} |
| 상태 | Draft |
| Epic 유형 | 플랫폼 (Platform) 또는 기능 (Feature) |
| 예상 기간 | {3-6}개월 |
| 상위 프로젝트 | {프로젝트명} |
| 원본 PRD | {원본 PRD 파일 경로} |

---

## 1. Epic 개요

### 1.1 Epic 비전
**"{전략적 비즈니스 역량 설명}"**

{이 Epic이 달성하고자 하는 핵심 목표 - 전략적 수준}

### 1.2 범위 (Scope)

**포함:**
- {전략적 역량 1}
- {전략적 역량 2}
- {전략적 역량 3}

**제외:**
- {명시적으로 제외되는 것들}

### 1.3 성공 지표
- ✅ {측정 가능한 성공 기준 1}
- ✅ {측정 가능한 성공 기준 2}
- ✅ {측정 가능한 성공 기준 3}

---

## 2. Chain (기능) 목록

이 Epic은 다음 Chain들로 구성됩니다:

### CHAIN-{epic-id}-01: {Chain 이름} ({예상 기간})
**비전**: "{Chain의 비전}"

**범위**:
- {기능 1}
- {기능 2}
- {기능 3}

**기술 스택**:
- {사용 기술}

**산출물**:
- {주요 산출물}

---

### CHAIN-{epic-id}-02: {Chain 이름} ({예상 기간})
...

---

## 3. 통합된 기존 EPICs (해당 시)

| 기존 EPIC | 새 위치 | 변경사항 |
|----------|---------|---------|
| EPIC-XXX | CHAIN-{id} | EPIC → Chain으로 강등 |

**통합 근거**: {왜 이 EPIC들을 하나로 통합했는지}

---

## 4. 의존성 및 일정

### 4.1 선행 EPICs
- {필요한 선행 EPIC 목록}

### 4.2 후행 EPICs (이 EPIC에 의존)
- {이 EPIC에 의존하는 EPIC 목록}

### 4.3 주요 마일스톤

| 마일스톤 | 목표일 | 산출물 |
|----------|--------|--------|
| M1: {이름} | Month {X} | {산출물} |
| M2: {이름} | Month {Y} | {산출물} |

---

## 5. 기술 스택

| 레이어 | 기술 | 비고 |
|--------|------|------|
| Frontend | {기술} | {설명} |
| Backend | {기술} | {설명} |
| Database | {기술} | {설명} |

---

## 6. 참조 문서

- 원본 PRD: {파일 경로}
- 기존 EPIC PRD: {백업 경로}
- 재구조화 계획: {계획 문서}

---

## 7. 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | {날짜} | 초안 작성 |
```

---

## 실행 예시

### jjiban 프로젝트 사례

**입력**: `jjiban-prd.md` (59KB, 대규모 프로젝트 관리 도구)

**초기 분석 결과 (세분화)**:
```
❌ 11개 EPIC 추출 (너무 세분화됨):
- EPIC-P01: 플랫폼 인프라 (4-6개월) ✅ 적절
- EPIC-001: Dashboard (1-3개월) ⚠️ 너무 작음
- EPIC-002: 프로젝트 관리 (1-3개월) ⚠️ 너무 작음
- EPIC-003: Workflow Engine (2-3개월)
- EPIC-004: Document Management (2-3개월)
- EPIC-005: Kanban Board (1-2개월) ⚠️ 너무 작음
- EPIC-006: Gantt Chart (1-2개월) ⚠️ 너무 작음
- EPIC-007: Task Detail Viewer (1-2개월) ⚠️ 너무 작음
- EPIC-008: LLM Terminal (2-3개월)
- EPIC-009: Workflow Automation (2-3개월)
- EPIC-010: CLI Deployment (2-3개월)
```

**통합 및 재구조화 (전략적 EPIC)**:
```
✅ 5개 전략적 EPIC (3-6개월 단위):

NEW-EPIC-01: Platform Foundation (4-6개월)
- 기존 EPIC-P01 유지

NEW-EPIC-02: Core Project Management System (5-6개월)
- CHAIN-02-01: Dashboard & Reporting (기존 EPIC-001)
- CHAIN-02-02: Project & Issue Management (기존 EPIC-002)
통합 근거: Dashboard는 프로젝트 데이터 UI, 두 기능 긴밀 결합

NEW-EPIC-03: Workflow & Document Engine (5-6개월)
- CHAIN-03-01: Workflow Engine (기존 EPIC-003)
- CHAIN-03-02: Document Management (기존 EPIC-004)
통합 근거: 워크플로우 단계마다 문서 생성, 불가분의 관계

NEW-EPIC-04: Visualization & User Experience (4-5개월)
- CHAIN-04-01: Kanban Board UI (기존 EPIC-005)
- CHAIN-04-02: Gantt Chart UI (기존 EPIC-006)
- CHAIN-04-03: Task Detail Viewer (기존 EPIC-007)
통합 근거: 세 가지 모두 프로젝트 데이터 시각화, 공통 요소 공유

NEW-EPIC-05: AI-Powered Automation (5-6개월)
- CHAIN-05-01: LLM Terminal (기존 EPIC-008)
- CHAIN-05-02: Workflow Automation (기존 EPIC-009)
- CHAIN-05-03: CLI Deployment (기존 EPIC-010)
통합 근거: 핵심 차별화 요소, "AI 개발 어시스턴트" 역량 형성
```

**최종 구조**:
```
📊 EPIC 재구조화 완료: 11개 → 5개 전략적 EPIC

projects/
├── NEW-EPIC-01-platform-foundation/ (4-6개월)
├── NEW-EPIC-02-core-project-management/ (5-6개월, 2 Chains)
├── NEW-EPIC-03-workflow-document-engine/ (5-6개월, 2 Chains)
├── NEW-EPIC-04-visualization-ux/ (4-5개월, 3 Chains)
└── NEW-EPIC-05-ai-automation/ (5-6개월, 3 Chains)

✅ 전략적 명확성: 5개의 명확한 비즈니스 역량
✅ 포트폴리오 관리 간소화: 11개 → 5개 추적 항목
✅ 의존성 명확화: EPIC 간 관계가 더 명확함
✅ 더 나은 계획: 3-6개월 단위의 전략적 계획
✅ 구조 보존: 모든 기존 작업이 Chain으로 보존됨
```

---

## 출력 형식

```
📄 PRD 분석 완료: {PRD 파일명}
🔍 프로젝트 타입: {자동 감지된 타입}

📊 초기 기능 그룹 추출: {N}개
→ 통합 필요: {M}개 그룹이 Chain-Level (1-3개월)
→ 전략적 통합 수행 중...

✅ 전략적 EPIC 추출 완료: {K}개 (각 3-6개월)

📁 생성된 구조:
projects/
├── NEW-EPIC-01-platform-foundation/ (4-6개월)
├── NEW-EPIC-02-{name}/ (5-6개월, {N} Chains)
├── NEW-EPIC-03-{name}/ (5-6개월, {N} Chains)
└── ...

📈 EPIC 요약:

[전략적 EPIC]
┌─────────────┬──────────────────────────┬────────┬───────────┐
│ Epic ID     │ Epic 이름                │ 기간   │ Chains    │
├─────────────┼──────────────────────────┼────────┼───────────┤
│ NEW-EPIC-01 │ Platform Foundation      │ 4-6개월│ -         │
│ NEW-EPIC-02 │ Core PM System           │ 5-6개월│ 2개       │
│ NEW-EPIC-03 │ Workflow & Doc Engine    │ 5-6개월│ 2개       │
│ NEW-EPIC-04 │ Visualization & UX       │ 4-5개월│ 3개       │
│ NEW-EPIC-05 │ AI-Powered Automation    │ 5-6개월│ 3개       │
└─────────────┴──────────────────────────┴────────┴───────────┘

🔗 의존성 로드맵:

Phase 1 (Months 1-6): Foundation
├─ NEW-EPIC-01: Platform Foundation
│
Phase 2 (Months 2-7): Core Functionality
├─ NEW-EPIC-02: Core PM (depends on EPIC-01)
└─ NEW-EPIC-03: Workflow (depends on EPIC-01, EPIC-02)
│
Phase 3 (Months 4-9): User Interface
└─ NEW-EPIC-04: Visualization (depends on EPIC-01, EPIC-02, EPIC-03)
│
Phase 4 (Months 5-11): Advanced Features
└─ NEW-EPIC-05: AI Automation (depends on EPIC-01, EPIC-03, EPIC-04)

📋 다음 단계:
1. 각 EPIC PRD 검토
2. Chain을 Module로 분해
3. 플랫폼 EPIC 우선 구현
4. 전략적 EPIC 순차 구현
5. 일정 및 담당자 할당
```

---

## 품질 기준

- ✅ **전략적 규모**: 각 EPIC이 3-6개월 단위
- ✅ **적정 개수**: 3-7개 EPIC (포트폴리오 관리 가능)
- ✅ **독립성**: 각 EPIC이 독립적인 비즈니스 가치 제공
- ✅ **완전성**: 원본 PRD의 모든 내용이 적절히 분배됨
- ✅ **일관성**: 모든 EPIC이 동일한 템플릿 구조 사용
- ✅ **추적성**: 원본 PRD와의 연결 명확히 표시
- ✅ **명확한 의존성**: EPIC 간 선후행 관계 명시

---

## 고급 옵션

사용자 요청 시 다음 옵션 지원:

1. **EPIC 개수 제한**: `--max-epics N` (기본값: 7, 권장: 5-6)
2. **최소 기간**: `--min-duration N` (기본값: 3개월)
3. **출력 디렉토리**: `--output-dir PATH` (기본값: ./projects/)
4. **의존성 시각화**: `--visualize-deps` (Mermaid 다이어그램)
5. **자동 통합 모드**: `--consolidate` (자동으로 Chain-Level을 통합)

---

## 사용 워크플로우

```
1. 사용자: /split-epics
2. AI: PRD 파일 경로 요청
3. AI: PRD 분석 → 초기 기능 그룹 추출
4. AI: Chain-Level 감지 → 전략적 통합 제안
5. 사용자: 통합 승인 (y/n)
6. AI: 5-7개 전략적 EPIC 생성
7. AI: Chain 구조 정의
8. AI: 폴더 및 PRD 문서 생성
9. 완료!
```
