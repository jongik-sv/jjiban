# 공통 모듈: 계층 입력 처리 (WP/ACT/TSK)

> 이 파일은 모든 `/wf:*` 명령어에서 Work Package, Activity, Task 단위 입력을 처리하는 공통 모듈입니다.

---

## 1. 지원 입력 형식

| 입력 형식 | 설명 | 예시 |
|-----------|------|------|
| `WP-XX` | Work Package 단위 | `WP-01`, `WP-08` |
| `ACT-XX-XX` | Activity 단위 | `ACT-01-01`, `ACT-02-03` |
| `TSK-XX-XX-XX` | Task 단위 (3단계 구조) | `TSK-01-01-01`, `TSK-02-01-02` |
| `TSK-XX-XX` | Task 단위 (2단계 구조, ACT 없음) | `TSK-08-01`, `TSK-09-02` |

---

## 2. 입력 ID 파싱 규칙

### 2.1 ID 패턴 정규식

```javascript
// ID 타입 식별
const patterns = {
    workPackage: /^WP-(\d{2})$/i,                    // WP-01, WP-08
    activity:    /^ACT-(\d{2})-(\d{2})$/i,           // ACT-01-01
    task3Level:  /^TSK-(\d{2})-(\d{2})-(\d{2})$/i,   // TSK-01-01-01 (3단계: WP/ACT/TSK)
    task2Level:  /^TSK-(\d{2})-(\d{2})$/i            // TSK-08-01 (2단계: WP/TSK, ACT 없음)
};

function parseInputId(input) {
    if (patterns.workPackage.test(input)) return { type: 'WP', id: input };
    if (patterns.activity.test(input)) return { type: 'ACT', id: input };
    if (patterns.task3Level.test(input)) return { type: 'TSK', id: input, level: 3 };
    if (patterns.task2Level.test(input)) return { type: 'TSK', id: input, level: 2 };
    return null;
}
```

### 2.2 입력 타입 판별

| 패턴 | 타입 | 처리 방식 |
|------|------|----------|
| `WP-XX` | Work Package | 해당 WP 내 모든 Task 병렬 처리 |
| `ACT-XX-XX` | Activity | 해당 ACT 내 모든 Task 병렬 처리 |
| `TSK-XX-XX-XX` | Task (3단계) | 단일 Task 처리 (WP/ACT/TSK 구조) |
| `TSK-XX-XX` | Task (2단계) | 단일 Task 처리 (WP/TSK 구조, ACT 없음) |

---

## 3. 통합 폴더 기반 Task 조회 방법

### 3.1 폴더 구조

> **중요**: 폴더명에 설명이 포함됨 (`WP-XX_description`, `ACT-XX-XX_description`)
> glob 검색 시 `WP-XX*`, `ACT-XX-XX*` 와일드카드 패턴 사용 필수

```
.jjiban/{project}/                        # 프로젝트 루트 (wbs/ 폴더 없음)
├── WP-01_core-issue-management/          # Work Package (3단계 구조: WP/ACT/TSK)
│   ├── meta.json                         # WP 메타데이터
│   ├── ACT-01-01_entity-crud/            # Activity
│   │   ├── meta.json                     # ACT 메타데이터
│   │   ├── TSK-01-01-01/                 # Task 폴더
│   │   │   ├── task.json                 # Task 데이터
│   │   │   ├── 010-basic-design.md
│   │   │   └── ...
│   │   └── TSK-01-01-02/
│   │       └── task.json
│   └── ACT-01-02_business-logic/
│       ├── meta.json
│       └── TSK-01-02-01/
│           └── task.json
├── WP-08_platform-data-storage/          # Work Package (2단계 구조: WP/TSK, ACT 없음)
│   ├── meta.json
│   ├── TSK-08-01/                        # Task 직접 포함 (TSK-XX-XX 형식)
│   │   └── task.json
│   ├── TSK-08-02/
│   │   └── task.json
│   └── ...
└── WP-09_platform-cli-execution/
    └── ...
```

### 3.2 Task JSON 구조

