# 공통 모듈: Task 데이터 및 문서 경로

> 이 파일은 모든 `/wf:*` 명령어에서 참조하는 공통 모듈입니다.

---

## 파일 기반 아키텍처 경로 규칙

### 1. 통합 폴더 구조

JJIBAN은 단일 `.jjiban/{project}/` 폴더에 모든 데이터와 문서를 통합 관리합니다.

> **중요**: 폴더명에 설명이 포함됨 (`WP-XX_description`, `ACT-XX-XX_description`)
> glob 검색 시 `WP-XX*`, `ACT-XX-XX*` 와일드카드 패턴 사용 필수

```
.jjiban/                                  # JJIBAN 데이터 루트
└── {project}/                            # 프로젝트 폴더
    ├── project.json                      # 프로젝트 메타데이터
    ├── team.json                         # 팀 멤버 목록
    ├── index.json                        # 칸반 인덱스 (자동 생성)
    ├── jjiban-prd.md                     # PRD 문서
    ├── jjiban-trd.md                     # TRD 문서
    ├── wbs.md                            # WBS 문서
    ├── {WP-ID}_description/              # Work Package (3단계: WP/ACT/TSK)
    │   ├── meta.json                     # WP 메타데이터
    │   └── {ACT-ID}_description/         # Activity
    │       ├── meta.json                 # ACT 메타데이터
    │       └── {TSK-ID}/                 # Task 폴더 (TSK-XX-XX-XX)
    │           ├── task.json             # Task 상세 데이터
    │           ├── 010-basic-design.md
    │           ├── 020-detail-design.md
    │           └── ...
    └── {WP-ID}_description/              # Work Package (2단계: WP/TSK, ACT 없음)
        ├── meta.json
        └── {TSK-ID}/                     # Task 폴더 직접 (TSK-XX-XX)
            ├── task.json
            └── ...
```

### 2. 주요 파일 경로

> glob 검색 시 `WP-XX*`, `ACT-XX-XX*` 와일드카드 패턴 사용 필수

| 용도 | 경로 (glob 패턴) | 설명 |
|------|-----------------|------|
| 프로젝트 정보 | `.jjiban/{project}/project.json` | 프로젝트 메타데이터 |
| PRD | `.jjiban/{project}/jjiban-prd.md` | PRD 문서 |
| TRD | `.jjiban/{project}/jjiban-trd.md` | TRD 문서 |
| UI Theme | `.jjiban/{project}/ui-theme-*.md` | UI 테마 가이드 (다크/라이트) |
| WBS | `.jjiban/{project}/wbs.md` | WBS 문서 |
| 팀 정보 | `.jjiban/{project}/team.json` | 팀 멤버 목록 |
| 칸반 인덱스 | `.jjiban/{project}/index.json` | 전체 Task 요약 |
| WP 메타데이터 | `.jjiban/{project}/{WP-ID}*/meta.json` | Work Package 정보 |
| ACT 메타데이터 | `.jjiban/{project}/{WP-ID}*/{ACT-ID}*/meta.json` | Activity 정보 |
| Task 데이터 (3단계) | `.jjiban/{project}/{WP-ID}*/{ACT-ID}*/{TSK-ID}/task.json` | Task 상세 정보 |
| Task 데이터 (2단계) | `.jjiban/{project}/{WP-ID}*/{TSK-ID}/task.json` | Task 상세 정보 (ACT 없음) |
| Task 문서 | `.jjiban/{project}/{WP-ID}*/**/{TSK-ID}/*.md` | Task 관련 문서 |

### 3. Task JSON 스키마

**파일 경로 (3단계)**: `.jjiban/{project}/{WP-ID}*/{ACT-ID}*/{TSK-ID}/task.json`
**파일 경로 (2단계)**: `.jjiban/{project}/{WP-ID}*/{TSK-ID}/task.json`

```json
{
  "id": "TSK-01-01-01",
  "title": "Project CRUD 구현",
  "category": "development",
  "status": "[ ]",
  "assignee": null,
  "priority": "medium",
  "estimate": null,
  "description": "프로젝트 생성, 조회, 수정, 삭제 기능 구현",
  "acceptance_criteria": [],
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-01-01T00:00:00Z"
}
```

### 4. Task 상태 코드

| 상태 코드 | 의미 | Category |
|----------|------|----------|
| `[ ]` | Todo (미시작) | 공통 |
| `[bd]` | 기본설계 | development |
| `[dd]` | 상세설계 | development |
| `[dr]` | 설계리뷰 | development |
| `[ds]` | 설계 | infrastructure |
| `[an]` | 분석 | defect |
| `[im]` | 구현 | 공통 |
| `[fx]` | 수정 | defect |
| `[cr]` | 코드리뷰 | 공통 |
| `[ts]` | 통합테스트 | development |
| `[xx]` | 완료 | 공통 |

---

## Task 문서 폴더 경로 규칙

### 1. Task 폴더 구조

모든 Task 관련 데이터와 문서는 Task 폴더 내에 통합 저장됩니다.

> **3단계 구조**: `.jjiban/{project}/{WP-ID}*/{ACT-ID}*/{TSK-ID}/`
> **2단계 구조**: `.jjiban/{project}/{WP-ID}*/{TSK-ID}/`

