# 마루 헤더 상태 전이 BPMN 다이어그램

## 파일 정보
- **파일명**: `maru-header-state-transition.bpmn`
- **생성일**: 2025-09-25
- **참조 문서**: `Task-3-1.MR0100-Backend-API-구현(상세설계).md`

## 사용 방법

### BPMN.io에서 열기
1. [bpmn.io](https://demo.bpmn.io/) 접속
2. **Open File** 클릭
3. `maru-header-state-transition.bpmn` 파일 선택
4. 다이어그램 확인 및 편집

### VS Code에서 열기 (확장 기능 필요)
1. **BPMN Viewer** 확장 기능 설치
2. `.bpmn` 파일 우클릭 → **Open with BPMN Viewer**

## 다이어그램 구성 요소

### 상태 (States)
- **🟢 CREATED** (생성상태): 초기 생성 상태, 수정 가능
- **🔵 INUSE** (사용중상태): 활성 사용 상태, 제한적 수정
- **🔴 DEPRECATED** (폐기상태): 폐기 상태, 읽기 전용

### 상태 전이 (State Transitions)
1. **생성** → CREATED (시작점)
2. **활성화**: CREATED → INUSE
3. **직접 폐기**: CREATED → DEPRECATED
4. **폐기**: INUSE → DEPRECATED
5. **되돌리기 (조건부)**: INUSE → CREATED
6. **종료**: DEPRECATED → 최종상태

### 비즈니스 규칙
- 동일 마루ID에 대해 하나의 활성 버전만 존재
- 모든 상태 변경은 새로운 버전으로 관리
- DEPRECATED 상태에서는 읽기 전용
- 역방향 전환(INUSE→CREATED)은 긴급상황에서만 허용

### 연결선 세부사항
- **정상 흐름**: START → CREATED → INUSE → DEPRECATED → END
- **직접 폐기**: CREATED → DEPRECATED (테스트 결과 부적합 시)
- **조건부 되돌리기**: INUSE → CREATED (긴급 수정 필요 시)

## 기술적 구현 참조
- **API 엔드포인트**: `PUT /api/v1/maru-headers/{maruId}/status`
- **상태 전환 검증**: MaruHeaderService에서 비즈니스 규칙 적용
- **버전 관리**: 선분 이력 모델 (START_DATE/END_DATE 기반)

## 주의사항
- 상태 전환 시 반드시 새로운 VERSION이 생성됨
- 이전 버전은 END_DATE가 현재 시간으로 설정됨
- 조건부 되돌리기는 `isEmergencyRollback` 조건 검증 필요