**경로 (3단계)**: `.jjiban/{project}/{WP-ID}*/{ACT-ID}*/{TSK-ID}/task.json`
**경로 (2단계)**: `.jjiban/{project}/{WP-ID}*/{TSK-ID}/task.json`

```json
{
  "id": "TSK-01-01-01",
  "title": "Project CRUD 구현",
  "category": "development",
  "status": "[ ]",
  "assignee": null,
  "priority": "medium"
}
```

### 3.3 Task 조회 절차

> **glob 패턴 주의**: 폴더명에 설명이 포함되므로 `WP-XX*`, `ACT-XX-XX*` 와일드카드 필수

**WP 입력 시 (예: `WP-01`, `WP-08`)**:
1. `.jjiban/{project}/WP-01*/` 패턴으로 폴더 탐색 (와일드카드!)
2. 하위 모든 `TSK-*/task.json` 파일 수집 (ACT 유무 관계없이)
3. 결과: `[TSK-01-01-01, TSK-01-01-02, ...]` 또는 `[TSK-08-01, TSK-08-02, ...]`

```javascript
// WP 하위 모든 Task 조회 (3단계/2단계 모두 지원)
function getTasksInWP(project, wpId) {
    // 와일드카드로 WP 폴더 찾기 (예: WP-01* → WP-01_core-issue-management)
    return glob(`.jjiban/${project}/${wpId}*/**/TSK-*/task.json`);
}
```

**ACT 입력 시 (예: `ACT-01-01`)**:
1. ACT ID에서 WP ID 추출 (`ACT-01-01` → `WP-01`)
2. `.jjiban/{project}/WP-01*/ACT-01-01*/` 패턴으로 폴더 탐색 (와일드카드!)
3. `TSK-*/task.json` 파일 수집
4. 결과: `[TSK-01-01-01, TSK-01-01-02, ...]`

```javascript
// ACT 하위 모든 Task 조회
function getTasksInACT(project, actId) {
    const wpNum = actId.match(/^ACT-(\d{2})/)[1];
    const wpId = `WP-${wpNum}`;
    // 와일드카드로 ACT 폴더 찾기 (예: ACT-01-01* → ACT-01-01_entity-crud)
    return glob(`.jjiban/${project}/${wpId}*/${actId}*/TSK-*/task.json`);
}
```

**TSK 입력 시 (3단계: `TSK-01-01-01`)**:
1. TSK ID에서 WP, ACT ID 추출
2. `.jjiban/{project}/WP-01*/ACT-01-01*/TSK-01-01-01/task.json` 패턴으로 접근
3. 결과: `[TSK-01-01-01]`

**TSK 입력 시 (2단계: `TSK-08-01`)**:
1. TSK ID에서 WP ID 추출 (ACT 없음)
2. `.jjiban/{project}/WP-08*/TSK-08-01/task.json` 패턴으로 접근
3. 결과: `[TSK-08-01]`

```javascript
// Task 폴더 경로 조회 (3단계/2단계 자동 판별)
function getTaskPath(project, taskId) {
    // 3단계: TSK-01-01-01
    const match3 = taskId.match(/^TSK-(\d{2})-(\d{2})-(\d{2})$/i);
    if (match3) {
        const [_, wp, act, _tsk] = match3;
        return `.jjiban/${project}/WP-${wp}*/ACT-${wp}-${act}*/${taskId}/`;
    }

    // 2단계: TSK-08-01 (ACT 없음)
    const match2 = taskId.match(/^TSK-(\d{2})-(\d{2})$/i);
    if (match2) {
        const [_, wp, _tsk] = match2;
        return `.jjiban/${project}/WP-${wp}*/${taskId}/`;
    }

    return null;
}

// Task JSON 경로 (glob 패턴)
function getTaskJsonPath(project, taskId) {
    return `${getTaskPath(project, taskId)}task.json`;
}
```

---

## 4. 상태 필터링

명령어별로 특정 상태의 Task만 처리하도록 필터링합니다.

### 4.1 상태 기반 필터 규칙

