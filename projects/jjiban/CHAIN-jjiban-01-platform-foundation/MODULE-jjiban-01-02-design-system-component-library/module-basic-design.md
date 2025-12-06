# Module 기본설계: Design System & Component Library

## 문서 정보

| 항목 | 내용 |
|------|------|
| Module ID | MODULE-jjiban-01-02 |
| 관련 PRD | module-prd.md |
| 문서 버전 | 1.0 |
| 작성일 | 2025-12-06 |
| 상태 | Draft |

---

## 1. 아키텍처 개요

### 1.1 컴포넌트 구조

```
src/components/
├── atoms/        # Button, Input, Icon, Typography
├── molecules/    # FormField, SearchBar, Card
└── organisms/    # Modal, Header, Footer
```

Ant Design을 래핑(Wrapping)하거나 스타일을 오버라이딩하여 프로젝트 전용 컴포넌트를 제공합니다. 직접 `antd`를 import하여 사용하는 것을 지양하고, `src/components/ui` 등을 통해 import하도록 권장합니다.

### 1.2 디자인 토큰
- `tokens/colors.ts`: Semantic Color 정의 (primary, success, warning, error, surface, text)
- `tokens/typography.ts`: FontSize, FontWeight, LineHeight
- `tokens/spacing.ts`: Padding, Margin 단위

---

## 2. 데이터 모델

해당 없음 (UI 라이브러리)

---

## 3. API 설계

### 3.1 컴포넌트 Props 인터페이스

**Button**
```typescript
interface ButtonProps extends AntButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}
```

**Icon**
```typescript
interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  className?: string;
}
```

---

## 4. UI/UX 설계

### 4.1 테마 전략
- **Light/Dark Mode**: CSS Variable을 사용하여 런타임에 색상 값 교체.
- **Responsive**: Tailwind의 breakpoint (`sm`, `md`, `lg`, `xl`) 활용.

---

## 5. 구현 가이드

### 5.1 파일 구조

```
src/
├── assets/
│   └── styles/
│       └── global.css (Tailwind directives)
├── components/
│   └── ui/
│       ├── Button/
│       │   ├── index.tsx
│       │   └── Button.stories.tsx
│       └── ...
└── theme/
    ├── antConfig.ts (AntD ConfigProvider props)
    └── index.ts
```

### 5.2 주요 구현 포인트
- Ant Design의 `ConfigProvider`를 `App.tsx` 최상단에 적용하여 전역 테마를 제어한다.
- Storybook의 `preview.tsx`에도 동일한 Provider를 감싸서 실제 앱과 동일한 환경을 제공한다.

---

## 6. 테스트 전략

### 6.1 시각적 테스트
- Storybook을 통해 각 variant별 렌더링 확인

### 6.2 단위 테스트
- 컴포넌트의 이벤트 핸들러 동작 확인 (onClick 등)

---

## 7. 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2025-12-06 | 초안 작성 |
