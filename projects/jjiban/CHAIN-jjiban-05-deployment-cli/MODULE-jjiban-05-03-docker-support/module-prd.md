# Module PRD: Docker Support

## 문서 정보

| 항목 | 내용 |
|------|------|
| Module ID | MODULE-jjiban-05-03 |
| Module 이름 | Docker Support |
| 문서 버전 | 1.0 |
| 작성일 | 2025-12-06 |
| 상태 | Draft |
| Module 유형 | User Story |
| 예상 기간 | 1주 |
| 상위 Chain | CHAIN-jjiban-05: Deployment & CLI Tools |
| 원본 Chain PRD | chain-prd.md |

---

## 1. Module 개요

### 1.1 User Story
**"As a developer, I want to run jjiban in a Docker container so that I can easily deploy it in any environment without worrying about dependencies."**

Docker 기반 컨테이너 배포를 지원합니다. Dockerfile과 docker-compose.yml을 제공하여 다양한 환경에서 일관된 실행 환경을 보장합니다.

### 1.2 범위 (Scope)

**포함:**
- Dockerfile 작성
- docker-compose.yml 작성
- 볼륨 마운트 설정 (.jjiban, projects)
- 환경 변수 설정
- 다중 스테이지 빌드 (최적화)

**제외:**
- Kubernetes 배포 (향후 확장)
- 클라우드 배포 (AWS ECS, Azure Container Apps 등)
- CI/CD 파이프라인

### 1.3 인수 조건 (Acceptance Criteria)
- [ ] `docker build` 명령으로 이미지 빌드 성공
- [ ] `docker-compose up` 명령으로 실행 가능
- [ ] 데이터 영속성 보장 (볼륨 마운트)
- [ ] Docker 이미지 크기 < 500MB
- [ ] 환경 변수로 설정 가능 (포트, API 키 등)

---

## 2. Task 목록

### TASK-jjiban-05-03-01: Dockerfile 작성 (2일)
**설명**: "다중 스테이지 빌드 Dockerfile 작성"

**작업 내용**:
- 빌드 스테이지 (Node.js + 빌드 도구)
- 프로덕션 스테이지 (Alpine)
- 최적화 (캐시 레이어, 크기 최소화)
- health check 설정

**완료 조건**:
- [ ] `docker build -t jjiban .` 성공
- [ ] 이미지 크기 < 500MB
- [ ] 컨테이너 실행 확인

---

### TASK-jjiban-05-03-02: docker-compose.yml 작성 (1일)
**설명**: "docker-compose 설정 파일 작성"

**작업 내용**:
- 서비스 정의
- 볼륨 마운트 설정
- 환경 변수 설정
- 네트워크 설정
- 재시작 정책

**완료 조건**:
- [ ] `docker-compose up` 실행 성공
- [ ] 볼륨 데이터 영속성 확인
- [ ] 환경 변수 적용 확인

---

### TASK-jjiban-05-03-03: Docker 문서화 및 스크립트 (2일)
**설명**: "Docker 사용 문서 및 헬퍼 스크립트 작성"

**작업 내용**:
- Docker 사용 가이드 (README)
- 빌드/실행 스크립트
- 환경 변수 템플릿 (.env.example)
- 트러블슈팅 가이드

**완료 조건**:
- [ ] 문서 완성
- [ ] 스크립트 동작 확인
- [ ] .env.example 포함

---

## 3. 의존성

### 3.1 선행 Modules
- MODULE-jjiban-05-01: CLI Package Structure (패키지 구조 필요)

### 3.2 후행 Modules (이 Module에 의존)
- 없음

### 3.3 외부 의존성
- Docker >= 20.10
- Docker Compose >= 2.0

---

## 4. 주요 화면/API 목록

### 4.1 화면 목록
| 화면 이름 | 경로 | 설명 | 관련 Task |
|----------|------|------|-----------|
| N/A | - | Infrastructure Module | - |

### 4.2 API 목록
| API | Method | 경로 | 설명 | 관련 Task |
|-----|--------|------|------|-----------|
| N/A | - | - | Infrastructure Module | - |

---

## 5. 기술 스택

| 레이어 | 기술 | 비고 |
|--------|------|------|
| Base Image | node:18-alpine | 경량 이미지 |
| Container | Docker | 컨테이너화 |
| Orchestration | Docker Compose | 로컬 오케스트레이션 |

---

## 6. 참조 문서

- 상위 Chain PRD: `chain-prd.md`
- Chain 기본설계: `chain-basic-design.md`
- Docker 설정: Section 3

---

## 7. 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2025-12-06 | 초안 작성 |
