---
name: wf:init-json
allowed-tools: [Read, Bash, Write, Glob, Grep]
description: "WBS 문서를 파싱하여 projects/[project]/ 아래에 WP, ACT, TSK 폴더 구조와 JSON 파일을 자동 생성합니다."
category: planning
---

# /init-json - WBS 폴더 구조 및 JSON 파일 생성

> **WBS → 폴더 + JSON 자동 생성**: wbs.md 문서를 분석하여 폴더 구조와 분산 JSON 파일(project.json, meta.json, task.json)을 생성합니다.

## 트리거
- `/wf:wbs` 명령어로 WBS 문서 생성 후
- 프로젝트 초기 폴더 구조 및 JSON 셋업이 필요한 경우
- 기존 폴더 구조에 JSON 파일만 추가가 필요한 경우

## 사용법
```bash
/wf:init-json [project-name]
/wf:init-json [project-name] --json-only     # 폴더는 유지, JSON만 생성
/wf:init-json [project-name] --folders-only  # 폴더만 생성, JSON 생략
/wf:init-json [project-name] --force         # 기존 파일 덮어쓰기

# 예시
/wf:init-json jjiban
/wf:init-json jjiban --json-only
```

## 전제 조건

### 필수 파일
- `projects/[project]/wbs.md` - Work Breakdown Structure 문서

### 참조 문서
- `projects/[project]/file-based-architecture-analysis.md` - JSON 스키마 정의

---

## 실제 폴더 구조

```
projects/[project]/
├── project.json                    # 프로젝트 메타데이터 + 일정
├── team.json                       # 팀원 목록
├── index.json                      # 칸반용 요약 (자동 생성)
├── wbs.md                          # WBS 문서 (기존)
├── [project]-prd.md                # PRD 문서 (기존)
├── [project]-trd.md                # TRD 문서 (기존)
│
├── WP-01_[wp-name]/
│   ├── meta.json                   # WP 메타데이터
│   │
│   ├── ACT-01-01_[act-name]/
│   │   ├── meta.json               # Activity 메타데이터
│   │   │
│   │   ├── TSK-01-01-01/
│   │   │   ├── task.json           # Task 메타데이터
│   │   │   ├── 010-basic-design.md
│   │   │   ├── 020-detail-design.md
│   │   │   ├── 021-design-review-[llm]-[n].md
│   │   │   ├── 030-implementation.md
│   │   │   ├── 031-code-review-[llm]-[n].md
│   │   │   └── test-results/
│   │   │       └── [timestamp]/
│   │   │           ├── tdd/
│   │   │           └── e2e/
│   │   │
│   │   └── TSK-01-01-02/
│   │       └── ...
│   │
│   └── ACT-01-02_[act-name]/
│       └── ...
│
├── WP-02_[wp-name]/
│   └── ...
│
└── WP-03_[wp-name]/
    └── ...
```

---

## JSON 스키마 정의

### 1. project.json (프로젝트 루트)

**위치**: `projects/[project]/project.json`

```json
{
  "$schema": "./schemas/project.schema.json",
  "id": "jjiban",
  "name": "JJIBAN Project Manager",
  "description": "AI 기반 프로젝트 관리 도구",
  "version": "0.1.0",
  "status": "active",
  "createdAt": "2026-01-15T00:00:00Z",
  "updatedAt": "2026-12-10T10:00:00Z",
  "schedule": {
    "startDate": "2026-01-15",
    "endDate": "2026-06-30",
    "estimatedDays": 120,
    "actualDays": null,
    "buffer": 15,
    "criticalPath": ["WP-01", "WP-02", "WP-03"]
  },
  "settings": {
    "defaultCategory": "development",
    "statusFlow": {
      "development": ["todo", "bd", "dd", "dr", "im", "cr", "ts", "xx"],
      "defect": ["todo", "an", "fx", "cr", "ts", "xx"],
      "infrastructure": ["todo", "ds", "im", "cr", "xx"]
    },
    "priorities": ["critical", "high", "medium", "low"],
    "scheduling": {
      "defaultEstimates": {
        "development": 5,
        "defect": 2,
        "infrastructure": 3
      },
      "bufferPercent": {
        "wp": 15,
        "activity": 10,
        "task": 0
      }
    }
  },
  "stats": {
    "totalWP": 3,
    "totalActivities": 15,
    "totalTasks": 45,
    "completedTasks": 0
  }
}
```

