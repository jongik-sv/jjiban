# /wf:auto - 자동 워크플로우 실행 (Subagent 기반)

> **완전 자동 개발**: wbs.md에서 실행 가능한 Task를 찾아 워크플로우를 **subagent로 병렬 실행**합니다.
>
> **핵심 기능**:
> - 의존성 기반 Task 자동 선택
> - **각 단계별 전문 Subagent 위임**
> - 상세설계 단계: review → apply 자동 수행
> - 구현 단계: audit → patch 자동 수행
> - 모든 카테고리 지원 (development, defect, infrastructure)

## 사용법

```bash
/wf:auto [범위] [부분실행] [옵션]

# 전체 자동 실행 (다음 실행 가능 Task부터 완료까지)
/wf:auto

# 특정 범위 지정
/wf:auto WP-01          # WP-01 내 Task만
/wf:auto ACT-01-01      # ACT-01-01 내 Task만
/wf:auto TSK-01-01-01   # 단일 Task만

# 부분 실행 (특정 단계까지만) - 영어 옵션
/wf:auto TSK-01-01-01 --until basic-design    # 기본설계까지
/wf:auto TSK-01-01-01 --until detail-design   # 상세설계까지
/wf:auto TSK-01-01-01 --until apply           # 설계리뷰 반영까지
/wf:auto TSK-01-01-01 --until build           # 구현까지

# 부분 실행 - 한글 자연어 (동일하게 동작)
/wf:auto TSK-01-01-01 기본설계까지
/wf:auto TSK-01-01-01 상세설계까지
/wf:auto TSK-01-01-01 리뷰반영까지
/wf:auto TSK-01-01-01 구현까지

# 일반 옵션
/wf:auto --dry-run      # 실행 계획만 출력 (실제 실행 안함)
/wf:auto --continue     # 실패해도 다음 Task 계속 진행
/wf:auto --max 5        # 최대 5개 Task만 처리
/wf:auto --skip-review  # review/apply 건너뛰기
/wf:auto --skip-audit   # audit/patch 건너뛰기

# 조합 사용
/wf:auto WP-01 상세설계까지 --max 3
/wf:auto TSK-01-01-01 --until build --skip-review
```

---

## Subagent 매핑

### 워크플로우 단계별 Subagent

| 단계 | 명령어 | Subagent | 역할 |
|------|--------|----------|------|
| 기본설계 | `/wf:start` | `requirements-analyst` | 요구사항 분석, 기본설계 문서 작성 |
| 상세설계 | `/wf:draft` | `system-architect` | 시스템 아키텍처 설계, 상세설계 문서 작성 |
| 설계리뷰 | `/wf:review` | `refactoring-expert` | 설계 품질 분석, 개선점 도출 |
| 구현(백엔드) | `/wf:build` | `backend-architect` | API 설계, 데이터베이스, 서버 로직 구현 |
| 구현(프론트) | `/wf:build` | `frontend-architect` | UI 컴포넌트, 화면 구현, 접근성 |
| 단위테스트 | `/wf:test` | `quality-engineer` | TDD 단위테스트 및 E2E 테스트 실행 |
| 코드리뷰 | `/wf:audit` | `refactoring-expert` | 코드 품질 분석, 기술 부채 식별 |
| 통합테스트 | `/wf:verify` | `quality-engineer` | 테스트 전략 설계, 통합 테스트 실행 |
| 인프라 | `/wf:build` (infra) | `devops-architect` | CI/CD, 배포, 모니터링 설정 |

### Subagent 설정 파일 위치

```
.claude/agents/
├── requirements-analyst.md   # 요구사항 분석, 기본설계
├── system-architect.md       # 시스템 설계, 상세설계
├── backend-architect.md      # 백엔드 구현
├── frontend-architect.md     # 프론트엔드 구현
├── quality-engineer.md       # 테스트 전략, 품질 검증
├── refactoring-expert.md     # 코드/설계 리뷰, 품질 개선
└── devops-architect.md       # 인프라, 배포 자동화
```

---

## 부분 실행 (--until / 자연어)

> **특정 단계까지만 실행**: `--until` 옵션 또는 한글 자연어로 원하는 단계까지만 워크플로우를 실행합니다.
> 완료([xx])까지 가지 않고 중간 단계에서 멈출 수 있습니다.

### Target 키워드 매핑

| 영어 옵션 (`--until`) | 한글 자연어 | 상태 변화 | 실행 단계 | 산출물 |
|----------------------|------------|----------|----------|--------|
| `basic-design` | `기본설계까지` | `[ ]→[bd]` | start | 010-basic-design.md |
| `ui-design` | `기본설계+UI까지`, `UI설계까지` | `[ ]→[bd]` | start + ui | 010 + 011-ui-design.md |
| `detail-design` | `상세설계까지` | `[bd]→[dd]` | draft | 020, 025, 026 |
| `review` | `리뷰까지`, `설계리뷰까지` | `[dd]` 유지 | review만 | 021-design-review-*.md |
| `apply` | `리뷰반영까지`, `apply까지` | `[dd]` 유지 | review + apply | 리뷰 반영 완료 |
| `build` | `구현까지`, `빌드까지` | `[dd]→[im]` | build + test | 030-implementation.md |
| `audit` | `코드리뷰까지`, `audit까지` | `[im]` 유지 | audit만 | 031-code-review-*.md |
| `patch` | `패치까지`, `코드리뷰반영까지` | `[im]` 유지 | audit + patch | 리뷰 반영 완료 |
| `verify` | `테스트까지`, `통합테스트까지` | `[im]→[ts]` | verify | 070-integration-test.md |
| `done` | `완료까지` (기본값) | `[ts]→[xx]` | done | 080-manual.md |

