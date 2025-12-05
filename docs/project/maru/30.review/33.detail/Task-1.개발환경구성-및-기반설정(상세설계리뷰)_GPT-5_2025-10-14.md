# 상세설계 리뷰 보고서

## ① 기본 정보
- **Task**: 1 개발환경 구성 및 기반 설정
- **검토자**: GPT-5 Codex
- **검토일**: 2025-10-14
- **대상 문서**: docs/project/maru/10.design/12.detail-design/Task-1.개발환경구성-및-기반설정(상세설계).md

## ② 검토 범위
- 검토 문서: 상세설계 본문 전 체계(절 0~16) 및 첨부 체크리스트
- 참조 문서: TRD (technical-requirements.md), 프로젝트 README, backend/src/config/database.*
- 검토 기법: 요구사항 추적성 확인, 아키텍처 일관성 점검, 보안/운영 위험 평가

## ③ 강점 및 긍정 관찰
- 프로세스 다이어그램과 ASCII 아트로 환경 구성 흐름을 시각화하여 온보딩 가이드를 제공함 (참조: Task-1 상세설계 135~200행).
- 환경 검증 체크리스트와 리스크 매트릭스를 포함해 Task 완결 여부 판정 기준을 마련한 점이 유효함 (참조: Task-1 상세설계 361행).

## ④ 발견 이슈

### ★ P1 - 로컬 DB 전략 누락 (Architecture)
- **위치**: docs/project/maru/10.design/12.detail-design/Task-1.개발환경구성-및-기반설정(상세설계).md:24, 41, 53
- **상세 설명**: 상세설계는 Oracle XE 설치·검증만을 전제로 범위를 한정하고 있음. 그러나 프로젝트 가이드(README 120~128행)는 PoC 기본 DB로 SQLite를 사용하며 `npm run migrate`, `npm run seed` 수행을 필수 절차로 정의. 실제 코드도 SQLite 초기화를 기본값으로 제공(`backend/src/config/database.sqlite.js`). Oracle만 기준으로 따라갈 경우 로컬/CI 환경 구축이 불가능하여 Task 1 목표(개발환경 완비)를 달성하지 못함.
- **파급 영향**: PoC 개발·테스트 자동화 블로킹, CI 실패, 환경 재현 불가.
- **개선안**: 상세설계에 “기본: SQLite, 선택: Oracle” 구조로 재정의하고, SQLite 파일 경로 및 마이그레이션/시드 스크립트 실행 절차, 검증 방법을 포함. Oracle 절차는 선택 경로로 분리해 추가 기술.

### ★ P2 - Nexacro 버전 불일치 (Quality)
- **위치**: docs/.../Task-1.개발환경구성-및-기반설정(상세설계).md:25, 74 vs 141, 165, README.md:14
- **상세 설명**: 범위·가정에서는 Nexacro Platform 17을 요구하나 동일 문서의 다른 절과 프로젝트 기준은 N v24를 사용. 설치 버전이 혼재하면 런타임 및 폼 호환성 문제가 발생.
- **파급 영향**: UI 런타임 불일치, 구축 실패 위험, 문서 신뢰도 하락.
- **개선안**: 전 구간을 Nexacro N v24로 통일하고, 버전 변경 배경 및 호환성 검증 결과를 문서화.

### ★ P2 - 초기 데이터 구축 절차 미정의 (Quality)
- **위치**: docs/.../Task-1.개발환경구성-및-기반설정(상세설계).md:125~134, README.md:120~128
- **상세 설명**: 구성 프로세스/검증 단계가 Node.js 기동, Oracle 접속, Nexacro 빌드 확인에만 국한되어 있고 필수 절차인 SQLite 마이그레이션·시드 수행 및 검증이 누락.
- **파급 영향**: DB 스키마/데이터 불일치로 이후 Task 진행 시 실패 가능.
- **개선안**: 프로세스/검증 섹션에 `npm run migrate`, `npm run seed`, seed 데이터 확인 방법, 실패 시 복구 절차를 추가.

### ★ P3 - 문서 메타데이터 최신화 필요 (Quality)
- **위치**: docs/.../Task-1.개발환경구성-및-기반설정(상세설계).md:11~12
- **상세 설명**: 문서 위치/참조 경로가 현재 리포 구조와 불일치(예: `./docs/project/maru/2. design/...`).
- **파급 영향**: 문서 추적성 저하, 혼동 가능.
- **개선안**: 최신 디렉터리 구조로 경로·참조 문서 재기재, 버전 정보 업데이트.

## ⑤ 검증 결과 요약
- 요구사항 커버리지: 기능 5건 중 3건 반영 (60%), 비기능 3건 중 1건 반영 (33%) — SQLite·Migration 요구 미반영.
- 이슈 분류 요약:

| Priority | Critical | High | Medium | Low | Info | 합계 |
|----------|----------|------|--------|-----|------|------|
| P1       | 0        | 1    | 0      | 0   | 0    | 1    |
| P2       | 0        | 2    | 0      | 0   | 0    | 2    |
| P3       | 0        | 0    | 1      | 0   | 0    | 1    |
| **합계** | 0        | 3    | 1      | 0   | 0    | 4    |

- 카테고리별: Architecture 1, Quality 3, Security 0, Performance 0.

## ⑥ 종합 의견
- 현재 상세설계는 Oracle 전제와 버전 혼선으로 실제 개발환경 구축 실패 위험이 높음: **“보완 필요”** 단계.
- SQLite 기반 절차 추가 및 버전 정합성 확보, 문서 메타 업데이트 후 재검토 권장.

## ⑦ 후속 조치 권장 목록
1. 상세설계 개정: DB 전략·버전·마이그레이션 절차 반영 후 이해관계자 리뷰.
2. README/TRD 등 상위 문서와 동기화하여 환경 정책 혼선을 제거.
3. 개정 문서 기반으로 환경 구축 리허설을 실행하고 체크리스트를 업데이트.

## ⑧ 참조 문서
- docs/project/maru/10.design/12.detail-design/Task-1.개발환경구성-및-기반설정(상세설계).md
- docs/project/maru/00.foundation/01.project-charter/technical-requirements.md
- README.md
- backend/src/config/database.js, database.sqlite.js
