# Module 기본설계: CLI Commands

## 문서 정보

| 항목 | 내용 |
|------|------|
| Module ID | MODULE-jjiban-05-02 |
| 관련 PRD | module-prd.md |
| 문서 버전 | 1.0 |
| 작성일 | 2025-12-06 |
| 상태 | Draft |

---

## 1. 아키텍처 개요

### 1.1 명령어 구조

```
packages/cli/src/
├── commands/
│   ├── index.ts              # 명령어 등록
│   ├── init.ts               # init 명령어
│   ├── start.ts              # start 명령어
│   ├── stop.ts               # stop 명령어
│   ├── status.ts             # status 명령어
│   ├── migrate.ts            # migrate 명령어
│   ├── update.ts             # update 명령어
│   └── wbs/
│       ├── index.ts          # wbs 서브커맨드
│       └── sync.ts           # wbs sync 명령어
├── utils/
│   ├── logger.ts             # 로깅 유틸리티
│   ├── spinner.ts            # 스피너 유틸리티
│   ├── config.ts             # 설정 관리
│   ├── process.ts            # 프로세스 관리
│   └── parser.ts             # Markdown 파서
└── index.ts                  # CLI 진입점
```

### 1.2 명령어 등록 패턴

```typescript
// src/index.ts
import { Command } from 'commander';
import { registerCommands } from './commands';

const program = new Command();

program
  .name('jjiban')
  .description('AI-Assisted Development Kanban Tool')
  .version(version);

// 모든 명령어 등록
registerCommands(program);

program.parse(process.argv);
```

---

## 2. 명령어 상세 설계

### 2.1 init 명령어

```typescript
// commands/init.ts
import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { execSync } from 'child_process';

interface InitOptions {
  port?: number;
  template?: string;
}

export function registerInit(program: Command) {
  program
    .command('init <name>')
    .description('Initialize a new jjiban project')
    .option('-p, --port <port>', 'Default server port', '3000')
    .option('-t, --template <template>', 'Project template', 'default')
    .action(async (name: string, options: InitOptions) => {
      await init(name, options);
    });
}

async function init(projectName: string, options: InitOptions) {
  const spinner = ora('Creating project...').start();

  try {
    const projectPath = path.join(process.cwd(), projectName);

    // 1. 폴더 존재 확인
    if (await fs.pathExists(projectPath)) {
      spinner.fail(chalk.red(`Directory "${projectName}" already exists`));
      process.exit(1);
    }

    // 2. 프로젝트 폴더 생성
    await fs.ensureDir(projectPath);
    spinner.text = 'Project folder created';

    // 3. 템플릿 복사
    const templatePath = path.join(__dirname, '../../templates');
    await fs.copy(templatePath, projectPath);
    spinner.text = 'Templates copied';

    // 4. config.json 생성
    const config = {
      name: projectName,
      version: '1.0.0',
      port: parseInt(options.port || '3000'),
      database: { type: 'sqlite', path: '.jjiban/jjiban.db' },
      llm: { provider: 'anthropic', model: 'claude-sonnet-4-20250514' }
    };
    await fs.writeJSON(
      path.join(projectPath, '.jjiban/config.json'),
      config,
      { spaces: 2 }
    );
    spinner.text = 'Configuration created';

    // 5. DB 생성 및 마이그레이션
    const originalDir = process.cwd();
    process.chdir(projectPath);
    execSync('npx prisma migrate deploy', { stdio: 'pipe' });
    process.chdir(originalDir);
    spinner.text = 'Database initialized';

    // 6. README.md 생성
    const readme = `# ${projectName}

Created with [jjiban](https://github.com/yourusername/jjiban) CLI.

## Getting Started

\`\`\`bash
cd ${projectName}
jjiban start
\`\`\`

## Commands

- \`jjiban start\` - Start the server
- \`jjiban stop\` - Stop the server
- \`jjiban status\` - Check server status
- \`jjiban migrate\` - Run database migrations
- \`jjiban wbs sync\` - Sync PRD to database
`;
    await fs.writeFile(path.join(projectPath, 'README.md'), readme);

    spinner.succeed(chalk.green('Project initialized successfully!'));

    console.log('');
    console.log(chalk.cyan('  Next steps:'));
    console.log(chalk.white(`    cd ${projectName}`));
    console.log(chalk.white('    jjiban start'));
    console.log('');

  } catch (error) {
    spinner.fail(chalk.red('Failed to initialize project'));
    console.error(error);
    process.exit(1);
  }
}
```

### 2.2 start/stop 명령어

```typescript
// commands/start.ts
import { Command } from 'commander';
import { spawn, ChildProcess } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import open from 'open';
import { getConfig, getJjibanDir } from '../utils/config';

interface StartOptions {
  port?: string;
  daemon?: boolean;
  open?: boolean;
}

export function registerStart(program: Command) {
  program
    .command('start')
    .description('Start the jjiban server')
    .option('-p, --port <port>', 'Server port')
    .option('-d, --daemon', 'Run in background')
    .option('-o, --open', 'Open browser automatically')
    .action(async (options: StartOptions) => {
      await start(options);
    });
}