### 한글 자연어 인식 패턴

```javascript
const koreanPatterns = {
  // 기본설계 관련
  '기본설계까지': 'basic-design',
  '기본설계완료까지': 'basic-design',
  'UI설계까지': 'ui-design',
  '기본설계+UI까지': 'ui-design',
  '화면설계까지': 'ui-design',

  // 상세설계 관련
  '상세설계까지': 'detail-design',
  'dd까지': 'detail-design',

  // 리뷰 관련
  '리뷰까지': 'review',
  '설계리뷰까지': 'review',
  '리뷰반영까지': 'apply',
  'apply까지': 'apply',

  // 구현 관련
  '구현까지': 'build',
  '빌드까지': 'build',
  '개발까지': 'build',

  // 코드리뷰 관련
  '코드리뷰까지': 'audit',
  'audit까지': 'audit',
  '패치까지': 'patch',
  '코드리뷰반영까지': 'patch',

  // 테스트 관련
  '테스트까지': 'verify',
  '통합테스트까지': 'verify',
  '검증까지': 'verify',

  // 완료
  '완료까지': 'done'
};
```

### 사용 예시

```bash
# 기본설계만 완료하고 멈춤
/wf:auto TSK-01-01-01 기본설계까지
/wf:auto TSK-01-01-01 --until basic-design

# 상세설계 리뷰까지만 (apply 전)
/wf:auto TSK-01-01-01 설계리뷰까지
/wf:auto TSK-01-01-01 --until review

# 구현까지 (테스트 통과, 코드리뷰 전)
/wf:auto TSK-01-01-01 구현까지
/wf:auto TSK-01-01-01 --until build

# 여러 Task에 동일하게 적용
/wf:auto WP-01 상세설계까지 --max 5
```

### 부분 실행 흐름 (development)

```
/wf:auto TSK-XX 상세설계까지

[ ] Todo
  ↓ /wf:start          → requirements-analyst
[bd] 기본설계
  ↓ /wf:draft          → system-architect
[dd] 상세설계  ← 여기서 STOP!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/wf:auto TSK-XX 리뷰반영까지

[dd] 상세설계 (이어서)
  ↓ /wf:review         → refactoring-expert
  ↓ /wf:apply          → (메인 에이전트)  ← 여기서 STOP!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/wf:auto TSK-XX (기본값: 완료까지)

[dd] 상세설계 (이어서)
  ↓ /wf:build          → backend + frontend
  │                       └── 내부적으로 /wf:test 호출
  ↓ /wf:test (조건부)  → quality-engineer ⚠️ 결과 없을 때만
[im] 구현
  ↓ /wf:audit          → refactoring-expert
  ↓ /wf:patch          → (메인 에이전트)
  ↓ /wf:verify         → quality-engineer
[ts] 테스트
  ↓ /wf:done           → (메인 에이전트)
[xx] 완료
```

---

## 카테고리별 전체 워크플로우 (Subagent 적용)

### development (개발)

```
[ ] Todo
  ↓ /wf:start          → requirements-analyst
[bd] 기본설계
  ↓ /wf:draft          → system-architect
[dd] 상세설계
  ↓ /wf:review (1회)   → refactoring-expert (자동 포함)
  ↓ /wf:apply          → (메인 에이전트)
  ↓ /wf:build          → backend-architect + frontend-architect (병렬)
  │                       └── 내부적으로 /wf:test 호출 (TDD + E2E)
  ↓ /wf:test (조건부)  → quality-engineer ⚠️ 테스트 결과 없을 때만 실행
[im] 구현
  ↓ /wf:audit (1회)    → refactoring-expert (자동 포함)
  ↓ /wf:patch          → (메인 에이전트)
  ↓ /wf:verify         → quality-engineer
[ts] 테스트
  ↓ /wf:done           → (메인 에이전트)
[xx] 완료
```

### defect (결함)

```
[ ] Todo
  ↓ /wf:start          → requirements-analyst
[an] 분석
  ↓ /wf:fix            → backend-architect / frontend-architect
  │                       └── 내부적으로 /wf:test 호출 (TDD + E2E)
  ↓ /wf:test (조건부)  → quality-engineer ⚠️ 테스트 결과 없을 때만 실행
[fx] 수정
  ↓ /wf:audit (1회)    → refactoring-expert (자동 포함)
  ↓ /wf:patch          → (메인 에이전트)
  ↓ /wf:verify         → quality-engineer
[ts] 테스트
  ↓ /wf:done           → (메인 에이전트)
[xx] 완료
```

### infrastructure (인프라)

```
[ ] Todo
  ↓ /wf:start 또는 /wf:skip  → devops-architect
[ds] 설계 (선택)
  ↓ /wf:build                → devops-architect
[im] 구현
  ↓ /wf:audit (1회)          → refactoring-expert (자동 포함)
  ↓ /wf:patch                → (메인 에이전트)
  ↓ /wf:done                 → (메인 에이전트)
[xx] 완료
```

---

## 핵심 실행 로직 (Target까지 반복 실행)