```
{TSK-ID}/                              # Task 폴더
├── task.json                          # Task 메타데이터
├── 010-basic-design.md                # 기본설계 (development)
├── 010-tech-design.md                 # 기술설계 (infrastructure)
├── 010-analysis.md                    # 결함분석 (defect)
├── 020-detail-design.md               # 상세설계 (development)
├── 021-design-review-{llm}-{n}.md     # 설계리뷰
├── 030-implementation.md              # 구현 문서
├── 031-code-review-{llm}-{n}.md       # 코드리뷰
├── 070-integration-test.md            # 통합테스트 (development)
├── 070-test-results.md                # 테스트 결과 (defect)
├── 080-manual.md                      # 사용자 매뉴얼 (development)
└── test-results/                      # 테스트 결과 아티팩트
    └── {timestamp}/
        ├── tdd/
        └── e2e/
```

### 2. 문서 파일 명명 규칙

| 번호 | 파일명 | 용도 | Category |
|------|--------|------|----------|
| 010 | `010-basic-design.md` | 기본설계 | development |
| 020 | `020-detail-design.md` | 상세설계 | development |
| 021 | `021-design-review-{llm}-{n}.md` | 설계리뷰 (N차) | development |
| 010 | `010-tech-design.md` | 기술설계 | infrastructure |
| 010 | `010-analysis.md` | 결함분석 | defect |
| 030 | `030-implementation.md` | 구현 문서 | 공통 |
| 031 | `031-code-review-{llm}-{n}.md` | 코드리뷰 (N차) | 공통 |
| 070 | `070-integration-test.md` | 통합테스트 | development |
| 070 | `070-test-results.md` | 테스트 결과 | defect |
| 080 | `080-manual.md` | 사용자 매뉴얼 | development |

### 3. 전체 경로 예시

| Task ID | Task 폴더 경로 (glob 패턴) | 구조 |
|---------|---------------------------|------|
| TSK-01-01-01 | `.jjiban/jjiban/WP-01*/ACT-01-01*/TSK-01-01-01/` | 3단계 |
| TSK-01-02-01 | `.jjiban/jjiban/WP-01*/ACT-01-02*/TSK-01-02-01/` | 3단계 |
| TSK-08-01 | `.jjiban/jjiban/WP-08*/TSK-08-01/` | 2단계 |
| TSK-09-02 | `.jjiban/jjiban/WP-09*/TSK-09-02/` | 2단계 |

---

## Task 조회 절차

> **glob 패턴 주의**: 폴더명에 설명이 포함되므로 `WP-XX*`, `ACT-XX-XX*` 와일드카드 필수

### 1. Task ID로 폴더 경로 찾기

```javascript
function getTaskPath(project, taskId) {
    // 3단계: TSK-01-02-03 → WP-01*/ACT-01-02*/TSK-01-02-03/
    const match3 = taskId.match(/^TSK-(\d{2})-(\d{2})-(\d{2})$/i);
    if (match3) {
        const [_, wp, act, _tsk] = match3;
        return `.jjiban/${project}/WP-${wp}*/ACT-${wp}-${act}*/${taskId}/`;
    }

    // 2단계: TSK-08-01 → WP-08*/TSK-08-01/
    const match2 = taskId.match(/^TSK-(\d{2})-(\d{2})$/i);
    if (match2) {
        const [_, wp, _tsk] = match2;
        return `.jjiban/${project}/WP-${wp}*/${taskId}/`;
    }

    return null;
}

// Task JSON 파일 경로 (glob 패턴)
function getTaskJsonPath(project, taskId) {
    return `${getTaskPath(project, taskId)}task.json`;
}
```

### 2. WP/ACT 하위 Task 목록 조회

```javascript
// WP 하위 모든 Task 조회 (3단계/2단계 모두 지원)
function getTasksInWP(project, wpId) {
    // 와일드카드로 WP 폴더 찾기 (예: WP-01* → WP-01_core-issue-management)
    return glob(`.jjiban/${project}/${wpId}*/**/TSK-*/task.json`);
}

// ACT 하위 모든 Task 조회
function getTasksInACT(project, wpId, actId) {
    // 와일드카드로 ACT 폴더 찾기 (예: ACT-01-01* → ACT-01-01_entity-crud)
    return glob(`.jjiban/${project}/${wpId}*/${actId}*/TSK-*/task.json`);
}
```

### 3. Task 상태 확인

```javascript
function getTaskStatus(taskJsonPath) {
    const taskData = JSON.parse(readFile(taskJsonPath));
    return taskData.status;  // "[ ]", "[bd]", "[im]", etc.
}
```

---

## 프로젝트 설정 파일

### project.json 스키마

**경로**: `.jjiban/{project}/project.json`

```json
{
  "id": "jjiban",
  "name": "JJIBAN - AI 기반 프로젝트 관리 도구",
  "description": "LLM 기반 소프트웨어 개발 지원 도구",
  "tech_stack": {
    "frontend": "Nuxt 3",
    "backend": "Nuxt Server Routes",
    "database": "JSON Files",
    "runtime": "Node.js"
  },
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-01-01T00:00:00Z"
}
```

---

<!--
jjiban 프로젝트 - Workflow Common Module
Version: 3.0
author: 장종익 

Changes (v3.0):
- 데이터와 문서를 단일 폴더로 통합
- .jjiban/{project}/ 구조로 변경
- Task 폴더 내에 task.json + 문서 통합
- projects/ 폴더 제거, 모든 것을 .jjiban/ 하위로 이동
- PRD/TRD 경로: .jjiban/{project}/prd.md, trd.md

Changes (v2.0):
- 파일 기반 아키텍처로 전환 (분산 JSON 구조)
- .jjiban/ 데이터 경로 추가
- projects/docs/tasks/ 문서 경로 분리
- Task JSON 스키마 정의
- 기존 폴더 구조 규칙 대체

Changes (v1.0):
- 초기 버전
-->