### 2. team.json (팀원 목록)

**위치**: `projects/[project]/team.json`

```json
{
  "$schema": "./schemas/team.schema.json",
  "members": [
    {
      "id": "admin",
      "name": "관리자",
      "email": "admin@project.com",
      "role": "admin",
      "avatar": null,
      "active": true
    }
  ],
  "roles": [
    { "id": "admin", "name": "관리자", "permissions": ["all"] },
    { "id": "member", "name": "멤버", "permissions": ["read", "write"] },
    { "id": "viewer", "name": "뷰어", "permissions": ["read"] }
  ]
}
```

### 3. WP meta.json (Work Package 메타데이터)

**위치**: `projects/[project]/WP-XX_[name]/meta.json`

```json
{
  "$schema": "../../schemas/wp.schema.json",
  "id": "WP-01",
  "name": "Platform Foundation",
  "folderName": "WP-01_platform-foundation",
  "purpose": "프로젝트의 기반이 되는 핵심 플랫폼 구축. 인증, 데이터베이스, 공통 컴포넌트 등 전체 시스템의 근간 마련",
  "scope": {
    "includes": ["인증/권한", "DB 스키마", "공통 UI", "로깅"],
    "excludes": ["비즈니스 도메인 기능"]
  },
  "order": 1,
  "status": "in_progress",
  "priority": "high",
  "dependencies": {
    "predecessors": [],
    "successors": ["WP-02", "WP-03"]
  },
  "deliverables": ["인증 시스템", "DB 스키마", "공통 컴포넌트 라이브러리"],
  "createdAt": "2026-01-15T00:00:00Z",
  "updatedAt": "2026-12-10T10:00:00Z",
  "schedule": {
    "estimatedDays": 30,
    "scheduledStart": "2026-01-15",
    "scheduledEnd": "2026-02-14",
    "actualStart": null,
    "actualEnd": null,
    "buffer": 15
  },
  "activities": ["ACT-01-01", "ACT-01-02", "ACT-01-03"],
  "stats": {
    "totalActivities": 3,
    "totalTasks": 12,
    "completedTasks": 0
  }
}
```

**WBS → JSON 매핑 (WP)**:

| WBS 필드 | JSON 필드 | 설명 |
|----------|----------|------|
| ID | `id` | WP-01 |
| 명칭 | `name` | Work Package 이름 |
| 목적 | `purpose` | WP가 달성하고자 하는 비즈니스 목표 |
| 범위 | `scope.includes`, `scope.excludes` | 포함/제외 항목 |
| 구축일자 | `schedule.scheduledStart`, `schedule.scheduledEnd` | 시작/종료일 |
| 우선순위 | `priority` | high/medium/low |
| 선행 WP | `dependencies.predecessors` | 선행 WP ID 배열 |
| 후행 WP | `dependencies.successors` | 후행 WP ID 배열 |
| 주요 산출물 | `deliverables` | 산출물 목록 배열 |

---

### 4. ACT meta.json (Activity 메타데이터)

**위치**: `projects/[project]/WP-XX_[name]/ACT-XX-XX_[name]/meta.json`

```json
{
  "$schema": "../../../schemas/activity.schema.json",
  "id": "ACT-01-01",
  "wpId": "WP-01",
  "name": "프로젝트 관리",
  "folderName": "ACT-01-01_project-management",
  "purpose": "이 Activity가 달성하고자 하는 구체적인 목표 및 가치",
  "scope": {
    "includes": ["프로젝트 CRUD", "설정 관리"],
    "excludes": ["권한 관리"]
  },
  "order": 1,
  "status": "in_progress",
  "dependencies": {
    "predecessors": [],
    "successors": ["ACT-01-02"]
  },
  "deliverables": ["Activity 완료 시 생성되는 결과물"],
  "createdAt": "2026-01-15T00:00:00Z",
  "updatedAt": "2026-12-10T10:00:00Z",
  "schedule": {
    "estimatedDays": 7,
    "scheduledStart": "2026-01-15",
    "scheduledEnd": "2026-01-22",
    "actualStart": null,
    "actualEnd": null,
    "buffer": 10
  },
  "tasks": ["TSK-01-01-01", "TSK-01-01-02", "TSK-01-01-03"],
  "stats": {
    "totalTasks": 3,
    "completedTasks": 0
  }
}
```