> **⚠️ 중요**: `/wf:auto`는 **target 단계까지 자동으로 모든 단계를 반복 실행**합니다.
> - 기본값: `[xx]` 완료까지 실행
> - `--until` 옵션 또는 한글 자연어로 중간 단계에서 멈출 수 있습니다.

### 반복 실행 알고리즘

```javascript
// 핵심 로직: target까지 반복 (기본값: 완료)
async function executeAutoWorkflow(taskId, options = {}) {
  const task = await loadTaskFromWbs(taskId);
  let currentStatus = task.status;
  let currentAction = null;

  // target 파싱 (영어 옵션 또는 한글 자연어)
  const target = parseTarget(options.until || options.koreanTarget) || 'done';

  // ⭐ 핵심: target에 도달할 때까지 반복
  while (!isTargetReached(currentStatus, currentAction, target)) {
    const mapping = subagentMapping[task.category][currentStatus];

    // 1. preActions 실행 (review/apply 또는 audit/patch)
    if (mapping.preActions) {
      for (const preAction of mapping.preActions) {
        currentAction = preAction.action;

        // ⭐ target 체크: preAction에서 멈춰야 하는지
        if (isTargetReached(currentStatus, currentAction, target)) {
          return { success: true, finalStatus: currentStatus, stoppedAt: target };
        }

        // ⭐ 조건부 실행: condition이 있으면 조건 검사
        if (preAction.condition === 'codeReviewNotExist') {
          // wf:audit이 이미 실행되었는지 확인
          const codeReviewExists = checkCodeReviewExists(taskId);
          if (codeReviewExists) {
            console.log(`[INFO] 코드 리뷰가 이미 존재합니다. wf:audit 스킵`);
            continue;  // 코드 리뷰가 있으면 스킵
          }
        }

        if (preAction.subagent) {
          await Task({ subagent_type: preAction.subagent, ... });
        } else {
          await executeMainAgentAction(preAction.action);  // apply, patch
        }
      }
    }

    // 2. 메인 액션 실행 (build, verify, done)
    currentAction = mapping.action;

    // ⭐ target 체크: mainAction에서 멈춰야 하는지
    if (isTargetReached(currentStatus, currentAction, target)) {
      return { success: true, finalStatus: currentStatus, stoppedAt: target };
    }

    if (mapping.subagent) {
      await Task({ subagent_type: mapping.subagent, ... });
    } else {
      await executeMainAgentAction(mapping.action);  // done
    }

    // 3. postActions 실행 (test) - 조건부 실행 지원
    if (mapping.postActions) {
      for (const postAction of mapping.postActions) {
        currentAction = postAction.action;

        // ⭐ 조건부 실행: condition이 있으면 조건 검사
        if (postAction.condition === 'testResultsNotExist') {
          // wf:build/wf:fix가 이미 wf:test를 호출했는지 확인
          const testResultsExist = checkTestResultsExist(taskId);
          if (testResultsExist) {
            console.log(`[INFO] 테스트 결과가 이미 존재합니다. wf:test 스킵`);
            continue;  // 테스트 결과가 있으면 스킵
          }
        }

        if (postAction.subagent) {
          await Task({ subagent_type: postAction.subagent, ... });
        } else {
          await executeMainAgentAction(postAction.action);
        }
      }
    }

    // 4. 상태 업데이트 확인
    currentStatus = mapping.next;

    // 5. 다음 루프로 진행
  }

  // 완료 (target 도달)
  return { success: true, finalStatus: currentStatus, stoppedAt: target };
}

// Target 도달 여부 확인
function isTargetReached(status, action, target) {
  const targetMap = {
    'basic-design': { status: '[bd]', action: 'start' },
    'ui-design':    { status: '[bd]', action: 'ui' },
    'detail-design':{ status: '[dd]', action: 'draft' },
    'review':       { status: '[dd]', action: 'review' },
    'apply':        { status: '[dd]', action: 'apply' },
    'build':        { status: '[im]', action: 'build' },
    'audit':        { status: '[im]', action: 'audit' },
    'patch':        { status: '[im]', action: 'patch' },
    'verify':       { status: '[ts]', action: 'verify' },
    'done':         { status: '[xx]', action: 'done' }
  };

  const t = targetMap[target];
  if (!t) return status === '[xx]';  // 기본값

  // 상태와 액션이 target에 도달했는지 확인
  return status === t.status && action === t.action;
}

// 한글 자연어 → 영어 target 변환
function parseTarget(input) {
  if (!input) return null;

  const koreanPatterns = {
    '기본설계까지': 'basic-design',
    'UI설계까지': 'ui-design',
    '상세설계까지': 'detail-design',
    '리뷰까지': 'review',
    '리뷰반영까지': 'apply',
    '구현까지': 'build',
    '코드리뷰까지': 'audit',
    '패치까지': 'patch',
    '테스트까지': 'verify',
    '완료까지': 'done'
    // ... 더 많은 패턴은 "부분 실행" 섹션 참조
  };

  return koreanPatterns[input] || input;  // 한글이면 변환, 아니면 그대로
}

// ⭐ 테스트 결과 문서 존재 여부 확인
// wf:build가 내부적으로 wf:test를 호출하므로, 중복 실행 방지
function checkTestResultsExist(taskId) {
  const taskFolder = `.jjiban/projects/{project}/tasks/${taskId}/`;

  // 테스트 결과 문서 존재 여부 확인
  const tddResultExists = fileExists(`${taskFolder}070-tdd-test-results.md`);
  const e2eResultExists = fileExists(`${taskFolder}070-e2e-test-results.md`);

  // 둘 중 하나라도 존재하면 테스트가 이미 실행된 것으로 간주
  return tddResultExists || e2eResultExists;
}

// ⭐ 코드 리뷰 문서 존재 여부 확인
// wf:audit이 이미 실행된 경우 중복 실행 방지
function checkCodeReviewExists(taskId) {
  const taskFolder = `.jjiban/projects/{project}/tasks/${taskId}/`;

  // 코드 리뷰 문서 존재 여부 확인 (적용완료 포함)
  const codeReviewFiles = glob(taskFolder, '031-code-review-*.md');

  // 코드 리뷰 파일이 하나라도 존재하면 이미 실행된 것으로 간주
  return codeReviewFiles.length > 0;
}
```

