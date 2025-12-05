# jjiban 프로젝트 초기 설정 가이드

이 문서는 jjiban 프로젝트의 초기 설정 및 개발 환경 구성 가이드입니다.
EPIC-P01 (플랫폼 인프라)의 설정 방법을 단계별로 안내합니다.

---

## 목차

1. [개발 환경 설정](#1-개발-환경-설정)
2. [Git 전략 및 브랜치 규칙](#2-git-전략-및-브랜치-규칙)
3. [데이터베이스 초기화](#3-데이터베이스-초기화)
4. [사용자 관리 및 인증](#4-사용자-관리-및-인증)
5. [디자인 시스템 설정](#5-디자인-시스템-설정)
6. [시스템 설정 파일](#6-시스템-설정-파일)
7. [CI/CD 파이프라인](#7-cicd-파이프라인)
8. [로깅 시스템](#8-로깅-시스템)
9. [전역 에러 처리](#9-전역-에러-처리)
10. [보안 설정](#10-보안-설정)

---

## 1. 개발 환경 설정

### 필수 요구사항

- **Node.js**: 18.x 이상
- **npm**: 9.x 이상
- **Git**: 2.x 이상
- **SQLite**: 3.x (Node.js에 포함)

### 설치 확인

```bash
node --version   # v18.x.x 이상
npm --version    # 9.x.x 이상
git --version    # 2.x.x 이상
```

### 프로젝트 클론 및 의존성 설치

```bash
git clone <repository-url>
cd jjiban
npm install
```

---

## 2. Git 전략 및 브랜치 규칙

### 브랜치 전략

```
main (프로덕션)
  └── develop (개발)
       ├── feature/EPIC-001-project-management
       ├── feature/EPIC-002-workflow-engine
       └── hotfix/bug-fix-123
```

**브랜치 규칙:**
- `main`: 프로덕션 릴리즈 (태그: v1.0.0, v1.1.0)
- `develop`: 개발 브랜치
- `feature/*`: 기능 개발 (Epic/Task 단위)
- `hotfix/*`: 긴급 수정

### 커밋 메시지 규칙

```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
refactor: 코드 리팩토링
test: 테스트 코드 추가/수정
chore: 빌드 설정 변경
```

**예시:**
```bash
git commit -m "feat: Add JWT authentication"
git commit -m "fix: Resolve login timeout issue"
git commit -m "docs: Update SETUP.md"
```

### Git 훅 설정 (선택)

```bash
# pre-commit hook (ESLint)
npm install husky --save-dev
npx husky install
npx husky add .husky/pre-commit "npm run lint"
```

---

## 3. 데이터베이스 초기화

### Prisma 설정

**파일 경로:** `packages/server/prisma/schema.prisma`

```bash
cd packages/server
npx prisma init
```

### 데이터베이스 마이그레이션

**초기 마이그레이션:**
```bash
npx prisma migrate dev --name init
```

**결과:**
- `.jjiban/jjiban.db` (SQLite 파일 생성)
- `prisma/migrations/` (마이그레이션 히스토리)

### Prisma Client 생성

```bash
npx prisma generate
```

### 시드 데이터 생성 (선택)

**파일:** `prisma/seed.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.create({
    data: {
      email: 'admin@jjiban.local',
      password: '$2b$10$...', // bcrypt 해시
      name: 'Admin',
      role: 'Admin'
    }
  });
  console.log('Seeding completed:', admin);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

**실행:**
```bash
npx prisma db seed
```

### Prisma Schema 정의

**파일:** `packages/server/prisma/schema.prisma`

**User 테이블:**
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String   // bcrypt 해시
  name      String
  role      String   @default("Developer")  // Admin, ProjectManager, Developer, Viewer
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  assignedTasks  Task[]
  plProjects     Epic[]
}
```

**Epic/Chain/Module/Task 테이블:**
```prisma
model Epic {
  id          String   @id @default(cuid())
  name        String
  description String?
  status      String   @default("active")
  plId        String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  pl          User?    @relation(fields: [plId], references: [id])
  chains      Chain[]
}

model Chain {
  id        String   @id @default(cuid())
  epicId    String
  name      String
  status    String   @default("planning")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  epic      Epic     @relation(fields: [epicId], references: [id], onDelete: Cascade)
  modules   Module[]
}

model Module {
  id        String   @id @default(cuid())
  chainId   String
  name      String
  status    String   @default("todo")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  chain     Chain    @relation(fields: [chainId], references: [id], onDelete: Cascade)
  tasks     Task[]
}

model Task {
  id          String   @id @default(cuid())
  moduleId    String
  name        String
  status      String   @default("todo")
  assigneeId  String?
  priority    String   @default("medium")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  module      Module   @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  assignee    User?    @relation(fields: [assigneeId], references: [id])
}
```

### 데이터베이스 백업

```bash
# SQLite DB 파일 백업
cp .jjiban/jjiban.db .jjiban/backups/jjiban-$(date +%Y%m%d).db

# 또는 SQL 덤프
sqlite3 .jjiban/jjiban.db .dump > backup.sql
```

---

## 4. 사용자 관리 및 인증

### JWT 인증 설정

**설치:**
```bash
npm install jsonwebtoken bcrypt
npm install -D @types/jsonwebtoken @types/bcrypt
```

**JWT 유틸리티 (`packages/server/src/utils/jwt.ts`):**
```typescript
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const ACCESS_TOKEN_EXPIRES = '15m';
const REFRESH_TOKEN_EXPIRES = '7d';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export const generateAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES });
};

export const generateRefreshToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};
```

### 비밀번호 해싱 (bcrypt)

**비밀번호 유틸리티 (`packages/server/src/utils/password.ts`):**
```typescript
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
```

### 인증 미들웨어

**파일:** `packages/server/src/middleware/auth.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.substring(7); // Remove 'Bearer '

  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
```

### 역할 기반 접근 제어 (RBAC)

**RBAC 미들웨어 (`packages/server/src/middleware/rbac.ts`):**
```typescript
import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden: Insufficient permissions',
        required: allowedRoles,
        current: req.user.role
      });
    }

    next();
  };
};
```

**사용 예시:**
```typescript
import express from 'express';
import { authenticate } from './middleware/auth';
import { requireRole } from './middleware/rbac';

const app = express();

// 인증 필요
app.get('/api/profile', authenticate, (req, res) => {
  res.json({ user: req.user });
});

// Admin 또는 ProjectManager만 접근 가능
app.delete('/api/projects/:id',
  authenticate,
  requireRole(['Admin', 'ProjectManager']),
  (req, res) => {
    // 프로젝트 삭제 로직
  }
);

// Developer 이상 접근 가능
app.post('/api/tasks',
  authenticate,
  requireRole(['Admin', 'ProjectManager', 'Developer']),
  (req, res) => {
    // Task 생성 로직
  }
);
```

### 로그인 API 예시

**파일:** `packages/server/src/routes/auth.ts`

```typescript
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';

const router = express.Router();
const prisma = new PrismaClient();

// 로그인
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 사용자 조회
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 비밀번호 검증
    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // JWT 생성
    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 회원가입
router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;

  try {
    // 이메일 중복 확인
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // 비밀번호 해싱
    const hashedPassword = await hashPassword(password);

    // 사용자 생성
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'Developer'
      }
    });

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
```

---

## 5. 디자인 시스템 설정

### UI 프레임워크 선택

**옵션 1: Ant Design (권장)**
```bash
npm install antd @ant-design/icons
```

**옵션 2: Shadcn UI**
```bash
npx shadcn-ui@latest init
```

### Tailwind CSS 설정

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**`tailwind.config.js`:**
```javascript
module.exports = {
  content: [
    "./packages/web/src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          100: '#e6f7ff',
          500: '#1890ff',
          700: '#096dd9'
        }
      }
    }
  },
  plugins: []
}
```

### 색상 팔레트 (CSS Variables)

**`styles/globals.css`:**
```css
:root {
  /* Primary Colors */
  --primary-100: #e6f7ff;
  --primary-500: #1890ff;
  --primary-700: #096dd9;

  /* Gray Scale */
  --gray-100: #f5f5f5;
  --gray-500: #8c8c8c;
  --gray-900: #000000;

  /* Semantic Colors */
  --success: #52c41a;
  --warning: #faad14;
  --error: #f5222d;
}
```

---

## 6. 시스템 설정 파일

### 환경 변수 (.env)

**파일 경로:** `.env` (Git 무시)

```bash
# LLM API Keys
ANTHROPIC_API_KEY=sk-ant-xxx
GOOGLE_API_KEY=AIzaSyxxx

# Database
DATABASE_URL=file:./.jjiban/jjiban.db

# JWT Secret
JWT_SECRET=your-secret-key-here-change-in-production
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# Server
NODE_ENV=development
PORT=3000
```

**보안 주의사항:**
- `.env` 파일은 절대 Git에 커밋하지 마세요
- `.env.example` 파일을 생성하여 템플릿 제공

### 프로젝트 설정 (config.json)

**파일 경로:** `.jjiban/config.json`

```json
{
  "name": "my-kanban-project",
  "version": "1.0.0",
  "port": 3000,
  "database": {
    "type": "sqlite",
    "path": ".jjiban/jjiban.db"
  },
  "server": {
    "host": "localhost",
    "cors": true
  },
  "features": {
    "terminal": true,
    "llm": true,
    "autoWorkflow": true
  },
  "paths": {
    "projects": "./projects",
    "templates": "./templates",
    "logs": ".jjiban/logs"
  }
}
```

### LLM 연결 설정 (llm-config.yaml)

**파일 경로:** `.jjiban/llm-config.yaml`

```yaml
providers:
  - name: claude
    enabled: true
    apiKey: ${ANTHROPIC_API_KEY}
    model: claude-3-5-sonnet-20241022
    maxTokens: 4096
    temperature: 0.7

  - name: gemini
    enabled: true
    apiKey: ${GOOGLE_API_KEY}
    model: gemini-2.0-flash-exp
    maxTokens: 8192
    temperature: 0.7

defaultProvider: claude

terminal:
  defaultShell: bash
  sessionTimeout: 3600
  maxSessions: 10
```

---

## 7. CI/CD 파이프라인

### GitHub Actions 워크플로우

**파일 경로:** `.github/workflows/ci.yml`

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Run tests
        run: npm run test

      - name: Lint
        run: npm run lint

  deploy:
    needs: build-and-test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to npm
        run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### npm 배포 설정

**버전 업데이트:**
```bash
npm version patch   # 1.0.0 → 1.0.1
npm version minor   # 1.0.0 → 1.1.0
npm version major   # 1.0.0 → 2.0.0
```

**Git 태그 푸시:**
```bash
git push --tags
```

---

## 8. 로깅 시스템

### Winston 로거 설정

**설치:**
```bash
npm install winston
```

**파일:** `packages/server/src/utils/logger.ts`

```typescript
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: '.jjiban/logs/error.log',
      level: 'error'
    }),
    new winston.transports.File({
      filename: '.jjiban/logs/combined.log'
    }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});
```

### 로그 레벨

- `error`: 시스템 오류, 예외
- `warn`: 경고 메시지
- `info`: 정보성 로그
- `debug`: 디버깅용 로그

### 사용 예시

```typescript
import { logger } from './utils/logger';

logger.info('Server started', { port: 3000 });
logger.error('Database connection failed', { error: err.message });
logger.debug('Task created', { taskId: 'TASK-001' });
```

### 로그 파일 로테이션

**설치:**
```bash
npm install winston-daily-rotate-file
```

**설정:**
```typescript
import DailyRotateFile from 'winston-daily-rotate-file';

const transport = new DailyRotateFile({
  filename: '.jjiban/logs/application-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d'
});

logger.add(transport);
```

---

## 9. 전역 에러 처리

### Express 에러 핸들러

**파일:** `packages/server/src/middleware/errorHandler.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};
```

### React 에러 바운더리

**파일:** `packages/web/src/components/ErrorBoundary.tsx`

```tsx
import React from 'react';
import { logger } from '../utils/logger';

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('React error', { error, errorInfo });
    this.setState({ hasError: true });
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. Please refresh the page.</div>;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
```

---

## 10. 보안 설정

### CORS 설정

**설치:**
```bash
npm install cors
npm install -D @types/cors
```

**파일:** `packages/server/src/middleware/cors.ts`

```typescript
import cors from 'cors';

export const corsOptions = {
  origin: process.env.NODE_ENV === 'development'
    ? ['http://localhost:3000', 'http://localhost:5173']
    : ['https://yourdomain.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// app.ts
import express from 'express';
const app = express();
app.use(cors(corsOptions));
```

### Helmet (보안 헤더)

**설치:**
```bash
npm install helmet
```

**사용:**
```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    }
  }
}));
```

### XSS 방지

**설치:**
```bash
npm install validator
```

**입력 Sanitization:**
```typescript
import validator from 'validator';

export const sanitizeInput = (input: string): string => {
  return validator.escape(input.trim());
};

// 사용 예시
app.post('/api/tasks', authenticate, async (req, res) => {
  const taskName = sanitizeInput(req.body.name);
  const description = sanitizeInput(req.body.description);
  // ...
});
```

### Rate Limiting

**설치:**
```bash
npm install express-rate-limit
```

**설정:**
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // IP당 100개 요청
  message: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.'
});

app.use('/api/', limiter);
```

---

## 11. 체크리스트

프로젝트 초기 설정이 완료되었는지 확인하세요:

**환경 설정:**
- [ ] Node.js 18+ 설치 확인
- [ ] Git 브랜치 전략 설정
- [ ] `.env` 파일 생성 및 API Key 설정

**데이터베이스:**
- [ ] Prisma Schema 정의 (User, Epic, Chain, Module, Task)
- [ ] Prisma 마이그레이션 완료 (`.jjiban/jjiban.db` 생성)
- [ ] Prisma Client 생성 (`npx prisma generate`)

**사용자 관리:**
- [ ] jsonwebtoken, bcrypt 설치
- [ ] JWT 유틸리티 구현 (`utils/jwt.ts`)
- [ ] 비밀번호 해싱 유틸리티 구현 (`utils/password.ts`)
- [ ] 인증 미들웨어 구현 (`middleware/auth.ts`)
- [ ] RBAC 미들웨어 구현 (`middleware/rbac.ts`)
- [ ] 로그인/회원가입 API 구현

**UI:**
- [ ] Ant Design 또는 Shadcn 설치
- [ ] Tailwind CSS 설정 완료

**시스템:**
- [ ] `.jjiban/config.json` 생성
- [ ] `.jjiban/llm-config.yaml` 생성
- [ ] Winston 로거 설정

**보안:**
- [ ] CORS 설정
- [ ] Helmet 보안 헤더
- [ ] XSS 방지 (validator)
- [ ] Rate Limiting
- [ ] Express 에러 핸들러 구현
- [ ] React Error Boundary 구현

**DevOps:**
- [ ] GitHub Actions 워크플로우 생성

---

## 12. 문제 해결

### SQLite DB 파일이 생성되지 않음
```bash
# Prisma 재생성
npx prisma generate
npx prisma migrate reset
```

### npm install 실패
```bash
# 캐시 삭제 후 재설치
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### 환경 변수가 로드되지 않음
```bash
# dotenv 설치 확인
npm install dotenv

# 코드에서 로드
import dotenv from 'dotenv';
dotenv.config();
```

### JWT 토큰 검증 실패
```typescript
// JWT_SECRET 환경 변수 확인
console.log(process.env.JWT_SECRET);

// .env 파일 로드 확인
import dotenv from 'dotenv';
dotenv.config();
```

---

## 13. 참고 자료

**플랫폼 인프라:**
- **EPIC-P01 PRD**: `projects/EPIC-P01-user-management/epic-prd.md`

**기술 문서:**
- **Prisma 문서**: https://www.prisma.io/docs
- **JWT**: https://jwt.io/
- **bcrypt**: https://github.com/kelektiv/node.bcrypt.js
- **Ant Design**: https://ant.design/
- **Tailwind CSS**: https://tailwindcss.com/
- **Winston**: https://github.com/winstonjs/winston
- **GitHub Actions**: https://docs.github.com/actions
- **OWASP Top 10**: https://owasp.org/www-project-top-ten/
