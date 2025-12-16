# 공통 모듈 (Lite)

> 워크플로우 실행에 필요한 핵심 정보만 포함

---

## 경로 규칙

| 용도 | 경로 |
|------|------|
| WBS 파일 | `.jjiban/projects/{project}/wbs.md` |
| Task 문서 | `.jjiban/projects/{project}/tasks/{TSK-ID}/` |
| 템플릿 | `.jjiban/templates/` |
| 프로젝트 설정 | `.jjiban/projects/{project}/project.json` |

---

## ID 패턴

| 패턴 | 타입 | 예시 |
|------|------|------|
| `WP-XX` | Work Package | WP-01, WP-08 |
| `ACT-XX-XX` | Activity | ACT-01-01 |
| `TSK-XX-XX-XX` | Task (4단계) | TSK-01-01-01 |
| `TSK-XX-XX` | Task (3단계) | TSK-01-01 |

---

## 상태 코드

| 코드 | 의미 | Category | 칸반 |
|------|------|----------|------|
| `[ ]` | Todo | 공통 | Todo |
| `[bd]` | 기본설계 | development | Design |
| `[dd]` | 상세설계 | development | Detail |
| `[an]` | 분석 | defect | Detail |
| `[ds]` | 설계 | infrastructure | Detail |
| `[im]` | 구현 | dev/infra | Implement |
| `[fx]` | 수정 | defect | Implement |
| `[ts]` | 테스트 | dev/defect | Verify |
| `[xx]` | 완료 | 공통 | Done |

---

## 문서 번호 체계

| 번호 | 파일명 | 단계 |
|------|--------|------|
| 010 | `010-basic-design.md` | 기본설계 |
| 011 | `011-ui-design.md` | 화면설계 |
| 020 | `020-detail-design.md` | 상세설계 |
| 021 | `021-design-review-{llm}-{n}.md` | 설계리뷰 |
| 025 | `025-traceability-matrix.md` | 추적성 매트릭스 |
| 026 | `026-test-specification.md` | 테스트 명세 |
| 030 | `030-implementation.md` | 구현 |
| 031 | `031-code-review-{llm}-{n}.md` | 코드리뷰 |
| 070 | `070-integration-test.md` | 통합테스트 |
| 080 | `080-manual.md` | 매뉴얼 |

---

## wbs.md 구조

```markdown
## WP-01: {제목}
- status: in_progress
- priority: high

### ACT-01-01: {제목}
- status: in_progress

#### TSK-01-01-01: {제목}
- category: development
- status: implement [im]
- priority: high
- assignee: {담당자}
- depends: TSK-XX-XX-XX
```

---

## 상태 업데이트 형식

wbs.md에서 Task 상태 변경:
```
- status: {상태명} [{코드}]
예: - status: implement [im]
```

---

## Git 커밋 형식

```
[{command}] {Task-ID}: {summary}

- {변경 내용}

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**명령어별 예시:**
| 명령어 | 메시지 |
|--------|--------|
| `/wf:start` | `[wf:start] TSK-01-01-01: 기본설계 완료` |
| `/wf:draft` | `[wf:draft] TSK-01-01-01: 상세설계 완료` |
| `/wf:build` | `[wf:build] TSK-01-01-01: 구현 완료` |
| `/wf:verify` | `[wf:verify] TSK-01-01-01: 통합테스트 완료` |
| `/wf:done` | `[wf:done] TSK-01-01-01: 작업 완료` |

---

## 리뷰 적용 완료 표시

적용 후 파일명 변경:
- `021-design-review-{llm}-{n}.md` → `021-design-review-{llm}-{n}(적용완료).md`
- `031-code-review-{llm}-{n}.md` → `031-code-review-{llm}-{n}(적용완료).md`

---

<!--
jjiban - Workflow Common Module (Lite)
Version: 1.0
-->
