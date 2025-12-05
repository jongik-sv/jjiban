# 상세설계 리뷰 보고서

## ① 기본 정보
- **Task**: 2 데이터베이스 스키마 구현
- **검토자**: GPT-5 Codex
- **검토일**: 2025-10-14
- **대상 문서**: docs/project/maru/10.design/12.detail-design/Task-2.데이터베이스-스키마-구현(상세설계).md

## ② 검토 범위
- 검토 문서: 상세설계 본문 전체(절 0~16) 및 부록 구조
- 참조 문서: database-design.md, technical-requirements.md, 프로젝트 README, backend/src/config/database.sqlite.js
- 검토 기법: 요구사항 추적성 점검, 무결성/아키텍처 정합성 검토, 실행 가능성 평가

## ③ 강점 및 긍정 관찰
- 프로세스 다이어그램과 텍스트 아트로 DB 구축 흐름과 엔터티 관계를 빠르게 파악할 수 있음 (docs/project/maru/10.design/12.detail-design/Task-2.데이터베이스-스키마-구현(상세설계).md:146,163).
- 버전 이력 JSON 예시를 통해 시간 구간 관리 개념을 직관적으로 전달함 (docs/project/maru/10.design/12.detail-design/Task-2.데이터베이스-스키마-구현(상세설계).md:231-244).

## ④ 발견 이슈

### ★ P1 - 룰 테이블 DDL 누락 (Architecture)
- **위치**: docs/project/maru/10.design/12.detail-design/Task-2.데이터베이스-스키마-구현(상세설계).md:28,91-109,181-224
- **설명**: 범위와 모듈 책임에 TB_MR_RULE_VAR, TB_MR_RULE_RECORD가 포함돼 있으나 DDL 섹션 6.2에는 TB_MR_HEAD/_CODE_CATE/_CODE_BASE만 정의되고 룰 테이블 정의가 아예 없음. Task 2 핵심 산출물인 다섯 개 테이블 중 두 개가 설계에서 누락돼 요구사항( tasks.md 2.2~2.5 ) 충족이 불가능함.
- **영향**: 룰 변수/레코드 구조 미정으로 이후 API·서비스 설계 연쇄 차질, 스키마 마이그레이션 불가.
- **개선안**: TRD 및 기본설계를 근거로 TB_MR_RULE_VAR, TB_MR_RULE_RECORD DDL, 제약조건, 인덱스 정의를 추가하고 버전/조건 컬럼 명세를 세부 기재.

### ★ P1 - 기본키·외래키 제약 및 인덱스 정의 부재 (Quality)
- **위치**: docs/project/maru/10.design/12.detail-design/Task-2.데이터베이스-스키마-구현(상세설계).md:183-224
- **설명**: 제시된 DDL은 컬럼만 선언하고 PRIMARY KEY, FOREIGN KEY, CHECK, UNIQUE, INDEX 정의가 전혀 없다. TRD는 동일 테이블에 PK/FK/체크/인덱스를 필수로 규정함(docs/project/maru/00.foundation/02.design-baseline/2. database-design.md:49-128,227). 제약이 없으면 이력 테이블 특성상 중복·무결성 붕괴 위험이 즉시 발생한다.
- **영향**: 데이터 무결성 보장 실패, 버전 이력 중복·고립, 성능 목표(<100ms) 달성 불가.
- **개선안**: TRD 정의를 반영해 각 테이블에 PK/FK/체크/유니크/인덱스 구문을 상세히 기술하고, 버전 기반 복합키와 상태 체크 로직을 명시.

### ★ P2 - 개발 기본 DB(SQLite)와의 정합 전략 부재 (Architecture)
- **위치**: docs/project/maru/10.design/12.detail-design/Task-2.데이터베이스-스키마-구현(상세설계).md:55-60,94-97 / README.md:120-128 / backend/src/config/database.sqlite.js:14-78
- **설명**: 상세설계는 Oracle 전용으로 가정하나 프로젝트 가이드라인과 코드 기본값은 SQLite를 PoC 기본 DB로 사용하고 마이그레이션·시드 스크립트를 제공한다. 설계에 dev/CI 환경 전환 전략, SQLite 대응 스키마, 마이그레이션 절차가 없어 구현 호환성과 자동화 검증이 단절된다.
- **영향**: 로컬/CI 구축 실패, 테스트 파이프라인 차단, 스키마 이중 유지 비용 증가.
- **개선안**: 기본 경로를 SQLite + Knex 마이그레이션으로 정의하고 Oracle은 확장 경로로 분리, 양쪽 스키마 차이를 표로 비교하며 변환 스크립트·시드 전략을 설계 문서에 추가.

### ★ P3 - 존재하지 않는 컬럼 참조 (Quality)
- **위치**: docs/project/maru/10.design/12.detail-design/Task-2.데이터베이스-스키마-구현(상세설계).md:250-253
- **설명**: 제약조건 예시에서 `PARENT_MARU_ID` 외래키를 언급하지만 해당 컬럼은 어떠한 테이블에도 정의되지 않음. 잘못된 컬럼명은 구현 시 혼선을 초래하고 DDL 자동 생성 시 오류를 발생시킴.
- **개선안**: 실제 FK 대상(`MARU_ID`, `VERSION`)으로 수정하고 참조 테이블/컬럼을 명확히 기재.

### ★ P4 - 참조 경로 오타 (Documentation)
- **위치**: docs/project/maru/10.design/12.detail-design/Task-2.데이터베이스-스키마-구현(상세설계).md:14
- **설명**: 참조 문서 경로에 슬래시가 누락되어 (`00.foundation01...`) 문서 추적성이 떨어짐.
- **개선안**: 올바른 경로(`00.foundation/01.project-charter/tasks.md`)로 수정.

## ⑤ 검증 결과 요약
- 요구사항 커버리지: 기능 5건 중 3건만 정의(60%), 비기능 4건 중 1건만 근거 확보(25%) — 제약조건/룰 테이블/성능 방안 미반영.
- 이슈 분류 요약:

| Priority | Critical | High | Medium | Low | Info | 합계 |
|----------|----------|------|--------|-----|------|------|
| P1       | 0        | 2    | 0      | 0   | 0    | 2    |
| P2       | 0        | 1    | 0      | 0   | 0    | 1    |
| P3       | 0        | 0    | 1      | 0   | 0    | 1    |
| P4       | 0        | 0    | 0      | 1   | 0    | 1    |
| **합계** | 0        | 3    | 1      | 1   | 0    | 5    |

- 카테고리별: Architecture 2, Quality 2, Documentation 1, Security/Performance 0.

## ⑥ 종합 의견
- 룰 테이블 부재와 제약조건 미정의로 스키마 구현이 불가능한 상태이므로 **“보완 필요”** 단계. 핵심 DDL 정비 후 재검토가 요구됨.

## ⑦ 후속 조치 권장 목록
1. TRD 기반으로 5개 테이블 DDL·제약·인덱스를 완비하고 룰 테이블 정의를 추가.
2. SQLite-Oracle 병행 전략과 마이그레이션/시드 절차를 상세설계에 반영.
3. 제약조건/참조 컬럼 명세를 검수해 오기 및 누락을 정정.
4. 문서 메타데이터(경로, 버전)를 최신 구조와 맞추어 추적성을 확보.

## ⑧ 참조 문서
- docs/project/maru/10.design/12.detail-design/Task-2.데이터베이스-스키마-구현(상세설계).md
- docs/project/maru/00.foundation/02.design-baseline/2. database-design.md
- docs/project/maru/00.foundation/01.project-charter/technical-requirements.md
- README.md
- backend/src/config/database.sqlite.js
