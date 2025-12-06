# Module PRD: Design System & Component Library

## 문서 정보

| 항목 | 내용 |
|------|------|
| Module ID | MODULE-jjiban-01-02 |
| Module 이름 | Design System & Component Library |
| 문서 버전 | 1.0 |
| 작성일 | 2025-12-06 |
| 상태 | Draft |
| Module 유형 | User Story |
| 예상 기간 | 3주 |
| 상위 Chain | Platform Foundation |
| 원본 Chain PRD | ../chain-prd.md |

---

## 1. Module 개요

### 1.1 User Story
**"As a 개발자, I want 재사용 가능한 UI 컴포넌트를 사용하고 싶다 so that 일관된 UI를 빠르게 개발할 수 있다"**

효율적인 프론트엔드 개발을 위해서는 미리 정의된 디자인 시스템과 컴포넌트가 필요합니다. Ant Design을 기반으로 하되, jjiban의 브랜드 정체성에 맞는 커스텀 테마와 추가 컴포넌트들을 정의하여 개발 생산성을 높입니다.

### 1.2 범위 (Scope)

**포함:**
- 색상 시스템 (Primary, Secondary, Neutral, Semantic)
- 타이포그래피 (Heading, Body, Caption)
- 공통 컴포넌트 재정의 (Button, Input, Select, Modal, Dropdown, Card, Table)
- 아이콘 시스템 (Lucide Icons)
- Storybook 설정 및 문서화
- 다크 모드 테마 설정

**제외:**
- 일회성 페이지 컴포넌트
- 복잡한 비즈니스 로직이 포함된 컴포넌트 (비즈니스 모듈에서 처리)

### 1.3 인수 조건 (Acceptance Criteria)
- [ ] 최소 20개 이상의 공통 컴포넌트가 Storybook에 등록됨
- [ ] Tailwind CSS 또는 CSS-in-JS를 통한 토큰 기반 스타일링
- [ ] 다크 모드 전환 시 모든 컴포넌트 색상 자동 반전
- [ ] 접근성 준수 (키보드 네비게이션, 스크린 리더)

---

## 2. Task 목록

### TASK-jjiban-01-02-01: Storybook 및 테마 환경 설정 (2일)
**설명**: "Storybook 및 Ant Design Theme Provider 설정"

**작업 내용**:
- Storybook 설치 및 초기 설정
- Ant Design ConfigProvider 설정 (Global Token 정의)
- Tailwind CSS 설정 (커스텀 컬러 팔레트)

**완료 조건**:
- [ ] Storybook 실행 확인
- [ ] Primary Color 변경 시 전체 앱 반영

---

### TASK-jjiban-01-02-02: Design Tokens (Color & Typography) 정의 (1일)
**설명**: "디자인 토큰 시스템 구축"

**작업 내용**:
- 색상 팔레트 정의 (design-token.ts)
- 폰트 패밀리 및 사이즈 정의
- 다크 모드 색상 매핑

**완료 조건**:
- [ ] 토큰 상수 파일 생성
- [ ] 다크 모드 대응 토큰 확인

---

### TASK-jjiban-01-02-03: Basic Atoms 구현 (Button, Input, Icon) (3일)
**설명**: "기본적인 원자 단위 컴포넌트 래핑 및 스타일링"

**작업 내용**:
- Button variant 추가 (Primary, Secondary, Ghost, Danger)
- Input, Textarea 스타일 커스터마이징
- Lucide Icon 컴포넌트 래퍼

**완료 조건**:
- [ ] Storybook에 각 컴포넌트 예제 등록
- [ ] 다양한 상태(Hover, Active, Disabled) 스타일 확인

---

### TASK-jjiban-01-02-04: Molecules 구현 (Dropdown, Card, Tag) (3일)
**설명**: "조금 더 복잡한 분자 단위 컴포넌트"

**작업 내용**:
- Card 컴포넌트 (Header, Body, Actions)
- Tag/Badge 시스템 (Status 표시용)
- Dropdown 메뉴 스타일링

**완료 조건**:
- [ ] Storybook 등록
- [ ] 칸반 카드 등에 사용될 기본 Card UI 확인

---

### TASK-jjiban-01-02-05: Organisms 구현 (Modal, Drawer, Table) (3일)
**설명**: "복합 컴포넌트 구현"

**작업 내용**:
- 공통 Modal/Dialog 템플릿
- 우측 슬라이딩 Drawer 공통화
- 데이터 테이블 (Pagination, Sorting 포함)

**완료 조건**:
- [ ] Storybook 등록
- [ ] 모달 호출 방식(Hook vs Component) 정의

---

### TASK-jjiban-01-02-06: 다크 모드 및 접근성 점검 (2일)
**설명**: "테마 전환 완벽 지원 및 a11y 테스트"

**작업 내용**:
- 다크 모드 토글 기능 구현
- 색상 대비비 확인
- ARIA 속성 누락 점검

**완료 조건**:
- [ ] 다크 모드에서 안 보이는 텍스트 없음
- [ ] 키보드로 모든 인터랙션 가능

---

## 3. 의존성

### 3.1 선행 Modules
- 없음 (Layout과 병렬 진행 가능)

### 3.2 후행 Modules
- 모든 Feature Chains (이 컴포넌트들을 사용)

### 3.3 외부 의존성
- Ant Design
- Tailwind CSS
- Lucide React
- Storybook

---

## 4. 주요 화면/API 목록

### 4.1 화면 목록
| 화면 이름 | 경로 | 설명 | 관련 Task |
|----------|------|------|-----------|
| Storybook | `(local):6006` | 컴포넌트 문서 | All |

### 4.2 API 목록
없음

---

## 5. 기술 스택

| 레이어 | 기술 | 비고 |
|--------|------|------|
| Styling | Tailwind CSS / AntD Token | 스타일링 |
| Icons | Lucide React | 아이콘 팩 |
| Doc | Storybook | 문서화 |

---

## 6. 참조 문서

- 상위 Chain PRD: ../chain-prd.md
- Ant Design 문서

---

## 7. 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2025-12-06 | 초안 작성 |