async function start(options: StartOptions) {
  // 1. jjiban 프로젝트인지 확인
  const jjibanDir = getJjibanDir();
  if (!await fs.pathExists(jjibanDir)) {
    console.error(chalk.red('Error: Not a jjiban project.'));
    console.error(chalk.yellow('Run `jjiban init <name>` first.'));
    process.exit(1);
  }

  // 2. 이미 실행 중인지 확인
  const pidPath = path.join(jjibanDir, 'server.pid');
  if (await fs.pathExists(pidPath)) {
    const pid = await fs.readFile(pidPath, 'utf-8');
    console.error(chalk.yellow(`Server already running (PID: ${pid})`));
    console.error(chalk.cyan('Run `jjiban stop` first.'));
    process.exit(1);
  }

  // 3. 설정 읽기
  const config = await getConfig();
  const port = options.port || config.port || 3000;

  // 4. 서버 시작
  console.log(chalk.cyan(`Starting jjiban server on port ${port}...`));

  const serverPath = path.join(__dirname, '../../server/dist/main.js');

  const server = spawn('node', [serverPath], {
    env: {
      ...process.env,
      PORT: String(port),
      DATABASE_URL: `file:${path.join(process.cwd(), '.jjiban/jjiban.db')}`
    },
    stdio: options.daemon ? 'ignore' : 'inherit',
    detached: options.daemon,
  });

  if (options.daemon) {
    // PID 저장
    await fs.writeFile(pidPath, String(server.pid));
    server.unref();
    console.log(chalk.green(`Server started in background (PID: ${server.pid})`));
    console.log(chalk.cyan(`  http://localhost:${port}`));
  } else {
    console.log(chalk.green(`Server running at http://localhost:${port}`));
  }

  // 5. 브라우저 열기
  if (options.open) {
    setTimeout(() => {
      open(`http://localhost:${port}`);
    }, 2000);
  }
}

// commands/stop.ts
export async function stop() {
  const pidPath = path.join(getJjibanDir(), 'server.pid');

  if (!await fs.pathExists(pidPath)) {
    console.log(chalk.yellow('No server running.'));
    return;
  }

  const pid = parseInt(await fs.readFile(pidPath, 'utf-8'));

  try {
    process.kill(pid, 'SIGTERM');
    await fs.remove(pidPath);
    console.log(chalk.green(`Server stopped (PID: ${pid})`));
  } catch (error) {
    await fs.remove(pidPath);
    console.log(chalk.yellow('Server was not running (cleaned up PID file).'));
  }
}
```

### 2.3 wbs sync 명령어

```typescript
// commands/wbs/sync.ts
import { Command } from 'commander';
import fs from 'fs-extra';
import chalk from 'chalk';
import ora from 'ora';
import matter from 'gray-matter';
import { marked } from 'marked';

interface SyncOptions {
  epic?: string;
  chain?: string;
  module?: string;
  all?: boolean;
  project?: string;
  dryRun?: boolean;
}

export function registerWbsSync(program: Command) {
  const wbs = program
    .command('wbs')
    .description('WBS management commands');

  wbs
    .command('sync')
    .description('Sync PRD documents to database')
    .option('--epic <file>', 'Sync from Epic PRD')
    .option('--chain <file>', 'Sync from Chain PRD')
    .option('--module <file>', 'Sync from Module PRD')
    .option('--all', 'Sync entire project')
    .option('--project <id>', 'Target project ID')
    .option('--dry-run', 'Preview without applying')
    .action(async (options: SyncOptions) => {
      await syncWbs(options);
    });
}

async function syncWbs(options: SyncOptions) {
  const spinner = ora('Parsing PRD...').start();

  try {
    let items: WbsItem[] = [];

    if (options.epic) {
      items = await parseEpicPrd(options.epic);
    } else if (options.chain) {
      items = await parseChainPrd(options.chain);
    } else if (options.module) {
      items = await parseModulePrd(options.module);
    } else if (options.all) {
      items = await parseAllPrds(options.project);
    } else {
      spinner.fail(chalk.red('Please specify a PRD file or --all flag'));
      process.exit(1);
    }

    spinner.text = `Found ${items.length} items`;

    if (options.dryRun) {
      spinner.succeed(chalk.cyan('Dry run - no changes applied'));
      console.log('');
      console.log(chalk.white('Items to sync:'));
      items.forEach(item => {
        const icon = item.type === 'epic' ? '📦' :
                     item.type === 'chain' ? '🔗' :
                     item.type === 'module' ? '📋' : '✅';
        console.log(`  ${icon} [${item.type.toUpperCase()}] ${item.id}: ${item.title}`);
      });
      return;
    }

    // DB 동기화
    spinner.text = 'Syncing to database...';
    await syncToDatabase(items);

    spinner.succeed(chalk.green(`Synced ${items.length} items successfully`));

  } catch (error) {
    spinner.fail(chalk.red('Sync failed'));
    console.error(error);
    process.exit(1);
  }
}

