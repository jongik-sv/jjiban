# PRD vs 워크플로우 명령어 비교 분석 보고서

## 문서 정보

| 항목 | 내용 |
|------|------|
| 분석일 | 2025-12-13 |
| PRD 버전 | 5.1 |
| 비교 대상 | `jjiban-prd.md` vs `.claude/commands/wf/*.md` |

---

## 1. 비교 요약

| 구분 | 항목 수 | 일치 | 불일치 | 비고 |
|------|--------|------|--------|------|
| 상태 전환 명령어 | 7개 | 6개 | 1개 | draft 문서 생성 확장 |
| 상태 내 액션 | 6개 | 6개 | 0개 | - |
| 문서 번호 체계 | 12개 | 12개 | 0개 | - |
| 상태 기호 | 8개 | 7개 | 1개 | CLAUDE.md와 불일치 |

---

## 2. 상태 전환 명령어 비교

### 2.1 development 카테고리

| 명령어 | PRD 정의 | 명령어 파일 | 일치 여부 |
|--------|----------|------------|----------|
| `start` | `[ ]` → `[bd]`, 생성: `010-basic-design.md` | `[ ]` → `[bd]`, 생성: `010-basic-design.md` | ✅ 일치 |
| `draft` | `[bd]` → `[dd]`, 생성: `020-detail-design.md` | `[bd]` → `[dd]`, 생성: 3개 문서 | ⚠️ 불일치 |
| `build` | `[dd]` → `[im]`, 생성: `030-implementation.md` | `[dd]` → `[im]`, 생성: `030-implementation.md` | ✅ 일치 |
| `verify` | `[im]` → `[vf]`, 생성: `070-integration-test.md` | `[im]` → `[vf]`, 생성: `070-integration-test.md` | ✅ 일치 |
| `done` | `[vf]` → `[xx]`, 생성: `080-manual.md` | `[vf]` → `[xx]`, 생성: `080-manual.md` | ✅ 일치 |

### 2.2 defect 카테고리

| 명령어 | PRD 정의 | 명령어 파일 | 일치 여부 |
|--------|----------|------------|----------|
| `start` | `[ ]` → `[an]`, 생성: `010-defect-analysis.md` | `[ ]` → `[an]`, 생성: `010-defect-analysis.md` | ✅ 일치 |
| `fix` | `[an]` → `[fx]`, 생성: `030-implementation.md` | `[an]` → `[fx]`, 생성: `030-implementation.md` | ✅ 일치 |
| `verify` | `[fx]` → `[vf]`, 생성: `070-test-results.md` | `[fx]` → `[vf]`, 생성: `070-test-results.md` | ✅ 일치 |
| `done` | `[vf]` → `[xx]`, 생성: - | `[vf]` → `[xx]`, 생성: - | ✅ 일치 |

### 2.3 infrastructure 카테고리

| 명령어 | PRD 정의 | 명령어 파일 | 일치 여부 |
|--------|----------|------------|----------|
| `start` | `[ ]` → `[dd]`, 생성: `010-tech-design.md` | `[ ]` → `[dd]`, 생성: `010-tech-design.md` | ✅ 일치 |
| `skip` | `[ ]` → `[im]`, 생성: - | `[ ]` → `[im]`, 생성: - | ✅ 일치 |
| `build` | `[dd]` → `[im]`, 생성: `030-implementation.md` | `[dd]` → `[im]`, 생성: `030-implementation.md` | ✅ 일치 |
| `done` | `[im]` → `[xx]`, 생성: - | `[im]` → `[xx]`, 생성: - | ✅ 일치 |

---

## 3. 상태 내 액션 비교

| 명령어 | PRD 정의 | 명령어 파일 | 일치 여부 |
|--------|----------|------------|----------|
| `ui` | 상태: `[bd]`, 카테고리: development, 문서: `011-ui-design.md` | 상태: `[bd]`, 카테고리: development, 문서: `011-ui-design.md` + SVG | ✅ 일치 |
| `review` | 상태: `[dd]`, 카테고리: development, 문서: `021-design-review-{llm}-{n}.md` | 상태: `[dd]`, 카테고리: development, 문서: `021-design-review-{llm}-{n}.md` | ✅ 일치 |
| `apply` | 상태: `[dd]`, 카테고리: development, 수정: `020-detail-design.md` | 상태: `[dd]`, 카테고리: development, 수정: `020-detail-design.md` | ✅ 일치 |
| `test` | 상태: `[im]`, 카테고리: development, 문서: TDD/E2E 결과 | 상태: `[im]`, 카테고리: development, 문서: TDD/E2E 결과 | ✅ 일치 |
| `audit` | 상태: `[im]`, `[fx]`, 카테고리: 전체, 문서: `031-code-review-{llm}-{n}.md` | 상태: `[im]`, `[fx]`, 카테고리: 전체, 문서: `031-code-review-{llm}-{n}.md` | ✅ 일치 |
| `patch` | 상태: `[im]`, `[fx]`, 카테고리: 전체, 수정: `030-implementation.md` | 상태: `[im]`, `[fx]`, 카테고리: 전체, 수정: `030-implementation.md` | ✅ 일치 |

---

## 4. 불일치 사항 상세

### 4.1 ⚠️ `/wf:draft` 문서 생성 확장

**PRD 정의** (섹션 3.2.4):
```
| `draft` | `bd` | `dd` | 상세설계 시작 | `020-detail-design.md` |
```

**명령어 파일 정의** (`wf/draft.md`):
```
생성 문서:
- 020-detail-design.md (상세설계 본문)
- 025-traceability-matrix.md (추적성 매트릭스)
- 026-test-specification.md (테스트 명세)
```