**WBS → JSON 매핑 (ACT)**:

| WBS 필드 | JSON 필드 | 설명 |
|----------|----------|------|
| ID | `id` | ACT-01-01 |
| 명칭 | `name` | Activity 이름 |
| 목적 | `purpose` | Activity 목표 |
| 범위 | `scope.includes`, `scope.excludes` | 포함/제외 항목 |
| 구축일자 | `schedule.scheduledStart`, `schedule.scheduledEnd` | 시작/종료일 |
| 선행 ACT | `dependencies.predecessors` | 선행 ACT ID 배열 |
| 후행 ACT | `dependencies.successors` | 후행 ACT ID 배열 |
| 주요 산출물 | `deliverables` | 산출물 목록 배열 |

---

### 5. TSK task.json (Task 상세 데이터)

**위치**: `projects/[project]/WP-XX_[name]/ACT-XX-XX_[name]/TSK-XX-XX-XX/task.json`

```json
{
  "$schema": "../../../../schemas/task.schema.json",
  "id": "TSK-01-01-01",
  "activityId": "ACT-01-01",
  "wpId": "WP-01",
  "title": "프로젝트 CRUD API 구현",
  "folderName": "TSK-01-01-01",
  "purpose": "이 Task가 해결하는 문제 또는 제공하는 가치",
  "category": "development",
  "status": "todo",
  "priority": "high",
  "assignee": null,
  "tags": ["api", "backend", "crud"],
  "createdAt": "2026-01-15T00:00:00Z",
  "updatedAt": "2026-12-10T10:00:00Z",
  "createdBy": "system",

  "dependencies": {
    "predecessors": [],
    "successors": ["TSK-01-01-02"],
    "type": "FS"
  },

  "schedule": {
    "estimatedDays": 5,
    "scheduledStart": "2026-01-15",
    "scheduledEnd": "2026-01-21",
    "actualStart": null,
    "actualEnd": null,
    "estimatedHours": null,
    "actualHours": null
  },

  "work": {
    "description": "프로젝트 생성/조회/수정/삭제 API 구현",
    "tasks": [
      "Backend 작업: API 엔드포인트 설계 및 구현",
      "Backend 작업: 비즈니스 로직 구현",
      "Frontend 작업: UI 컴포넌트 구현",
      "Frontend 작업: 상태 관리 및 API 연동",
      "테스트: 단위 테스트 작성"
    ],
    "backend": {
      "endpoints": ["POST /api/projects", "GET /api/projects", "PUT /api/projects/:id", "DELETE /api/projects/:id"],
      "services": ["ProjectService"]
    },
    "frontend": {
      "components": ["ProjectForm", "ProjectList", "ProjectCard"],
      "pages": ["ProjectsPage"]
    }
  },

  "deliverables": [
    {
      "path": "src/api/projects.ts",
      "description": "API 엔드포인트"
    },
    {
      "path": "src/services/project.service.ts",
      "description": "비즈니스 로직"
    },
    {
      "path": "src/components/ProjectForm.tsx",
      "description": "UI 컴포넌트"
    },
    {
      "path": "tests/projects.spec.ts",
      "description": "테스트 코드"
    }
  ],

  "acceptanceCriteria": [
    {
      "id": "AC-01",
      "description": "프로젝트 생성 시 필수 필드 검증",
      "completed": false
    },
    {
      "id": "AC-02",
      "description": "프로젝트 목록 조회 시 페이지네이션 지원",
      "completed": false
    },
    {
      "id": "AC-03",
      "description": "응답시간 < 200ms",
      "completed": false
    },
    {
      "id": "AC-04",
      "description": "테스트 커버리지 >= 80%",
      "completed": false
    }
  ],

  "requirements": ["REQ-001", "REQ-002"],

  "defect": null,

  "history": [
    { "status": "todo", "at": "2026-01-15T00:00:00Z", "by": "system" }
  ],

  "documents": {
    "basicDesign": "010-basic-design.md",
    "detailDesign": "020-detail-design.md",
    "designReview": [
      "021-design-review-claude-1(적용완료).md",
      "021-design-review-gemini-1(적용완료).md"
    ],
    "implementation": "030-implementation.md",
    "codeReview": [
      "031-code-review-claude-1(적용완료).md",
      "031-code-review-gemini-1(적용완료).md"
    ],
    "testResults": "test-results/"
  }
}
```

