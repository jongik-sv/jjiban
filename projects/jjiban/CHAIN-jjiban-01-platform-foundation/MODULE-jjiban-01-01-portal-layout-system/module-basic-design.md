# Module 기본설계: Portal & Layout System

## 문서 정보

| 항목 | 내용 |
|------|------|
| Module ID | MODULE-jjiban-01-01 |
| 관련 PRD | module-prd.md |
| 문서 버전 | 1.0 |
| 작성일 | 2025-12-06 |
| 상태 | Draft |

---

## 1. 아키텍처 개요

### 1.1 컴포넌트 구조

```
App
├── AppProvider (Router, Theme, Store)
└── MainLayout
    ├── GlobalHeader
    │   ├── Logo
    │   ├── ProjectSwitcher
    │   └── UserProfileMenu
    ├── Sidebar
    │   └── NavigationMenu
    └── ContentArea
        ├── Breadcrumbs
        └── Outlet (Page Content)
```

### 1.2 주요 컴포넌트
- **MainLayout**: 전체 앱의 골격. Header, Sidebar, Content 영역을 배치.
- **GlobalHeader**: 상단 네비게이션 바. 전역적인 기능(검색, 알림, 프로필) 접근점.
- **Sidebar**: 주요 기능 모듈로 이동하는 트리형 메뉴.
- **AppRouter**: React Router 설정 및 라우트 정의.

---

## 2. 데이터 모델

### 2.1 UI State (Zustand)

```typescript
interface UIStore {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}
```

---

## 3. UI/UX 설계

### 3.1 화면 구조

```
+-------------------------------------------------------+
|  Global Header (Logo, Project,       User)            |
+------+------------------------------------------------+
|      |  Breadcrumbs                                   |
| Side |                                                |
| bar  |  +------------------------------------------+  |
|      |  |                                          |  |
|      |  |           Page Content (Outlet)          |  |
|      |  |                                          |  |
|      |  +------------------------------------------+  |
|      |                                                |
+------+------------------------------------------------+
```

---

## 4. 구현 가이드

### 4.1 파일 구조

```
src/
├── components/
│   ├── layout/
│   │   ├── MainLayout.tsx
│   │   ├── GlobalHeader.tsx
│   │   └── Sidebar.tsx
│   └── common/
│       └── Breadcrumbs.tsx
├── routes/
│   ├── AppRouter.tsx
│   └── RouteGuard.tsx
└── stores/
    └── uiStore.ts
```

### 4.2 주요 구현 포인트
- `Outlet`을 사용하여 중첩 라우팅 구조를 잡는다.
- `NavLink`를 사용하여 현재 활성화된 메뉴 스타일링을 자동화한다.
- 모바일(768px 미만)에서는 Sidebar를 Drawer 컴포넌트로 교체하여 오버레이 형태로 보여준다.

---

## 5. 테스트 전략

### 5.1 단위 테스트
- `uiStore` 상태 변경 테스트 (토글 동작)
- `Breadcrumbs` 경로 파싱 로직 테스트

### 5.2 E2E 테스트 (Playwright)
- 로그인 후 메인 레이아웃 진입 확인
- 사이드바 메뉴 클릭 시 페이지 전환 확인
- 헤더의 로그아웃 버튼 동작 확인
- 모바일 뷰포트 변경 시 사이드바 동작 확인

---

## 6. 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2025-12-06 | 초안 작성 |
