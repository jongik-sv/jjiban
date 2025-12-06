# Module 기본설계: Docker Support

## 문서 정보

| 항목 | 내용 |
|------|------|
| Module ID | MODULE-jjiban-05-03 |
| 관련 PRD | module-prd.md |
| 문서 버전 | 1.0 |
| 작성일 | 2025-12-06 |
| 상태 | Draft |

---

## 1. 아키텍처 개요

### 1.1 Docker 파일 구조

```
jjiban/
├── Dockerfile                    # 다중 스테이지 빌드
├── docker-compose.yml            # 로컬 실행용
├── docker-compose.prod.yml       # 프로덕션용
├── .dockerignore                 # 빌드 제외 파일
├── .env.example                  # 환경 변수 템플릿
└── scripts/
    ├── docker-build.sh           # 빌드 스크립트
    └── docker-run.sh             # 실행 스크립트
```

### 1.2 컨테이너 구조

```
┌─────────────────────────────────────────────────────┐
│                   Docker Container                   │
├─────────────────────────────────────────────────────┤
│  Node.js 18 Alpine                                  │
│  ├── /app                                           │
│  │   ├── bin/jjiban.js      (CLI 진입점)            │
│  │   ├── server/dist/       (백엔드)                │
│  │   ├── web/dist/          (프론트엔드)            │
│  │   └── prisma/            (DB 스키마)             │
│  │                                                  │
│  └── Volumes (외부 마운트)                          │
│      ├── /app/data/.jjiban  (설정, DB)              │
│      └── /app/data/projects (프로젝트 파일)         │
└─────────────────────────────────────────────────────┘
          │
          ▼ Port 3000
     Host Network
```

---

## 2. Dockerfile 설계

### 2.1 다중 스테이지 빌드

```dockerfile
# Dockerfile

# ==========================================
# Stage 1: Dependencies
# ==========================================
FROM node:18-alpine AS deps

WORKDIR /app

# pnpm 설치
RUN corepack enable && corepack prepare pnpm@latest --activate

# 의존성 파일 복사
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/cli/package.json ./packages/cli/
COPY packages/server/package.json ./packages/server/
COPY packages/web/package.json ./packages/web/

# 의존성 설치
RUN pnpm install --frozen-lockfile

# ==========================================
# Stage 2: Builder
# ==========================================
FROM node:18-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

# 의존성 복사
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/cli/node_modules ./packages/cli/node_modules
COPY --from=deps /app/packages/server/node_modules ./packages/server/node_modules
COPY --from=deps /app/packages/web/node_modules ./packages/web/node_modules

# 소스 복사
COPY . .

# 빌드
RUN pnpm run build

# ==========================================
# Stage 3: Production
# ==========================================
FROM node:18-alpine AS production

WORKDIR /app

# 필수 패키지 설치
RUN apk add --no-cache tini

# 비root 사용자 생성
RUN addgroup -g 1001 -S jjiban && \
    adduser -S -u 1001 -G jjiban jjiban

# 빌드 결과물 복사
COPY --from=builder /app/packages/cli/dist ./dist
COPY --from=builder /app/packages/cli/bin ./bin
COPY --from=builder /app/packages/cli/server ./server
COPY --from=builder /app/packages/cli/web ./web
COPY --from=builder /app/packages/cli/templates ./templates
COPY --from=builder /app/packages/cli/prisma ./prisma
COPY --from=builder /app/packages/cli/package.json ./

# 프로덕션 의존성만 설치
RUN npm install --production

# 데이터 디렉토리 생성
RUN mkdir -p /app/data/.jjiban /app/data/projects && \
    chown -R jjiban:jjiban /app/data

# 사용자 전환
USER jjiban

# 환경 변수
ENV NODE_ENV=production
ENV PORT=3000
ENV JJIBAN_DATA_DIR=/app/data

# 포트 노출
EXPOSE 3000

# 볼륨
VOLUME ["/app/data"]

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/api/health || exit 1

# 진입점
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "bin/jjiban.js", "start"]
```

### 2.2 .dockerignore

```
# .dockerignore

# Dependencies
node_modules
**/node_modules

# Build outputs (will be built in container)
dist
**/dist
.next
**/.next

# Development files
.git
.gitignore
*.md
!README.md

# IDE
.vscode
.idea
*.swp
*.swo

# Tests
**/__tests__
**/*.test.ts
**/*.spec.ts
coverage
.nyc_output

# Docker
Dockerfile*
docker-compose*
.docker

# Environment
.env
.env.*
!.env.example

# OS
.DS_Store
Thumbs.db

# Logs
*.log
logs
```

---

## 3. docker-compose 설계

### 3.1 docker-compose.yml (개발용)

