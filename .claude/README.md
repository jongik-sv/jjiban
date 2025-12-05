# Tasks.md 상태 변경 분석 보고서

## 📋 개요

이 보고서는 `.claude\commands` 폴더 내의 모든 명령어들이 `tasks.md` 파일의 Task 상태를 어떻게 변경하는지 체계적으로 분석한 문서입니다.

**분석 일시**: 2025-10-11
**분석 범위**: plan, design, dev, qa, release 폴더의 모든 명령어
**핵심 개념**: 각 명령어는 `update_task_status()` 함수를 통해 tasks.md의 Task 체크박스 상태를 변경

---

## 🔄 Task 상태 라이프사이클

```
[ ] → [d] → [dr] → [di] → [i] → [c] → [a] → [X]
 |     |      |      |     |     |     |      |
 |     |      |      |     |     |     |      └─ 최종완료
 |     |      |      |     |     |     └──────── 개선적용완료
 |     |      |      |     |     └────────────── 교차검증완료
 |     |      |      |     └──────────────────── 구현완료
 |     |      |      └────────────────────────── 설계개선완료
 |     |      └───────────────────────────────── 설계리뷰완료
 |     └──────────────────────────────────────── 설계완료
 └────────────────────────────────────────────── 미시작
```

### 상태 코드 설명

| 상태 | 설명 | 의미 |
|-----|------|------|
| `[ ]` | 미시작 | Task가 아직 시작되지 않음 |
| `[-]` | 진행중 | Task가 진행 중 (명령어에서는 사용하지 않음) |
| `[d]` | 설계완료 | Detail Design 완료 |
| `[dr]` | 설계리뷰완료 | Design Review 완료 |
| `[di]` | 설계개선완료 | Design Improved (리뷰 개선사항 적용 완료) |
| `[i]` | 구현완료 | Implementation 완료 |
| `[c]` | 교차검증완료 | Cross-check 완료 |
| `[a]` | 개선적용완료 | Apply (교차검증 개선사항 적용 완료) |
| `[X]` | 최종완료 | Finalize 완료 |

---

## 📂 폴더별 명령어 분석

### 1️⃣ plan 폴더 (기획 단계)

#### `/plan:doc_init` - 문서 폴더 구조 생성
- **상태 변경**: ❌ 없음
- **설명**: CLAUDE.md에서 프로젝트명을 추출하여 docs 폴더 구조를 생성
- **목적**: 프로젝트 초기 문서 환경 구축

#### `/legacy:analyze_legacy` - 레거시 시스템 분석
- **상태 변경**: ❌ 없음
- **설명**: GLUE 프레임워크 레거시 시스템을 분석하여 요구사항 문서와 BPMN 생성
- **산출물**: `[SERVICE-ID]_legacy_analysis.md`, BPMN 파일

#### `/plan:ui_theme` - UI/UX 테마 추출
- **상태 변경**: ❌ 없음
- **설명**: 외부 사이트의 UI/UX 디자인 원칙을 분석하여 JSON 및 가이드 문서 생성
- **산출물**: UI/UX 가이드 문서, JSON 디자인 토큰

#### `/plan:wbs` - 구현 계획 생성 ✨
- **상태 변경**: ✅ **tasks.md 파일 생성**
- **설명**: 설계 문서를 분석하여 화면 단위 Task 구조로 tasks.md 생성
- **초기 상태**: 모든 Task는 `[ ]` (미시작) 상태로 생성
- **산출물**: `./docs/project/[project]/00.foundation/01.project-charter/tasks.md`

**tasks.md 예시**:
```markdown
## 1단계: 시스템 공통 기능
- [ ] 1. 개발환경구성 및 기반설정

## 2단계: 마루관리 화면 구현
- [ ] 2. MR0100 - 마루헤더관리 (우선순위: 1)
  - [ ] 2.1 Backend API 구현
  - [ ] 2.2 Frontend UI 구현
```

---

### 2️⃣ design 폴더 (설계 단계)

#### `/design:detail` - 상세설계 작성
- **상태 변경**: ✅ `[ ]` → `[d]`
- **함수 호출**: `update_task_status(task_number, "detail_design")`
- **설명**: Task의 상세설계서와 UI 테스트케이스 생성
- **산출물**: `{task-id}.{task명}(상세설계).md`

**변경 예시**:
```markdown
# Before
- [ ] 2. MR0100 - 마루헤더관리

# After
- [d] 2. MR0100 - 마루헤더관리
```

#### `/design:review_detail` - 상세설계 리뷰
- **상태 변경**: ✅ `[d]` → `[dr]`
- **함수 호출**: `update_task_status(task_number, "design_reviewed")`
- **설명**: 다른 LLM(Gemini, GPT-5)을 활용한 상세설계 교차 검증
- **산출물**: `{task-id}.{task명}(상세설계리뷰)_{llm}_{date}.md`
- **리뷰 대상**: 아키텍처, 보안, 성능, 품질