### 전체 실행 예시 (development 카테고리)

```
/wf:auto TSK-02-03-03 (시작 상태: [dd])

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Loop 1: [dd] → [im]
  ├── preActions:
  │   ├── review (refactoring-expert) → 021-design-review-claude-1.md
  │   └── apply (메인) → 리뷰 반영, 파일명에 (적용완료) 추가
  ├── mainAction:
  │   └── build (backend-architect) → 030-implementation.md, 코드 구현
  │       └── 내부적으로 /wf:test 호출 → 070-tdd/e2e-test-results.md 생성
  └── postActions:
      └── test (quality-engineer) → ⚠️ 테스트 결과 존재 시 스킵

Loop 2: [im] → [ts]
  ├── preActions:
  │   ├── audit (refactoring-expert) → 031-code-review-claude-1.md
  │   └── patch (메인) → 리뷰 반영, 파일명에 (적용완료) 추가
  └── mainAction:
      └── verify (quality-engineer) → 070-integration-test.md

Loop 3: [ts] → [xx]
  └── mainAction:
      └── done (메인) → 080-manual.md, wbs.md 상태 [xx]로 업데이트

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ 완료: Task가 [xx] 상태가 되어 루프 종료
```

### 상태별 루프 횟수

| 시작 상태 | 필요 루프 | 실행 단계 |
|----------|----------|----------|
| `[ ]` Todo | 5회 | start → draft → build → verify → done |
| `[bd]` 기본설계 | 4회 | draft → build → verify → done |
| `[dd]` 상세설계 | 3회 | build → verify → done |
| `[im]` 구현 | 2회 | verify → done |
| `[ts]` 테스트 | 1회 | done |
| `[xx]` 완료 | 0회 | 이미 완료 |

---

## Subagent 실행 로직

### Task 도구 호출 패턴

```javascript
// 단일 Subagent 실행
Task({
  description: "TSK-01-01-01 기본설계 수행",
  prompt: `
    Task ID: TSK-01-01-01
    프로젝트: jjiban
    단계: 기본설계 (start)

    wbs.md 경로: .jjiban/projects/jjiban/wbs.md
    Task 폴더: .jjiban/projects/jjiban/tasks/TSK-01-01-01/

    실행 내용:
    1. wbs.md에서 Task 메타데이터 확인
    2. 010-basic-design.md 문서 생성
    3. wbs.md 상태 업데이트: [ ] → [bd]
  `,
  subagent_type: "requirements-analyst"
});

// 병렬 Subagent 실행 (백엔드 + 프론트엔드)
// 두 Task 도구를 동시에 호출하여 병렬 실행
Task({
  description: "TSK-01-01-01 백엔드 구현",
  prompt: "...",
  subagent_type: "backend-architect",
  run_in_background: true
});

Task({
  description: "TSK-01-01-01 프론트엔드 구현",
  prompt: "...",
  subagent_type: "frontend-architect",
  run_in_background: true
});

// 결과 수집
TaskOutput({ task_id: "backend_task_id" });
TaskOutput({ task_id: "frontend_task_id" });
```

### 상태별 Subagent 매핑

