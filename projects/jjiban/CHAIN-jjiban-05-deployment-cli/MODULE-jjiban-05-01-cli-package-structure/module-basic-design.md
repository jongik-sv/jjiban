# Module 기본설계: CLI Package Structure

## 문서 정보

| 항목 | 내용 |
|------|------|
| Module ID | MODULE-jjiban-05-01 |
| 관련 PRD | module-prd.md |
| 문서 버전 | 1.0 |
| 작성일 | 2025-12-06 |
| 상태 | Draft |

---

## 1. 아키텍처 개요

### 1.1 Monorepo 구조

```
jjiban/
├── packages/
│   ├── cli/                          # CLI 도구 (npm 배포 대상)
│   │   ├── bin/
│   │   │   └── jjiban.js             # CLI 진입점 (shebang)
│   │   ├── src/
│   │   │   ├── index.ts              # 메인 엔트리
│   │   │   ├── commands/             # 명령어 모듈
│   │   │   │   └── index.ts
│   │   │   └── utils/                # 유틸리티
│   │   │       ├── logger.ts
│   │   │       └── config.ts
│   │   ├── templates/                # 프로젝트 템플릿
│   │   │   ├── .jjiban/
│   │   │   │   └── config.json
│   │   │   └── projects/
│   │   │       └── .gitkeep
│   │   ├── server/                   # 번들된 백엔드
│   │   │   └── dist/
│   │   │       └── main.js
│   │   ├── web/                      # 번들된 프론트엔드
│   │   │   └── dist/
│   │   │       └── (static files)
│   │   ├── prisma/                   # Prisma 스키마
│   │   │   └── schema.prisma
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── server/                       # 백엔드 소스
│   │   ├── src/
│   │   ├── prisma/
│   │   └── package.json
│   │
│   └── web/                          # 프론트엔드 소스
│       ├── src/
│       └── package.json
│
├── pnpm-workspace.yaml               # Workspace 설정
├── package.json                      # 루트 패키지
├── tsconfig.base.json                # 공통 TS 설정
└── .eslintrc.js                      # 공통 ESLint 설정
```

### 1.2 패키지 의존성 구조

```
┌─────────────────────────────────────────────────────┐
│                   @jjiban/cli                        │
│  (npm 배포 대상 - 모든 것을 포함)                    │
├─────────────────────────────────────────────────────┤
│  bin/jjiban.js     → CLI 진입점                     │
│  server/dist/      → 번들된 NestJS 서버             │
│  web/dist/         → 번들된 Next.js 정적 파일        │
│  templates/        → 프로젝트 템플릿                 │
│  prisma/           → DB 스키마                      │
└─────────────────────────────────────────────────────┘
          ▲ 빌드 시 복사
          │
┌─────────┴─────────┐    ┌─────────────────────┐
│   @jjiban/server  │    │    @jjiban/web      │
│   (개발용)        │    │    (개발용)         │
└───────────────────┘    └─────────────────────┘
```

---

## 2. CLI 진입점 설계

### 2.1 bin/jjiban.js

```javascript
#!/usr/bin/env node

/**
 * jjiban CLI 진입점
 *
 * Usage:
 *   jjiban <command> [options]
 *
 * Commands:
 *   init <name>    Initialize a new project
 *   start          Start the server
 *   stop           Stop the server
 *   migrate        Run database migrations
 *   status         Check server status
 *   update         Check for updates
 *   backup         Backup data
 *   restore        Restore from backup
 */

require('../dist/index.js');
```

### 2.2 src/index.ts

```typescript
import { Command } from 'commander';
import chalk from 'chalk';
import { version } from '../package.json';

const program = new Command();

program
  .name('jjiban')
  .description('AI-Assisted Development Kanban Tool')
  .version(version, '-v, --version', 'Output the current version');

// 명령어 등록 (MODULE-02에서 구현)
// program.command('init').action(...)
// program.command('start').action(...)

program.parse(process.argv);

// 명령어 없이 실행 시 도움말 표시
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
```

---

## 3. 번들링 설계

### 3.1 백엔드 번들링 (esbuild)

```typescript
// packages/server/esbuild.config.ts
import { build } from 'esbuild';

build({
  entryPoints: ['src/main.ts'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  outfile: 'dist/main.js',
  external: [
    // Native 모듈 제외
    '@prisma/client',
    'better-sqlite3',
  ],
  define: {
    'process.env.NODE_ENV': '"production"',
  },
});
```

### 3.2 프론트엔드 빌드 (Next.js Static Export)

```javascript
// packages/web/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // 정적 파일로 내보내기
  distDir: 'dist',
};

module.exports = nextConfig;
```

### 3.3 빌드 스크립트