**WBS → JSON 매핑 (TSK)**:

| WBS 필드 | JSON 필드 | 설명 |
|----------|----------|------|
| TSK ID | `id` | TSK-01-01-01 |
| Task명 | `title` | Task 제목 |
| Category | `category` | development/defect/infrastructure |
| 목적 | `purpose` | Task가 해결하는 문제 |
| 선행 TSK | `dependencies.predecessors` | 선행 Task ID 배열 |
| 후행 TSK | `dependencies.successors` | 후행 Task ID 배열 |
| 의존 유형 | `dependencies.type` | FS/SS/FF/SF |
| 예상 기간 | `schedule.estimatedDays` | 일 단위 기간 |
| 주요 작업 | `work.tasks` | 작업 목록 배열 |
| Backend 작업 | `work.backend` | API, 서비스 정보 |
| Frontend 작업 | `work.frontend` | 컴포넌트, 페이지 정보 |
| 산출물 | `deliverables` | 파일 경로 및 설명 배열 |
| 인수 기준 | `acceptanceCriteria` | AC 목록 배열 |
| 요구사항 추적 | `requirements` | REQ ID 배열 |

---

### 5-1. TSK task.json (defect 카테고리 추가 필드)

```json
{
  "defect": {
    "severity": "major",
    "symptom": "버그 발생 시 관찰되는 현상",
    "rootCause": "분석된 근본 원인",
    "affectedScope": "결함이 미치는 기능/사용자 범위",
    "regressionTest": "tests/regression-test.spec.ts"
  }
}
```

---

### 6. index.json (자동 생성 - 칸반용 요약)

**위치**: `projects/[project]/index.json`

```json
{
  "generatedAt": "2026-12-10T10:00:00Z",
  "projectId": "jjiban",
  "tasks": [
    {
      "id": "TSK-01-01-01",
      "title": "프로젝트 CRUD API 구현",
      "status": "cr",
      "category": "development",
      "priority": "high",
      "assignee": null,
      "wpId": "WP-01",
      "activityId": "ACT-01-01",
      "scheduledStart": "2026-01-15",
      "scheduledEnd": "2026-01-21",
      "predecessors": [],
      "successors": ["TSK-01-01-02"],
      "acceptanceCriteriaCount": 4,
      "acceptanceCriteriaCompleted": 0
    }
  ],
  "summary": {
    "total": 45,
    "byStatus": {
      "todo": 30,
      "bd": 5,
      "dd": 3,
      "im": 4,
      "cr": 2,
      "xx": 1
    },
    "byCategory": {
      "development": 35,
      "defect": 5,
      "infrastructure": 5
    }
  },
  "dependencyGraph": {
    "nodes": ["TSK-01-01-01", "TSK-01-01-02", "TSK-01-02-01"],
    "edges": [
      { "from": "TSK-01-01-01", "to": "TSK-01-01-02", "type": "FS" },
      { "from": "TSK-01-01-02", "to": "TSK-01-02-01", "type": "FS" }
    ],
    "criticalPath": ["TSK-01-01-01", "TSK-01-01-02", "TSK-02-01-01"]
  }
}
```

---

## 실행 과정

### 1단계: 프로젝트 컨텍스트 확인

1. 프로젝트 이름 확인 (인자 또는 현재 디렉토리)
2. `projects/[project]/wbs.md` 파일 존재 확인
3. 기존 폴더/JSON 구조 확인

### 2단계: WBS 문서 파싱

**파싱 패턴 (확장)**:

