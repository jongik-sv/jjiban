# MARU 시스템 기술 요구 문서
## Technical Requirements Document (TRD)

**프로젝트**: MARU (Master Code & Rule Management System)
**버전**: 1.0
**작성일**: 2025-01-17
**문서 유형**: PoC (Proof of Concept)

---

## 1. 시스템 개요 및 아키텍처

### 1.1 시스템 아키텍처
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│    Backend      │────▶│    Database     │
│ (Nexacro N v24) │     │   (Node.js)     │     │   (Oracle)      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                        ┌─────────────────┐
                        │     Cache       │
                        │  (node-cache)   │
                        └─────────────────┘
```

### 1.2 아키텍처 특징
- **3-Tier Architecture**: Presentation - Business - Data 계층 분리
- **RESTful API**: Frontend-Backend 간 HTTP/JSON 통신
- **Stateless Design**: 서버 무상태성으로 확장성 확보
- **Database-First**: Oracle DB 중심의 데이터 중심 설계

### 1.3 PoC 시스템 구성
- **개발 환경**: Windows 11, localhost 기반
- **배포 방식**: 단일 서버 배포 (개발/운영 동일)
- **확장성**: 향후 분산 환경으로 확장 가능한 구조

---

## 2. 기술 스택 및 버전 (2025 최신)

### 2.1 Backend 기술 스택

#### 2.1.1 Runtime & Framework
- **Node.js**: v24.x (2025 최신 LTS)
  - V8 엔진 최신 버전, WebAssembly 지원
  - Built-in URLPattern, permission APIs
- **Express.js**: v5.1.0 (2025 기본 버전)
  - Promise 기반 에러 처리 개선
  - path-to-regexp@8.x 보안 강화
  - Node.js 18+ 필수

#### 2.1.2 Database & ORM
- **Oracle Database**: localhost:1521/XE
  - 사용자: maru/maru
  - 버전: Oracle Database 21c 이상 권장
- **node-oracledb**: v6.9.0 (Oracle 공식 최신 드라이버)
  - Thin Mode (순수 JavaScript, Oracle Client 불필요)
  - Oracle Database 23ai 기능 지원
  - Thick Mode 옵션 (고급 기능 필요시)
- **Knex.js**: v3.1.0 (SQL Query Builder)
  - Oracle 방언 지원
  - 마이그레이션 및 시드 기능
  - Connection Pooling

#### 2.1.3 캐시 & 성능
- **@cacheable/node-cache**: v1.7.0 (유지보수 활발한 node-cache 대체)
  - 기존 node-cache API 완전 호환
  - Async/Await 지원
  - Storage Adapters via Keyv
  - 향후 Redis 확장 가능

#### 2.1.4 유틸리티 & 미들웨어
- **cors**: v2.8.5 (CORS 처리)
- **helmet**: v7.1.0 (보안 헤더)
- **morgan**: v1.10.0 (로깅)
- **dotenv**: v16.4.5 (환경 변수)
- **joi**: v17.12.0 (데이터 검증)

### 2.2 Frontend 기술 스택
- **Nexacro Platform**: N v24 (기업 RIA 플랫폼)
  - JavaScript 기반 UI 컴포넌트
  - 데이터바인딩 및 이벤트 처리
  - RESTful API 통신 (JSON)
  - 향상된 성능 및 모던 웹 표준 지원

### 2.3 개발 도구
- **IDE**: Visual Studio Code 2025
- **API 테스트**: Postman/Insomnia
- **Database 도구**: Oracle SQL Developer, DBeaver
- **버전 관리**: Git

---

## 3. 개발 환경 및 도구

### 3.1 개발 환경 구성

#### 3.1.1 Node.js 환경
```bash
# Node.js 24.x 설치
node --version  # v24.x.x

# 프로젝트 초기화
npm init -y