interface WbsItem {
  type: 'epic' | 'chain' | 'module' | 'task';
  id: string;
  title: string;
  description?: string;
  parentId?: string;
  status?: string;
  metadata?: Record<string, any>;
}

async function parseChainPrd(filePath: string): Promise<WbsItem[]> {
  const content = await fs.readFile(filePath, 'utf-8');
  const { data: frontmatter, content: markdown } = matter(content);

  const items: WbsItem[] = [];

  // Chain 정보 추출
  const chainId = extractFromTable(markdown, 'Chain ID');
  const chainName = extractFromTable(markdown, 'Chain 이름');

  items.push({
    type: 'chain',
    id: chainId,
    title: chainName,
    description: extractSection(markdown, 'Chain 비전'),
    metadata: { frontmatter }
  });

  // Module 목록 추출
  const moduleRegex = /### (MODULE-[\w-]+): ([^\n]+) \(([^)]+)\)/g;
  let match;

  while ((match = moduleRegex.exec(markdown)) !== null) {
    const [, moduleId, moduleName, duration] = match;

    // 해당 Module의 기능과 인수조건 추출
    const moduleSection = extractModuleSection(markdown, moduleId);

    items.push({
      type: 'module',
      id: moduleId,
      title: moduleName,
      parentId: chainId,
      description: moduleSection.vision,
      metadata: {
        duration,
        features: moduleSection.features,
        acceptanceCriteria: moduleSection.acceptanceCriteria
      }
    });
  }

  return items;
}

// 헬퍼 함수들
function extractFromTable(markdown: string, key: string): string {
  const regex = new RegExp(`\\|\\s*${key}\\s*\\|\\s*([^|]+)\\s*\\|`);
  const match = markdown.match(regex);
  return match ? match[1].trim() : '';
}

function extractSection(markdown: string, heading: string): string {
  const regex = new RegExp(`### .*${heading}[\\s\\S]*?\\n([\\s\\S]*?)(?=###|$)`);
  const match = markdown.match(regex);
  return match ? match[1].trim() : '';
}

function extractModuleSection(markdown: string, moduleId: string) {
  // Module 섹션 파싱 로직
  return {
    vision: '',
    features: [],
    acceptanceCriteria: []
  };
}

async function syncToDatabase(items: WbsItem[]) {
  // Prisma를 통한 DB 동기화
  // 구현 예정
}
```

---

## 3. 유틸리티 설계

### 3.1 로거

```typescript
// utils/logger.ts
import chalk from 'chalk';

export const logger = {
  info: (msg: string) => console.log(chalk.cyan('ℹ'), msg),
  success: (msg: string) => console.log(chalk.green('✔'), msg),
  warn: (msg: string) => console.log(chalk.yellow('⚠'), msg),
  error: (msg: string) => console.log(chalk.red('✖'), msg),
  debug: (msg: string) => {
    if (process.env.DEBUG) {
      console.log(chalk.gray('🐛'), msg);
    }
  }
};
```

### 3.2 설정 관리

```typescript
// utils/config.ts
import fs from 'fs-extra';
import path from 'path';

export interface JjibanConfig {
  name: string;
  version: string;
  port: number;
  database: {
    type: 'sqlite';
    path: string;
  };
  llm: {
    provider: string;
    model: string;
  };
}

export function getJjibanDir(): string {
  return path.join(process.cwd(), '.jjiban');
}

export async function getConfig(): Promise<JjibanConfig> {
  const configPath = path.join(getJjibanDir(), 'config.json');

  if (!await fs.pathExists(configPath)) {
    throw new Error('config.json not found');
  }

  return fs.readJSON(configPath);
}

export async function saveConfig(config: JjibanConfig): Promise<void> {
  const configPath = path.join(getJjibanDir(), 'config.json');
  await fs.writeJSON(configPath, config, { spaces: 2 });
}
```

---

## 4. 에러 처리

### 4.1 공통 에러 핸들러

```typescript
// utils/error.ts
import chalk from 'chalk';

export class JjibanError extends Error {
  constructor(
    message: string,
    public code: string,
    public suggestion?: string
  ) {
    super(message);
    this.name = 'JjibanError';
  }
}

export function handleError(error: unknown): never {
  if (error instanceof JjibanError) {
    console.error(chalk.red(`Error [${error.code}]: ${error.message}`));
    if (error.suggestion) {
      console.error(chalk.yellow(`Suggestion: ${error.suggestion}`));
    }
  } else if (error instanceof Error) {
    console.error(chalk.red(`Error: ${error.message}`));
  } else {
    console.error(chalk.red('An unknown error occurred'));
  }

  process.exit(1);
}
```

---

## 5. 테스트 전략

### 5.1 단위 테스트
- 각 명령어 함수 테스트
- Markdown 파서 테스트
- 설정 로딩 테스트

### 5.2 통합 테스트
- init → start → status → stop 흐름
- wbs sync 전체 흐름

### 5.3 E2E 테스트
- 실제 프로젝트 생성 후 명령어 실행
- 다양한 옵션 조합 테스트

---

## 6. 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2025-12-06 | 초안 작성 |