| 패턴 | 정규식 | 예시 |
|------|--------|------|
| Work Package | `### WP-(\d+):\s*(.+?)(?:\s*\((.+?)\))?$` | `### WP-01: Platform Foundation (핵심 기능)` |
| WP 테이블 | `\|\s*\*\*(.+?)\*\*\s*\|\s*(.+?)\s*\|` | WP 메타데이터 테이블 |
| Activity | `#### ACT-(\d+-\d+):\s*(.+)$` | `#### ACT-01-01: Project 관리 기능` |
| ACT 테이블 | `\|\s*\*\*(.+?)\*\*\s*\|\s*(.+?)\s*\|` | ACT 메타데이터 테이블 |
| Task 헤더 | `##### TSK-(\d+-\d+-\d+):\s*(.+?)\s*\`\[(\w+)\]\`` | `##### TSK-01-01-01: 프로젝트 CRUD `[development]`` |
| Task 테이블 | `\|\s*\*\*(.+?)\*\*\s*\|\s*(.+?)\s*\|` | Task 메타데이터 테이블 |
| 주요 작업 | `^\d+\.\s*\{(.+?)\}` 또는 리스트 항목 | 작업 목록 |
| 산출물 | `^\-\s*\`(.+?)\`\s*-?\s*(.*)$` | 산출물 목록 |
| 인수 기준 | `^\-\s*\[\s*\]\s*\{(.+?)\}` | AC 목록 |
| 요구사항 | `REQ-\d+` | 요구사항 ID |
| 선행 TSK | `선행 TSK.*?:\s*(.+)` | 선행 Task |
| 후행 TSK | `후행 TSK.*?:\s*(.+)` | 후행 Task |

### 3단계: 폴더 구조 생성

**이름 변환 규칙 (kebab-case)**:
- 영문: 소문자로 변환, 공백을 `-`로
- 한글: 제거 또는 영문 대체
- 특수문자 (`&`, `/`, `(`, `)` 등): 제거
- 연속 `-` 제거

**예시**:
- `Core - Issue Management` → `core-issue-management`
- `Portal & Layout` → `portal-layout`
- `프로젝트 관리` → `project-management`

### 4단계: JSON 파일 생성

1. **project.json** 생성 (프로젝트 루트)
2. **team.json** 생성 (기본 템플릿)
3. **WP별 meta.json** 생성 (목적, 범위, 의존성, 산출물 포함)
4. **ACT별 meta.json** 생성 (목적, 범위, 의존성, 산출물 포함)
5. **TSK별 task.json** 생성 (상세 필드 포함)

### 5단계: 기존 문서 연결

Task 폴더 내 기존 문서를 task.json의 documents 필드에 연결:

| 파일 패턴 | documents 필드 |
|-----------|----------------|
| `010-basic-design.md` | `basicDesign` |
| `020-detail-design.md` | `detailDesign` |
| `021-design-review-*.md` | `designReview[]` |
| `030-implementation.md` | `implementation` |
| `031-code-review-*.md` | `codeReview[]` |
| `test-results/` | `testResults` |

### 6단계: 상태 자동 추론

기존 문서를 기반으로 Task 상태 자동 추론:

| 존재하는 문서 | 추론 상태 | 설명 |
|--------------|----------|------|
| 없음 | `todo` | 대기 |
| `010-basic-design.md` | `bd` | 기본설계 |
| `020-detail-design.md` | `dd` | 상세설계 |
| `021-design-review-*.md` | `dr` | 설계리뷰 |
| `030-implementation.md` | `im` | 구현 |
| `031-code-review-*.md` | `cr` | 코드리뷰 |
| `test-results/` 존재 | `ts` | 테스트 |
| 코드리뷰 + 테스트 + "적용완료" | `xx` | 완료 |

**완료 상태 판별 로직**:
```
IF (031-code-review 파일에 "적용완료" 포함)
   AND (test-results/ 폴더 존재)
THEN status = "xx"
```

### 7단계: 의존성 그래프 생성

- WP/ACT/TSK 레벨의 선행/후행 관계 추출
- index.json에 `dependencyGraph` 필드 생성
- Critical Path 자동 계산

### 8단계: 통계 계산 및 index.json 생성

- 각 레벨의 stats 필드 자동 계산
- index.json에 전체 Task 요약 생성
- 인수 기준 완료율 계산

---

## 출력 형식