```yaml
# docker-compose.yml
version: '3.8'

services:
  jjiban:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: jjiban
    ports:
      - "${PORT:-3000}:3000"
    volumes:
      - jjiban-data:/app/data
      - ./projects:/app/data/projects  # 로컬 프로젝트 마운트
    environment:
      - NODE_ENV=${NODE_ENV:-development}
      - PORT=3000
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - GOOGLE_API_KEY=${GOOGLE_API_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    restart: unless-stopped
    networks:
      - jjiban-network

volumes:
  jjiban-data:
    driver: local

networks:
  jjiban-network:
    driver: bridge
```

### 3.2 docker-compose.prod.yml (프로덕션용)

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  jjiban:
    image: jjiban/jjiban:${VERSION:-latest}
    container_name: jjiban-prod
    ports:
      - "3000:3000"
    volumes:
      - /opt/jjiban/data:/app/data
    environment:
      - NODE_ENV=production
      - PORT=3000
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
    restart: always
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '0.5'
          memory: 512M
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### 3.3 환경 변수 템플릿

```bash
# .env.example

# Server Configuration
PORT=3000
NODE_ENV=development

# LLM API Keys (at least one required)
ANTHROPIC_API_KEY=sk-ant-api03-xxx
GOOGLE_API_KEY=AIza-xxx
OPENAI_API_KEY=sk-xxx

# Database (optional, defaults to SQLite)
# DATABASE_URL=postgresql://user:pass@localhost:5432/jjiban

# Logging
LOG_LEVEL=info
```

---

## 4. 헬퍼 스크립트

### 4.1 빌드 스크립트

```bash
#!/bin/bash
# scripts/docker-build.sh

set -e

VERSION=${1:-latest}
IMAGE_NAME="jjiban/jjiban"

echo "🐳 Building Docker image: ${IMAGE_NAME}:${VERSION}"

# 빌드
docker build \
  --tag "${IMAGE_NAME}:${VERSION}" \
  --tag "${IMAGE_NAME}:latest" \
  --build-arg VERSION="${VERSION}" \
  --file Dockerfile \
  .

# 이미지 크기 확인
echo ""
echo "📦 Image size:"
docker images "${IMAGE_NAME}:${VERSION}" --format "{{.Size}}"

echo ""
echo "✅ Build complete: ${IMAGE_NAME}:${VERSION}"
```

### 4.2 실행 스크립트

```bash
#!/bin/bash
# scripts/docker-run.sh

set -e

# 환경 변수 파일 확인
if [ ! -f .env ]; then
  echo "⚠️  .env file not found. Copying from .env.example..."
  cp .env.example .env
  echo "📝 Please edit .env with your API keys."
  exit 1
fi

# 실행 모드 선택
MODE=${1:-dev}

case $MODE in
  dev)
    echo "🚀 Starting jjiban in development mode..."
    docker-compose up --build
    ;;
  prod)
    echo "🚀 Starting jjiban in production mode..."
    docker-compose -f docker-compose.prod.yml up -d
    ;;
  stop)
    echo "🛑 Stopping jjiban..."
    docker-compose down
    ;;
  logs)
    docker-compose logs -f
    ;;
  *)
    echo "Usage: ./docker-run.sh [dev|prod|stop|logs]"
    exit 1
    ;;
esac
```

---

## 5. 최적화 전략

### 5.1 이미지 크기 최적화

| 전략 | 설명 | 절감량 |
|------|------|--------|
| Alpine 베이스 | node:18 → node:18-alpine | ~600MB |
| 다중 스테이지 빌드 | devDependencies 제외 | ~200MB |
| .dockerignore | 불필요 파일 제외 | ~50MB |
| npm prune | 프로덕션 의존성만 | ~100MB |

**목표**: 최종 이미지 < 500MB

### 5.2 빌드 캐시 최적화

```dockerfile
# 의존성 레이어 (변경 빈도 낮음)
COPY package*.json ./
RUN npm install

# 소스 레이어 (변경 빈도 높음)
COPY . .
RUN npm run build
```

---

## 6. 보안 고려사항

### 6.1 컨테이너 보안

- 비root 사용자 실행 (`USER jjiban`)
- 최소 권한 원칙 적용
- 불필요한 패키지 미설치
- 환경 변수로 시크릿 관리

### 6.2 네트워크 보안

- 내부 네트워크 사용
- 필요한 포트만 노출
- Health check 엔드포인트 보호

---

## 7. 테스트 전략

### 7.1 빌드 테스트
- Docker 빌드 성공 확인
- 이미지 크기 검증 (< 500MB)
- 취약점 스캔 (trivy)

### 7.2 실행 테스트
- 컨테이너 시작 확인
- Health check 통과
- 볼륨 마운트 확인

### 7.3 통합 테스트
- docker-compose 전체 스택 실행
- API 응답 확인
- 데이터 영속성 확인

---

## 8. 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2025-12-06 | 초안 작성 |
