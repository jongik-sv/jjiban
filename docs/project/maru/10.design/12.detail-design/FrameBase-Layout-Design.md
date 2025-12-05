# FrameBase 기본 프레임 설계 개요

**작성일:** 2025-09-26  
**작성자:** Codex  
**관련 폼:** `Form_LTop`, `Form_Left`, `Form_Work`, `Form_Bottom`

---

## 1. 목적

- Nexacro 기본 프레임 영역을 표준화하여 공통 UI 구조를 확립한다.
- 좌측 메뉴·작업 영역·상하단 상태 표시부 간 역할을 명확히 정의한다.

---

## 2. 시각 구조

```
┌───────────────────────────────────────────────┐
│ Form_Top                                      │
├───────────────┬───────────────────────────────┤
│ Form_Left     │ Form_Work (Tab Workspace)     │
│ ├ Form_LTop   │  ┌───────────────┐            │
│ └ Tree Menu   │  │ Tab1 │ + │ x │            │
│               │  └───────────────┘            │
├───────────────┴───────────────────────────────┤
│ Form_Bottom                                   │
└───────────────────────────────────────────────┘
```

- `Form_LTop`: 좌측 상단 사용자/환경 정보, 즐겨찾기 버튼.
- `Form_Left`: 메뉴 트리 + 검색 필드, `Form_LTop` 임베드.
- `Form_Work`: 탭 기반 작업 공간, 여러 화면 동시 오픈 지원.
- `Form_Bottom`: 시스템 상태, 버전, 서버·시간 표시.

---

## 3. 기능 요구

| 영역 | 기능 | 비고 |
|------|------|------|
| Form_LTop | 프로젝트 타이틀, 로그인 유저/환경 뱃지 표시 | 이후 Single-Sign-On 연동 시 확장 |
| Form_Left | 트리 메뉴 + 검색, 클릭 시 작업 탭 열기 | 메뉴 데이터셋 `MENU_ID`, `FORM_URL` 기준 |
| Form_Work | Tab Close 버튼, 중복 탭 방지, 기본 "홈" 탭 제공 | `openWorkPage()` API 노출 |
| Form_Bottom | 상태 메시지, 버전, 진행 중 업무 수 표시 | Timer 기반 갱신 (후속) |

---

## 4. 데이터 설계

### 4.1 메뉴 Dataset (`dsMenu`)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| MENU_ID | STRING | 메뉴 식별자 |
| MENU_NM | STRING | 표시명 |
| PARENT_ID | STRING | 상위 메뉴 |
| FORM_URL | STRING | 화면 경로 (`MR::MR0100.xfdl`) |
| LEVEL | INT | 트리 뎁스 |
| ORDER | INT | 정렬 순서 |

### 4.2 탭 상태 Dataset (`dsTabState`, 추후 도입)

| 컬럼 | 설명 |
|------|------|
| TAB_ID | 탭 식별자 (`MENU_ID`) |
| TAB_NM | 탭 제목 |
| FORM_URL | 로딩된 폼 경로 |
| ACTIVE | 선택 여부 |

---

## 5. 이벤트 흐름

1. `Form_Left` 트리 클릭 → 메뉴 데이터 추출.
2. `Form_Left` → Application 글로벌 `fnOpenWorkPage(menuId, menuNm, url)` 호출.
3. `Form_Work` 의 `openWorkPage` (등록 함수) 실행.
   - 기존 탭 여부 확인.
   - 신규 탭 생성 후 `Div` 에 대상 폼 로드.
   - 탭 선택.
4. 탭 닫기 이벤트 → `Form_Work` 가 탭 제거 및 리소스 해제.
5. `Form_Bottom` 은 최근 작업/시각/상태 메시지를 표시.

---

## 6. UI 세부 가이드

### 6.1 Form_LTop

- 높이 90px, 배경색 `#1F2A37`.
- Static(좌측) 프로젝트명, Static(우측) 사용자/환경.
- Button(즐겨찾기) 아이콘 (placeholder 텍스트).

### 6.2 Form_Left

- 상단 Div: `url="FrameBase::Form_LTop.xfdl"`, 높이 90px.
- 검색 Edit + Button 1열 배치.
- Tree(`trv_menu`): `treeinitstatus="expand,all"`, `textcolumn="MENU_NM"`.

### 6.3 Form_Work

- Tab(`tab_work`): `tabclosebutton="true"`, 기본 탭 `홈`.
- 탭 아이콘 없음, `showextrabutton=true` 로 빈 탭 추가 버튼 제공.
- 각 탭 내부 `Div` 가 실제 Form URL 로딩 담당.

### 6.4 Form_Bottom

- 좌측 Static: "MARU Platform" 고정 문구.
- 가운데 Static: 현재 시간 (후속 Timer 연동).
- 우측 Static: 버전/배포 정보 (전역 변수 활용).

---

## 7. 후속 과제

1. 메뉴 트리 데이터→Backend API 연동.
2. Form_Work 탭 상태 Dataset 도입.
3. Form_Bottom 실시간 상태(Queue, Job) 표시.
4. UX 검토 후 색상/spacing 확정.

---

본 설계를 기반으로 각 xfdl 파일 구현을 진행한다.
