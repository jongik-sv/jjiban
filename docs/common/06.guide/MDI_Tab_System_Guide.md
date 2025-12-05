# Nexacro N V24 MDI 탭 시스템 가이드

## 목차
1. [개요](#1-개요)
2. [시스템 구조](#2-시스템-구조)
3. [구현 패턴](#3-구현-패턴)
4. [전역 함수 API](#4-전역-함수-api)
5. [사용 예제](#5-사용-예제)
6. [베스트 프랙티스](#6-베스트-프랙티스)
7. [트러블슈팅](#7-트러블슈팅)

---

## 1. 개요

### 1.1 MDI(다중 문서 인터페이스)란?
- 하나의 애플리케이션 내에서 여러 문서(화면)를 동시에 열 수 있는 인터페이스
- 탭 형태로 화면을 관리하여 사용자 경험 향상

### 1.2 주요 기능
- ✅ 메뉴 클릭 시 새 탭 자동 추가
- ✅ 중복 탭 방지 (동일 메뉴 클릭 시 기존 탭 활성화)
- ✅ 탭 닫기 (X 버튼, 현재 탭 닫기, 모든 탭 닫기)
- ✅ 탭 전환 시 폼 자동 로드
- ✅ 홈 버튼으로 시작 페이지 이동
- ✅ 탭 목록 팝업 표시
- ✅ 탭 새로고침 기능

---

## 2. 시스템 구조

### 2.1 파일 구조
```
nexacro/
├── FrameBase/
│   ├── Form_Tab.xfdl          # 탭 관리 프레임 (핵심)
│   ├── Form_Work.xfdl         # 작업 영역 (폼 표시)
│   └── Form_Left.xfdl         # 좌측 메뉴 (메뉴 버튼)
└── _lib/
    └── gfn_menu.xjs           # 메뉴 관련 전역 함수
```

### 2.2 컴포넌트 구조

**Form_Tab.xfdl**
```
┌─────────────────────────────────────────────────────┐
│ [🏠] [탭1] [탭2] [탭3] ...  [☰][↻][✕][⌦]            │
└─────────────────────────────────────────────────────┘
│   │
│   └─ Tab 컴포넌트 (tab_work)
│      - Tabpage 동적 추가/제거
│      - showextrabutton="true" (X 버튼 표시)
│
└─ Dataset (ds_tab_list)
   - TAB_ID: 탭 고유 ID
   - MENU_ID: 메뉴 ID
   - MENU_NM: 메뉴명
   - FORM_URL: 폼 URL
   - TAB_INDEX: 탭 인덱스
```

### 2.3 데이터 흐름
```
메뉴 클릭 (Form_Left)
    ↓
app.gv_TabFrame.fnAddTab(menuId, menuNm, formUrl)
    ↓
중복 체크 (fnFindTab)
    ↓
    ├─ 중복 O → 기존 탭 활성화
    └─ 중복 X → 새 탭 추가
              ↓
          tab_work.insertTabpage()
              ↓
          ds_tab_list.addRow()
              ↓
          fnLoadFormToWorkFrame(formUrl)
              ↓
          WorkFrame.set_formurl(formUrl)
```

---

## 3. 구현 패턴

### 3.1 탭 추가 기본 패턴

**메뉴 버튼 클릭 이벤트 (Form_Left.xfdl)**
```javascript
this.btn_menu_onclick = function(obj, e)
{
    var menuId = obj.id.replace("btn_", "");
    var menuText = obj.text;
    var formUrl = "";

    // 메뉴별 폼 URL 매핑
    switch(menuId) {
        case "MR0100":
            formUrl = "MR::MR0100.xfdl";
            break;
        // ...
    }

    // 탭 추가
    var app = nexacro.getApplication();
    if (app && app.gv_TabFrame) {
        app.gv_TabFrame.fnAddTab(menuId, menuText, formUrl);
    }
};
```

### 3.2 탭 추가 함수 (Form_Tab.xfdl)

```javascript
this.fnAddTab = function(menuId, menuNm, formUrl)
{
    // 1. 중복 체크
    var existIndex = this.fnFindTab(menuId);
    if (existIndex >= 0) {
        this.tab_work.set_tabindex(existIndex);
        return;
    }

    // 2. 새 탭 추가
    var tabId = "tab_" + String(menuId);
    var insertIndex = this.tab_work.getTabpageCount();

    this.tab_work.insertTabpage(tabId, insertIndex);

    var tabpage = this.tab_work.getTabpage(insertIndex);
    tabpage.set_text(String(menuNm));

    // 3. 데이터셋에 저장
    var nRow = this.ds_tab_list.addRow();
    this.ds_tab_list.setColumn(nRow, "TAB_ID", tabpage.name);
    this.ds_tab_list.setColumn(nRow, "MENU_ID", String(menuId));
    this.ds_tab_list.setColumn(nRow, "MENU_NM", String(menuNm));
    this.ds_tab_list.setColumn(nRow, "FORM_URL", String(formUrl));
    this.ds_tab_list.setColumn(nRow, "TAB_INDEX", insertIndex);

    // 4. 새 탭으로 이동
    this.tab_work.set_tabindex(insertIndex);

    // 5. 폼 로드
    this.fnLoadFormToWorkFrame(formUrl);
};
```

### 3.3 중복 탭 체크 패턴

```javascript
this.fnFindTab = function(menuId)
{
    for (var i = 0; i < this.ds_tab_list.rowcount; i++) {
        if (this.ds_tab_list.getColumn(i, "MENU_ID") == menuId) {
            return this.ds_tab_list.getColumn(i, "TAB_INDEX");
        }
    }
    return -1;
};
```

### 3.4 탭 닫기 패턴

```javascript
this.fnCloseTab = function(tabIndex)
{
    if (tabIndex == 0) {
        // 홈 탭은 닫을 수 없음
        return;
    }

    var tabpage = this.tab_work.getTabpage(tabIndex);
    if (!tabpage) return;

    var tabId = tabpage.name;

    // 1. 데이터셋에서 제거
    var nRow = this.ds_tab_list.findRow("TAB_ID", tabId);
    if (nRow >= 0) {
        this.ds_tab_list.deleteRow(nRow);
    }

    // 2. 탭 제거
    this.tab_work.removeTabpage(tabIndex);

    // 3. 탭 인덱스 재정렬
    this.fnUpdateTabIndexes();

    // 4. 이전 탭으로 이동
    var newIndex = Math.max(0, tabIndex - 1);
    this.tab_work.set_tabindex(newIndex);
};
```

---

## 4. 전역 함수 API

### 4.1 gfn_openMenu()

**설명**: 메뉴를 열고 탭을 추가합니다.

**문법**:
```javascript
gfn_openMenu(menuId, menuNm, formUrl)
```

**파라미터**:
- `menuId` (String): 메뉴 ID (중복 체크 키)
- `menuNm` (String): 메뉴명 (탭 제목)
- `formUrl` (String): 폼 URL (패키지::파일명.xfdl)

**반환값**: Boolean (성공 여부)

**예제**:
```javascript
gfn_openMenu("MR0100", "마루 헤더 관리", "MR::MR0100.xfdl");
```

---

### 4.2 gfn_getCurrentTab()

**설명**: 현재 활성화된 탭 정보를 가져옵니다.

**문법**:
```javascript
var currentTab = gfn_getCurrentTab();
```

**반환값**: Object
```javascript
{
    tabId: "tab_MR0100",
    menuId: "MR0100",
    menuNm: "마루 헤더 관리",
    formUrl: "MR::MR0100.xfdl",
    tabIndex: 1
}
```

**예제**:
```javascript
var currentTab = gfn_getCurrentTab();
if (currentTab) {
    trace("현재 탭: " + currentTab.menuNm);
}
```

---

### 4.3 gfn_getAllTabs()

**설명**: 모든 열린 탭 목록을 가져옵니다.

**문법**:
```javascript
var allTabs = gfn_getAllTabs();
```

**반환값**: Array of Objects
```javascript
[
    { tabId: "default_tab", menuId: "HOME", menuNm: "홈", ... },
    { tabId: "tab_MR0100", menuId: "MR0100", menuNm: "마루 헤더 관리", ... },
    ...
]
```

**예제**:
```javascript
var allTabs = gfn_getAllTabs();
trace("열린 탭 개수: " + allTabs.length);
```

---

### 4.4 gfn_closeTab()

**설명**: 특정 탭을 닫습니다.

**문법**:
```javascript
gfn_closeTab(menuId)
```

**파라미터**:
- `menuId` (String): 닫을 메뉴 ID

**반환값**: Boolean (성공 여부)

**예제**:
```javascript
gfn_closeTab("MR0100");
```

---

### 4.5 gfn_goHome()

**설명**: 홈 탭으로 이동합니다.

**문법**:
```javascript
gfn_goHome();
```

**반환값**: Boolean (성공 여부)

**예제**:
```javascript
gfn_goHome();
```

---

## 5. 사용 예제

### 5.1 메뉴 버튼에서 탭 열기

```javascript
// Form_Left.xfdl의 버튼 클릭 이벤트
this.btn_MR0100_onclick = function(obj, e)
{
    gfn_openMenu("MR0100", "마루 헤더 관리", "MR::MR0100.xfdl");
};
```

### 5.2 동적으로 탭 열기

```javascript
// 특정 조건에 따라 탭 열기
if (condition) {
    gfn_openMenu("MR0200", "마루 현황 조회", "MR::MR0200.xfdl");
}
```

### 5.3 현재 탭 정보 활용

```javascript
// 현재 탭에 따라 다른 처리
var currentTab = gfn_getCurrentTab();
if (currentTab && currentTab.menuId == "MR0100") {
    // MR0100 화면에서만 실행할 로직
    this.fn_specialFunction();
}
```

### 5.4 모든 탭 순회

```javascript
// 모든 열린 탭 순회
var allTabs = gfn_getAllTabs();
for (var i = 0; i < allTabs.length; i++) {
    trace("탭 " + i + ": " + allTabs[i].menuNm);
}
```

### 5.5 조건부 탭 닫기

```javascript
// 특정 조건에서 탭 자동 닫기
if (saveSuccess) {
    gfn_closeTab("MR0100");
    gfn_goHome();
}
```

---

## 6. 베스트 프랙티스

### 6.1 메뉴 ID 네이밍 규칙

**권장**:
- `MR0100`, `MR0200` (모듈 + 번호)
- `CD0100`, `RL0100` (카테고리 + 번호)

**이유**: 중복 체크 키로 사용되므로 고유해야 함

### 6.2 폼 URL 형식

**권장**:
- `패키지::파일명.xfdl` (예: `MR::MR0100.xfdl`)

**이유**: Nexacro 표준 경로 형식

### 6.3 전역 변수 설정

**Form_Tab.xfdl의 onload**:
```javascript
this.Form_Tab_onload = function(obj, e)
{
    // 전역 변수 설정 (필수)
    nexacro.getApplication().gv_TabFrame = this;
};
```

**Form_Work.xfdl의 onload**:
```javascript
this.Form_Work_onload = function(obj, e)
{
    // 전역 변수 설정 (필수)
    nexacro.getApplication().gv_WorkFrame = this;
};
```

### 6.4 에러 처리

```javascript
this.fnAddTab = function(menuId, menuNm, formUrl)
{
    try {
        // 탭 추가 로직
        trace("✅ 탭 추가 성공: " + menuId);
    } catch (e) {
        trace("❌ 탭 추가 오류: " + e.message);
        trace("스택: " + e.stack);
    }
};
```

### 6.5 로그 활용

```javascript
// trace를 활용한 디버깅
trace("=== 탭 추가 시작 ===");
trace("menuId: " + menuId);
trace("menuNm: " + menuNm);
trace("formUrl: " + formUrl);
```

---

## 7. 트러블슈팅

### 7.1 "TabFrame을 찾을 수 없습니다" 오류

**원인**: `app.gv_TabFrame`이 설정되지 않음

**해결**:
```javascript
// Form_Tab.xfdl의 onload에서 전역 변수 설정
this.Form_Tab_onload = function(obj, e)
{
    nexacro.getApplication().gv_TabFrame = this;
};
```

---

### 7.2 탭 전환 시 폼이 로드되지 않음

**원인**: `WorkFrame` 경로가 잘못됨

**해결**:
```javascript
// fnGetWorkFrame()에서 동적으로 WorkFrame 탐색
this.fnGetWorkFrame = function()
{
    var app = nexacro.getApplication();
    if (app.gv_WorkFrame) {
        return app.gv_WorkFrame;
    }
    // 경로 탐색 로직...
};
```

---

### 7.3 중복 탭이 계속 추가됨

**원인**: `fnFindTab()`에서 menuId를 찾지 못함

**해결**:
- Dataset에 menuId가 정확히 저장되었는지 확인
- menuId 타입 일치 확인 (String 변환)

```javascript
this.ds_tab_list.setColumn(nRow, "MENU_ID", String(menuId));
```

---

### 7.4 탭 닫기 후 인덱스 오류

**원인**: 탭 인덱스가 재정렬되지 않음

**해결**:
```javascript
this.fnUpdateTabIndexes = function()
{
    for (var i = 0; i < this.ds_tab_list.rowcount; i++) {
        this.ds_tab_list.setColumn(i, "TAB_INDEX", i + 1);
    }
};
```

---

### 7.5 홈 탭이 닫힘

**원인**: 탭 닫기 로직에서 홈 탭 체크 누락

**해결**:
```javascript
this.fnCloseTab = function(tabIndex)
{
    if (tabIndex == 0) {
        trace("⚠️ 홈 탭은 닫을 수 없습니다");
        return;
    }
    // ...
};
```

---

## 8. 추가 개선 아이디어

### 8.1 탭 아이콘 추가
- 메뉴별 아이콘 설정
- `tabpage.set_icon()` 활용

### 8.2 탭 최대 개수 제한
- 성능을 위해 최대 10개 제한
- 초과 시 경고 메시지

### 8.3 탭 히스토리 저장
- 탭 열기/닫기 이력 저장
- 세션 복원 기능

### 8.4 탭 정렬/이동
- 드래그 앤 드롭으로 탭 순서 변경
- 탭 위치 저장

### 8.5 탭별 상태 유지
- 각 탭마다 독립적인 ChildFrame 생성
- 탭 전환 시 이전 상태 유지

---

## 9. 참고 자료

- [Nexacro N V24 공식 문서](https://docs.tobesoft.com/developer_guide_nexacro_n_v24_ko/)
- [Tab 컴포넌트 가이드](https://docs.tobesoft.com/developer_guide_nexacro_n_v24_ko/e2d43d86b4fcf1b4)
- [ChildFrame 생성 예제](../Nexacro_Examples.md#122-childframe-생성하기)
- [LLM Nexacro 개발 가이드](./LLM_Nexacro_Development_Guide.md)

---

**문서 버전**: 1.0
**작성일**: 2025-10-01
**작성자**: Claude Code Agent
