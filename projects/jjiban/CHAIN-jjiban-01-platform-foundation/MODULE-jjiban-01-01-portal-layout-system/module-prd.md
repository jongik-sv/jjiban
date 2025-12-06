# Module PRD: Portal & Layout System

## 문서 정보

| 항목 | 내용 |
|------|------|
| Module ID | MODULE-jjiban-01-01 |
| Module 이름 | Portal & Layout System |
| 문서 버전 | 1.0 |
| 작성일 | 2025-12-06 |
| 상태 | Draft |
| Module 유형 | User Story |
| 예상 기간 | 2주 |
| 상위 Chain | Platform Foundation |
| 원본 Chain PRD | ../chain-prd.md |

---

## 1. Module 개요

### 1.1 User Story
**"As a 사용자, I want 일관된 레이아웃과 네비게이션을 통해 앱을 탐색하고 싶다 so that 효율적으로 작업을 전환할 수 있다"**

사용자는 로그인 후 대시보드, 프로젝트 목록, 설정 등 다양한 화면으로 이동해야 합니다. Portal & Layout System은 애플리케이션의 뼈대가 되는 레이아웃과 네비게이션을 제공하여, 사용자가 어디에 있든 일관된 경험을 유지하고 길을 잃지 않도록 돕습니다.

### 1.2 범위 (Scope)

**포함:**
- 전역 헤더 (로고, 프로젝트 선택, 사용자 메뉴)
- 사이드바 네비게이션 (메뉴 항목, 접기/펼치기)
- 메인 레이아웃 템플릿 (2-column, 3-column)
- 라우팅 시스템 (React Router v6)
- 브레드크럼 네비게이션
- 404 Not Found 페이지

**제외:**
- 개별 페이지의 구체적인 콘텐츠 (대시보드 내부 위젯 등)
- 로그인/회원가입 페이지 (Auth Module에서 처리)

### 1.3 인수 조건 (Acceptance Criteria)
- [ ] 모든 화면에서 일관된 헤더/사이드바 표시
- [ ] 반응형 디자인 (모바일, 태블릿, 데스크톱) 지원 및 사이드바 토글 동작
- [ ] 라우팅 전환 시 레이아웃 깜빡임 없이 상태 유지
- [ ] 현재 위치를 나타내는 브레드크럼 표시

---

## 2. Task 목록

### TASK-jjiban-01-01-01: React Router 및 레이아웃 구조 설계 (1일)
**설명**: "React Router v7 설정 및 기본 레이아웃 컴포넌트 구조 잡기"

**작업 내용**:
- React Router 설치 및 라우트 정의
- Layout Outlet 구조 설계
- Route Guard (AuthGuard) 스캐폴딩

**완료 조건**:
- [ ] 기본 라우팅 동작 확인
- [ ] URL 변경 시 페이지 전환 확인

---

### TASK-jjiban-01-01-02: Global Header 구현 (1일)
**설명**: "상단 고정 헤더 구현"

**작업 내용**:
- 로고 및 앱 타이틀 표시
- 프로젝트 전환 드롭다운 UI
- 사용자 프로필 아바타 및 메뉴 (Popconfirm/Dropdown)

**완료 조건**:
- [ ] 헤더가 상단에 고정됨
- [ ] 사용자 메뉴 클릭 시 로그아웃 옵션 표시

---

### TASK-jjiban-01-01-03: Sidebar Navigation 구현 (2일)
**설명**: "좌측 네비게이션 사이드바 구현"

**작업 내용**:
- 메뉴 아이템 데이터 구조 정의
- 사이드바 컴포넌트 구현 (Ant Design Menu 활용)
- 접기/펼치기 (Collapse) 상태 관리 (Zustand)
- 현재 라우트에 따른 메뉴 활성화 (Active State)

**완료 조건**:
- [ ] 메뉴 클릭 시 해당 라우트로 이동
- [ ] 현재 URL에 맞는 메뉴 하이라이트
- [ ] 사이드바 접기/펼치기 동작

---

### TASK-jjiban-01-01-04: Breadcrumbs 및 Page Title 구현 (1일)
**설명**: "경로 탐색을 위한 브레드크럼 구현"

**작업 내용**:
- 라우트 매칭 기반 브레드크럼 생성 유틸리티
- Ant Design Breadcrumb 컴포넌트 적용
- 페이지별 Title 동적 변경 (React Helmet 등 활용)

**완료 조건**:
- [ ] 깊은 경로 진입 시 브레드크럼 정상 표시
- [ ] 브레드크럼 링크 클릭 시 상위 경로 이동

---

### TASK-jjiban-01-01-05: 반응형 레이아웃 대응 (1일)
**설명**: "모바일 및 태블릿 환경 대응"

**작업 내용**:
- Media Query 설정
- 모바일에서 사이드바를 Drawer로 변경
- 헤더 구성 요소 간소화

**완료 조건**:
- [ ] 모바일 화면에서 사이드바가 햄버거 메뉴로 동작
- [ ] 작은 화면에서도 UI 깨짐 없음

---

## 3. 의존성

### 3.1 선행 Modules
- 없음 (가장 먼저 시작)

### 3.2 후행 Modules
- MODULE-jjiban-01-02: Design System (이 모듈에서 정의된 레이아웃 사용)
- MODULE-jjiban-01-04: Authentication (AuthGuard 연동)

### 3.3 외부 의존성
- React Router
- Ant Design (Layout, Menu, Breadcrumb)
- Zustand (UI 상태 관리)

---

## 4. 주요 화면/API 목록

### 4.1 화면 목록
| 화면 이름 | 경로 | 설명 | 관련 Task |
|----------|------|------|-----------|
| 메인 레이아웃 | `/*` | 앱의 기본 쉘 | TASK-01 |
| 404 페이지 | `*` | 페이지 없음 | TASK-01 |

### 4.2 API 목록
없음 (Pure UI Module)

---

## 5. 기술 스택

| 레이어 | 기술 | 비고 |
|--------|------|------|
| Frontend | React Router v7 | 라우팅 |
| UI | Ant Design Layout | 레이아웃 컴포넌트 |
| State | Zustand | 사이드바 상태 관리 |

---

## 6. 참조 문서

- 상위 Chain PRD: ../chain-prd.md
- UI 디자인 시안 (Figma - TBD)

---

## 7. 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2025-12-06 | 초안 작성 |
