# MARU 구현 계획 (화면 중심)

## 구현 계획 개요

MARU(Master Code & Rule Management System)는 중앙화된 마스터 코드와 비즈니스 룰 관리를 통해 시스템 간 데이터 일관성을 보장하는 PoC 시스템입니다.

### 핵심 아키텍처 특징
- **3-Tier Architecture**: Nexacro N V24 Frontend + Node.js Backend + Oracle Database
- **선분 이력 모델**: 모든 변경사항의 시간 추적 및 버전 관리
- **RESTful API**: Frontend-Backend 간 HTTP/JSON 통신
- **상태 기반 관리**: CREATED/INUSE/DEPRECATED 상태별 차등 수정 정책

### 화면 중심 개발 접근법
각 화면을 독립적인 Task로 관리하여 Frontend UI와 Backend 기능을 통합적으로 개발

---

## 1단계: 개발 환경 구축 및 데이터베이스 구현 (1-3주)

- [X] 1. 개발 환경 구성 및 기반 설정
  - 1.1 Nexacro N v24 개발 환경 구성
  - 1.2 프로젝트 구조 생성 (Backend/Frontend 폴더)
  - 1.3 핵심 의존성 설치 (express, oracledb, knex 등)
  - _요구사항: TRD 3.1 개발 환경 구성_
  - _참고 기본설계 문서: technical-requirements.md_

- [X] 2. 데이터베이스 스키마 구현
  - 2.1 코어 테이블 생성 (TB_MR_HEAD, TB_MR_CODE_CATE, TB_MR_CODE_BASE)
  - 2.2 룰 관리 테이블 생성 (TB_MR_RULE_VAR, TB_MR_RULE_RECORD)
  - 2.3 선분 이력 모델 적용 (START_DATE, END_DATE)
  - 2.4 인덱스 및 제약조건 설정
  - 2.5 데이터베이스 연동 설정 및 테스트
  - _요구사항: BRD 4.1-4.2 마스터 코드 및 룰 관리_
  - _참고 기본설계 문서: 2. database-design.md_

---

## 2단계: 마루 관리 화면 구현 (3-4주)

- 3. MR0100 - 마루헤더관리 화면 (우선순위: 1)
  - [dr] 3.1 MR0100 Backend API 구현 ✅ **Cross Check 개선사항 적용 완료**
    - [x] 마루 헤더 CRUD API 구현 (MH001-MH008) ✅ **완료 + 추가 API**
    - [x] 상태 변경 API 구현 (MH006): CREATED → INUSE → DEPRECATED ✅ **완료**
    - [x] 선분 이력 기반 수정 로직 구현 (상태별 차등 처리) ✅ **완료**
    - [x] Swagger API 문서화 ✅ **완료**
    - [x] Cross Check 개선사항 적용: description 필드 수정, 스키마 중복 제거 ✅ **완료**
  - [d] 3.2 MR0100 Frontend UI 구현 **[i→d] 상세설계 v2.0 완료**
    - [x] 상세설계서 v2.0 작성 완료 (기존 설계 무시, 새로 작성) ✅
    - [x] UI 레이아웃 SVG 파일 생성 완료 ✅
    - [x] 요구사항 추적 매트릭스 작성 (8개 기능 요구사항, 5개 비기능 요구사항) ✅
    - [x] UI 테스트케이스 작성 (10개 컴포넌트 TC, 8개 시나리오 TC) ✅
    - [ ] Nexacro Form 생성 (frmMR0100.xfdl) - 구현 대기
    - [ ] Dataset 구조 구현 (ds_search, ds_maruList, ds_maruDetail) - 구현 대기
    - [ ] Backend API 연동 및 Transaction 구현 - 구현 대기
  - _요구사항: BRD UC-001 코드 헤더 관리_
  - _참고 기본설계 문서: 5. program-list.md, 3. api-design.md, 4. ui-design.md_
  - _상세설계서: Task-3-2.MR0100-Frontend-UI-구현(상세설계).md v2.0_