**변경 예시**:
```markdown
# Before
- [d] 2. MR0100 - 마루헤더관리

# After
- [dr] 2. MR0100 - 마루헤더관리
```

#### `/design:apply_detail_review` - 설계 리뷰 개선사항 적용
- **상태 변경**: ✅ `[dr]` → `[di]`
- **함수 호출**: `update_task_status(task_number, "design_improved")`
- **설명**: 설계 리뷰에서 도출된 개선사항을 상세설계서에 적용
- **산출물**: 리뷰 문서에 "적용 결과" 섹션 추가
- **원칙**: 맥락 기반 선택적 적용 (무조건 적용 금지)

**변경 예시**:
```markdown
# Before
- [dr] 2. MR0100 - 마루헤더관리

# After
- [di] 2. MR0100 - 마루헤더관리
```

---

### 3️⃣ dev 폴더 (개발 단계)

#### `/dev:implement` - TDD 기반 구현
- **상태 변경**: ✅ `[d]` → `[i]` (또는 `[di]` → `[i]`)
- **함수 호출**: `update_task_status(task_number, "implement")`
- **설명**: 상세설계서를 바탕으로 TDD 방식으로 Task 구현
- **산출물**:
  - 구현 보고서: `{task-id}.{task명}(implementation).md`
  - Backend TDD 결과: `50.test/52.tdd-results/{task-id}_{task-name}/{timestamp}/`
  - Frontend E2E 결과: `50.test/51.e2e-test-results/{task-id}_{task-name}/{timestamp}/`

**특징**:
- **Backend-only Task**: 2단계(Backend TDD)만 실행
- **Frontend-only Task**: 3단계(E2E 테스트)만 실행
- **Full-stack Task**: 2단계 → 3단계 통합 실행

**변경 예시**:
```markdown
# Before
- [di] 2. MR0100 - 마루헤더관리
  - [ ] 2.1 Backend API 구현
  - [ ] 2.2 Frontend UI 구현

# After
- [i] 2. MR0100 - 마루헤더관리
  - [x] 2.1 Backend API 구현
  - [x] 2.2 Frontend UI 구현
```

---

### 4️⃣ qa 폴더 (품질 보증 단계)

#### `/qa:integration` - 통합 테스트케이스 작성
- **상태 변경**: ❌ 없음
- **설명**: Task의 전체 워크플로우를 검증하는 통합 테스트케이스 생성
- **산출물**:
  - 통합 테스트 시나리오: `50.test/52.integration-test/scenarios/itc_{task-id}.md`
  - 테스트 증빙: `50.test/52.integration-test/evidence/`

#### `/qa:e2e_test` - E2E 테스트 실행
- **상태 변경**: ❌ 없음
- **설명**: Playwright E2E 테스트 실행 및 결과 저장
- **산출물**: `50.test/51.e2e-test-results/{task-id}_{task-name}/{timestamp}/`
- **호출**: `/dev:implement` 명령어 3단계에서 자동 호출

**타임스탬프 형식**: `YYYY-MM-DDTHH-mm-ss` (KST 기준)

#### `/qa:crosscheck` - 설계-구현 교차 검증
- **상태 변경**: ✅ `[i]` → `[c]`
- **함수 호출**: `update_task_status(task_number, "crosscheck")`
- **설명**: 다른 LLM을 활용한 설계-구현 일관성 검증
- **산출물**: `30.review/35.code/{task-id}.{task명}(crosscheck)_{llm}_{date}.md`
- **검증 대상**: 설계-구현 일관성, 코드 품질, 보안, 테스트 커버리지

**변경 예시**:
```markdown
# Before
- [i] 2. MR0100 - 마루헤더관리

# After
- [c] 2. MR0100 - 마루헤더관리
```

#### `/qa:apply` - Cross Check 개선사항 적용
- **상태 변경**: ✅ `[c]` → `[a]`
- **함수 호출**: `update_task_status(task_number, "apply")`
- **설명**: Cross Check에서 도출된 개선사항을 코드 및 문서에 적용
- **산출물**: `30.review/35.applied-code/{task-id}.{task명}(apply).md`
- **원칙**: P1-P2 중심의 우선순위 기반 선택적 적용

**변경 예시**:
```markdown
# Before
- [c] 2. MR0100 - 마루헤더관리

# After
- [a] 2. MR0100 - 마루헤더관리
```

---

### 5️⃣ release 폴더 (릴리즈 단계)

