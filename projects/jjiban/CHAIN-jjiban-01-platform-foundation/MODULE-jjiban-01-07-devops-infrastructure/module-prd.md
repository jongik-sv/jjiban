# Module PRD: DevOps & Infrastructure

## 문서 정보

| 항목 | 내용 |
|------|------|
| Module ID | MODULE-jjiban-01-07 |
| Module 이름 | DevOps & Infrastructure |
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
**"As a 개발자/운영자, I want 배포 과정이 자동화되고 안정적이기를 원한다 so that 코드 품질을 유지하며 빠르게 릴리즈할 수 있다"**

안정적인 서비스를 위해 코드 변경 사항은 자동으로 검증(CI)되어야 하며, 배포(CD) 과정은 일관되어야 합니다. 또한 Docker를 활용하여 환경 종속성을 최소화합니다.

### 1.2 범위 (Scope)

**포함:**
- Git 브랜치 전략 (main, develop, feature/*)
- GitHub Actions CI 워크플로우 (Lint, Build, Test)
- Dockerfile 작성 (Frontend, Backend)
- Docker Compose 설정 (로컬 실행 환경)
- 환경별 배포 스크립트 작성

**제외:**
- K8s 오케스트레이션 (초기 단계 불필요)
- 복잡한 모니터링 인프라 (Prometheus 등)

### 1.3 인수 조건 (Acceptance Criteria)
- [ ] PR 생성 시 자동으로 Build 및 Test 수행
- [ ] `docker-compose up` 명령어로 전체 서비스 로컬 실행 가능
- [ ] main 브랜치 머지 시 Docker 이미지 빌드 및 태깅

---

## 2. Task 목록

### TASK-jjiban-01-07-01: Docker Environment 구성 (2일)
**설명**: "컨테이너 실행 환경 정의"

**작업 내용**:
- Frontend (`/packages/web`) Dockerfile 작성 (Multi-stage build)
- Backend (`/packages/server`) Dockerfile 작성
- Root `docker-compose.yml` 작성

**완료 조건**:
- [ ] Docker 이미지 빌드 성공 및 용량 최적화 (Alpine 사용)
- [ ] 컨테이너 실행 시 앱 정상 동작

---

### TASK-jjiban-01-07-02: CI Pipeline 구축 (1일)
**설명**: "GitHub Actions 워크플로우 설정"

**작업 내용**:
- `.github/workflows/ci.yml` 작성
- Lint 체크 및 Build 수행
- 단위 테스트 실행

**완료 조건**:
- [ ] PR 푸시 시 CI Job 트리거 및 Pass/Fail 리포트

---

### TASK-jjiban-01-07-03: CD Pipeline 구축 (1일)
**설명**: "자동 배포 파이프라인"

**작업 내용**:
- `.github/workflows/cd.yml` 작성
- GitHub Container Registry (GHCR) 로그인 및 Push
- 버저닝 전략 (Semantic Versioning) 적용

**완료 조건**:
- [ ] Main 브랜치 Push 시 이미지 생성 및 업로드

---

### TASK-jjiban-01-07-04: 로컬 개발 환경 개선 (1일)
**설명**: "개발자 경험(DX) 향상"

**작업 내용**:
- `npm run dev` 하나로 전체 서비스 실행 (Turborepo, Concurrently)
- Pre-commit Hook (Husky) 설정
- VS Code 설정 (`.vscode/launch.json`)

**완료 조건**:
- [ ] 커밋 시 Lint 자동 수행
- [ ] 디버거 연결 확인

---

## 3. 의존성

### 3.1 선행 Modules
- 없음 (구조만 있으면 가능)

### 3.2 후행 Modules
- 모든 Modules (CI/CD 통과 필요)

### 3.3 외부 의존성
- Docker
- GitHub Actions

---

## 4. 주요 화면/API 목록
없음 (Infrastructure)

---

## 5. 기술 스택

| 레이어 | 기술 | 비고 |
|--------|------|------|
| Container | Docker | Multi-stage |
| CI/CD | GitHub Actions |
| DX | Husky, Turbo |

---

## 6. 참조 문서

- 상위 Chain PRD: ../chain-prd.md

---

## 7. 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2025-12-06 | 초안 작성 |