- 4. MR0200 - 마루현황조회 화면 (우선순위: 2) ✅ **구현 완료**
  - [d] 4.1 MR0200 Backend API 구현 **[상세설계 완료 - 신규 작성]**
    - 상세설계서 v2.0 작성 완료 ✅ **기존 설계 무시하고 새로 설계**
    - 3개 API 설계: 목록 조회(MH001), 통계 조회(MH008), 캐시 무효화(MH009)
    - 11개 필터 조건 정의 (타입/상태/우선순위/검색/기간/정렬 등)
    - 캐시 전략 설계 (5분 TTL, node-cache)
    - 성능 목표 설정 (목록 < 1초, 통계 < 500ms)
    - 테스트 케이스 작성 (기능/오류/성능/데이터 정확성)
  - [d] 4.2 MR0200 Frontend UI 구현 **[상세설계 v3.0 완료 - 신규 작성]** ✅ **기존 설계 무시하고 새로 설계**
    - [x] 상세설계서 v3.0 작성 완료 ✅ **전체 재설계**
    - [x] UI 레이아웃 SVG 파일 생성 ✅ **상호작용 포인트 포함**
    - [x] Dataset 구조 정의 (ds_search, ds_maruList, ds_statistics) ✅
    - [x] Transaction 설계 (tran_maruList, tran_statistics, tran_clearCache) ✅
    - [x] UI 테스트케이스 작성 (10개 컴포넌트 TC, 5개 시나리오 TC) ✅
    - [x] 요구사항 추적성 매트릭스 작성 (9개 요구사항) ✅
    - [ ] Nexacro Form 구현 (MR0200.xfdl) - 구현 대기
    - [ ] Backend API 연동 및 Transaction 구현 - 구현 대기
  - _요구사항: 마루 목록 및 현황 조회_
  - _참고 기본설계 문서: 5. program-list.md, 4. ui-design.md_

- 5. MR0300 - 마루이력조회 화면 (우선순위: 3)
  - [d] 5.1 MR0300 Backend API 구현 **[d]**
    - 마루 이력 조회 API 구현 (MH007)
    - 특정 시점 데이터 조회 기능
    - 변경사항 비교 기능
    - Swagger API 문서화
  - [d] 5.2 MR0300 Frontend UI 구현
    - Nexacro Form 생성 (frmMR0300.xfdl)
    - 이력 그리드 및 타임라인 표시
    - 버전 비교 기능 UI
    - 변경사항 하이라이트 표시
  - _요구사항: BRD UC-006 이력 관리_
  - _참고 기본설계 문서: 5. program-list.md, 4. ui-design.md_

---

## 3단계: 코드 관리 화면 구현 (4-6주)

- 6. CD0100 - 코드카테고리관리 화면 (우선순위: 4)
  - [d] 6.1 CD0100 Backend API 구현 **[d]**
    - 코드 카테고리 CRUD API 구현 (CC001-CC005)
    - 코드 타입 검증 (Normal: 콤마구분, RegEx: 정규식)
    - 부모-자식 관계 검증 (마루 헤더와의 연관성)
    - Swagger API 문서화
    - 상세설계서 작성 완료
  - [d] 6.2 CD0100 Frontend UI 구현 **[d]**
    - Nexacro Form 생성 (frmCD0100.xfdl)
    - 카테고리 정의 폼 (트리 구조)
    - 코드 타입 선택 및 정의 입력
    - 실시간 정규식 검증 기능
  - _요구사항: BRD UC-002 코드 카테고리 관리_
  - _참고 기본설계 문서: 5. program-list.md, 3. api-design.md, 4. ui-design.md_

