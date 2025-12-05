MARU : 코드와 룰을 관리 업무 정의
# MARU Header(TB_MR_HEAD)
 - # 마루ID
 - # VERSION : 처음 시작은 0, 변경이 있을때 마다 1 증가
 - 마루명
 - 마루 상태(CREATED, INUSE, DEPRECATED)
 - 마루 타입(CODE, RULE)
 - 데이터 우선순위 사용 여부 (Y/N)
 - 레코드 시작일시(시작일시, 변경 시작일)
 - 레코드 종료일시(종료일시, 기본값은 9999년도 12월 31일 23시 59초)
  
# Code 관리
## MARU CODE CATEGORY(TB_MR_CODE_CATE)
 - # 마루ID(FK)
 - # 카테코리 ID
 - # VERSION : 처음 시작은 0, 변경이 있을때 마다 1 증가
 - 카테고리명
 - 코드 타입 : Normal:코드를 콤마로 구분하여 하나의 스트링으로 정의, RegEx(정규식)
 - 코드 정의
   1. 예1 Normal : 1P,82,83,84,85,91,92
   2. 예2 RegEx : (1P|8.|9.)
 - 레코드 시작일시(시작일시, 변경 시작일)
 - 레코드 종료일시(종료일시, 기본값은 9999년도 12월 31일 23시 59초)
  
## MARU CODE BASE(TB_MR_CODE_BASE)
 - # 마루ID(FK)
 - # 코드
 - # VERSION
 - 코드 명(default)
 - 순번
 - Alter 코드 명1
 - Alter 코드 명2
 - Alter 코드 명3
 - Alter 코드 명4
 - Alter 코드 명5
 - 레코드 시작일시(시작일시, 변경 시작일)
 - 레코드 종료일시(종료일시)

# Maru RULE
## MARU RULE 변수(TB_MR_RULE_VAR)
 - # 마루ID(FK)
 - # VARIABLE TYPE : OP(조건) / RSLT(결과)
 - # VARIABLE POSITION : 변수 위치 (조건/결과가 대상 레코드의 몇번째 칼럼인지 정의, OP와 RSLT 각각 순서 정의)
 - # VERSION 
 - DISPLAY 순서 : 관리를 위한 룰을 표형태로 표현했을 때 화면에 출력되는 컬럼의 순서(VARIABLE POSITION와 다름)
 - VARIABLE NAME : 변수 이름
 - VARIABLE DATA TYPE : String / Number / Boolean
 - VARIABLE TYPE(VARIABLE TYPE이 CONDITION(조건)인 경우 활성화)
	1. Equal : OPRL 보이고 정확하게 일치(단순 값 비교), OP, OPRR 값 무시
	2. One(VARIABLE TYPE이 OP인 경우만 해당) : OP, OPRL만 보임
	3. Two(VARIABLE TYPE이 OP인 경우만 해당) : OP, OPRL, OPRR 칼럼 모두 보임
 - SCALE : Number형인 경우 소수점
 - 레코드 시작일시(시작일시, 변경 시작일)
 - 레코드 종료일시(종료일시, 기본값은 9999년도 12월 31일 23시 59초)

## MARU RULE RECORD(TB_MR_RULE_RECORD)
 - # 마루ID(FK)
 - # RECORD ID : 마루ID + '_' + 랜덤문자열
 - 우선순위 
 - 설명(DESCRIPTION)
 - OP_1
 - OPRL_1
 - OPRR_1
 ...
 - OP_20
 - OPRL_20
 - OPRR_20
 - RSLT_1
 ...
 - RSLT_20
 - 레코드 시작일시(시작일시, 변경 시작일) 
 - 레코드 종료일시(종료일시, 기본값은 9999년도 12월 31일 23시 59초)
 
# 공통 적용 방법
## 모든 테이블은 선분 이력으로 관리
 - INUSE 상태에서는 수정할 때마다 레코드를 종료하고 신규 레코드를 생성한다.
 - 이전 수정대상 레코드의 종료일시에 입력받은 적용일시를 업데이트한다.
 - 신규 레코드를 생성하고 모든 값을 복사하되 시작일시는 적용일시로 버전은 1증가한다.
## 테이블 관계
 - `MARU Header(TB_MR_HEAD)`가 부모 테이블이다.
 - `MARU CODE CATEGORY(TB_MR_CODE_CATE)`의 코드 정의 컬럼은 `MARU CODE BASE(TB_MR_CODE_BASE)`의 코드에 정의 되어 있어야 한다.
 - `MARU RULE 변수(TB_MR_RULE_VAR)`는 `MARU RULE RECORD(TB_MR_RULE_RECORD)`의 설명하는 테이블이다.


## 기타
  - 레코드 시작일은 Date 형이며 NOT NULL 이다. 디폴트 값은 현재 시각이다.
  - 레코드 종료일은 Date 형이며 NOT NULL 이다. 디폴트 값은 표현 가능한 가장 큰 날짜 값이다.
  - 각 테이블은 모두 (레코드 종료일, 레코드 시작일, 마루ID) 인덱스를 가진다.
  - `MARU RULE 변수`테이블 조건에서 Expression은 Boolean 형만 가능(조건은 참/거짓만 됨)
  - `MARU RULE 변수`테이블 결과에서 Expression은 모두 가능(문자열 조작도 가능)
  - `MARU RULE 변수 (TB_MR_RULE_VAR)` 테이블에서 (마루ID, VERSION, VARIABLE NAME)의 UK가 필요
  - `MARU RULE RECORD(TB_MR_RULE_RECORD)` 테이블은 OP, OPRL, OPRR, RSLT 항목은 뒤에 첨자를 붙여서 20개씩 존재(예 OP_1, OPRL_1, OPRR_1, RSLT_1)
  - MARU Header의 마루 상태에 따른 레코드 업데이트 처리 방법
    1. CREATED : 수정이 자유롭다.
	2. INUSE : 기존 레코드를 종료(종료일시에 종료시점 적용)하고 신규 레코드 생성(시작일시는 기존 레코드의 종료시점 + 1초, 종료일시는 표현 가능한 가증 큰 일시)
	3. DEPRECATED : 모든 수정 불가


# 참고 `MARU RULE RECORD(TB_MR_RULE_RECORD)`의 OP 종류
 - =
 - !=
 - <
 - >
 - <=
 - >=
 - BETWEEN : OPRL <= 비교값 <= OPRR
 - IN : 콤마로 구분된 스트링에서 INSTR() 함수로 검색
 - NOT_IN : 콤마로 구분된 스트링에서 INSTR() 함수로 검색해서 못찾으면 참
 - NOT_CHECK : 조건을 체크 하지 않음
 - SCRIPT : 자바스크립트 수행결과
	
## TODO
  - Decision Tree 형태의 자유로운 룰 처리를 위한 자료 구조 추가