#### `/release:finalize` - 최종 문서화 및 정리
- **상태 변경**: ✅ `[a]` → `[X]`
- **함수 호출**: `update_task_status(task_number, "finalize")`
- **설명**: 모든 Task 관련 문서를 통합하고 최종 문서화 수행
- **산출물**:
  - 릴리즈 노트: `40.finalization/41.release-notes/`
  - 전달 패키지: `40.finalization/42.delivery-package/`
  - Git 태그: `v1.0.0-[Task명]`

**변경 예시**:
```markdown
# Before
- [a] 2. MR0100 - 마루헤더관리

# After
- [X] 2. MR0100 - 마루헤더관리
```

---

## 🔄 상태 변경 흐름도

### 표준 워크플로우 (설계 리뷰 포함)

```
[ ] 미시작
 ↓
 └─ /design:detail
 ↓
[d] 설계완료
 ↓
 └─ /design:review_detail
 ↓
[dr] 설계리뷰완료
 ↓
 └─ /design:apply_detail_review
 ↓
[di] 설계개선완료
 ↓
 └─ /dev:implement
 ↓
[i] 구현완료
 ↓
 └─ /qa:crosscheck
 ↓
[c] 교차검증완료
 ↓
 └─ /qa:apply
 ↓
[a] 개선적용완료
 ↓
 └─ /release:finalize
 ↓
[X] 최종완료
```

### 간소화 워크플로우 (설계 리뷰 생략)

```
[ ] 미시작
 ↓
 └─ /design:detail
 ↓
[d] 설계완료
 ↓
 └─ /dev:implement
 ↓
[i] 구현완료
 ↓
 └─ /qa:crosscheck
 ↓
[c] 교차검증완료
 ↓
 └─ /qa:apply
 ↓
[a] 개선적용완료
 ↓
 └─ /release:finalize
 ↓
[X] 최종완료
```

---

## 📊 명령어별 상태 변경 매트릭스

| 명령어 | 상태 변경 | 함수 호출 | 단계 |
|-------|---------|----------|------|
| `/plan:doc_init` | ❌ | - | 기획 |
| `/legacy:analyze_legacy` | ❌ | - | 기획 |
| `/plan:ui_theme` | ❌ | - | 기획 |
| `/plan:wbs` | ✅ tasks.md 생성 | - | 기획 |
| `/design:detail` | ✅ [ ] → [d] | `update_task_status(task_number, "detail_design")` | 설계 |
| `/design:review_detail` | ✅ [d] → [dr] | `update_task_status(task_number, "design_reviewed")` | 설계 |
| `/design:apply_detail_review` | ✅ [dr] → [di] | `update_task_status(task_number, "design_improved")` | 설계 |
| `/dev:implement` | ✅ [d/di] → [i] | `update_task_status(task_number, "implement")` | 개발 |
| `/qa:integration` | ❌ | - | QA |
| `/qa:e2e_test` | ❌ | - | QA |
| `/qa:crosscheck` | ✅ [i] → [c] | `update_task_status(task_number, "crosscheck")` | QA |
| `/qa:apply` | ✅ [c] → [a] | `update_task_status(task_number, "apply")` | QA |
| `/release:finalize` | ✅ [a] → [X] | `update_task_status(task_number, "finalize")` | 릴리즈 |

---

## 🎯 핵심 함수: `update_task_status()`

### 함수 개요
- **위치**: `@docs/common/07.functions/update_task_status.md`
- **목적**: tasks.md에서 특정 Task의 체크박스 상태를 업데이트
- **호출 방식**: 각 명령어에서 작업 완료 후 호출

### 함수 시그니처
```javascript
update_task_status(task_number, status_type)
```

**파라미터**:
- `task_number`: Task 번호 (예: "3.1", "Task-3-1")
- `status_type`: 상태 타입
  - `"detail_design"` → `[d]`
  - `"design_reviewed"` → `[dr]`
  - `"design_improved"` → `[di]`
  - `"implement"` → `[i]`
  - `"crosscheck"` → `[c]`
  - `"apply"` → `[a]`
  - `"finalize"` → `[X]`

### 하위 작업 체크박스 관리

`/dev:implement` 명령어는 하위 작업 체크박스도 함께 업데이트:

```markdown
# Before
- [d] 2. MR0100 - 마루헤더관리
  - [ ] 2.1 Backend API 구현
  - [ ] 2.2 Frontend UI 구현

# After
- [i] 2. MR0100 - 마루헤더관리
  - [x] 2.1 Backend API 구현
  - [x] 2.2 Frontend UI 구현
```

---

## 📈 통계 및 인사이트

### 상태 변경 명령어 비율
- **상태 변경 O**: 8개 (61.5%)
- **상태 변경 X**: 5개 (38.5%)

### 단계별 명령어 수
- **plan**: 4개 (1개만 tasks.md 생성)
- **design**: 3개 (모두 상태 변경)
- **dev**: 1개 (상태 변경)
- **qa**: 4개 (2개만 상태 변경)
- **release**: 1개 (상태 변경)

