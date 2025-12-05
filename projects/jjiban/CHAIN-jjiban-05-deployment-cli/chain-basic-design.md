# Chain 기본설계: Deployment & CLI Tools

## 문서 정보

| 항목 | 내용 |
|------|------|
| Chain ID | CHAIN-jjiban-05 |
| 관련 PRD | chain-prd.md |
| 문서 버전 | 1.0 |
| 작성일 | 2024-12-06 |
| 상태 | Draft |

---

## 1. 아키텍처 개요

### 1.1 Monorepo 구조

```
jjiban/
├── packages/
│   ├── cli/                          # CLI 도구 (배포 대상)
│   │   ├── bin/
│   │   │   └── jjiban.js             # CLI 진입점
│   │   ├── commands/
│   │   │   ├── init.js
│   │   │   ├── start.js
│   │   │   ├── stop.js
│   │   │   ├── migrate.js
│   │   │   ├── status.js
│   │   │   └── update.js
│   │   ├── templates/
│   │   ├── server/dist/              # 번들된 백엔드
│   │   ├── web/dist/                 # 번들된 프론트엔드
│   │   └── package.json
│   │
│   ├── server/                       # 백엔드 소스
│   │   ├── src/
│   │   └── prisma/
│   │
│   └── web/                          # 프론트엔드 소스
│       └── src/
│
└── package.json                      # 루트 (monorepo)
```

### 1.2 CLI 실행 흐름

```
사용자 → jjiban init my-project
         │
         ▼
      bin/jjiban.js (진입점)
         │
         ▼
      Commander.js (명령어 파싱)
         │
         ▼
   commands/init.js (명령어 실행)
         │
         ├─► 1. 폴더 생성
         ├─► 2. 템플릿 복사
         ├─► 3. DB 생성
         └─► 4. README 생성
```

---

## 2. CLI 명령어 구현

### 2.1 jjiban init 명령어

```javascript
// commands/init.js
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');
const inquirer = require('inquirer');

async function init(projectName, options) {
  const spinner = ora('Creating project...').start();

  try {
    // 1. 프로젝트 폴더 생성
    const projectPath = path.join(process.cwd(), projectName);
    await fs.ensureDir(projectPath);
    spinner.text = 'Project folder created';

    // 2. 템플릿 복사
    const templatePath = path.join(__dirname, '../templates');
    await fs.copy(templatePath, projectPath);
    spinner.text = 'Templates copied';

    // 3. config.json 생성
    const config = {
      name: projectName,
      version: '1.0.0',
      port: options.port || 3000,
      database: { type: 'sqlite', path: '.jjiban/jjiban.db' }
    };
    await fs.writeJSON(path.join(projectPath, '.jjiban/config.json'), config, { spaces: 2 });
    spinner.text = 'Configuration created';

    // 4. SQLite DB 생성 및 마이그레이션
    process.chdir(projectPath);
    const { execSync } = require('child_process');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    spinner.text = 'Database initialized';

    // 5. README 생성
    const readme = `# ${projectName}\n\nCreated with jjiban CLI.\n\n## Getting Started\n\n\`\`\`bash\ncd ${projectName}\njjiban start\n\`\`\``;
    await fs.writeFile(path.join(projectPath, 'README.md'), readme);

    spinner.succeed(chalk.green('Project initialized successfully!'));
    console.log(chalk.cyan(`\n  cd ${projectName}`));
    console.log(chalk.cyan(`  jjiban start\n`));

  } catch (error) {
    spinner.fail(chalk.red('Failed to initialize project'));
    console.error(error);
    process.exit(1);
  }
}

module.exports = { init };
```

### 2.2 jjiban start 명령어

```javascript
// commands/start.js
const { spawn } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

async function start(options) {
  // 1. 설정 파일 읽기
  const configPath = path.join(process.cwd(), '.jjiban/config.json');
  if (!await fs.pathExists(configPath)) {
    console.error(chalk.red('Error: Not a jjiban project. Run `jjiban init` first.'));
    process.exit(1);
  }

  const config = await fs.readJSON(configPath);
  const port = options.port || config.port || 3000;

  // 2. 서버 시작
  console.log(chalk.cyan(`Starting jjiban server on port ${port}...`));

  const serverPath = path.join(__dirname, '../server/dist/main.js');
  const server = spawn('node', [serverPath], {
    env: { ...process.env, PORT: port },
    stdio: 'inherit',
    detached: options.daemon
  });

  if (options.daemon) {
    // PID 파일 저장
    await fs.writeFile('.jjiban/server.pid', server.pid.toString());
    console.log(chalk.green(`Server started in background (PID: ${server.pid})`));
  }

  // 3. 브라우저 열기
  if (options.open) {
    const open = require('open');
    await open(`http://localhost:${port}`);
  }
}

module.exports = { start };
```

---

## 3. Docker 설정

### 3.1 Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# jjiban CLI 전역 설치
RUN npm install -g jjiban

# 프로젝트 초기화
RUN jjiban init jjiban-project

WORKDIR /app/jjiban-project

# 포트 노출
EXPOSE 3000

# 볼륨 마운트
VOLUME ["/app/jjiban-project/.jjiban", "/app/jjiban-project/projects"]

# 서버 시작
CMD ["jjiban", "start"]
```

### 3.2 docker-compose.yml

```yaml
version: '3.8'

services:
  jjiban:
    image: jjiban/jjiban:latest
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/jjiban-project/.jjiban
      - ./projects:/app/jjiban-project/projects
    environment:
      - NODE_ENV=production
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - GOOGLE_API_KEY=${GOOGLE_API_KEY}
    restart: unless-stopped
```

---

## 4. npm 배포 프로세스

### 4.1 빌드 스크립트

```bash
#!/bin/bash
# build.sh

echo "Building frontend..."
cd packages/web
npm run build
cd ../..

echo "Building backend..."
cd packages/server
npm run build
cd ../..

echo "Copying to CLI package..."
cp -r packages/web/dist packages/cli/web/
cp -r packages/server/dist packages/cli/server/
cp -r packages/server/prisma packages/cli/server/

echo "Creating tarball..."
cd packages/cli
npm pack

echo "Build complete! Package: jjiban-1.0.0.tgz"
```

### 4.2 배포 명령어

```bash
cd packages/cli

# 1. 버전 업데이트
npm version patch   # 1.0.0 → 1.0.1

# 2. npm 배포
npm publish

# 또는 스코프 패키지
npm publish --access public
```

---

## 5. 보안 및 성능

### 5.1 보안 고려사항
- **API 키 보호**: 환경 변수 또는 .env 파일 사용
- **PID 파일 권한**: 600 (소유자만 읽기/쓰기)
- **Docker 볼륨**: 호스트 경로 검증

### 5.2 성능 목표
- CLI 시작 시간: < 1s
- 프로젝트 초기화: < 10s
- 서버 시작: < 5s
- Docker 이미지 크기: < 500MB

---

## 6. 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2024-12-06 | 초안 작성 |