# 의존성 설치
npm install express@5.1.0 oracledb@6.9.0 knex@3.1.0
npm install @cacheable/node-cache@1.7.0 cors helmet morgan dotenv joi
npm install --save-dev nodemon
```

#### 3.1.2 Oracle Database 연결 설정
```javascript
// config/database.js
const knex = require('knex')({
  client: 'oracledb',
  connection: {
    host: 'localhost',
    port: 1521,
    user: 'maru',
    password: 'maru',
    database: 'XE',
    connectString: 'localhost:1521/XE'
  },
  pool: {
    min: 2,
    max: 10
  }
});
```

#### 3.1.3 프로젝트 구조
```
maru_nexacro/
├── backend/
│   ├── config/          # 설정 파일
│   ├── controllers/     # 컨트롤러 (비즈니스 로직)
│   ├── models/          # 데이터 모델
│   ├── routes/          # API 라우트
│   ├── middleware/      # 미들웨어
│   ├── services/        # 서비스 레이어
│   ├── utils/           # 유틸리티
│   ├── migrations/      # DB 마이그레이션
│   └── seeds/           # 초기 데이터
├── frontend/
│   ├── nexacro/         # Nexacro N v24 프로젝트
│   └── assets/          # 정적 자원
├── docs/
│   ├── api/             # API 문서
│   ├── requirements/    # 요구사항 문서
│   └── architecture/    # 아키텍처 문서
└── scripts/             # 배포/유틸리티 스크립트
```

### 3.2 개발 워크플로우
1. **API First**: API 설계 → Backend 구현 → Frontend 연동
2. **Database Migration**: DDL 스크립트를 Knex 마이그레이션으로 관리
3. **테스트 주도**: API 테스트 → 통합 테스트 → E2E 테스트
4. **점진적 개발**: 핵심 기능부터 단계적 구현

---

## 4. 데이터베이스 설계 요구사항

### 4.1 테이블 설계 원칙

#### 4.1.1 선분 이력 모델
- 모든 테이블에 `START_DATE`, `END_DATE` 컬럼 필수
- `VERSION` 컬럼으로 버전 관리
- Primary Key: 업무키 + VERSION
- 인덱스: (END_DATE, START_DATE, 업무키)

#### 4.1.2 데이터 타입 표준
```sql
-- 공통 컬럼
MARU_ID        VARCHAR2(50)      -- 마루ID
VERSION        NUMBER(10, 0)     -- 버전
START_DATE     TIMESTAMP         -- 시작일시
END_DATE       TIMESTAMP         -- 종료일시 (기본값: 9999-12-31 23:59:59)

-- 업무 컬럼
CODE           VARCHAR2(100)     -- 코드
CODE_NAME      VARCHAR2(200)     -- 코드명
DESCRIPTION    VARCHAR2(1000)    -- 설명
SORT_ORDER     NUMBER(10, 0)     -- 순번
STATUS         VARCHAR2(20)      -- 상태 (CREATED/INUSE/DEPRECATED)
```

### 4.2 테이블 생성 DDL

#### 4.2.1 기본 테이블
```sql
-- 마루 헤더
CREATE TABLE TB_MR_HEAD (
    MARU_ID VARCHAR2(50) NOT NULL,
    VERSION NUMBER(10, 0) NOT NULL,
    MARU_NAME VARCHAR2(200) NOT NULL,
    MARU_STATUS VARCHAR2(20) DEFAULT 'CREATED',
    MARU_TYPE VARCHAR2(10) NOT NULL,
    PRIORITY_USE_YN CHAR(1) DEFAULT 'N',
    START_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    END_DATE TIMESTAMP DEFAULT TO_TIMESTAMP('9999-12-31 23:59:59', 'YYYY-MM-DD HH24:MI:SS'),
    CONSTRAINT PK_TB_MR_CODE_HEAD PRIMARY KEY (MARU_ID, VERSION)
);

-- 인덱스 생성
CREATE INDEX IDX_TB_MR_CODE_HEAD_01 ON TB_MR_HEAD (END_DATE, START_DATE, MARU_ID);
```

### 4.3 데이터 검증 규칙
- NOT NULL 제약조건: 필수 컬럼
- CHECK 제약조건: 상태값, 타입값 검증
- UNIQUE 제약조건: 업무 키 중복 방지
- FOREIGN KEY: 참조 무결성 보장

---

## 5. API 설계 원칙

### 5.1 RESTful API 설계

#### 5.1.1 URL 설계 원칙
```
GET    /api/v1/codes                    # 코드 목록 조회
GET    /api/v1/codes/{maruId}           # 특정 코드 조회
POST   /api/v1/codes                    # 코드 생성
PUT    /api/v1/codes/{maruId}           # 코드 수정
DELETE /api/v1/codes/{maruId}           # 코드 삭제 (논리삭제)

GET    /api/v1/codes/{maruId}/history   # 코드 이력 조회
GET    /api/v1/codes/{maruId}/versions/{version}  # 특정 버전 조회
```

#### 5.1.2 HTTP 상태 코드
- 200: 성공
- 201: 생성 성공
- 400: 잘못된 요청
- 404: 리소스 없음
- 409: 충돌 (상태 변경 불가 등)
- 500: 서버 에러

#### 5.1.3 응답 형식
```javascript
// 성공 응답
{
  "success": true,
  "data": {...},
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20
  }
}

// 에러 응답
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "입력값이 올바르지 않습니다.",
    "details": [...]
  }
}
```

### 5.2 API 보안
- CORS 설정: Frontend 도메인만 허용
- Request Validation: Joi 스키마 검증
- SQL Injection 방지: Parameterized Query
- XSS 방지: 입력값 이스케이프

---

## 6. 성능 요구사항

### 6.1 응답 시간 목표
- **단순 조회**: < 500ms
- **복잡 조회**: < 1초
- **데이터 수정**: < 1초
- **대량 데이터 조회**: < 3초

### 6.2 성능 최적화 전략

#### 6.2.1 Database 최적화
- 적절한 인덱스 설계
- Query 최적화 (Explain Plan 활용)
- Connection Pool 설정
- Statement Caching

#### 6.2.2 Application 캐시
```javascript
// 캐시 설정
const NodeCache = require('@cacheable/node-cache');
const cache = new NodeCache({
  stdTTL: 600, // 10분
  checkperiod: 60 // 1분마다 만료 체크
});