```javascript
const subagentMapping = {
  development: {
    '[ ]':  {
      action: 'start',
      subagent: 'requirements-analyst',
      next: '[bd]'
    },
    '[bd]': {
      action: 'draft',
      subagent: 'system-architect',
      next: '[dd]'
    },
    '[dd]': {
      action: 'build',
      subagent: ['backend-architect', 'frontend-architect'], // 병렬
      next: '[im]',
      preActions: [
        { action: 'review', subagent: 'refactoring-expert' },
        { action: 'apply', subagent: null }  // 메인 에이전트
      ],
      postActions: [
        // ⚠️ wf:build가 내부적으로 wf:test를 호출하므로, 테스트 결과 문서가 없을 때만 실행
        { action: 'test', subagent: 'quality-engineer', condition: 'testResultsNotExist' }
      ]
    },
    '[im]': {
      action: 'verify',
      subagent: 'quality-engineer',
      next: '[ts]',
      preActions: [
        // ⚠️ 코드 리뷰 문서가 이미 존재하면 스킵
        { action: 'audit', subagent: 'refactoring-expert', condition: 'codeReviewNotExist' },
        { action: 'patch', subagent: null }
      ]
    },
    '[ts]': {
      action: 'done',
      subagent: null,  // 메인 에이전트
      next: '[xx]'
    }
  },
  defect: {
    '[ ]':  {
      action: 'start',
      subagent: 'requirements-analyst',
      next: '[an]'
    },
    '[an]': {
      action: 'fix',
      subagent: ['backend-architect', 'frontend-architect'],
      next: '[fx]',
      postActions: [
        // ⚠️ wf:fix가 내부적으로 wf:test를 호출하므로, 테스트 결과 문서가 없을 때만 실행
        { action: 'test', subagent: 'quality-engineer', condition: 'testResultsNotExist' }
      ]
    },
    '[fx]': {
      action: 'verify',
      subagent: 'quality-engineer',
      next: '[ts]',
      preActions: [
        // ⚠️ 코드 리뷰 문서가 이미 존재하면 스킵
        { action: 'audit', subagent: 'refactoring-expert', condition: 'codeReviewNotExist' },
        { action: 'patch', subagent: null }
      ]
    },
    '[ts]': {
      action: 'done',
      subagent: null,
      next: '[xx]'
    }
  },
  infrastructure: {
    '[ ]':  {
      action: 'start',
      subagent: 'devops-architect',
      next: '[ds]'
    },
    '[ds]': {
      action: 'build',
      subagent: 'devops-architect',
      next: '[im]'
    },
    '[im]': {
      action: 'done',
      subagent: null,
      next: '[xx]',
      preActions: [
        // ⚠️ 코드 리뷰 문서가 이미 존재하면 스킵
        { action: 'audit', subagent: 'refactoring-expert', condition: 'codeReviewNotExist' },
        { action: 'patch', subagent: null }
      ]
    }
  }
};
```

---

## 단일 Task 자동 실행 플로우 (Subagent 적용)

```
┌─────────────────────────────────────────────────────────────────┐
│ /wf:auto TSK-XX-XX-XX                                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Task 정보 로드                                              │
│     ├── wbs.md에서 Task 메타데이터 추출                         │
│     ├── category, status, depends 확인                         │
│     └── 의존성 검사 (depends Task가 모두 [xx]인지)              │
│                                                                 │
│  2. 실행 계획 수립                                              │
│     ├── 현재 상태에서 다음 액션 결정                            │
│     ├── subagentMapping에서 담당 Subagent 확인                 │
│     ├── preActions 확인 (review/apply, audit/patch)            │
│     └── 실행 순서 확정                                          │
│                                                                 │
│  3. Subagent 워크플로우 실행 (예: [dd] 상세설계 상태)           │
│     │                                                           │
│     ├── 3a. Task(subagent: refactoring-expert) → /wf:review    │
│     │   └── 021-design-review-{llm}-1.md 생성                  │
│     │                                                           │
│     ├── 3b. 메인 에이전트 → /wf:apply                          │
│     │   └── 리뷰 내용 반영                                      │
│     │                                                           │
│     └── 3c. Task 병렬 실행 → /wf:build                         │
│         ├── Task(subagent: backend-architect)                  │
│         │   └── TDD 기반 백엔드 구현                            │
│         └── Task(subagent: frontend-architect)                 │
│             └── 프론트엔드 구현 + E2E 테스트                    │
│                                                                 │
│  4. 결과 수집 (TaskOutput)                                      │
│     ├── 각 Subagent 실행 결과 수집                              │
│     ├── 상태 전이 확인 ([dd] → [im])                           │
│     ├── 필수 산출물 존재 확인                                   │
│     └── 테스트 결과 확인 (통과율)                               │
│                                                                 │
│  5. 보고서 출력                                                 │
│     └── 실행 결과 요약 (Subagent별 결과 포함)                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 연속 실행 모드 (다중 Task 병렬 처리)

```
┌─────────────────────────────────────────────────────────────────┐
│ /wf:auto WP-01 --max 10                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. WP-01 내 실행 가능 Task 목록 추출                           │
│     ├── wbs.md 파싱 → Task 목록                                 │
│     ├── 완료되지 않은 Task 필터링                               │
│     ├── 의존성 검사 → 실행 가능 Task 선별                       │
│     └── 우선순위 정렬 (priority, WBS 순서)                      │
│                                                                 │
│  2. 독립 Task 병렬 실행 그룹화                                  │
│     ├── 상호 의존성 없는 Task들을 그룹화                        │
│     └── 동시 실행 가능 Task 식별                                │
│                                                                 │
│  3. 병렬 Subagent 실행                                          │
│     │                                                           │
│     │  [독립 Task 그룹 1]                                       │
│     │  ├── Task(TSK-01-01-01, run_in_background: true)         │
│     │  ├── Task(TSK-01-02-01, run_in_background: true)         │
│     │  └── Task(TSK-01-03-01, run_in_background: true)         │
│     │                                                           │
│     │  TaskOutput() × 3 → 결과 수집                             │
│     │                                                           │
│     │  [의존성 충족 후 다음 그룹]                                │
│     │  ├── Task(TSK-01-01-02, run_in_background: true)         │
│     │  └── Task(TSK-01-02-02, run_in_background: true)         │
│     │                                                           │
│     └── 반복...                                                 │
│                                                                 │
│  4. 최종 보고서                                                 │
│     ├── 성공/실패 Task 목록                                     │
│     ├── Subagent별 실행 결과                                    │
│     └── 다음 실행 가능 Task 안내                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Subagent 프롬프트 템플릿

### requirements-analyst (기본설계)