- 7. CD0200 - 코드기본값관리 화면 (우선순위: 5)
  - [d] 7.1 CD0200 Backend API 구현 **[d]**
    - 코드 기본값 CRUD API 구현 (CB001-CB005)
    - 다국어 지원 (대체 코드명 1~5)
    - 정렬 순서 관리 기능
    - Swagger API 문서화
  - [d] 7.2 CD0200 Frontend UI 구현 **[d - v2.0 완료]** ✅
    - [x] 상세설계서 v2.0 작성 완료 (기존 무시, 신규 작성) ✅
    - [x] UI 레이아웃 SVG 파일 생성 완료 ✅
    - [x] 요구사항 추적 매트릭스 (9개 기능, 4개 비기능) ✅
    - [x] UI 테스트케이스 (10개 컴포넌트, 4개 시나리오, 3개 접근성) ✅
    - [ ] Nexacro Form 구현 (CD0200.xfdl) - 구현 대기
    - [ ] Dataset 구조 및 Transaction - 구현 대기
  - _요구사항: BRD UC-003 코드 기본값 관리_
  - _참고 기본설계 문서: 5. program-list.md, 3. api-design.md, 4. ui-design.md_
  - _상세설계서: Task-7-2.CD0200-Frontend-UI-구현(상세설계).md v2.0_

- 8. CD0300 - 코드검증관리 화면 (우선순위: 6)
  - [d] 8.1 CD0300 Backend API 구현
    - 코드 카테고리 정의와 일치성 검증 API 구현 (CB006)
    - 중복 코드 검증 기능
    - 데이터 무결성 체크 리포트
    - Swagger API 문서화
  - [d] 8.2 CD0300 Frontend UI 구현
    - Nexacro Form 생성 (frmCD0300.xfdl)
    - 검증 결과 표시 그리드
    - 오류 상세 정보 팝업
    - 자동 수정 제안 기능
  - _요구사항: BRD UC-007 데이터 검증_
  - _참고 기본설계 문서: 5. program-list.md, 3. api-design.md_

---

## 4단계: 룰 관리 화면 구현 (6-7주)

- 9. RL0100 - 룰변수관리 화면 (우선순위: 7)
  - [d] 9.1 RL0100 Backend API 구현
    - 룰 변수 CRUD API 구현 (RV001-RV005)
    - 변수 타입 관리 (OP: 조건, RSLT: 결과)
    - 데이터 타입 및 조건 타입 검증
    - Swagger API 문서화
  - [d] 9.2 RL0100 Frontend UI 구현
    - Nexacro Form 생성 (frmRL0100.xfdl)
    - 변수 정의 마스터-디테일 구조
    - 변수 타입별 입력 폼
    - 변수 위치 및 순서 관리 UI
  - _요구사항: BRD UC-004 룰 변수 정의_
  - _참고 기본설계 문서: 5. program-list.md, 3. api-design.md, 4. ui-design.md_

- 10. RL0200 - 룰레코드관리 화면 (우선순위: 8)
  - [d] 10.1 RL0200 Backend API 구현 **[d]**
    - 룰 레코드 CRUD API 구현 (RR001-RR005)
    - 조건-결과 매트릭스 관리 (OP_1~20, RSLT_1~20)
    - 우선순위 관리 및 정렬 기능
    - Swagger API 문서화
    - 상세설계서 작성 완료
  - [d] 10.2 RL0200 Frontend UI 구현
    - Nexacro Form 생성 (frmRL0200.xfdl)
    - 동적 매트릭스 그리드 구현
    - 조건 및 결과 입력 UI
    - 우선순위 드래그앤드롭 기능
  - _요구사항: BRD UC-005 룰 레코드 관리_
  - _참고 기본설계 문서: 5. program-list.md, 3. api-design.md, 4. ui-design.md_

- 11. RL0300 - 룰실행테스트 화면 (우선순위: 9)
  - [d] 11.1 RL0300 Backend API 구현 **[d]**
    - 룰 실행 API 구현 (RR006)
    - 연산자 처리 (=, !=, <, >, <=, >=, BETWEEN, IN, NOT_IN, NOT_CHECK, SCRIPT)
    - 조건 평가 및 결과 반환 로직
    - 룰 검증 및 테스트 기능
    - Swagger API 문서화
  - [d] 11.2 RL0300 Frontend UI 구현 **[d]**
    - Nexacro Form 생성 (frmRL0300.xfdl)
    - 테스트 데이터 입력 폼
    - 룰 실행 결과 표시
    - 디버깅 및 단계별 실행 기능
    - 상세설계서 작성 완료
  - _요구사항: 비즈니스 룰 실행 및 결과 생성_
  - _참고 기본설계 문서: 5. program-list.md, schetch.md_

