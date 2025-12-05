---
name: dev:implement
description: "TDD 기반 Task 구현 (최적화 버전)"
category: development
complexity: complex
wave-enabled: true
performance-profile: optimized
auto-flags:
  - --seq
  - --c7
  - --token-efficient
  - --delegate auto
  - --task-manage
mcp-servers: [sequential, context7]
personas: [java-developer, backend-architect, nexacro-developer, frontend-developer, quality-engineer, refactoring-expert]
---

# /dev:implement - TDD 기반 Task 구현 (v1)

> **최적화된 구현 전문화**: 상세설계서를 바탕으로 TDD 방식으로 Task를 구현하고 구현 보고서를 효율적으로 생성합니다.

## 트리거
- 상세설계서가 완성된 Task의 구현이 필요한 경우
- TDD 방식으로 체계적인 개발이 필요한 경우
- 구현과 동시에 구현 보고서 생성이 필요한 경우

## 사용법
```bash
# Task 번호로 실행 (권장)
/dev:implement Task 3.1
/dev:implement 3.1

# 기존 방식도 지원
/dev:implement "Task-3-1"
/dev:implement "Task 3.2"
```

## ⚠️ 사전 검증 (Pre-execution Validation)

**실행 전 필수 체크**:
이 명령어를 실행하기 전에 다음 파일들의 존재 여부를 **반드시** 확인하세요:

### 공통 함수 (필수)
- [ ] `@docs/common/07.functions/analyze_project_context.md`
- [ ] `@docs/common/07.functions/compile_frontend.md`
- [ ] `@docs/common/07.functions/setup_e2e_test.md`
- [ ] `@docs/common/07.functions/run_e2e_test.md`

### 프로젝트 설정 (필수)
- [ ] `@docs/common/01.config/{project}/frontend.md`
- [ ] `@docs/common/01.config/{project}/testing.md`

**검증 절차**:
1. 각 파일에 대해 Read 도구를 사용하여 존재 확인
2. **파일이 존재하지 않으면 아래 에러 메시지 출력 후 즉시 중단**
3. 모든 파일이 존재하는 경우에만 명령어 실행 진행

**검증 실패 시 에러 메시지**:
```
❌ 명령어 실행 중단

필수 파일이 존재하지 않습니다:
- {missing_file_path}

조치 방법:
1. 파일이 올바른 위치에 있는지 확인하세요
2. 누락된 파일을 생성하거나 복원하세요
3. 파일 경로가 정확한지 확인하세요

명령어 실행을 중단합니다.
```

## 자동 실행 플로우

### 단계별 실행 Agent 설정 (최적화 핵심)
- **Backend 구현**: backend-architect 에이전트 (조건부 - API/서버 로직 Task만)
- **Frontend 구현**: frontend-developer 에이전트 (조건부 - UI/화면 Task만, 프로젝트 설정 참조)
- **테스트 작성**: quality-engineer 에이전트 (조건부)
- **Refactoring**: refactoring-expert 에이전트 (필요시)

### 1단계: 구현 환경 준비 및 설계 분석
**Auto-Persona**: architect
**MCP**: sequential + context7

**자동 실행 단계**:
1. **Task 정보 추출 및 파싱**:
   ```javascript
   // "/dev:implement Task 3.1" 또는 "/dev:implement 3.1"에서 Task 번호 추출
   function parseTaskFromCommand(input) {
       const taskPattern = /(?:Task\s+)?(\d+\.\d+)/i;
       return input.match(taskPattern)?.[1]; // "3.1" 추출
   }
   ```

2. **공통 문서 분석 함수 호출**: `analyze_project_context(task_number)`
   - 📋 함수 참조: `@docs/common/07.functions/analyze_project_context.md`
   - `./docs/project/maru/00.foundation/01.project-charter/tasks.md`에서 Task 정보 조회
   - 자동 파일명 생성: `{task-id}.{task명}(implementation).md`
     - 예: `Task-3-1.MR0100-Backend-API-구현(implementation).md`
   - 프로젝트 정보 및 Task 상세 정보 수집
   - 상세설계서 및 관련 문서 자동 로드
   - **구현 유형 분석 및 플래그 설정**:
     - **Backend 구현 여부** (`hasBackend`):
       - Task 정보에서 "Backend", "API", "서버", "Service", "Controller" 키워드 검색
       - 상세설계서에 API 설계 또는 서버 로직 섹션 존재 확인
     - **Frontend 구현 여부** (`hasFrontend`):
       - Task 정보에서 "Frontend", "UI", "화면", "xfdl", "Nexacro" 키워드 검색
       - 상세설계서에 화면 설계 섹션 존재 확인
   - 구현 전략 수립을 위한 컨텍스트 준비
