# LLM Code Agent를 위한 OASIS 프레임워크 BPMN 설계 가이드


본 문서는 LLM Code Agent가 OASIS 프레임워크 환경에서 BPMN 기반 서비스를 설계할 수 있도록 작성된 종합 가이드입니다.

## 목차
1. [OASIS 프레임워크 개요](#1-oasis-프레임워크-개요)
2. [BPMN 서비스 기본 구조](#2-bpmn-서비스-기본-구조)
3. [서비스 설계 패턴](#3-서비스-설계-패턴)
4. [프로세스 요소별 가이드라인](#4-프로세스-요소별-가이드라인)
5. [데이터 처리 방식](#5-데이터-처리-방식)
6. [오류 처리 및 예외 상황](#6-오류-처리-및-예외-상황)
7. [명명 규칙 및 코딩 컨벤션](#7-명명-규칙-및-코딩-컨벤션)
8. [일반적인 오류 패턴 및 해결책](#8-일반적인-오류-패턴-및-해결책)
9. [베스트 프랙티스](#9-베스트-프랙티스)

## 1. OASIS 프레임워크 개요

### 1.1 기본 아키텍처
OASIS는 Camunda BPMN 엔진을 기반으로 하는 비즈니스 프로세스 실행 프레임워크입니다.

**핵심 특징:**
- BPMN 2.0 표준 준수
- Camunda Platform 7.15.0 기반
- 서비스 태스크를 통한 Java 클래스 실행
- 스크립트 태스크를 통한 SQL 직접 실행
- 멀티 인스턴스 루프를 통한 배치 처리

### 1.2 서비스 구조
```
src/main/resources/services/
├── core/           # 핵심 비즈니스 프로세스
│   ├── mtlprg/     # 자재 진행 관리
│   ├── moprg/      # 제조 오더 진행 관리
│   └── ordprg      # 주문 진행 관리
├── mpn/            # 생산 계획 관리
├── mpp/            # 생산 실적 관리
├── mqd/            # 품질 설계 관리
├── mlg/            # 물류 관리
└── mqm/            # 품질 관리
```

## 2. BPMN 서비스 기본 구조

### 2.1 표준 BPMN 헤더
모든 BPMN 파일은 다음과 같은 표준 헤더를 사용합니다:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions
    xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
    xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
    xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
    xmlns:camunda="http://camunda.org/schema/1.0/bpmn"
    xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:modeler="http://camunda.org/schema/modeler/1.0"
    id="Definitions_0llnb2d"
    targetNamespace="http://bpmn.io/schema/bpmn"
    exporter="Camunda Modeler"
    exporterVersion="4.12.0"
    modeler:executionPlatform="Camunda Platform"
    modeler:executionPlatformVersion="7.15.0">
```

### 2.2 프로세스 기본 구조
```xml
<bpmn:process id="Process_05xymvn" isExecutable="true">
  <bpmn:extensionElements>
    <camunda:properties>
      <camunda:property name="dto" value="패키지.클래스명" />
      <camunda:property name="input" value="입력파라미터명" />
    </camunda:properties>
  </bpmn:extensionElements>

  <!-- 시작 이벤트 -->
  <bpmn:startEvent id="StartEvent_1">
    <bpmn:outgoing>Flow_초기플로우</bpmn:outgoing>
  </bpmn:startEvent>

  <!-- 프로세스 요소들 -->

  <!-- 종료 이벤트 -->
  <bpmn:endEvent id="Event_종료">
    <bpmn:incoming>Flow_최종플로우</bpmn:incoming>
  </bpmn:endEvent>
</bpmn:process>
```

## 3. 서비스 설계 패턴

### 3.1 액션 기반 분기 패턴
OASIS에서 가장 일반적인 패턴으로, `action` 파라미터에 따라 처리 로직을 분기합니다.

```xml
<bpmn:exclusiveGateway id="Gateway_action" name="액션 판단">
  <bpmn:extensionElements>
    <camunda:properties>
      <camunda:property name="input" value="action" />
    </camunda:properties>
  </bpmn:extensionElements>
  <bpmn:incoming>Flow_from_start</bpmn:incoming>
  <bpmn:outgoing>Flow_save</bpmn:outgoing>
  <bpmn:outgoing>Flow_delete</bpmn:outgoing>
  <bpmn:outgoing>Flow_find</bpmn:outgoing>
</bpmn:exclusiveGateway>

<bpmn:sequenceFlow id="Flow_save" name="save"
    sourceRef="Gateway_action" targetRef="Activity_save" />
<bpmn:sequenceFlow id="Flow_delete" name="delete"
    sourceRef="Gateway_action" targetRef="Activity_delete" />
<bpmn:sequenceFlow id="Flow_find" name="find"
    sourceRef="Gateway_action" targetRef="Activity_find" />
```

### 3.2 상태 기반 전환 패턴
자재나 오더의 상태에 따라 다른 처리를 수행하는 패턴입니다.

```xml
<bpmn:exclusiveGateway id="Gateway_status" name="상태 판단">
  <bpmn:extensionElements>
    <camunda:properties>
      <camunda:property name="input" value="eventName" />
    </camunda:properties>
  </bpmn:extensionElements>
  <bpmn:incoming>Flow_status_check</bpmn:incoming>
  <bpmn:outgoing>Flow_warehousing</bpmn:outgoing>
  <bpmn:outgoing>Flow_input</bpmn:outgoing>
  <bpmn:outgoing>Flow_production</bpmn:outgoing>
</bpmn:exclusiveGateway>

<bpmn:sequenceFlow id="Flow_warehousing" name="라인입고"
    sourceRef="Gateway_status" targetRef="Activity_warehousing" />
<bpmn:sequenceFlow id="Flow_input" name="투입"
    sourceRef="Gateway_status" targetRef="Activity_input" />
```

### 3.3 배치 처리 패턴
멀티 인스턴스 루프를 사용한 배치 처리 패턴입니다.

```xml
<bpmn:subProcess id="SubProcess_batch" name="배치 처리">
  <bpmn:multiInstanceLoopCharacteristics
      isSequential="true"
      camunda:collection="saveRecords"
      camunda:elementVariable="saveRecord:패키지.DTO클래스명" />

  <bpmn:startEvent id="Event_batch_start">
    <bpmn:outgoing>Flow_batch_process</bpmn:outgoing>
  </bpmn:startEvent>

  <bpmn:serviceTask id="Activity_batch_item" name="개별 처리"
      camunda:class="패키지.클래스명#메서드명">
    <bpmn:incoming>Flow_batch_process</bpmn:incoming>
    <bpmn:outgoing>Flow_batch_end</bpmn:outgoing>
  </bpmn:serviceTask>

  <bpmn:endEvent id="Event_batch_end">
    <bpmn:incoming>Flow_batch_end</bpmn:incoming>
  </bpmn:endEvent>
</bpmn:subProcess>
```

## 4. 프로세스 요소별 가이드라인

### 4.1 서비스 태스크 (Service Task)

#### Java 클래스 실행
```xml
<bpmn:serviceTask id="Activity_java_service" name="자재 상태 변경"
    camunda:class="com.dongkuk.dmes.film.biz.mcm.mtm.Film#changeFilmPrgSts">
  <bpmn:extensionElements>
    <camunda:inputOutput>
      <camunda:inputParameter name="nextFilmPrgSts">G2</camunda:inputParameter>
    </camunda:inputOutput>
    <camunda:properties>
      <camunda:property name="output" value="mtlId" />
    </camunda:properties>
  </bpmn:extensionElements>
  <bpmn:incoming>Flow_input</bpmn:incoming>
  <bpmn:outgoing>Flow_output</bpmn:outgoing>
</bpmn:serviceTask>
```

#### 필수 속성
- `camunda:class`: 실행할 Java 클래스와 메서드 (클래스명#메서드명)
- `name`: 태스크의 의미를 나타내는 한글명
- `id`: 유니크한 태스크 식별자

#### 입출력 파라미터
- `camunda:inputParameter`: 메서드 실행 시 전달할 파라미터
- `camunda:property name="output"`: 결과값을 저장할 변수명

### 4.2 스크립트 태스크 (Script Task)

#### SQL 직접 실행
```xml
<bpmn:scriptTask id="Activity_sql_script" name="시험 대상 조회"
    scriptFormat="sql" camunda:resource="mqm.mqm01010.tstTarget">
  <bpmn:extensionElements>
    <camunda:properties>
      <camunda:property name="output" value="target" />
    </camunda:properties>
  </bpmn:extensionElements>
  <bpmn:incoming>Flow_input</bpmn:incoming>
  <bpmn:outgoing>Flow_output</bpmn:outgoing>
</bpmn:scriptTask>
```

#### 인라인 SQL 실행
```xml
<bpmn:scriptTask id="Activity_inline_sql" name="인라인 SQL" scriptFormat="sql">
  <bpmn:extensionElements>
    <camunda:properties>
      <camunda:property name="output" value="result" />
    </camunda:properties>
  </bpmn:extensionElements>
  <bpmn:incoming>Flow_input</bpmn:incoming>
  <bpmn:outgoing>Flow_output</bpmn:outgoing>
  <bpmn:script>
    SELECT '1' as "value", 'test' as "displayValue"
    FROM dual
    UNION ALL
    SELECT '2', 'example'
    FROM dual
  </bpmn:script>
</bpmn:scriptTask>
```

### 4.3 호출 활동 (Call Activity)

#### 서브 프로세스 호출
```xml
<bpmn:callActivity id="Activity_call_subprocess" name="상태 변경"
    calledElement="FilmProgressStatus">
  <bpmn:extensionElements>
    <camunda:inputOutput>
      <camunda:inputParameter name="eventName">투입</camunda:inputParameter>
    </camunda:inputOutput>
    <camunda:properties>
      <camunda:property name="input" value="mtlId" />
    </camunda:properties>
  </bpmn:extensionElements>
  <bpmn:incoming>Flow_input</bpmn:incoming>
  <bpmn:outgoing>Flow_output</bpmn:outgoing>
</bpmn:callActivity>
```

### 4.4 배타적 게이트웨이 (Exclusive Gateway)

#### 조건 분기
```xml
<bpmn:exclusiveGateway id="Gateway_condition" name="조건 판단">
  <bpmn:extensionElements>
    <camunda:properties>
      <camunda:property name="input" value="판단변수명" />
    </camunda:properties>
  </bpmn:extensionElements>
  <bpmn:incoming>Flow_input</bpmn:incoming>
  <bpmn:outgoing>Flow_condition_true</bpmn:outgoing>
  <bpmn:outgoing>Flow_condition_false</bpmn:outgoing>
</bpmn:exclusiveGateway>

<bpmn:sequenceFlow id="Flow_condition_true" name="조건만족"
    sourceRef="Gateway_condition" targetRef="Activity_true">
  <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">
    #root.getLineRstId().isEmpty() == true
  </bpmn:conditionExpression>
</bpmn:sequenceFlow>
```

## 5. 데이터 처리 방식

### 5.1 DTO 클래스 정의
프로세스 최상위에서 사용할 DTO 클래스를 정의합니다.

```xml
<bpmn:process id="Process_05xymvn" isExecutable="true">
  <bpmn:extensionElements>
    <camunda:properties>
      <camunda:property name="dto" value="com.dongkuk.dmes.film.biz.mpp.prg.dto.LineResultDto" />
    </camunda:properties>
  </bpmn:extensionElements>
```

### 5.2 멀티 인스턴스 처리
배치 데이터 처리를 위한 멀티 인스턴스 설정:

```xml
<bpmn:multiInstanceLoopCharacteristics
    isSequential="true"
    camunda:collection="saveRecords"
    camunda:elementVariable="saveRecord:com.dongkuk.dmes.film.biz.dto.TargetDto" />
```

**주요 속성:**
- `isSequential="true"`: 순차 처리 (병렬 처리는 "false")
- `camunda:collection`: 처리할 데이터 컬렉션 변수명
- `camunda:elementVariable`: 개별 요소를 참조할 변수명과 타입

### 5.3 타입 시스템
OASIS는 강타입 시스템을 사용합니다:

```xml
<camunda:inputParameter name="material">
  $type{com.dongkuk.dmes.film.biz.mcm.mtm.Material}
</camunda:inputParameter>
<camunda:inputParameter name="lineInput">
  $type{com.dongkuk.dmes.film.biz.mpp.prg.LineInput}
</camunda:inputParameter>
```

## 6. 오류 처리 및 예외 상황

### 6.1 오류 이벤트 정의
```xml
<bpmn:error id="Error_투입상태오류" name="투입상태 오류"
    camunda:errorMessage="투입상태가 아닙니다." />
<bpmn:error id="Error_라인불일치" name="라인불일치"
    camunda:errorMessage="투입라인과 자재의 라인이 다릅니다." />
```

### 6.2 오류 종료 이벤트
```xml
<bpmn:endEvent id="Event_error_end">
  <bpmn:extensionElements>
    <camunda:properties>
      <camunda:property name="input" value="mtlId,eventName" />
    </camunda:properties>
  </bpmn:extensionElements>
  <bpmn:incoming>Flow_error</bpmn:incoming>
  <bpmn:errorEventDefinition id="ErrorEventDefinition_투입상태오류"
      errorRef="Error_투입상태오류" />
</bpmn:endEvent>
```

### 6.3 조건부 오류 처리
```xml
<bpmn:sequenceFlow id="Flow_error_condition" name="투입상태 오류"
    sourceRef="Activity_check" targetRef="Event_error_end">
  <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">
    #root == false
  </bpmn:conditionExpression>
</bpmn:sequenceFlow>
```

## 7. 명명 규칙 및 코딩 컨벤션

### 7.1 ID 명명 규칙

#### 프로세스 요소 ID
- **StartEvent**: `StartEvent_1`, `Event_start_process`
- **EndEvent**: `Event_end_success`, `Event_error_end`
- **ServiceTask**: `Activity_서비스명`, `Activity_자재상태변경`
- **ScriptTask**: `Activity_스크립트명`, `Activity_데이터조회`
- **Gateway**: `Gateway_분기조건`, `Gateway_action_판단`
- **CallActivity**: `Activity_call_프로세스명`

#### 시퀀스 플로우 ID
- **기본 플로우**: `Flow_순차번호` (Flow_1, Flow_2, ...)
- **조건 플로우**: `Flow_조건명` (Flow_save, Flow_delete, Flow_error)

### 7.2 이름(name) 명명 규칙
- **한글 사용**: 비즈니스 의미를 명확히 표현
- **간결성**: 10자 이내 권장
- **일관성**: 동일한 개념은 동일한 용어 사용

**예시:**
- "자재 상태 변경", "투입 실적 등록", "검사 결과 조회"

### 7.3 패키지 및 클래스 명명
OASIS에서 사용하는 표준 패키지 구조:

```
com.dongkuk.dmes.film.biz.
├── mcm.mtm.*        # 자재 관리 (Material Management)
├── mpn.sch.*        # 생산 계획 (Production Schedule)
├── mpp.prg.*        # 생산 실적 (Production Progress)
├── mqd.dsn.*        # 품질 설계 (Quality Design)
└── mqm.*            # 품질 관리 (Quality Management)
```

## 8. 일반적인 오류 패턴 및 해결책

### 8.1 ID 중복 오류
```xml
<!-- 잘못된 예: 동일한 ID 사용 -->
<bpmn:serviceTask id="Activity_1" name="첫번째 태스크" />
<bpmn:serviceTask id="Activity_1" name="두번째 태스크" />  <!-- 오류! -->
```

```xml
<!-- 올바른 예: 유니크한 ID 사용 -->
<bpmn:serviceTask id="Activity_first_task" name="첫번째 태스크" />
<bpmn:serviceTask id="Activity_second_task" name="두번째 태스크" />
```

### 8.2 플로우 연결 오류
```xml
<!-- 잘못된 예: 잘못된 sourceRef/targetRef -->
<bpmn:sequenceFlow id="Flow_1" sourceRef="NonExistentElement" targetRef="Activity_1" />
```

```xml
<!-- 올바른 예: 정확한 요소 참조 -->
<bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="Activity_1" />
```

### 8.3 속성 누락 오류

#### 필수 속성 누락
```xml
<!-- 잘못된 예: 필수 속성 누락 -->
<bpmn:serviceTask id="Activity_service" name="서비스 태스크">
  <!-- camunda:class 속성 누락 -->
</bpmn:serviceTask>
```

```xml
<!-- 올바른 예: 필수 속성 포함 -->
<bpmn:serviceTask id="Activity_service" name="서비스 태스크"
    camunda:class="com.package.ClassName#methodName">
</bpmn:serviceTask>
```

### 8.4 멀티 인스턴스 설정 오류
```xml
<!-- 잘못된 예: 타입 정보 누락 -->
<bpmn:multiInstanceLoopCharacteristics
    camunda:collection="records"
    camunda:elementVariable="record" />  <!-- 타입 정보 없음 -->
```

```xml
<!-- 올바른 예: 완전한 타입 정보 -->
<bpmn:multiInstanceLoopCharacteristics
    isSequential="true"
    camunda:collection="saveRecords"
    camunda:elementVariable="saveRecord:com.package.DTO" />
```

## 9. 베스트 프랙티스

### 9.1 프로세스 설계 원칙

#### 단일 책임 원칙
각 서비스는 하나의 명확한 비즈니스 목적을 가져야 합니다.

```xml
<!-- 좋은 예: 명확한 단일 목적 -->
<bpmn:process id="MaterialStatusChange" name="자재 상태 변경">
  <!-- 자재 상태 변경만을 담당하는 프로세스 -->
</bpmn:process>
```

#### 재사용성 고려
공통 로직은 별도의 서브 프로세스로 분리합니다.

```xml
<!-- 공통 상태 변경 로직을 별도 프로세스로 분리 -->
<bpmn:callActivity id="Activity_status_change"
    calledElement="FilmProgressStatus">
  <bpmn:extensionElements>
    <camunda:inputOutput>
      <camunda:inputParameter name="eventName">투입</camunda:inputParameter>
    </camunda:inputOutput>
  </bpmn:extensionElements>
</bpmn:callActivity>
```

### 9.2 데이터 흐름 관리

#### 명시적 입출력 정의
모든 서비스 태스크는 명확한 입출력을 정의해야 합니다.

```xml
<bpmn:serviceTask id="Activity_material_create" name="자재 생성"
    camunda:class="com.dongkuk.dmes.film.biz.mcm.mtm.Material#divideMaterial">
  <bpmn:extensionElements>
    <camunda:inputOutput>
      <!-- 입력 파라미터 명시 -->
      <camunda:inputParameter name="parentMaterial">
        $type{com.dongkuk.dmes.film.biz.mcm.mtm.Material}
      </camunda:inputParameter>
    </camunda:inputOutput>
    <camunda:properties>
      <!-- 출력 변수 명시 -->
      <camunda:property name="output" value="newMtlId" />
    </camunda:properties>
  </bpmn:extensionElements>
</bpmn:serviceTask>
```

### 9.3 오류 처리 전략

#### 예상 가능한 오류 사전 정의
비즈니스 로직에서 발생할 수 있는 오류를 사전에 정의합니다.

```xml
<!-- 프로세스 하단에 오류 정의 -->
<bpmn:error id="Error_투입상태오류" name="투입상태 오류"
    camunda:errorMessage="자재가 투입 가능한 상태가 아닙니다." />
<bpmn:error id="Error_라인불일치" name="라인불일치"
    camunda:errorMessage="투입 라인과 자재의 현재 라인이 일치하지 않습니다." />
<bpmn:error id="Error_권한부족" name="권한부족"
    camunda:errorMessage="해당 작업을 수행할 권한이 없습니다." />
```

### 9.4 성능 최적화

#### 배치 처리 활용
대량 데이터 처리 시 멀티 인스턴스를 활용합니다.

```xml
<bpmn:subProcess id="SubProcess_batch_processing" name="배치 처리">
  <bpmn:multiInstanceLoopCharacteristics
      isSequential="true"
      camunda:collection="dataList"
      camunda:elementVariable="data:com.package.DataDTO" />

  <!-- 개별 처리 로직 -->
  <bpmn:serviceTask id="Activity_process_item" name="개별 데이터 처리"
      camunda:class="com.package.ProcessorClass#processItem" />
</bpmn:subProcess>
```

#### SQL 최적화
스크립트 태스크의 SQL은 성능을 고려하여 작성합니다.

```xml
<bpmn:scriptTask id="Activity_optimized_query" name="최적화된 조회"
    scriptFormat="sql" camunda:resource="module.service.optimizedQuery">
  <!-- 인덱스를 고려한 WHERE 조건 -->
  <!-- 필요한 컬럼만 SELECT -->
  <!-- 적절한 JOIN 사용 -->
</bpmn:scriptTask>
```

### 9.5 문서화 및 주석

#### 프로세스 문서화
복잡한 비즈니스 로직은 documentation 요소를 활용합니다.

```xml
<bpmn:serviceTask id="Activity_complex_logic" name="복잡한 로직 처리"
    camunda:class="com.package.ComplexProcessor#process">
  <bpmn:documentation>
    이 태스크는 다음과 같은 복잡한 비즈니스 로직을 처리합니다:
    1. 자재의 현재 상태를 확인
    2. 투입 가능 여부를 검증
    3. 라인 호환성을 체크
    4. 상태 변경 및 이력 기록

    주의사항:
    - 투입 상태가 아닌 자재는 처리 불가
    - 라인 코드 불일치 시 오류 발생
  </bpmn:documentation>
</bpmn:serviceTask>
```

### 9.6 테스트 고려사항

#### 테스트 친화적 설계
Mock 객체 사용을 고려한 설계를 합니다.

```xml
<bpmn:serviceTask id="Activity_testable_service" name="테스트 가능한 서비스"
    camunda:class="com.package.TestableService#execute">
  <bpmn:documentation>
    BPMN 테스트 시 Mock 객체 사용 예시:

    TestableService mockService = mock(TestableService.class);
    when(mockService.execute(any())).thenReturn(expectedResult);

    Map&lt;String, Object&gt; mockMap = new HashMap&lt;&gt;();
    mockMap.put(TestableService.class.getName(), mockService);

    // 테스트 실행 시 Mock 객체가 우선 사용됩니다.
  </bpmn:documentation>
</bpmn:serviceTask>
```

## 추가 고려사항

### 버전 관리
- BPMN 파일은 git과 같은 VCS로 관리
- 프로세스 변경 시 이전 버전과의 호환성 고려
- 점진적 배포를 위한 버전 관리 전략 수립

### 모니터링
- 프로세스 실행 모니터링을 위한 로깅 포인트 설정
- 성능 측정을 위한 메트릭 수집 지점 정의
- 비즈니스 KPI 측정을 위한 이벤트 포인트 설정

### 보안
- 민감한 데이터 처리 시 암호화 고려
- 사용자 권한 체크 로직 포함
- 감사 추적을 위한 로그 기록

이 가이드를 따라 OASIS 프레임워크에서 표준화되고 안정적인 BPMN 서비스를 설계할 수 있습니다.