### 필수 경로
Task를 완료하기 위한 **필수 명령어 경로**:

1. `/plan:wbs` - tasks.md 생성
2. `/design:detail` - 상세설계 (→ [d])
3. `/dev:implement` - 구현 (→ [i])
4. `/qa:crosscheck` - 교차검증 (→ [c])
5. `/qa:apply` - 개선적용 (→ [a])
6. `/release:finalize` - 최종완료 (→ [X])

**선택 경로** (품질 강화):
- `/design:review_detail` + `/design:apply_detail_review` (설계 품질 향상)

---

## 🔍 특이사항 및 주의점

### 1. Task 번호 파싱
모든 명령어는 다음 패턴으로 Task 번호를 추출:
```javascript
function parseTaskFromCommand(input) {
    const taskPattern = /(?:Task\s+)?(\d+\.\d+)/i;
    return input.match(taskPattern)?.[1]; // "3.1" 추출
}
```

**지원 형식**:
- `Task 3.1`
- `3.1`
- `Task-3-1` (변환: `3.1`)

### 2. 타임스탬프 관리
테스트 결과 저장 시 KST 기준 타임스탬프 사용:
- **형식**: `YYYY-MM-DDTHH-mm-ss`
- **예시**: `2025-10-02T10-29-11`
- **시간대**: Asia/Seoul (UTC+9)

### 3. 다중 LLM 활용
다음 명령어는 다른 LLM 사용을 권장:
- `/design:review_detail` - Gemini, GPT-5, Claude Opus
- `/qa:crosscheck` - Gemini, GPT-5 등

**이유**: 편향 방지 및 객관성 확보

### 4. 선택적 실행
다음 단계는 조건부 실행:
- `/dev:implement` 2단계 (Backend): API/서버 로직 Task만
- `/dev:implement` 3단계 (Frontend): UI/화면 Task만
- `/dev:implement` 4단계 (품질 검증): 고복잡도/성능 중요 Task만

---

## 📝 실무 활용 예시

### 시나리오: Task 3.1 "MR0100 Backend API 구현" 전체 과정

```bash
# 1. 상세설계 작성
/design:detail Task 3.1
# tasks.md: [ ] → [d]

# 2. 설계 리뷰 (선택)
/design:review_detail Task 3.1
# tasks.md: [d] → [dr]

# 3. 설계 개선사항 적용 (선택)
/design:apply_detail_review Task 3.1
# tasks.md: [dr] → [di]

# 4. TDD 기반 구현
/dev:implement Task 3.1
# tasks.md: [di] → [i]
# 하위 작업: [ ] → [x]

# 5. 교차 검증
/qa:crosscheck Task 3.1
# tasks.md: [i] → [c]

# 6. 개선사항 적용
/qa:apply Task 3.1
# tasks.md: [c] → [a]

# 7. 최종 문서화
/release:finalize Task 3.1
# tasks.md: [a] → [X]
```

### 최종 tasks.md 상태

```markdown
## 2단계: 마루관리 화면 구현

- [X] 2. MR0100 - 마루헤더관리 (우선순위: 1)
  - [x] 2.1 Backend API 구현
  - [x] 2.2 Frontend UI 구현
  - _요구사항: [REQ-001]_
  - _참고: [프로그램리스트.md, api-design.md, ui-design.md]_
```

---

## 🎓 결론

### 핵심 인사이트

1. **체계적 상태 관리**: 8단계 상태 코드로 Task 진행 상황을 세밀하게 추적
2. **자동화된 업데이트**: `update_task_status()` 함수로 일관된 상태 변경 보장
3. **유연한 워크플로우**: 설계 리뷰 선택적 실행으로 프로젝트 규모에 맞는 조정 가능
4. **품질 중심**: 다중 LLM 교차 검증으로 객관적 품질 보증
5. **추적성**: 모든 단계의 산출물이 체계적으로 문서화되어 완전한 이력 관리

### 권장사항

- **소규모 Task**: `[ ] → [d] → [i] → [X]` (간소화 경로)
- **중규모 Task**: `[ ] → [d] → [i] → [c] → [a] → [X]` (표준 경로)
- **대규모 Task**: `[ ] → [d] → [dr] → [di] → [i] → [c] → [a] → [X]` (전체 경로)

### 향후 개선 방향

1. **자동화 강화**: Git 훅 연동으로 상태 변경 자동 감지
2. **대시보드 구축**: 실시간 Task 진행 상황 시각화
3. **알림 시스템**: Task 상태 변경 시 팀원 자동 알림
4. **통계 분석**: 단계별 소요 시간 분석 및 생산성 측정

---

**보고서 작성자**: Claude Sonnet 4.5
**보고서 날짜**: 2025-10-11
**버전**: v1.0
