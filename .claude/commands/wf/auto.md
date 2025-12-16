# /wf:auto - 자동 워크플로우 실행

> **Task 자동 선택**: `npx jjiban next-task`로 실행 가능한 Task를 조회하여 워크플로우를 자동 실행합니다.

## 실행 절차

### 1단계: 실행 가능한 Task 조회

```bash
npx jjiban next-task
```

**결과 JSON 파싱:**
```json
{
  "executable": [
    { "id": "TSK-XX-XX", "category": "development", "status": "[dd]", "nextAction": "build" }
  ],
  "waiting": [
    { "id": "TSK-YY-YY", "blockedBy": ["TSK-XX-XX"] }
  ]
}
```

### 2단계: Task 선택

- `executable` 배열이 비어 있으면 → `[ERROR] 실행 가능한 Task가 없습니다` 출력 후 종료
- `executable[0]` 선택 (우선순위+WBS ID 순으로 이미 정렬됨)

### 3단계: 워크플로우 실행

선택된 Task의 `nextAction`에 따라 해당 `/wf:*` 명령어 실행

---

## 사용법

```bash
/wf:auto [옵션]

# 기본 실행 (첫 번째 실행 가능 Task)
/wf:auto

# 부분 실행
/wf:auto --until detail-design   # 상세설계까지
/wf:auto 상세설계까지             # 한글 자연어

# 옵션
/wf:auto --dry-run      # 실행 계획만 출력
/wf:auto --skip-review  # review/apply 건너뛰기
/wf:auto --skip-audit   # audit/patch 건너뛰기
```

---

## 카테고리별 워크플로우

### development
```
[ ] → start → [bd] → ui → draft → [dd]
    → review → apply → build → test → [im]
    → audit → patch → verify → [ts] → done → [xx]
```

### defect
```
[ ] → start → [an] → fix → test → [fx]
    → audit → patch → verify → [ts] → done → [xx]
```

### infrastructure
```
[ ] → start/skip → [ds] → build → [im]
    → audit → patch → done → [xx]
```

---

## 부분 실행 옵션

| --until | 한글 자연어 | 상태 | 실행 단계 |
|---------|------------|------|----------|
| `basic-design` | `기본설계까지` | `[bd]` | start |
| `ui-design` | `UI설계까지` | `[bd]` | start + ui |
| `detail-design` | `상세설계까지` | `[dd]` | draft |
| `review` | `리뷰까지` | `[dd]` | review |
| `apply` | `리뷰반영까지` | `[dd]` | review + apply |
| `build` | `구현까지` | `[im]` | build + test |
| `audit` | `코드리뷰까지` | `[im]` | audit |
| `patch` | `패치까지` | `[im]` | audit + patch |
| `verify` | `테스트까지` | `[ts]` | verify |
| `done` | `완료까지` | `[xx]` | done (기본값) |

---

## 핵심 실행 로직

```
1. npx jjiban next-task 실행 → JSON 결과 획득
2. executable[0] 선택 (없으면 에러)
3. task.nextAction 확인
4. 해당 /wf:{action} 명령어 실행
5. target 도달까지 반복 (기본: done)
```

### 상태별 명령어 매핑

| 상태 | nextAction | 실행 명령어 |
|------|-----------|------------|
| `[ ]` | start | `/wf:start {taskId}` |
| `[bd]` | draft | `/wf:ui` → `/wf:draft {taskId}` |
| `[dd]` | build | `/wf:review` → `/wf:apply` → `/wf:build {taskId}` |
| `[im]` | verify | `/wf:audit` → `/wf:patch` → `/wf:verify {taskId}` |
| `[ts]` | done | `/wf:done {taskId}` |
| `[an]` | fix | `/wf:fix {taskId}` |
| `[fx]` | verify | `/wf:audit` → `/wf:patch` → `/wf:verify {taskId}` |
| `[ds]` | build | `/wf:build {taskId}` |

---

## 출력 형식

### 시작
```
[wf:auto] Task 자동 선택

실행: npx jjiban next-task
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 실행 가능한 Task (3개)
  1. TSK-09-01 [development] [ ] → start
  2. TSK-08-07 [development] [dd] → build
  3. TSK-03-01 [infrastructure] [im] → done

⏳ 대기 중 (1개)
  - TSK-10-01: TSK-09-01 완료 대기

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

▶️ 선택: TSK-09-01 (development, start)
```

### 완료
```
[wf:auto] 자동 워크플로우 완료

대상: TSK-09-01
실행 시간: 25분 18초

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[OK] [ ] → [bd] 기본설계
   └── start: 010-basic-design.md

[OK] [bd] → [dd] 상세설계
   ├── ui: 011-ui-design.md
   └── draft: 020, 025, 026

[OK] [dd] → [im] 구현
   ├── review: 021-design-review-claude-1.md
   ├── apply: 반영 완료
   └── build: 030-implementation.md

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ 완료: TSK-09-01 [xx]
```

---

## 옵션 정리

| 옵션 | 설명 | 기본값 |
|------|------|--------|
| `--until <target>` | 특정 단계까지만 실행 | done |
| `<한글>까지` | 한글 자연어 지원 | done |
| `--dry-run` | 실행 계획만 출력 | false |
| `--skip-review` | review/apply 건너뛰기 | false |
| `--skip-audit` | audit/patch 건너뛰기 | false |

---

## 에러 케이스

| 에러 | 메시지 | 처리 |
|------|--------|------|
| Task 없음 | `[ERROR] 실행 가능한 Task가 없습니다` | 종료 |
| CLI 실패 | `[ERROR] next-task 실행 실패` | 종료 |
| JSON 파싱 실패 | `[ERROR] 결과 파싱 실패` | 종료 |

---

## 공통 모듈 참조

@.claude/includes/wf-common-lite.md

---

<!--
jjiban 프로젝트 - Workflow Command
author: 장종익
Command: wf:auto
Version: 1.0
-->