2. 프로젝트 구조 분석 및 기존 패턴 파악
3. 구현 전략 수립 (TDD/E2E)
4. **Task 유형별 실행 플로우 결정**:
   - **Backend-only** (`hasBackend=true`, `hasFrontend=false`):
     - 1단계 → **2단계** → 4단계 → 5단계
   - **Frontend-only** (`hasBackend=false`, `hasFrontend=true`):
     - 1단계 → **3단계** → 4단계 → 5단계
   - **Full-stack** (`hasBackend=true`, `hasFrontend=true`):
     - 1단계 → **2단계** → **3단계** → 4단계 → 5단계

### 2단계: TDD 기반 백엔드 구현 (Agent 위임)
**Auto-Persona**: java-developer (Agent 위임)
**MCP**: sequential + context7

**활성화 조건**:
- Task에 백엔드 구현이 포함된 경우 (API/서버 로직)
- Task 상세설계서에 API 설계 또는 서버 로직 섹션 존재하는 경우
- 조건 미충족 시 2단계 건너뛰고 3단계로 이동

**자동 실행 단계**:
1. **테스트 우선 작성** (Red Phase):
   - API 엔드포인트 테스트 작성 (Jest/Supertest)
   - 데이터베이스 연동 테스트 작성
   - 비즈니스 로직 유닛 테스트 작성
2. **최소 구현** (Green Phase):
   - 중복 코드 지양(공통코드를 분리하여 재사용)
   - Controller, Service, Repository 패턴 구현
   - 데이터베이스 스키마 및 모델 구현
   - API 라우팅 및 미들웨어 구현
   - Swagger를 통한 API 문서화(기본 데이터 설정 필요)
3. **코드 개선** (Refactor Phase):
   - 코드 품질 향상 및 중복 제거
   - 성능 최적화 및 보안 강화
4. **백엔드 테스트 실행 및 검증**:
   - 작성된 테스트 전체 실행
   - 코드 커버리지 측정 (목표: 80% 이상)
   - API 계약 검증 및 정적 분석

5. **TDD 테스트 결과 저장**:
   ```javascript
   // Task 정보 가져오기
   const taskId = parseTaskId(input); // "Task-3-1"
   const taskName = await getTaskName(taskId); // "Backend-API-구현"
   const folderName = `${taskId}_${taskName}`;

   // 대한민국 KST 타임스탬프 생성
   const kstTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
   const timestamp = `${year}-${month}-${day}T${hour}-${minute}-${second}`;

   // TDD 결과 저장 경로
   const tddResultDir = `./docs/project/maru/50.test/52.tdd-results/${folderName}/${timestamp}`;

   // 테스트 결과 저장
   - coverage/ (커버리지 리포트)
   - test-results.json (테스트 결과)
   - api-contract.json (API 계약 검증 결과)
   ```

**품질 기준**:
- 테스트 커버리지 80% 이상
- 모든 API 테스트 통과
- 정적 분석 통과

**산출물**:
- Backend 소스 코드 + 테스트 코드
- TDD 테스트 결과: `./docs/project/maru/50.test/52.tdd-results/{task-id}_{task-name}/{timestamp}/`

### 3단계: 프론트엔드 구현 및 E2E 검증 (Agent 위임)
**Auto-Persona**: frontend-developer (Agent 위임, 프로젝트 설정 참조)
**MCP**: sequential + playwright

**활성화 조건**:
- Task에 프론트엔드 구현이 포함된 경우 (UI/화면 개발)
- Task 상세설계서에 화면 설계가 존재하는 경우
- Frontend 파일 생성/수정이 필요한 경우
- 조건 미충족 시 3단계 건너뛰고 4단계로 이동

**자동 실행 단계**:
1. **Frontend 화면 구현**:
   - 📋 참조: `@docs/common/01.config/{project}/frontend.md`
   - 프레임워크별 화면 파일 생성 및 UI 컴포넌트 배치
   - 데이터 바인딩 및 상태 관리
   - 화면 간 네비게이션 구현