| 명령어 | 처리 대상 상태 | 필터 조건 |
|--------|---------------|-----------|
| `/wf:start` | `[ ]` Todo | 미시작 Task만 |
| `/wf:draft` | `[bd]` 기본설계 | 기본설계 완료 Task만 |
| `/wf:build` | `[dd]` 상세설계, `[ds]` 설계 | 설계 완료 Task만 |
| `/wf:review` | `[dd]` 상세설계 | 상세설계 완료 Task만 |
| `/wf:audit` | `[im]` 구현, `[fx]` 수정 | 구현/수정 완료 Task만 |
| `/wf:verify` | `[im]` 구현, `[fx]` 수정 | 구현/수정 완료 Task만 |
| `/wf:done` | `[xx]` 완료 | 완료 상태 Task만 |

### 4.2 상태 확인 방법

```javascript
function getTaskStatus(project, taskId) {
    const taskJsonPath = getTaskJsonPath(project, taskId);
    const taskData = JSON.parse(readFile(taskJsonPath));
    return taskData.status;  // "[ ]", "[bd]", "[im]", etc.
}

function filterTasksByStatus(project, taskIds, targetStatuses) {
    return taskIds.filter(taskId => {
        const status = getTaskStatus(project, taskId);
        return targetStatuses.includes(status);
    });
}
```

### 4.3 Task 상태 코드

| 상태 코드 | 의미 |
|----------|------|
| `[ ]` | Todo (미시작) |
| `[bd]` | 기본설계 |
| `[dd]` | 상세설계 |
| `[dr]` | 설계리뷰 |
| `[ds]` | 설계 (infrastructure) |
| `[an]` | 분석 (defect) |
| `[im]` | 구현 |
| `[fx]` | 수정 (defect) |
| `[cr]` | 코드리뷰 |
| `[ts]` | 통합테스트 |
| `[xx]` | 완료 |

---

## 5. 병렬 처리 구현

### 5.1 병렬 실행 원칙

WP 또는 ACT 단위 입력 시, 해당 범위 내 Task들을 **병렬**로 처리합니다.

```
/wf:start WP-01

실행 흐름:
┌─────────────────────────────────────────────────────────┐
│ WP-01 내 Task 목록 수집                                  │
│ └── .jjiban/{project}/wbs/WP-01/*/TSK-*/task.json       │
├─────────────────────────────────────────────────────────┤
│ 상태 필터링 ([ ] Todo 상태만)                           │
│ └── TSK-01-01-01, TSK-01-02-01                         │
├─────────────────────────────────────────────────────────┤
│ 병렬 처리 (Task Agent 위임)                             │
│ ├── Task Agent → TSK-01-01-01                          │
│ └── Task Agent → TSK-01-02-01                          │
├─────────────────────────────────────────────────────────┤
│ 결과 수집 및 통합 보고                                  │
└─────────────────────────────────────────────────────────┘
```

### 5.2 병렬 처리 도구

```markdown
병렬 처리 시 Task 도구 활용:

1. **Task 도구 병렬 호출**:
   - 각 Task에 대해 Task 도구를 병렬로 호출
   - subagent_type: 해당 명령어에 맞는 에이전트 타입
   - run_in_background: true (선택적)

2. **결과 수집**:
   - AgentOutputTool로 각 Task 결과 수집
   - 통합 결과 보고서 생성
```

### 5.3 동시 실행 제한

| 설정 | 기본값 | 설명 |
|------|--------|------|
| 최대 병렬 수 | 5 | 동시 실행 Task 수 제한 |
| 배치 크기 | 5 | 한 번에 처리할 Task 그룹 크기 |

---

## 6. 출력 형식

### 6.1 단일 Task 처리 (기존)

```
[wf:start] 워크플로우 시작

Task: TSK-01-01-01
Category: development
상태 전환: [ ] Todo → [bd] 기본설계
...
```

### 6.2 WP/ACT 단위 병렬 처리