```markdown
## Task 정보
- Task ID: {taskId}
- 프로젝트: {project}
- 카테고리: {category}
- 현재 상태: [ ] Todo

## 실행 내용
1. wbs.md에서 Task 메타데이터 확인
   - 경로: .jjiban/projects/{project}/wbs.md
2. 요구사항 분석 및 기본설계 수행
3. 010-basic-design.md 문서 생성
   - 경로: .jjiban/projects/{project}/tasks/{taskId}/010-basic-design.md
   - 템플릿: .jjiban/templates/010-basic-design.md
4. wbs.md 상태 업데이트: [ ] → [bd]

## 참고 문서
- @.claude/includes/wf-common.md
- @.claude/includes/wf-hierarchy-input.md
```

### system-architect (상세설계)

```markdown
## Task 정보
- Task ID: {taskId}
- 프로젝트: {project}
- 카테고리: development
- 현재 상태: [bd] 기본설계

## 실행 내용
1. 010-basic-design.md 문서 확인
2. 시스템 아키텍처 설계 수행
3. 다음 문서 생성:
   - 020-detail-design.md (상세설계)
   - 025-traceability-matrix.md (추적성 매트릭스)
   - 026-test-specification.md (테스트 명세)
4. wbs.md 상태 업데이트: [bd] → [dd]

## 참고 문서
- @.claude/includes/wf-common.md
```

### backend-architect / frontend-architect (구현)

```markdown
## Task 정보
- Task ID: {taskId}
- 프로젝트: {project}
- 역할: {backend|frontend}
- 현재 상태: [dd] 상세설계

## 실행 내용
1. 020-detail-design.md 상세설계 확인
2. 026-test-specification.md 테스트 명세 확인
3. TDD 기반 구현:
   - 단위 테스트 먼저 작성
   - 코드 구현
   - 테스트 통과 확인
4. 030-implementation.md 문서 생성
5. wbs.md 상태 업데이트: [dd] → [im]

## 백엔드 담당 (backend-architect)
- API 엔드포인트 구현
- 데이터베이스 스키마
- 서버 로직

## 프론트엔드 담당 (frontend-architect)
- UI 컴포넌트 구현
- E2E 테스트 작성
- 접근성 검증
```

### quality-engineer (테스트)

```markdown
## Task 정보
- Task ID: {taskId}
- 프로젝트: {project}
- 현재 상태: [im] 구현

## 실행 내용
1. 구현 코드 확인
2. 통합 테스트 설계 및 실행
3. 070-integration-test.md 문서 생성
4. 테스트 결과 아티팩트 저장
5. wbs.md 상태 업데이트: [im] → [ts]

## 테스트 범위
- 단위 테스트 커버리지 80% 이상
- E2E 테스트 통과율 100%
- 성능 테스트 (필요시)
```

### refactoring-expert (리뷰)

```markdown
## Task 정보
- Task ID: {taskId}
- 프로젝트: {project}
- 리뷰 대상: {설계문서|구현코드}

## 실행 내용
1. 대상 문서/코드 분석
2. 품질 지표 측정
3. 개선점 도출
4. 리뷰 문서 생성:
   - 설계리뷰: 021-design-review-{llm}-{n}.md
   - 코드리뷰: 031-code-review-{llm}-{n}.md

## 리뷰 관점
- SOLID 원칙 준수
- 기술 부채 식별
- 유지보수성 평가
- 보안 취약점 검토
```

---

## 안정성 보장 메커니즘

### 실행 전 검증

| 검증 항목 | 조건 | 실패 시 처리 |
|----------|------|-------------|
| Task 존재 | wbs.md에 Task ID 존재 | 에러 종료 |
| Subagent 존재 | .claude/agents/에 에이전트 파일 존재 | 에러 종료 |
| 의존성 충족 | depends Task가 모두 [xx] | 스킵 또는 대기 |
| 상태 유효성 | 현재 상태에서 전이 가능 | 에러 종료 |
| 필수 문서 | 이전 단계 산출물 존재 | 에러 또는 경고 |

### Subagent 실행 중 안전장치

```
타임아웃 (Subagent별)
├── requirements-analyst: 15분
├── system-architect: 20분
├── backend-architect: 30분
├── frontend-architect: 30분
├── quality-engineer: 25분
├── refactoring-expert: 15분
└── devops-architect: 20분

재시도 정책
├── Subagent 실패: 1회 재시도
├── 테스트 실패: 5회까지 자동 수정 시도
└── 영구적 오류: 즉시 중단

체크포인트
├── 각 Subagent 완료 시 상태 저장
├── 중단 시 마지막 성공 상태로 복원 가능
└── wbs.md 변경 전 백업 (.wbs.md.bak)
```

### 실행 후 검증

```javascript
const postValidation = {
  'start': {
    requiredDocs: ['010-basic-design.md'],
    statusCheck: '[bd]|[an]|[ds]',
    subagent: 'requirements-analyst'
  },
  'draft': {
    requiredDocs: ['020-detail-design.md', '025-traceability-matrix.md', '026-test-specification.md'],
    statusCheck: '[dd]',
    subagent: 'system-architect'
  },
  'build': {
    requiredDocs: ['030-implementation.md'],
    statusCheck: '[im]',
    subagent: ['backend-architect', 'frontend-architect']
  },
  'test': {
    requiredDocs: [],
    statusCheck: '[im]',
    testCoverage: 80,
    e2ePassRate: 100,
    subagent: 'quality-engineer'
  },
  'verify': {
    requiredDocs: ['070-integration-test.md'],
    statusCheck: '[ts]',
    subagent: 'quality-engineer'
  },
  'done': {
    requiredDocs: ['080-manual.md'],
    statusCheck: '[xx]',
    subagent: null  // 메인 에이전트
  }
};
```