---

## 5단계: 공통 관리 및 통합 테스트 (7-8주)

- 12. CM0100 - 메인화면 (우선순위: 10)
  - [d] 12.1 CM0100 Backend API 구현 **[d]**
    - 대시보드 데이터 API 구현
    - 시스템 상태 모니터링 API
    - 통계 및 지표 수집 API
    - Swagger API 문서화
  - [d] 12.2 CM0100 Frontend UI 구현 **[d]**
    - Nexacro Form 생성 (frmCM0100.xfdl)
    - 시스템 대시보드 레이아웃
    - 메뉴 네비게이션 구조
    - 실시간 상태 표시 위젯
  - _요구사항: 시스템 메인 대시보드_
  - _참고 기본설계 문서: 5. program-list.md, 4. ui-design.md_

- [d] 13. 공통 서비스 및 캐시 구현 **[d]**
  - 13.1 선분 이력 관리 공통 함수 구현
  - 13.2 데이터 검증 및 에러 처리 미들웨어
  - 13.3 캐시 레이어 구현 (마스터 데이터 캐싱)
  - 13.4 로깅 및 모니터링 시스템
  - _요구사항: 공통 기능 및 성능 최적화_
  - _참고 기본설계 문서: technical-requirements.md_
  - _상세설계서 작성 완료_

- [d] 14. 통합 테스트 및 시나리오 검증 **[d]**
  - [x] 상세설계서 작성 완료 ✅
  - [ ] 14.1 Frontend-Backend 통합 테스트 (모든 화면)
  - [ ] 14.2 전체 사용자 시나리오 테스트
    - 코드 생성 → 수정 → 상태 변경 시나리오
    - 룰 생성 → 변수 정의 → 실행 테스트 시나리오
    - 이력 조회 및 추적 시나리오
  - [ ] 14.3 성능 테스트 및 최적화
  - [ ] 14.4 에러 처리 및 예외 상황 테스트
  - _요구사항: 전체 시스템 검증_
  - _참고 기본설계 문서: 모든 설계 문서_
  - _상세설계서: Task-14.통합-테스트-및-시나리오-검증(상세설계).md_

---

## 화면별 완성도 기준

### 각 화면 Task 완료 기준
- **Backend API**: 모든 필요 엔드포인트 구현 및 테스트 완료
- **Frontend UI**: Nexacro Form 완전 구현 및 Dataset 연동
- **기능 통합**: Frontend-Backend 완전 연동 및 기능 검증
- **UI/UX**: 사용자 시나리오 기반 인터페이스 검증
- **에러 처리**: 예외 상황 처리 및 사용자 피드백

---

## 성공 지표 및 검증 기준

### 기능적 성공 기준
- **모든 화면 완성**: 10개 핵심 화면 완전 구현 및 동작
- **CRUD 완전성**: 모든 화면에서 생성/조회/수정/삭제 기능 동작
- **선분 이력 동작**: 모든 화면에서 버전 관리 및 시점별 조회
- **상태 관리**: CREATED/INUSE/DEPRECATED 상태별 정책 동작
- **데이터 검증**: 코드 정의 일치성, 룰 문법 검증 기능

### 기술적 성공 기준
- **Oracle 연동**: 모든 화면에서 데이터베이스 정상 연동
- **Nexacro UI**: 모든 화면에서 Dataset, Form, Component 정상 동작
- **REST API**: 모든 화면에서 API 호출 및 응답 정상 처리
- **캐시 동작**: 마스터 데이터 캐싱 및 성능 최적화
- **에러 관리**: 표준화된 에러 응답 및 사용자 알림

### 화면별 사용성 기준
- **응답성**: 각 화면 로딩 시간 < 2초
- **직관성**: 최소한의 교육으로 사용 가능한 UI
- **일관성**: 모든 화면에서 동일한 UI 패턴 적용
- **접근성**: 키보드 네비게이션 및 단축키 지원

---

**최종 검증**: 모든 화면에서 사용자 시나리오 완전 수행 가능, 화면별 기능 완성도 100%, 전체 시스템 통합 검증 완료