2. **API 연동 구현**:
   - 프레임워크별 HTTP 클라이언트 설정
   - 데이터 송수신 로직 구현
   - 에러 처리 및 사용자 피드백
3. **E2E 테스트 작성**:
   - 사용자 시나리오 E2E 테스트 코드 작성
   - Backend-Frontend 연동 검증 시나리오 작성
   - 화면 설계 요구사항 검증 케이스 작성
4. **E2E 테스트 실행** (명령어 호출):
   ```bash
   # /qa:e2e_test 명령어를 호출하여 E2E 테스트 실행
   SlashCommand: /qa:e2e_test ${task_number}
   ```
   - 환경 준비 및 서버 상태 확인
   - Playwright E2E 테스트 자동 실행
   - Task별 테스트 결과 저장 (타임스탬프 포함)
   - 테스트 결과 분석 및 리포트 생성
5. **테스트 결과 검증 및 이슈 수정**:
   - E2E 테스트 결과 확인
   - 주요 시나리오 100% 통과 확인
   - 발견된 이슈 수정
   - 필요시 `/qa:e2e_test` 재실행

**품질 기준**:
- 주요 사용자 시나리오 E2E 테스트 100% 통과
- Backend-Frontend 연동 정상 동작
- 화면 설계 요구사항 충족
- 테스트 결과가 Task별로 체계적으로 저장됨

**산출물**:
- Frontend 소스 코드 (프레임워크별 파일 형식)
- E2E 테스트 코드
- Task별 E2E 테스트 결과 리포트 (`/qa:e2e_test` 명령어 산출물)

### 4단계: 선택적 품질 검증 (고복잡도/성능 중요 Task만)
**Auto-Persona**: quality-engineer (Agent 위임)
**MCP**: sequential

**활성화 조건**:
- Task 복잡도 > 0.7 OR
- 성능 요구사항 명시된 Task OR
- 보안 중요도 높은 Task

**자동 실행 단계**:
1. **비기능적 품질 검증**:
   - 성능 프로파일링 및 부하 테스트
   - 보안 취약점 스캔
   - 접근성 자동 검증 (WCAG)
2. **결함 수정 및 재검증**:
   - 발견된 이슈 우선순위 분류
   - 중대한 이슈 수정
   - 회귀 테스트 실행

**산출물**: 성능/보안/접근성 검증 리포트

### 5단계: 구현 보고서 생성
**Auto-Persona**: technical-writer
**MCP**: sequential

**자동 실행 단계**:
1. **구현 결과 수집** (Task 유형별):
   - 구현된 기능 목록 정리
   - **테스트 결과 종합** (조건부):
     - **Backend** (2단계 실행된 경우):
       - TDD 테스트 결과 경로: `./docs/project/maru/50.test/52.tdd-results/{task-id}_{task-name}/{timestamp}/`
       - 커버리지 리포트, API 계약 검증 결과 링크
     - **Frontend** (3단계 실행된 경우):
       - `/qa:e2e_test` 명령어 실행 결과
       - E2E 테스트 결과 경로: `./docs/project/maru/50.test/51.e2e-test-results/{task-id}_{task-name}/{timestamp}/`
       - 스크린샷 및 테스트 리포트 링크 포함
     - **선택적**: 4단계 비기능 품질 검증 결과
   - 주요 기술적 결정사항 정리
2. **구현 보고서 작성** (Task 유형별):
   - 구현 보고서 템플릿 활용
   - **Backend TDD 결과** (2단계 실행된 경우):
     - TDD 테스트 결과 링크: `./docs/project/maru/50.test/52.tdd-results/{task-id}_{task-name}/{timestamp}/`
     - 커버리지 리포트 경로 명시
     - API 테스트 결과 및 코드 품질 메트릭
   - **E2E 검증 결과** (3단계 실행된 경우):
     - E2E 테스트 결과 링크: `./docs/project/maru/50.test/51.e2e-test-results/{task-id}_{task-name}/{timestamp}/`
     - HTML 리포트 경로 명시
     - 테스트 실행 시각 기록 (KST 기준)
     - 주요 테스트 결과 요약 (통과율, 실패 케이스 등)
     - 캡쳐한 화면을 시나리오 E2E 테스트별로 구현 보고서에 첨부
     - 스크린샷 경로: `/qa:e2e_test` 명령어 산출물의 screenshots 경로 참조
   - 알려진 이슈 및 향후 개선사항 기술