### 리뷰 적용 완료 처리

> **중요**: 리뷰 내용을 반영(apply/patch)한 후, 해당 리뷰 문서에 `(적용완료)` 표시를 추가해야 합니다.

**설계 리뷰 (review → apply)**:
```bash
# 적용 전
021-design-review-{llm}-{n}.md

# 적용 후 (파일명 변경)
021-design-review-{llm}-{n}(적용완료).md
```

**코드 리뷰 (audit → patch)**:
```bash
# 적용 전
031-code-review-{llm}-{n}.md

# 적용 후 (파일명 변경)
031-code-review-{llm}-{n}(적용완료).md
```

**처리 시점**:
- `/wf:apply` 완료 후 → 설계 리뷰 문서에 (적용완료) 표시
- `/wf:patch` 완료 후 → 코드 리뷰 문서에 (적용완료) 표시

**자동화 처리**:
```javascript
// patch/apply 완료 후 자동 실행
function markReviewAsApplied(taskFolder, reviewType) {
  const pattern = reviewType === 'design'
    ? '021-design-review-*.md'
    : '031-code-review-*.md';

  const files = glob(taskFolder, pattern);
  for (const file of files) {
    if (!file.includes('(적용완료)')) {
      const newName = file.replace('.md', '(적용완료).md');
      rename(file, newName);
    }
  }
}
```

---

## 출력 형식

### Dry-run 모드 (Subagent 포함)

```
[wf:auto] 실행 계획 (dry-run)

대상: WP-01 (Platform Infrastructure)
실행 가능 Task: 3개

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

실행 순서:

1. TSK-02-03-01 [infrastructure] [im] → [xx]
   ├── 계획: audit → patch → done
   ├── audit: refactoring-expert
   └── done: (메인 에이전트)

2. TSK-02-03-02 [development] [dd] → [im]
   ├── 계획: review → apply → build
   ├── review: refactoring-expert
   └── build: backend-architect + frontend-architect (병렬)

3. TSK-02-03-03 [development] [dd] → [im]
   ├── 계획: review → apply → build
   ├── review: refactoring-expert
   └── build: backend-architect + frontend-architect (병렬)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Subagent 사용 요약:
├── refactoring-expert: 3회 (review: 2, audit: 1)
├── backend-architect: 2회 (build)
├── frontend-architect: 2회 (build)
└── 메인 에이전트: 3회 (apply: 2, done: 1)

대기 중 (의존성 미충족):
├── TSK-03-01: depends TSK-02-03-03 [dd]
└── TSK-03-02: depends TSK-02-02-01, TSK-02-02-02, TSK-03-01

실행하려면: /wf:auto WP-01
```

### Dry-run 모드 (부분 실행)

```
[wf:auto] 실행 계획 (dry-run)

대상: TSK-02-03-03 (development)
목표: 상세설계까지 (--until detail-design)
현재 상태: [ ] Todo

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

실행 계획:

1. [ ] → [bd] 기본설계
   └── start: requirements-analyst

2. [bd] → [dd] 상세설계
   └── draft: system-architect

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏸️ 중단점: [dd] 상세설계 완료 후 멈춤
   (review, apply, build 등은 실행하지 않음)

실행하려면: /wf:auto TSK-02-03-03 상세설계까지
```

### 실행 결과 (부분 완료)

```
[wf:auto] 워크플로우 부분 실행 완료

대상: TSK-02-03-03
목표: 리뷰반영까지 (--until apply)
실행 시간: 12분 45초

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

실행 결과:

[OK] [ ] → [dd] 상세설계
   ├── start (requirements-analyst): 완료
   └── draft (system-architect): 완료

[OK] [dd] 리뷰 및 반영
   ├── review (refactoring-expert): 3건 지적
   └── apply (메인): 3건 반영

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏸️ 중단: 리뷰반영까지 완료 (apply)
   현재 상태: [dd] 상세설계
   남은 단계: build → test → audit → patch → verify → done

이어서 실행: /wf:auto TSK-02-03-03
또는 구현까지: /wf:auto TSK-02-03-03 구현까지
```

### 실행 결과 (Subagent 포함)

```
[wf:auto] 자동 워크플로우 실행 완료

대상: WP-01
실행 시간: 45분 32초
Subagent 호출: 7회

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

실행 결과:

[OK] TSK-02-03-01 [infrastructure]
   [im] → [xx] done
   ├── audit (refactoring-expert): Pass
   └── done (메인): 완료

[OK] TSK-02-03-02 [development]
   [dd] → [im] build
   ├── review (refactoring-expert): 3건 지적
   ├── apply (메인): 3건 반영
   ├── build (backend-architect): TDD 12/12 (100%)
   └── build (frontend-architect): E2E 8/8 (100%)

[FAIL] TSK-02-03-03 [development]
   [dd] → [im] build 실패
   ├── review (refactoring-expert): 2건 지적
   ├── apply (메인): 2건 반영
   └── build (frontend-architect): E2E 5/8 실패 (5회 재시도 초과)
       └── 실패 테스트: E2E-003, E2E-005, E2E-007

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Subagent 실행 통계:
├── requirements-analyst: 0회
├── system-architect: 0회
├── backend-architect: 2회 (성공: 2)
├── frontend-architect: 2회 (성공: 1, 실패: 1)
├── quality-engineer: 0회
├── refactoring-expert: 3회 (성공: 3)
└── 메인 에이전트: 3회 (성공: 3)

요약:
├── 성공: 2개
├── 실패: 1개
├── 스킵: 0개
└── 진행률: WP-01 (67% → 78%)

실패 Task 상세:
└── TSK-02-03-03: frontend-architect 재실행 필요
    수동 확인 후: /wf:build TSK-02-03-03

다음 실행 가능: /wf:auto WP-01 --continue
```