```bash
#!/bin/bash
# scripts/build-cli.sh

set -e

echo "🔨 Building jjiban CLI package..."

# 1. 프론트엔드 빌드
echo "📦 Building frontend..."
pnpm --filter @jjiban/web build

# 2. 백엔드 빌드
echo "📦 Building backend..."
pnpm --filter @jjiban/server build

# 3. CLI 패키지로 복사
echo "📋 Copying to CLI package..."
rm -rf packages/cli/web/dist packages/cli/server/dist
cp -r packages/web/dist packages/cli/web/
cp -r packages/server/dist packages/cli/server/
cp -r packages/server/prisma packages/cli/

# 4. CLI 소스 빌드
echo "🔧 Building CLI..."
pnpm --filter @jjiban/cli build

# 5. 패키지 생성
echo "📦 Creating tarball..."
cd packages/cli
npm pack

echo "✅ Build complete!"
ls -lh *.tgz
```

---

## 4. package.json 설계

### 4.1 packages/cli/package.json

```json
{
  "name": "jjiban",
  "version": "1.0.0",
  "description": "AI-Assisted Development Kanban Tool",
  "keywords": ["kanban", "ai", "development", "cli"],
  "author": "Your Name",
  "license": "MIT",
  "bin": {
    "jjiban": "./bin/jjiban.js"
  },
  "main": "./dist/index.js",
  "files": [
    "bin/",
    "dist/",
    "server/",
    "web/",
    "templates/",
    "prisma/"
  ],
  "engines": {
    "node": ">=18.0.0"
  },
  "dependencies": {
    "commander": "^11.1.0",
    "inquirer": "^9.2.12",
    "chalk": "^5.3.0",
    "ora": "^7.0.1",
    "fs-extra": "^11.2.0",
    "open": "^10.0.0",
    "@prisma/client": "^5.7.0",
    "better-sqlite3": "^9.2.2"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@types/fs-extra": "^11.0.4",
    "typescript": "^5.3.0",
    "esbuild": "^0.19.0"
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsc -w",
    "prepublishOnly": "npm run build"
  }
}
```

### 4.2 pnpm-workspace.yaml

```yaml
packages:
  - 'packages/*'
```

### 4.3 루트 package.json

```json
{
  "name": "jjiban-monorepo",
  "private": true,
  "scripts": {
    "dev": "pnpm -r --parallel dev",
    "build": "./scripts/build-cli.sh",
    "build:web": "pnpm --filter @jjiban/web build",
    "build:server": "pnpm --filter @jjiban/server build",
    "build:cli": "pnpm --filter @jjiban/cli build",
    "clean": "pnpm -r clean",
    "lint": "pnpm -r lint",
    "test": "pnpm -r test"
  },
  "devDependencies": {
    "typescript": "^5.3.0"
  }
}
```

---

## 5. 템플릿 구조

### 5.1 templates/ 폴더

```
templates/
├── .jjiban/
│   ├── config.json         # 프로젝트 설정
│   └── .gitkeep
├── projects/
│   └── .gitkeep
└── .gitignore
```

### 5.2 config.json 템플릿

```json
{
  "name": "{{PROJECT_NAME}}",
  "version": "1.0.0",
  "port": 3000,
  "database": {
    "type": "sqlite",
    "path": ".jjiban/jjiban.db"
  },
  "llm": {
    "provider": "anthropic",
    "model": "claude-sonnet-4-20250514"
  }
}
```

---

## 6. 크로스 플랫폼 지원

### 6.1 경로 처리

```typescript
// src/utils/paths.ts
import path from 'path';
import os from 'os';

export function getJjibanDir(): string {
  return path.join(process.cwd(), '.jjiban');
}

export function getConfigPath(): string {
  return path.join(getJjibanDir(), 'config.json');
}

export function getDbPath(): string {
  return path.join(getJjibanDir(), 'jjiban.db');
}

// Windows 호환 경로 변환
export function normalizePath(p: string): string {
  return p.split(path.sep).join('/');
}
```

### 6.2 실행 권한 (postinstall)

```json
{
  "scripts": {
    "postinstall": "node scripts/postinstall.js"
  }
}
```

```javascript
// scripts/postinstall.js
const fs = require('fs');
const path = require('path');

// Unix 계열에서 실행 권한 부여
if (process.platform !== 'win32') {
  const binPath = path.join(__dirname, '../bin/jjiban.js');
  fs.chmodSync(binPath, '755');
}
```

---

## 7. 테스트 전략

### 7.1 단위 테스트
- Commander.js 명령어 파싱 테스트
- 경로 유틸리티 테스트
- 설정 파일 로딩 테스트

### 7.2 통합 테스트
- `npm pack` 결과물 검증
- 크로스 플랫폼 설치 테스트

### 7.3 E2E 테스트
- `npx jjiban --version` 테스트
- `npx jjiban --help` 테스트

---

## 8. 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2025-12-06 | 초안 작성 |