// 캐시 적용 대상
- 마스터 코드 조회 (변경 빈도 낮음)
- 코드 카테고리 정보
- 룰 정의 정보
```

#### 6.2.3 Network 최적화
- gzip 압축 활성화
- JSON 응답 크기 최적화
- 페이징 처리 (기본 20건)

### 6.3 확장성 고려사항
- Stateless 서버 설계
- Database Connection Pool
- 캐시 분리 (향후 Redis)
- Load Balancer 대응 가능

---

## 7. 보안 요구사항

### 7.1 PoC 보안 수준
- **인증**: 기본 세션 기반 (복잡한 JWT 제외)
- **권한**: 단일 관리자 (RBAC 제외)
- **데이터 보호**: SQL Injection, XSS 방지
- **통신 보안**: 개발 환경 HTTP 허용

### 7.2 보안 구현
```javascript
// 기본 보안 미들웨어
app.use(helmet({
  contentSecurityPolicy: false // 개발용
}));

app.use(cors({
  origin: ['http://localhost:3000'], // Frontend URL
  credentials: true
}));

// 입력값 검증
const Joi = require('joi');
const codeSchema = Joi.object({
  maruName: Joi.string().required().max(200),
  maruType: Joi.string().valid('CODE', 'RULE').required()
});
```

### 7.3 데이터 보안
- 민감정보 암호화 (향후)
- 감사 로그 기록
- 백업 및 복구 전략
- 개인정보 처리 방침 (향후)

---

## 8. 배포 및 운영 요구사항

### 8.1 PoC 배포 환경
- **서버**: Windows 11 개발 머신
- **포트**: Backend(3000), Frontend(8080)
- **프로세스 관리**: PM2 또는 nodemon
- **로그**: Console + File 출력

### 8.2 배포 스크립트
```bash
#!/bin/bash
# deploy.sh

# Backend 배포
cd backend
npm install
npm run migrate
npm run seed
npm start &

# Frontend 배포 (Nexacro)
cd ../frontend
# Nexacro 배포 스크립트 실행
```

### 8.3 모니터링 (PoC)
- Application 로그: morgan + winston
- Database 연결 상태 체크
- API 응답시간 측정
- 에러 발생 알림 (Console)

### 8.4 백업 전략
- Database: 일일 백업 (Oracle Export)
- Application: Git 버전 관리
- 설정 파일: 별도 백업

---

## 9. 개발 가이드라인

### 9.1 코딩 표준
- **JavaScript**: ES2024 문법 사용
- **코드 스타일**: Prettier + ESLint
- **네이밍**: camelCase (변수/함수), PascalCase (클래스)
- **주석**: JSDoc 형식

### 9.2 Git 워크플로우
- **브랜치 전략**: Git Flow (간소화)
- **커밋 메시지**: Conventional Commits
- **코드 리뷰**: Pull Request 기반

### 9.3 테스트 전략
- **Unit Test**: Jest (선택사항, PoC)
- **API Test**: Postman Collection
- **Integration Test**: 수동 테스트
- **E2E Test**: Nexacro 기능 테스트

---

## 10. 위험 요소 및 대응

### 10.1 기술적 위험

#### Oracle Database 연동
- **위험**: node-oracledb Thin Mode 제한사항
- **대응**: Thick Mode 설치 준비, 기능 검증

#### Nexacro N v24 학습 곡선
- **위험**: Nexacro N v24 개발 경험 부족
- **대응**: 기본 튜토리얼 완료, 샘플 프로젝트 분석, v24 신규 기능 숙지

#### 성능 요구사항
- **위험**: 대량 데이터 처리 시 성능 저하
- **대응**: 페이징, 캐시, 인덱스 최적화

### 10.2 운영 위험
- **Single Point of Failure**: 단일 서버 구성
- **데이터 손실**: 백업 전략 수립
- **확장성**: 아키텍처 유연성 확보

---

## 11. 다음 단계 (Post-PoC)

### 11.1 기술 확장
- Redis 캐시 도입
- Docker 컨테이너화
- CI/CD 파이프라인
- 마이크로서비스 분리

### 11.2 기능 확장
- 사용자 인증/권한 관리
- 다국어 지원
- 고급 감사 기능
- 외부 시스템 연동 API

### 11.3 운영 확장
- 모니터링 시스템 (Prometheus + Grafana)
- 로그 집중화 (ELK Stack)
- 고가용성 구성
- 보안 강화

---

**문서 승인**

| 역할 | 이름 | 서명 | 날짜 |
|------|------|------|------|
| 기술 리더 | | | |
| 시스템 아키텍트 | | | |
| 개발팀 리더 | | | |

---

**참고 문헌**
- Node.js 24.x Documentation
- Express.js 5.x Documentation
- node-oracledb 6.9.0 Documentation
- Oracle Database 21c Documentation
- Nexacro Platform N v24 Developer Guide