---

## 옵션 정리

| 옵션 | 설명 | 기본값 |
|------|------|--------|
| `--until <target>` | 특정 단계까지만 실행 (영어) | done (완료까지) |
| `<한글>까지` | 특정 단계까지만 실행 (자연어) | done (완료까지) |
| `--dry-run` | 실행 계획만 출력 | false |
| `--continue` | 실패해도 다음 Task 계속 | false |
| `--max N` | 최대 N개 Task 처리 | 무제한 |
| `--skip-review` | review/apply 건너뛰기 | false |
| `--skip-audit` | audit/patch 건너뛰기 | false |
| `--timeout M` | 단일 Subagent 타임아웃 (분) | 30 |
| `--parallel N` | 병렬 Subagent 수 | 3 |

### --until Target 값

| Target | 한글 자연어 | 설명 |
|--------|------------|------|
| `basic-design` | `기본설계까지` | 기본설계 완료 후 멈춤 |
| `ui-design` | `UI설계까지`, `기본설계+UI까지` | UI설계 완료 후 멈춤 |
| `detail-design` | `상세설계까지` | 상세설계 완료 후 멈춤 |
| `review` | `리뷰까지`, `설계리뷰까지` | 설계리뷰 완료 후 멈춤 |
| `apply` | `리뷰반영까지` | 설계리뷰 반영 후 멈춤 |
| `build` | `구현까지`, `빌드까지` | 구현+단위테스트 완료 후 멈춤 |
| `audit` | `코드리뷰까지` | 코드리뷰 완료 후 멈춤 |
| `patch` | `패치까지`, `코드리뷰반영까지` | 코드리뷰 반영 후 멈춤 |
| `verify` | `테스트까지`, `통합테스트까지` | 통합테스트 완료 후 멈춤 |
| `done` | `완료까지` (기본값) | 완료까지 실행 |

---

## 에러 케이스

| 에러 | 메시지 | 처리 |
|------|--------|------|
| Task 없음 | `[ERROR] 실행 가능한 Task가 없습니다` | 종료 |
| Subagent 없음 | `[ERROR] Subagent 파일을 찾을 수 없습니다: {agent}` | 종료 |
| 의존성 미충족 | `[WARN] 의존성 미충족: {deps}` | 스킵 |
| 상태 전이 불가 | `[ERROR] 현재 상태에서 전이 불가: {status}` | 종료 |
| Subagent 타임아웃 | `[ERROR] Subagent 타임아웃: {agent} ({M}분 초과)` | 종료 |
| Subagent 실패 | `[ERROR] Subagent 실행 실패: {agent}` | 재시도/종료 |
| 테스트 실패 | `[ERROR] 테스트 5회 재시도 초과` | 종료/continue |

---

## 공통 모듈 참조

@.claude/includes/wf-hierarchy-input.md
@.claude/includes/wf-common.md

---

<!--
jjiban 프로젝트 - Workflow Command
author: 장종익
Command: wf:auto
Version: 2.3

Changes (v2.3):
- wf:audit 조건부 실행 로직 추가
  - 코드 리뷰 문서(031-code-review-*.md) 존재 시 스킵
  - checkCodeReviewExists() 함수 추가
  - preActions.condition 속성 추가 ('codeReviewNotExist')
  - development/defect/infrastructure 모든 카테고리에 적용

Changes (v2.2):
- wf:test 조건부 실행 로직 추가
  - wf:build/wf:fix가 내부적으로 wf:test를 호출하므로 중복 방지
  - 테스트 결과 문서(070-tdd/e2e-test-results.md) 존재 시 스킵
  - checkTestResultsExist() 함수 추가
  - postActions.condition 속성 추가 ('testResultsNotExist')
- 워크플로우 다이어그램 업데이트 (조건부 실행 표시)

Changes (v2.1):
- 부분 실행 기능 추가 (--until 옵션)
- 한글 자연어 지원 ("상세설계까지", "리뷰반영까지" 등)
- Target 키워드 매핑 테이블 추가
- isTargetReached() 로직 추가
- parseTarget() 한글→영어 변환 함수 추가
- 부분 완료 출력 형식 추가
- 옵션 정리 표에 --until 및 Target 값 추가

Changes (v2.0):
- Subagent 기반 실행으로 전면 개편
- 워크플로우 단계별 전문 Subagent 매핑
- Task 도구 호출 패턴 추가
- Subagent 프롬프트 템플릿 추가
- 병렬 Subagent 실행 지원
- Subagent별 타임아웃 설정
- 실행 통계에 Subagent 정보 포함

Previous (v1.0):
- 자동 워크플로우 실행 명령어 생성
- 카테고리별 전체 워크플로우 정의
- 상태별 다음 액션 매핑
-->