3. **Task 상태 업데이트**: `update_task_status(task_number, "implement")`
   - 📋 함수 참조: `@docs/common/07.functions/update_task_status.md`
   - tasks.md에서 Task 체크박스를 [i]로 변경
   - 하위 작업 체크박스를 [x]로 변경
   - 진행 상태를 **[d→i]**로 표시


## 🎯 최적화 특징

### ⚡ 에이전트 위임 효율성
- 도메인별 전문 에이전트 자동 배정
- 병렬 처리 가능한 작업 분리
- 각 에이전트의 강점 활용 극대화

### 🧪 TDD + E2E 통합 워크플로우
- **Backend**: TDD로 단위/통합 테스트 (2단계, 조건부)
  - 활성화 조건: API/서버 로직 개발 포함 Task
- **Frontend**: Playwright E2E로 연동 검증 (3단계, 조건부)
  - 활성화 조건: UI/화면 개발 포함 Task
- **Task 유형별 워크플로우**:
  - Backend-only: 2단계만 실행
  - Frontend-only: 3단계만 실행
  - Full-stack: 2단계 → 3단계 통합 실행
- **선택적**: 비기능 품질 검증 (4단계, 조건부)
- **중복 제거**: Playwright E2E가 통합 테스트 역할 수행

### 📊 품질 중심
- 각 단계에서 품질 보증 완료
- **Backend Task**: 테스트 커버리지 80% 이상
- **Frontend Task**: E2E 주요 시나리오 100% 통과
- **Full-stack Task**: Backend + Frontend 품질 기준 모두 충족
- **선택적**: 성능/보안/접근성 검증 (조건부)

## 산출물 위치

### SDD v1 폴더 구조 기준
- **구현 보고서**: `./docs/project/[Project]/20.implementation/{task-id}.{task명}(implementation).md`
- **E2E 테스트 결과**: `./docs/project/[Project]/50.test/51.e2e-test-results/{task-id}_{task-name}/{timestamp}/`
- **TDD 테스트 결과**: `./docs/project/[Project]/50.test/52.tdd-results/{task-id}_{task-name}/{timestamp}/`

**예시 (Task 유형별)**:
- **Backend-only Task**:
  - `./docs/project/maru/20.implementation/Task-3-1.MR0100-Backend-API-구현(implementation).md`
  - `./docs/project/maru/50.test/52.tdd-results/Task-3-1_Backend-API-구현/2025-10-02T10-00-00/`
- **Frontend-only Task**:
  - `./docs/project/maru/20.implementation/Task-3-2.MR0100-Frontend-UI-구현(implementation).md`
  - `./docs/project/maru/50.test/51.e2e-test-results/Task-3-2_Frontend-UI-구현/2025-10-02T14-30-00/`
- **Full-stack Task**:
  - `./docs/project/maru/20.implementation/Task-3-3.MR0100-Full-구현(implementation).md`
  - `./docs/project/maru/50.test/52.tdd-results/Task-3-3_Full-구현/2025-10-02T10-00-00/` (Backend TDD)
  - `./docs/project/maru/50.test/51.e2e-test-results/Task-3-3_Full-구현/2025-10-02T16-00-00/` (E2E)

**E2E 테스트 결과 구조** (Frontend 포함 Task만):
  - `html/index.html` - HTML 테스트 리포트
  - `results.json` - JSON 형식 테스트 결과
  - `junit.xml` - JUnit 형식 테스트 결과
  - `screenshots/` - 시나리오별 스크린샷

**Task 유형별 테스트 결과**:
- **Backend-only**: TDD 테스트 결과 (52.tdd-results/)
- **Frontend-only**: E2E 테스트 결과 (51.e2e-test-results/)
- **Full-stack**: TDD 테스트 + E2E 테스트 결과 모두

## 타임스탬프 형식
**형식**: `YYYY-MM-DDTHH-mm-ss` (대한민국 KST 기준, 파일 시스템 호환)
**예시**: `2025-10-02T10-29-11` (KST, UTC+9)
**설명**: `Asia/Seoul` 시간대로 명시적 변환하여 정확한 로컬 시간 보장

---

## 연관 명령어

**호출하는 명령어**:
- `/qa:e2e_test` - 3단계에서 E2E 테스트 실행 (함수처럼 호출)

**다음 단계 명령어**:
- `/qa:code_review` - 설계-구현 교차 검증 수행

**사전 요구 명령어**:
- `/design:detail` - Task 상세설계 완료 필요