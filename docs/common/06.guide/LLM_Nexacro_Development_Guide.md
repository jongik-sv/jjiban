# LLM Code Agent를 위한 Nexacro N UI 개발 가이드

본 문서는 LLM Code Agent가 Nexacro N V24 환경에서 오류 없이 UI 프로그램을 생성할 수 있도록 작성된 가이드입니다.

## 목차
1. [기본 구조 이해](#1-기본-구조-이해)
2. [필수 패턴 및 규칙](#2-필수-패턴-및-규칙)
3. [컴포넌트별 가이드라인](#3-컴포넌트별-가이드라인)
4. [스크립트 작성 규칙](#4-스크립트-작성-규칙)
5. [데이터셋 구성](#5-데이터셋-구성)
6. [일반적인 오류 패턴 및 해결책](#6-일반적인-오류-패턴-및-해결책)
7. [베스트 프랙티스](#7-베스트-프랙티스)

## 1. 기본 구조 이해

### 1.1 FDL 파일 구조
Nexacro N의 Form 파일(.xfdl)은 다음과 같은 기본 구조를 가집니다:

```xml
<?xml version="1.0" encoding="utf-8"?>
<FDL version="2.1">
  <Form id="formId" width="1280" height="670" titletext="화면제목" onload="fn_onload">
    <Layouts>
      <Layout height="670" width="1280" stepcount="0" mobileorientation="landscape">
        <!-- 컴포넌트들 -->
      </Layout>
    </Layouts>
    <Script type="xscript5.1"><![CDATA[
      // 자바스크립트 코드
    ]]></Script>
    <Objects>
      <!-- 데이터셋 정의 -->
    </Objects>
    <Bind>
      <!-- 데이터 바인딩 -->
    </Bind>
  </Form>
</FDL>
```

### 1.2 필수 속성
- **Form 태그**: `id`, `width`, `height`, `titletext`, `onload` 속성 필수
- **Layout 태그**: `height`, `width` 속성 필수
- **컴포넌트**: `id`, `taborder` 속성 필수

## 2. 필수 패턴 및 규칙

### 2.1 화면 표준 레이아웃
모든 화면은 다음과 같은 표준 레이아웃을 따라야 합니다:

```xml
<!-- 제목 영역 (필수) -->
<Div id="div_title" taborder="3" text="Div00" left="20" height="40" right="20" top="0">
  <Layouts>
    <Layout>
      <Edit id="edt_title" taborder="0" readonly="true" tabstop="false"
            value="화면제목" text="화면제목" width="250"
            cssclass="edi_WFHD_Title" height="27" left="0" top="10" textAlign="left"/>
      <Div id="div_topMenu" taborder="1" height="27"
           url="_com_div::commonTopButton.xfdl" text=""
           left="270" right="0" top="10"/>
    </Layout>
  </Layouts>
</Div>

<!-- 검색 조건 영역 -->
<Div id="div_search" taborder="0" text="Div00" left="20"
     top="div_title:10" height="43" right="20" cssclass="div_WFSA_Box">
  <Layouts>
    <Layout>
      <!-- 검색 조건 컴포넌트들 -->
    </Layout>
  </Layouts>
</Div>

<!-- 접기/펼치기 버튼 -->
<Button id="btn_fold" taborder="2" top="93" left="20" right="20"
        onclick="btn_fold_onclick" cssclass="btn_WFSA_Fold"
        tabstop="false" height="10"/>

<!-- 메인 컨텐츠 영역 -->
<Div id="div_main" taborder="1" left="20" top="btn_fold:5"
     text="" right="20" bottom="30">
  <Layouts>
    <Layout>
      <!-- 메인 컨텐츠 -->
    </Layout>
  </Layouts>
</Div>

<!-- 하단 상태바 (필수) -->
<Div id="div_bottom" taborder="4" left="20" height="20" right="20"
     bottom="0" cssclass="div_WF_Footer" tabstop="false"
     url="_com_div::commonBottomStatus.xfdl"/>
```

### 2.2 위치 지정 규칙

#### 절대 위치
```xml
left="20" top="10" width="100" height="21"
```

#### 상대 위치 (권장)
```xml
left="20" top="div_title:10" right="20" bottom="30"
```

#### 중요사항
- **절대 위치와 상대 위치 혼용 금지**: 한 컴포넌트에서 `width`와 `right`를 동시에 사용하면 안됨
- **올바른 예**: `left="20" right="20"` 또는 `left="20" width="100"`
- **잘못된 예**: `left="20" width="100" right="20"`

## 3. 컴포넌트별 가이드라인

### 3.1 Grid 컴포넌트

```xml
<Grid id="grd_main" taborder="1" left="0" top="25"
      binddataset="ds_main" right="0" bottom="20"
      autofittype="col" selecttype="row">
  <Formats>
    <Format id="default">
      <Columns>
        <Column size="30"/>   <!-- NO 컬럼 -->
        <Column size="30"/>   <!-- 체크박스 컬럼 -->
        <Column size="80"/>   <!-- 데이터 컬럼들 -->
      </Columns>
      <Rows>
        <Row size="48" band="head"/>  <!-- 헤더 -->
        <Row size="24"/>              <!-- 데이터 -->
      </Rows>
      <Band id="head">
        <Cell text="NO"/>
        <Cell col="1" text="선택"/>
        <Cell col="2" text="컬럼명"/>
      </Band>
      <Band id="body">
        <Cell text="expr:currow + 1"/>
        <Cell col="1" text="bind:CHK" edittype="checkbox"
              displaytype="checkboxcontrol" cssclass="cellBody_Rdo"/>
        <Cell col="2" text="bind:COLUMN_NAME"/>
      </Band>
    </Format>
  </Formats>
</Grid>
```

#### Grid 필수 속성
- `binddataset`: 연결할 데이터셋 명시
- `autofittype="col"`: 컬럼 자동 맞춤
- `selecttype`: "row", "cell", "multirow" 중 선택

### 3.2 Edit 컴포넌트

```xml
<!-- 일반 입력 필드 -->
<Edit id="edt_input" taborder="1" left="80" top="10"
      width="100" height="21" text="" maxlength="50"/>

<!-- 읽기 전용 라벨 -->
<Edit id="edt_label" taborder="0" left="10" top="10"
      height="21" cssclass="edi_WFSA_Label" value="라벨명"
      text="라벨명" enable="true" tabstop="false"
      readonly="true" width="60"/>

<!-- 제목용 -->
<Edit id="edt_title" taborder="0" left="0" top="0"
      width="100" height="21" cssclass="edi_WF_Title1"
      value="제목" text="제목" tabstop="false" readonly="true"/>
```

### 3.3 Combo 컴포넌트

```xml
<Combo id="cbo_select" taborder="1" left="80" top="10"
       width="100" height="21" text=""
       innerdataset="ds_codeList"
       codecolumn="CODE_VAL" datacolumn="CODE_NAME"
       index="-1" onitemchanged="cbo_select_onitemchanged"/>
```

### 3.4 Button 컴포넌트

```xml
<Button id="btn_search" taborder="1" text="조회"
        left="200" top="10" width="60" height="21"
        onclick="btn_search_onclick"/>
```

## 4. 스크립트 작성 규칙

### 4.1 기본 구조

```javascript
/**
*  @화면명  : formId.xfdl(화면제목)
*  @화면설명 : 화면 설명
*
************** 소스 수정 이력 *************************************************
*    date           Modifier            Description
*******************************************************************************
*  2024.01.01      개발자명    최초 생성
*******************************************************************************
*/

include "_lib::libInClude.xjs";

this.grd_row = -1;

// 폼 로드 이벤트
this.fn_onload = function(obj:nexacro.Form,e:nexacro.LoadEventInfo)
{
	this.gfn_formOnLoad(obj);
};

// 폼 로드 후 처리
this.fn_formAfterOnload = function()
{
	this.fn_button();
	// 초기 설정
};
```

### 4.2 필수 함수들

#### 버튼 생성 함수
```javascript
this.fn_button = function()
{
	this.div_title.form.div_topMenu.form.fn_commonTop_onload(this,
		new Array(["btn_custom","fn_custom", "사용자버튼","btn_WF_Point"]), // 사용자정의버튼
		new Array(["btn_search"], ["btn_save"], ["btn_close"])); // 기본버튼
};
```

#### 조회 함수
```javascript
this.fn_search = function(obj:nexacro.Button,e:nexacro.ClickEventInfo)
{
	var sSvcID        = "search";
	var sUrl          = "api/q/moduleName/methodName";
	var sInDatasets   = "ds_search=ds_search";
	var sOutDatasets  = "ds_main=resultDataset";
	var sArgument     = "";
	var sCallbackFunc = "fn_callBack";

	this.gfn_transaction(sSvcID, sUrl, sInDatasets, sOutDatasets, sArgument, sCallbackFunc);
};
```

#### 콜백 함수
```javascript
this.fn_callBack = function (strSvcId, nErrorCode, strErrorMsg)
{
	if(nErrorCode < 0) return false;

	switch(strSvcId)
	{
		case "search" :
			this.div_bottom.form.fn_commonBottomStatus_msg(this.ds_main.rowcount + " 건 조회 되었습니다.");
		    break;
		case "save" :
			this.fn_search(); // 저장 후 재조회
			break;
	}
};
```

#### 닫기 함수 (필수)
```javascript
this.fn_close = function(obj,e)
{
	var objApp = nexacro.getApplication();
	objApp.gv_AppTabPath.form.fn_closeForm();
};
```

#### 접기/펼치기 함수
```javascript
this.btn_fold_onclick = function(obj:nexacro.Button,e:nexacro.ClickEventInfo)
{
	this.gfn_fold(this, this.div_search, this.div_main, this.btn_fold);
};
```

## 5. 데이터셋 구성

### 5.1 기본 데이터셋 구조

```xml
<Dataset id="ds_main" onrowposchanged="ds_main_onrowposchanged">
  <ColumnInfo>
    <Column id="CHK" type="STRING" size="256"/>
    <Column id="COLUMN_NAME" type="STRING" size="256"/>
    <Column id="NUMBER_COLUMN" type="BIGDECIMAL" size="15"/>
    <Column id="DATE_COLUMN" type="DATE" size="8"/>
  </ColumnInfo>
  <Rows>
    <Row>
      <Col id="CHK">0</Col>
      <Col id="COLUMN_NAME">샘플데이터</Col>
    </Row>
  </Rows>
</Dataset>
```

### 5.2 데이터 타입 매핑
- **STRING**: 문자열 데이터
- **BIGDECIMAL**: 숫자 데이터
- **DATE**: 날짜 데이터
- **INT**: 정수 데이터

### 5.3 코드 데이터셋 예제

```xml
<Dataset id="ds_codeList">
  <ColumnInfo>
    <Column id="CODE_VAL" type="STRING" size="256"/>
    <Column id="CODE_NAME" type="STRING" size="256"/>
  </ColumnInfo>
  <Rows>
    <Row>
      <Col id="CODE_VAL">01</Col>
      <Col id="CODE_NAME">코드명1</Col>
    </Row>
    <Row>
      <Col id="CODE_VAL">02</Col>
      <Col id="CODE_NAME">코드명2</Col>
    </Row>
  </Rows>
</Dataset>
```

## 6. 일반적인 오류 패턴 및 해결책

### 6.1 레이아웃 오류

#### 문제: 위치 속성 충돌
```xml
<!-- 잘못된 예 -->
<Edit left="20" width="100" right="20"/>
```
```xml
<!-- 올바른 예 -->
<Edit left="20" width="100"/>
<!-- 또는 -->
<Edit left="20" right="20"/>
```

#### 문제: taborder 누락
```xml
<!-- 잘못된 예 -->
<Edit id="edt_input" left="20" top="10"/>
```
```xml
<!-- 올바른 예 -->
<Edit id="edt_input" taborder="1" left="20" top="10"/>
```

### 6.2 Grid 관련 오류

#### 문제: 데이터셋 바인딩 누락
```xml
<!-- 잘못된 예 -->
<Grid id="grd_main">
```
```xml
<!-- 올바른 예 -->
<Grid id="grd_main" binddataset="ds_main">
```

#### 문제: 컬럼과 데이터 불일치
```xml
<!-- Grid에 3개 컬럼이 있는데 데이터셋에 해당 컬럼이 없는 경우 -->
<Cell col="2" text="bind:MISSING_COLUMN"/>  <!-- 오류 발생 -->
```

### 6.3 스크립트 오류

#### 문제: 함수명 불일치
```javascript
// 잘못된 예: 버튼 onclick과 함수명 불일치
// onclick="btn_search_onclick" 인데 함수는 fn_search
```

#### 문제: 데이터셋 이벤트 함수 누락
```xml
<!-- onrowposchanged 이벤트가 있는데 함수가 없는 경우 -->
<Dataset id="ds_main" onrowposchanged="ds_main_onrowposchanged">
```

## 7. 베스트 프랙티스

### 7.1 명명 규칙

#### 컴포넌트 ID 규칙
- **Div**: `div_` + 용도 (예: `div_search`, `div_main`)
- **Grid**: `grd_` + 용도 (예: `grd_main`, `grd_detail`)
- **Edit**: `edt_` + 용도 (예: `edt_name`, `edt_title`)
- **Button**: `btn_` + 기능 (예: `btn_search`, `btn_save`)
- **Combo**: `cbo_` + 용도 (예: `cbo_status`, `cbo_type`)
- **Dataset**: `ds_` + 용도 (예: `ds_main`, `ds_search`)

#### 함수명 규칙
- **공통 함수**: `fn_` + 기능명 (예: `fn_search`, `fn_save`)
- **이벤트 함수**: 컴포넌트ID + `_` + 이벤트명 (예: `btn_search_onclick`)

### 7.2 코드 구조화

#### 스크립트 섹션 순서
1. 주석 헤더 (화면명, 설명, 수정이력)
2. include 문
3. 전역 변수
4. 생명주기 함수 (fn_onload, fn_formAfterOnload)
5. 화면 초기화 함수 (fn_button, fn_init)
6. 비즈니스 로직 함수 (fn_search, fn_save)
7. 이벤트 핸들러 함수
8. 유틸리티 함수

### 7.3 데이터 검증

#### 필수 입력 체크
```javascript
if(this.gfn_isNull(this.ds_search.getColumn(0, "SEARCH_KEY"))) {
    this.gfn_message("", "", "검색조건을 입력하세요.", "error", "", "");
    return false;
}
```

#### 날짜/시간 검증
```javascript
if(!this.gfn_isDate(this.ds_main.getColumn(i, 'START_DATE'))) {
    this.gfn_message("", "", "올바른 날짜를 입력하세요.", "error", "", "");
    return false;
}
```

### 7.4 성능 최적화

#### 이벤트 비활성화
```javascript
// 대량 데이터 처리 시
this.ds_main.set_enableevent(false);
// 데이터 처리
this.ds_main.set_enableevent(true);
```

#### 데이터셋 초기화
```javascript
// 조회 전 기존 데이터 정리
this.ds_main.clearData();
```

### 7.5 공통 함수 활용

#### 메시지 표시
```javascript
this.gfn_message("", "", "메시지내용", "info", "", "");
```

#### 확인 대화상자
```javascript
var fn_callback = function(FormId, rtn) {
    if(rtn) {
        // 확인 시 처리
    }
}
this.gfn_message("", "", "저장하시겠습니까?", "confirm", "확인", fn_callback);
```

## 주의사항

1. **인코딩**: 반드시 UTF-8 인코딩 사용
2. **XML 구조**: 모든 태그는 반드시 닫혀야 함
3. **스크립트 블록**: `<![CDATA[]]>` 내부에 자바스크립트 코드 작성
4. **이벤트 함수**: XML에서 선언한 이벤트 함수는 반드시 스크립트에 구현
5. **데이터셋 바인딩**: Grid의 bind 컬럼명은 데이터셋의 실제 컬럼과 일치해야 함
6. **CSS 클래스**: 프로젝트에서 정의된 CSS 클래스만 사용
7. **공통 함수**: `gfn_` 접두사 함수들은 프레임워크에서 제공하는 공통 함수

이 가이드를 따라 개발하면 Nexacro N 환경에서 안정적이고 표준화된 UI 프로그램을 생성할 수 있습니다.