### 성공 시 출력
```
[init-json] WBS 폴더 구조 및 JSON 파일 생성 완료

프로젝트: jjiban
WBS 파일: projects/jjiban/wbs.md

생성된 구조:
├── project.json
├── team.json
├── index.json
├── WP-01_platform-foundation/
│   ├── meta.json (predecessors: [], successors: [WP-02, WP-03])
│   ├── ACT-01-01_project-management/
│   │   ├── meta.json (predecessors: [], successors: [ACT-01-02])
│   │   ├── TSK-01-01-01/task.json
│   │   │   ├── status: cr
│   │   │   ├── predecessors: []
│   │   │   ├── successors: [TSK-01-01-02]
│   │   │   ├── work.tasks: 5개
│   │   │   ├── deliverables: 4개
│   │   │   └── acceptanceCriteria: 4개
│   │   ├── TSK-01-01-02/task.json (status: im)
│   │   └── TSK-01-01-03/task.json (status: dd)
│   └── ACT-01-02_work-package-management/
│       ├── meta.json
│       └── ...
├── WP-02_core-workflow-engine/
│   └── ...
└── WP-03_core-document-management/
    └── ...

통계:
- Work Package: 3개
- Activity: 15개
- Task: 45개
- 연결된 문서: 120개
- 자동 추론된 상태: 45개
- 의존성 관계: 62개
- 인수 기준: 180개

의존성 그래프:
- Critical Path: WP-01 → ACT-01-01 → TSK-01-01-01 → ... → WP-03
```

### 에러 케이스
- WBS 파일 없음: `[ERROR] projects/[project]/wbs.md 파일을 찾을 수 없습니다.`
- 파싱 실패: `[ERROR] WBS 문서 형식이 올바르지 않습니다.`
- JSON 이미 존재: `[SKIP] project.json이 이미 존재합니다. --force 옵션으로 덮어쓰기`
- 순환 의존성: `[ERROR] 순환 의존성 감지: TSK-01-01-01 ↔ TSK-01-01-02`

---

## 옵션

| 옵션 | 설명 |
|------|------|
| `--force` | 기존 폴더/JSON 파일 덮어쓰기 |
| `--dry-run` | 실제 생성 없이 미리보기만 |
| `--json-only` | 기존 폴더 유지, JSON 파일만 생성 |
| `--folders-only` | 폴더만 생성, JSON 생략 |
| `--skip-team` | team.json 생성 생략 |
| `--skip-index` | index.json 생성 생략 |
| `--start-date [YYYY-MM-DD]` | 프로젝트 시작일 지정 (기본: 오늘) |
| `--validate` | 의존성 무결성 검증만 수행 |

---

## 성공 기준

- WBS 문서의 모든 WP/ACT/TSK 폴더 생성
- 모든 레벨에 meta.json/task.json 생성
- 폴더명 kebab-case 일관성
- 기존 문서가 task.json의 documents에 연결됨
- Task 상태가 기존 문서 기반으로 자동 추론됨
- project.json에 정확한 통계 및 일정 반영
- **목적(purpose) 필드 모든 레벨에 포함**
- **선행/후행 의존성(dependencies) 모든 레벨에 포함**
- **주요 작업(work.tasks) Task에 포함**
- **산출물(deliverables) 상세 경로 포함**
- **인수 기준(acceptanceCriteria) 체크리스트 포함**
- **의존성 그래프(dependencyGraph) index.json에 포함**
- **순환 의존성 검증 통과**

---

## 다음 단계

```
/wf:init-json jjiban 완료 후:

1. project.json 검토 및 일정 조정
2. 의존성 그래프 검토 (index.json)
3. /wf:start [Task-ID] - Task 워크플로우 시작
4. Task 진행에 따라 JSON 자동 업데이트
```

---

## 참조 문서

- `file-based-architecture-analysis.md`: 파일 기반 아키텍처 및 JSON 스키마 정의
- `issue-structure-waterfall.md`: 이슈 계층 구조 정의
- `/wf:wbs`: WBS 문서 생성 명령어
- `/wf:start`: Task 워크플로우 시작

<!--
jjiban 프로젝트 - Command Documentation
author: 장종익 
Command: init-json
Category: planning
Version: 3.0
-->
