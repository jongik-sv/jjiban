# Module PRD: Project Settings

## 문서 정보

| 항목 | 내용 |
|------|------|
| Module ID | MODULE-jjiban-01-10 |
| Module 이름 | Project Settings |
| 문서 버전 | 1.0 |
| 작성일 | 2025-12-06 |
| 상태 | Draft |
| Module 유형 | User Story |
| 예상 기간 | 1주 |
| 상위 Chain | Platform Foundation |
| 원본 Chain PRD | ../chain-prd.md |

---

## 1. Module 개요

### 1.1 User Story
**"As a 프로젝트 관리자(PM), I want 프로젝트별 설정을 커스터마이징하고 싶다 so that 팀의 워크플로우에 맞게 도구를 최적화할 수 있다"**

모든 프로젝트가 동일한 방식으로 진행되지는 않습니다. 어떤 프로젝트는 TDD가 필수이고, 어떤 프로젝트는 간단한 리뷰만 필요할 수 있습니다. 프로젝트(Epic) 단위로 워크플로우, LLM 설정, 권한 등을 개별 설정할 수 있게 합니다.

### 1.2 범위 (Scope)

**포함:**
- 프로젝트 설정 화면 (`/projects/:epicId/settings`)
- 워크플로우 커스터마이징 (단계 활성화/비활성화)
- 문서 경로 설정 (기본 경로, 템플릿 경로)
- LLM 프로바이더 선택 (프로젝트별 기본 LLM)
- 팀원 권한 관리 (프로젝트 레벨 멤버 추가/제거)

**제외:**
- 과금 관리 (Open Source 버전이므로)

### 1.3 인수 조건 (Acceptance Criteria)
- [ ] 프로젝트별로 다른 워크플로우 단계 적용 가능
- [ ] 설정 변경 시 해당 프로젝트 내 Task 업데이트
- [ ] LLM 설정 변경 시 터미널 기본값 변경
- [ ] 관리자 외 접근 제한

---

## 2. Task 목록

### TASK-jjiban-01-10-01: Project Settings UI (1일)
**설명**: "설정 탭 네비게이션 및 레이아웃"

**작업 내용**:
- 탭 구조 (일반, 워크플로우, 멤버, 통합)
- 설정 폼 컴포넌트

**완료 조건**:
- [ ] 탭 간 전환 부드러움

---

### TASK-jjiban-01-10-02: Workflow Configuration (1일)
**설명**: "워크플로우 단계 제어 로직"

**작업 내용**:
- `workflows.json` 또는 DB 필드 설계
- 단계별 Toggle Switch UI
- 설정 저장 API

**완료 조건**:
- [ ] 비활성화된 단계는 칸반 보드에서 숨겨짐

---

### TASK-jjiban-01-10-03: Member & Permission (1일)
**설명**: "프로젝트 멤버 관리"

**작업 내용**:
- 멤버 검색 및 추가 모달
- 역할 변경 (Viewer -> Dev)
- 멤버 제거 기능

**완료 조건**:
- [ ] 추가된 멤버만 프로젝트 접근 가능 (Private 프로젝트인 경우)

---

### TASK-jjiban-01-10-04: Integration Settings (1일)
**설명**: "LLM 및 외부 도구 연동"

**작업 내용**:
- LLM Provider 선택 (ComboBox)
- API Key 입력 (암호화 전송)

**완료 조건**:
- [ ] 설정값이 LLM Chain 실행 시 참조됨

---

## 3. 의존성

### 3.1 선행 Modules
- MODULE-jjiban-01-04: Auth (권한 체크)
- MODULE-jjiban-01-03: DB (설정 저장)

### 3.2 후행 Modules
- CHAIN-02 (워크플로우 변경 반영)
- CHAIN-04 (LLM 설정 반영)

### 3.3 외부 의존성
- 없음

---

## 4. 주요 화면/API 목록

### 4.1 화면 목록
| 화면 이름 | 경로 | 설명 | 관련 Task |
|----------|------|------|-----------|
| 프로젝트 설정 | `/projects/:epicId/settings` | 탭 기반 설정 | All |

### 4.2 API 목록
| API | Method | 경로 | 설명 | 관련 Task |
|-----|--------|------|------|-----------|
| 설정 저장 | PUT | `/api/projects/:id/settings` | JSON 설정 업데이트 | All |

---

## 5. 기술 스택

| 레이어 | 기술 | 비고 |
|--------|------|------|
| DB | Prisma | JSON 타입 컬럼 활용 |

---

## 6. 참조 문서

- 상위 Chain PRD: ../chain-prd.md

---

## 7. 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2025-12-06 | 초안 작성 |