```
[wf:start] 워크플로우 시작 (병렬 처리)

입력: WP-01 (Work Package)
범위: Core - Issue Management
데이터 경로: .jjiban/{project}/wbs/WP-01/
대상 Task: 12개 (상태 필터 적용: 8개)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 병렬 처리 진행 상황:
├── [1/8] TSK-01-01-01: Project CRUD 구현 ✅
├── [2/8] TSK-01-01-02: Project 대시보드 구현 ✅
├── [3/8] TSK-01-02-01: WP CRUD 구현 🔄 진행중
├── [4/8] TSK-01-02-02: WP 계층 구조 관리 ⏳ 대기
...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 처리 결과 요약:
├── 성공: 6개
├── 실패: 1개 (TSK-01-02-03: 상세설계 문서 없음)
└── 스킵: 1개 (TSK-01-02-04: 이미 진행 중)

다음 단계: 개별 Task별 다음 명령어 실행
```

---

## 7. 사용 예시

### 7.1 명령어별 예시

```bash
# Work Package 단위 실행
/wf:start WP-01           # WP-01 내 모든 Todo Task 시작
/wf:draft WP-01           # WP-01 내 모든 기본설계 완료 Task 상세설계
/wf:build WP-01           # WP-01 내 모든 상세설계 완료 Task 구현

# Activity 단위 실행
/wf:start ACT-01-01       # ACT-01-01 내 모든 Todo Task 시작
/wf:review ACT-01-01      # ACT-01-01 내 모든 상세설계 Task 리뷰

# Task 단위 실행 (기존)
/wf:start TSK-01-01-01    # 단일 Task 시작
```

### 7.2 옵션 조합

```bash
# 특정 상태 Task만 처리 (선택적 옵션)
/wf:build WP-01 --status dd    # 상세설계 상태만
/wf:audit ACT-01-01 --llm gemini  # 특정 LLM으로 리뷰

# 병렬 처리 제어 (선택적 옵션)
/wf:start WP-01 --parallel 3   # 최대 3개 병렬
/wf:draft ACT-01-01 --sequential  # 순차 처리
```

---

## 8. 에러 케이스

| 에러 | 메시지 |
|------|--------|
| 잘못된 ID 형식 | `[ERROR] 잘못된 ID 형식입니다. WP-XX, ACT-XX-XX, TSK-XX-XX-XX 형식을 사용하세요` |
| WP 폴더 없음 | `[ERROR] WBS에서 Work Package를 찾을 수 없습니다: .jjiban/{project}/wbs/{WP-ID}/` |
| ACT 폴더 없음 | `[ERROR] WBS에서 Activity를 찾을 수 없습니다: .jjiban/{project}/wbs/{WP-ID}/{ACT-ID}/` |
| Task 폴더 없음 | `[ERROR] Task 폴더를 찾을 수 없습니다: .jjiban/{project}/wbs/.../[TSK-ID]/` |
| 대상 Task 없음 | `[WARN] 처리 대상 Task가 없습니다. (상태 필터: [상태])` |
| 모두 스킵 | `[WARN] 모든 Task가 스킵되었습니다. (이미 처리됨 또는 조건 미충족)` |

---

<!--
jjiban 프로젝트 - Workflow Common Module
Module: wf-hierarchy-input
Version: 3.0
author: 장종익 

Changes (v3.0):
- 통합 폴더 구조로 변경 (.jjiban/{project}/wbs/)
- Task 데이터 경로: TSK-ID.json → TSK-ID/task.json
- 문서가 Task 폴더 내에 통합됨
- getTaskPath, getTaskJsonPath 함수 업데이트
- 폴더 구조 다이어그램 업데이트

Changes (v2.0):
- 파일 기반 아키텍처로 전환 (분산 JSON 구조)
- WBS 마크다운 파싱 → JSON 파일 직접 접근 방식으로 변경
- .jjiban/wbs/ 경로 기반 Task 조회 로직 추가
- Task 상태를 JSON status 필드에서 읽는 방식으로 변경
- glob 패턴 기반 Task 목록 수집 로직 추가

Changes (v1.0):
- 초기 버전 (WBS 마크다운 파싱 기반)
-->
