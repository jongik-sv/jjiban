# 5. 백엔드 설계 (Backend Design)

## 5.1 개요
백엔드는 Node.js 환경에서 Express.js(또는 NestJS) 프레임워크를 사용하여 구축하며, REST API 서버와 WebSocket 서버를 동시에 운영합니다. 핵심 기능인 터미널 에뮬레이션은 `node-pty` 라이브러리를 통해 OS의 쉘 프로세스를 직접 제어합니다.

## 5.2 디렉토리 구조 (NestJS Standard)

NestJS의 모듈 시스템을 기반으로 도메인 주도 설계(DDD)의 개념을 일부 차용하여 구조화합니다.

```
/src
├── /common             # 전역 공통 모듈 (Filters, Guards, Interceptors, Decorators)
│   ├── /filters        # 예: http-exception.filter.ts
│   └── /dtos           # 공통 DTO (PaginationDto 등)
├── /config             # 환경 변수 설정 (ConfigModule)
├── /modules            # 도메인별 모듈 (핵심)
│   ├── /auth           # AuthModule
│   ├── /project        # ProjectModule
│   ├── /issue          # IssueModule
│   ├── /terminal       # TerminalModule (node-pty)
│   ├── /llm            # LlmModule (Prompt Engine)
│   └── /workflow       # WorkflowModule (Auto-Pilot)
├── /prisma             # Prisma Client & Schema
└── /main.ts            # 앱 진입점
```

## 5.3 아키텍처 패턴 가이드 (AI Guide)

### 5.3.1 모듈(Module) 설계 원칙
- **캡슐화**: 각 모듈은 자신의 도메인 로직만 처리하며, 다른 모듈의 DB에 직접 접근하지 않는다.
- **공유**: 다른 모듈의 기능이 필요하면 해당 모듈의 `Service`를 `exports`하고 `imports`하여 사용한다.
- **순환 참조 방지**: `forwardRef()` 사용을 지양하고, 공통 로직은 `SharedModule`로 분리한다.

### 5.3.2 계층별 책임 (Layered Architecture)
1. **Controller (`*.controller.ts`)**
   - HTTP 요청 수신 및 응답 반환.
   - **DTO 검증 (`ValidationPipe`) 필수 적용.**
   - 비즈니스 로직 절대 포함 금지.
   - 예: `@Post() create(@Body() dto: CreateIssueDto) { return this.service.create(dto); }`

2. **Service (`*.service.ts`)**
   - 핵심 비즈니스 로직 구현.
   - 트랜잭션 관리 (`Prisma.$transaction`).
   - 외부 서비스 호출.

3. **Repository / DAL**
   - Prisma Client를 직접 사용하거나, 복잡한 쿼리는 별도 Repository 클래스로 분리.
   - `this.prisma.issue.findMany(...)`

### 5.3.3 DTO (Data Transfer Object) 필수 사용
- 모든 요청/응답 데이터는 `class-validator`로 데코레이팅된 Class 기반 DTO를 사용해야 한다.
- `any` 타입 사용 금지.

## 5.4 주요 모듈 상세 설계

### 5.4.1 Terminal Module (핵심)
- **책임**: `node-pty` 프로세스 생성, 관리, 입출력 파이핑.
- **PtyManager 클래스**:
  - `sessions: Map<string, IPty>`: 활성화된 세션 관리.
  - `createSession(issueId, templateId)`:
    1. 쉘 실행 (bash/zsh/powershell).
    2. 초기 환경 변수 설정 (프로젝트 경로 등).
    3. 프롬프트 템플릿 로드 및 초기 명령어 주입.
  - `write(sessionId, data)`: 사용자 입력을 쉘에 전달.
  - `resize(sessionId, cols, rows)`: 터미널 크기 동기화.
  - `kill(sessionId)`: 프로세스 종료 및 리소스 정리.

### 5.3.2 LLM Service
- **책임**: 프롬프트 템플릿 엔진 및 컨텍스트 주입.
- **PromptEngine**:
  - Handlebars를 사용하여 템플릿 변수 치환.
  - `{{task.doc_path}}` 등의 변수를 실제 DB 값으로 매핑.
- **ContextBuilder**:
  - 필요한 파일 내용을 읽어 프롬프트에 포함시키는 로직.
  - 토큰 제한을 고려한 컨텍스트 요약 (추후 고도화).

### 5.3.3 Workflow Service (Auto-Pilot)
- **책임**: 자동화 작업의 생명주기 관리 및 단계별 실행 제어.
- **JobExecutor**:
  - `executeJob(jobId)`: 작업 실행 메인 루프.
  - `runStep(step)`:
    1. 해당 단계의 프롬프트 템플릿 로드.
    2. `TerminalService`를 통해 LLM 실행.
    3. 실행 완료 대기 (Exit Code 확인).
    4. 결과 분석 (성공/실패 판정).
  - `transitionNext(job)`:
    - 완전 자동 모드: 즉시 다음 단계 실행.
    - 반자동 모드: `waiting_approval` 상태로 변경 후 대기.

### 5.3.4 Document Service
- **책임**: 파일 시스템의 Markdown 파일 CRUD.
- **FileWatcher**:
  - `chokidar` 라이브러리를 사용하여 문서 변경 감지.
  - 파일이 변경되면 WebSocket을 통해 프론트엔드에 알림 (실시간 뷰어 갱신).

## 5.4 데이터베이스 접근 (ORM)
- **Prisma** 또는 **TypeORM** 사용 권장.
- **Migration**: 스키마 변경 이력 관리.
- **Seeding**: 초기 개발용 더미 데이터 생성 스크립트.

## 5.5 에러 처리 및 로깅
- **Global Exception Filter**: 모든 예외를 포착하여 표준화된 JSON 응답 반환.
- **Winston / Morgan**: HTTP 요청 및 시스템 로그 기록.
- **Terminal Logs**: 터미널 세션의 모든 입출력을 파일 또는 DB에 아카이빙하여 추후 감사(Audit)나 재학습 데이터로 활용.

## 5.6 배포 전략
- **Docker**:
  - `node` 베이스 이미지 사용.
  - `node-pty` 컴파일을 위한 빌드 도구(`python`, `make`, `g++`) 포함 필요.
- **Volume Mounting**:
  - 프로젝트 루트 디렉토리를 컨테이너에 마운트하여 호스트 파일 시스템 접근 허용.