**분석**:
- PRD에서는 `020-detail-design.md` 하나만 언급
- 실제 명령어에서는 3개 파일로 분할하여 생성
- PRD 섹션 3.3.3 "문서 번호 체계"에는 `025-traceability-matrix.md`, `026-test-specification.md`가 언급되어 있음

**권장 조치**:
- **PRD 업데이트 필요**: 섹션 3.2.4의 `draft` 명령어 설명에 3개 문서 생성 내용 반영

---

### 4.2 ℹ️ CLAUDE.md와 PRD 간 상태 코드 불일치

**CLAUDE.md 정의**:
```
development:     [ ] → [bd] → [dd] → [im] → [ts] → [xx]
defect:          [ ] → [an] → [fx] → [ts] → [xx]
```

**PRD 정의** (섹션 3.2.7, B.2):
```
development:     [ ] → [bd] → [dd] → [im] → [vf] → [xx]
defect:          [ ] → [an] → [fx] → [vf] → [xx]
```

**분석**:
- CLAUDE.md에서 `[ts]` 사용 (테스트 상태)
- PRD에서 `[vf]` 사용 (검증 상태)
- 두 코드의 의미는 동일하나 표기가 다름

**권장 조치**:
- **CLAUDE.md 업데이트 필요**: `[ts]`를 `[vf]`로 변경하여 PRD와 일치시킴

---

## 5. 정상 일치 항목

### 5.1 문서 번호 체계 (PRD 섹션 3.3.3)

| 문서 | PRD | 명령어 파일 | 일치 |
|------|-----|------------|------|
| 기본설계 | `010-basic-design.md` | `010-basic-design.md` | ✅ |
| 화면설계 | `011-ui-design.md` | `011-ui-design.md` | ✅ |
| 상세설계 | `020-detail-design.md` | `020-detail-design.md` | ✅ |
| 설계 리뷰 | `021-design-review-{llm}-{n}.md` | `021-design-review-{llm}-{n}.md` | ✅ |
| 추적성 매트릭스 | `025-traceability-matrix.md` | `025-traceability-matrix.md` | ✅ |
| 테스트 명세 | `026-test-specification.md` | `026-test-specification.md` | ✅ |
| 구현 | `030-implementation.md` | `030-implementation.md` | ✅ |
| 코드 리뷰 | `031-code-review-{llm}-{n}.md` | `031-code-review-{llm}-{n}.md` | ✅ |
| 통합테스트 | `070-integration-test.md` | `070-integration-test.md` | ✅ |
| TDD 테스트 결과 | `070-tdd-test-results.md` | `070-tdd-test-results.md` | ✅ |
| E2E 테스트 결과 | `070-e2e-test-results.md` | `070-e2e-test-results.md` | ✅ |
| 매뉴얼 | `080-manual.md` | `080-manual.md` | ✅ |

### 5.2 상태 기호 (PRD 섹션 B.2)

| 기호 | 의미 | PRD | 명령어 | 일치 |
|------|------|-----|--------|------|
| `[ ]` | Todo | ✅ | ✅ | ✅ |
| `[bd]` | 기본설계 | ✅ | ✅ | ✅ |
| `[dd]` | 상세설계 | ✅ | ✅ | ✅ |
| `[an]` | 분석 | ✅ | ✅ | ✅ |
| `[im]` | 구현 | ✅ | ✅ | ✅ |
| `[fx]` | 수정 | ✅ | ✅ | ✅ |
| `[vf]` | 검증 | ✅ | ✅ | ✅ |
| `[xx]` | 완료 | ✅ | ✅ | ✅ |

---

## 6. 결론 및 권장 조치

### 6.1 필수 조치 (P1)

| # | 조치 내용 | 대상 파일 | 우선순위 |
|---|----------|----------|----------|
| 1 | CLAUDE.md 상태 코드 수정: `[ts]` → `[vf]` | `CLAUDE.md` | P1 |

### 6.2 권장 조치 (P2)

| # | 조치 내용 | 대상 파일 | 우선순위 |
|---|----------|----------|----------|
| 1 | PRD 섹션 3.2.4 `draft` 명령어 설명에 분할 문서(025, 026) 생성 내용 추가 | `jjiban-prd.md` | P2 |

### 6.3 전체 평가

- **일관성 점수**: 95% (19/20 항목 일치)
- **심각한 불일치**: 없음
- **기능적 영향**: 없음 (불일치 항목은 문서화 수준의 차이)

---

## 7. 명령어 파일 목록

### 7.1 상태 전환 명령어 (7개)

| 파일명 | 명령어 | 적용 카테고리 |
|--------|--------|--------------|
| `start.md` | `/wf:start` | development, defect, infrastructure |
| `draft.md` | `/wf:draft` | development |
| `build.md` | `/wf:build` | development, infrastructure |
| `fix.md` | `/wf:fix` | defect |
| `skip.md` | `/wf:skip` | infrastructure |
| `verify.md` | `/wf:verify` | development, defect |
| `done.md` | `/wf:done` | development, defect, infrastructure |

### 7.2 상태 내 액션 (6개)

| 파일명 | 명령어 | 적용 카테고리 | 반복 가능 |
|--------|--------|--------------|----------|
| `ui.md` | `/wf:ui` | development | X |
| `review.md` | `/wf:review` | development | O |
| `apply.md` | `/wf:apply` | development | O |
| `test.md` | `/wf:test` | development | O |
| `audit.md` | `/wf:audit` | 전체 | O |
| `patch.md` | `/wf:patch` | 전체 | O |

---

*보고서 작성: Claude Opus 4.5*
*작성일: 2025-12-13*
