# jjiban - AI 기반 프로젝트 관리 도구

## 프로젝트 개요

로컬 환경에서 실행되는 파일 기반 프로젝트 관리 도구. `npx jjiban`으로 실행하며, Git으로 동기화.

**핵심 가치**: LLM CLI가 `.jjiban/` 폴더의 `wbs.md` 파일을 직접 수정 가능

---

## 기술 스택

| 계층 | 기술 |
|-----|------|
| 런타임 | Node.js 20.x |
| 프레임워크 | Nuxt 3 (Standalone) |
| 프론트엔드 | Vue 3, PrimeVue 4.x, TailwindCSS |
| 데이터 | wbs.md + JSON (.jjiban/) |
| 터미널 | xterm.js + node-pty |
| 차트 | Frappe Gantt |

---

## WBS 계층 구조

**4단계** (대규모): `Project → WP → ACT → TSK`
**3단계** (소규모): `Project → WP → TSK`

| 레벨 | 명칭 | 기간 |
|------|------|------|
| L1 | Project | 6~24개월 |
| L2 | Work Package | 1~3개월 |
| L3 | Activity (선택) | 1~4주 |
| L4 | Task | 1일~1주 |

**Task 유형 (category)**: `development`, `defect`, `infrastructure`

---

## 워크플로우 상태

### 칸반 컬럼 (6단계)

```
Todo [ ] → Design [bd] → Detail [dd] → Implement [im] → Verify [vf] → Done [xx]
```

### 카테고리별 흐름

| 카테고리 | 상태 흐름 |
|---------|----------|
| development | `[ ]` → `[bd]` → `[dd]` → `[im]` → `[vf]` → `[xx]` |
| defect | `[ ]` → `[an]` → `[fx]` → `[vf]` → `[xx]` |
| infrastructure | `[ ]` → `[ds]?` → `[im]` → `[xx]` |

### 워크플로우 명령어

**development**: `start` → `draft` → `build` → `verify` → `done`
**defect**: `start` → `analyze` → `verify` → `done`
**infrastructure**: `start`/`skip` → `build` → `done`

---

## 데이터 구조

```
.jjiban/
├── settings/              # 전역 설정
│   ├── projects.json      # 프로젝트 목록
│   ├── columns.json       # 칸반 컬럼
│   ├── categories.json    # 카테고리
│   ├── workflows.json     # 워크플로우 규칙
│   └── actions.json       # 상태 내 액션
├── templates/             # 문서 템플릿
└── projects/              # 프로젝트 폴더
    └── [project-id]/
        ├── project.json   # 프로젝트 메타
        ├── team.json      # 팀원 목록
        ├── wbs.md         # WBS 통합 (유일한 소스)
        └── tasks/         # Task 문서
            └── {TSK-ID}/
```

---

## 문서 번호 체계

| 단계 | 파일명 |
|------|--------|
| 기본설계 | `010-basic-design.md` |
| 화면설계 | `011-ui-design.md` |
| 상세설계 | `020-detail-design.md` |
| 설계리뷰 | `021-design-review-{llm}-{n}.md` |
| 구현 | `030-implementation.md` |
| 코드리뷰 | `031-code-review-{llm}-{n}.md` |
| 통합테스트 | `070-integration-test.md` |
| 매뉴얼 | `080-manual.md` |

---

## 코딩 규칙

- Vue 3 Composition API (`<script setup>`) 사용
- 일반 HTML 사용금지, PrimeVue 4.x 적극 사용
- 파일 접근은 Server Routes 통해서만
- TypeScript 필수
- Pinia로 상태 관리

### CSS 클래스 중앙화 원칙

> **핵심**: 컴포넌트 내 `:style` 및 HEX 하드코딩 금지. `main.css` Tailwind 클래스로 통일.

```
main.css → tailwind.config.ts → 컴포넌트 (:class만 사용)
```

**금지**: `:style="{ backgroundColor: '#3b82f6' }"`, `const color = '#3b82f6'`
**권장**: `:class="\`node-icon-${type}\`"`, `:class="{ 'status-done': isDone }"`
**예외**: 동적 계산 필수 (paddingLeft, 드래그 리사이즈, Props 동적값)

---

## 주요 화면

- 대시보드: 전체 현황
- 칸반 보드: 드래그 앤 드롭 작업 관리
- WBS 트리: 계층 구조 표시
- Gantt 차트: 일정 시각화
- Task 상세: 정보, 문서, LLM 터미널


## TDD, E2E 테스트 시 유의사항
- .jjiban/jjiban 폴더는 테스트에 사용하지 말것
- 요청에 좋은 대안이 있으면 제시해