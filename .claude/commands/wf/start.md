# /wf:start - 워크플로우 시작 (Lite)

> **상태 전환**: `[ ] Todo` → `[bd]` | `[an]` | `[dd]`

## 사용법

```bash
/wf:start [WP-ID | ACT-ID | Task-ID]
```

---

## 상태 전환 규칙

| category | 현재 | 다음 | 생성 문서 |
|----------|------|------|----------|
| development | `[ ]` | `[bd]` | `010-basic-design.md` |
| defect | `[ ]` | `[an]` | `010-defect-analysis.md` |
| infrastructure | `[ ]` | `[dd]` | `010-tech-design.md` (선택) |

---

## 실행 과정

1. **Task 정보 수집**
   - Task JSON에서 Task 찾기
   - category, 상태, PRD 참조 확인

2. **PRD/TRD 내용 추출**
   - 기본설계 PRD 참조 섹션 읽기
   - TRD 기술 요구사항 참고

3. **범위 검증**
   - WBS Task 설명 범위 내 항목만 포함
   - 누락/초과 항목 확인

4. **문서 생성**
   - Task 폴더 생성: `.jjiban/projects/{project}/tasks/{TSK-ID}/`
   - 템플릿 참조: `.jjiban/templates/010-*.md`

5. **Task JSON 상태 업데이트**
   - status 필드 변경
   - updated_at 업데이트

---

## 에러 케이스

| 에러 | 메시지 |
|------|--------|
| Task 없음 | `[ERROR] Task를 찾을 수 없습니다` |
| 잘못된 상태 | `[ERROR] Todo 상태가 아닙니다` |
| category 없음 | `[ERROR] Task category가 지정되지 않았습니다` |
| PRD 참조 없음 | `[WARN] PRD 참조를 찾을 수 없습니다` |

---

## 다음 명령어

| category | 다음 | 설명 |
|----------|------|------|
| development | `/wf:ui` 또는 `/wf:draft` | UI 설계 또는 상세설계 |
| defect | `/wf:fix` | 수정 단계 |
| infrastructure | `/wf:skip` 또는 `/wf:build` | 설계 생략 또는 구현 |

---

## 공통 모듈 참조

@.claude/includes/wf-common-lite.md
@.claude/includes/wf-conflict-resolution-lite.md
@.claude/includes/wf-auto-commit-lite.md

---

<!--
wf:start lite
Version: 1.0
-->
