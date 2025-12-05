# Chain 기본설계: Workflow & Document Engine

## 문서 정보

| 항목 | 내용 |
|------|------|
| Chain ID | CHAIN-jjiban-03 |
| 관련 PRD | chain-prd.md |
| 문서 버전 | 1.0 |
| 작성일 | 2024-12-06 |
| 상태 | Draft |

---

## 1. 아키텍처 개요

### 1.1 워크플로우 상태 다이어그램

```
[Todo] --start--> [기본설계] --draft--> [상세설계] --plan--> [상세설계리뷰]
                                                                     │
                                    ┌────────────────────────────────┘
                                    │ review (변경요청)
                                    ▼
                         [상세설계개선] --revise--> [상세설계리뷰]
                                                         │ approved
                                                         ▼
                                                     [구현] --build--> [코드리뷰]
                                                                          │
                                    ┌─────────────────────────────────────┘
                                    │ audit (변경요청)
                                    ▼
                           [개선적용] --patch--> [코드리뷰]
                                                     │ approved
                                                     ▼
                                              [통합테스트] --verify--> [완료]
```

### 1.2 주요 컴포넌트
- **Workflow Engine**: FSM 기반 상태 전환
- **Template Generator**: Handlebars 템플릿 엔진
- **Document Manager**: 파일 I/O 및 버전 관리
- **WBS Parser**: Markdown → JSON 파싱
- **Document Viewer**: Markdown 렌더러

---

## 2. 데이터 모델

### 2.1 Workflow State Mapping

```javascript
const WORKFLOW_STATES = {
  todo: { symbol: "[ ]", next: ["bd"] },
  bd: { symbol: "[bd]", next: ["dd"] },         // 기본설계
  dd: { symbol: "[dd]", next: ["dr"] },         // 상세설계
  dr: { symbol: "[dr]", next: ["dr", "im"] },   // 설계리뷰 (루프 가능)
  im: { symbol: "[im]", next: ["cr"] },         // 구현
  cr: { symbol: "[cr]", next: ["cr", "ts"] },   // 코드리뷰 (루프 가능)
  ts: { symbol: "[ts]", next: ["xx"] },         // 통합테스트
  xx: { symbol: "[xx]", next: [] }              // 완료
};

const COMMANDS = {
  start: { from: "todo", to: "bd" },
  draft: { from: "bd", to: "dd" },
  plan: { from: "dd", to: "dr" },
  review: { from: "dr", to: "dr", action: "generate_review" },
  revise: { from: "dr", to: "dr", action: "update_design" },
  approved_design: { from: "dr", to: "im" },
  build: { from: "im", to: "cr" },
  audit: { from: "cr", to: "cr", action: "generate_review" },
  patch: { from: "cr", to: "cr", action: "update_code" },
  approved_code: { from: "cr", to: "ts" },
  verify: { from: "ts", to: "xx" },
  done: { from: "xx", to: "xx" }
};
```

---

## 3. 문서 템플릿 구조

### 3.1 템플릿 파일 목록

| 번호 | 파일명 | 생성 시점 | 버전 관리 |
|------|--------|-----------|-----------|
| 00 | `00-prd.md` | Task 생성 시 | 단일 버전 |
| 01 | `01-basic-design.md` | `start` 명령 시 | 단일 버전 |
| 02 | `02-detail-design.md` | `draft` 명령 시 | **Working Copy** (Git) |
| 03 | `03-detail-design-review-{llm}-{n}.md` | `plan` 명령 시 | 순차 누적 |
| 05 | `05-implementation.md` | `build` 명령 시 | **Working Copy** (Git) |
| 05 | `05-tdd-test-results.md` | `build` 명령 시 | 단일 버전 |
| 05 | `05-e2e-test-results.md` | `build` 명령 시 | 단일 버전 |
| 06 | `06-code-review-{llm}-{n}.md` | `build` 완료 시 | 순차 누적 |
| 08 | `08-integration-test.md` | `verify` 명령 시 | 단일 버전 |
| 09 | `09-manual.md` | `done` 명령 시 | 단일 버전 |

### 3.2 템플릿 변수

```handlebars
---
taskId: {{taskId}}
taskName: {{taskName}}
author: {{author}}
createdAt: {{createdAt}}
---

# {{documentTitle}}

## Task 정보
- **Task ID**: {{taskId}}
- **제목**: {{taskName}}
- **담당자**: {{assignee}}
- **브랜치**: {{branchName}}

## 내용
{{content}}
```

---

## 4. WBS 파싱 로직

### 4.1 파싱 패턴 (Markdown)

```markdown
## Chain 목록
- [ ] CHAIN-001: 부재료 관리 (PL: 홍길동, 2024-01-15 ~ 2024-03-31)
- [ ] CHAIN-002: 조업 관리 (PL: 김철수, 2024-02-01 ~ 2024-06-30)
```

### 4.2 파싱 결과 (JSON)

```json
[
  {
    "id": "CHAIN-001",
    "name": "부재료 관리",
    "pl": "홍길동",
    "startDate": "2024-01-15",
    "targetDate": "2024-03-31",
    "status": "pending"
  }
]
```

### 4.3 Merge 전략

| 상황 | 동작 | 우선순위 |
|------|------|----------|
| ID가 DB에 없음 | INSERT | 문서 |
| ID가 DB에 있음, 이름 다름 | UPDATE name | 문서 |
| ID가 DB에 있음, 상태 다름 | 유지 | DB (진행 상태) |
| 문서에 없는 ID | archived 처리 | DB |

---

## 5. 보안 및 성능

### 5.1 보안 고려사항
- **Path Traversal 방지**: documentPath 검증 (상위 디렉토리 접근 금지)
- **파일 쓰기 권한**: 프로젝트 루트 내부만 허용
- **XSS 방지**: Markdown 렌더링 시 Sanitization (DOMPurify)

### 5.2 성능 목표
- 문서 생성 시간: < 1s
- 문서 렌더링: < 500ms
- WBS 파싱: < 2s (100개 항목)
- 파일 읽기: < 100ms

---

## 6. 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2024-12-06 | 초안 작성 |
