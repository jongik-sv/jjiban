# Module 기본설계: Backup & Restore

## 문서 정보

| 항목 | 내용 |
|------|------|
| Module ID | MODULE-jjiban-05-05 |
| 관련 PRD | module-prd.md |
| 문서 버전 | 1.0 |
| 작성일 | 2025-12-06 |
| 상태 | Draft |

---

## 1. 아키텍처 개요

### 1.1 컴포넌트 구조

```
packages/cli/src/
├── commands/
│   └── backup/
│       ├── index.ts           # backup 서브커맨드
│       ├── create.ts          # backup 생성
│       ├── restore.ts         # backup 복원
│       ├── list.ts            # backup 목록
│       └── clean.ts           # 오래된 백업 정리
├── services/
│   └── backup.ts              # 백업 서비스
└── utils/
    ├── archive.ts             # 압축/해제 유틸리티
    └── checksum.ts            # 무결성 검증
```

### 1.2 백업 구조

```
.jjiban/
└── backups/
    ├── backup-20251206-143022.tar.gz     # 백업 파일
    ├── backup-20251206-143022.meta.json  # 메타데이터
    └── backup-20251205-091500.tar.gz
```

### 1.3 백업 내용물

```
backup-20251206-143022.tar.gz
├── jjiban.db                  # SQLite 데이터베이스
├── config.json                # 설정 파일
├── projects/                  # 프로젝트 문서
│   ├── project-a/
│   └── project-b/
└── .backup-meta.json          # 백업 메타데이터
```

---

## 2. 백업 서비스 설계

### 2.1 BackupService

```typescript
// services/backup.ts
import fs from 'fs-extra';
import path from 'path';
import archiver from 'archiver';
import tar from 'tar';
import { createHash } from 'crypto';
import { format } from 'date-fns';

interface BackupMeta {
  id: string;
  createdAt: string;
  version: string;
  size: number;
  checksum: string;
  description?: string;
  contents: {
    database: boolean;
    config: boolean;
    projects: string[];
  };
}

interface BackupOptions {
  description?: string;
  excludeProjects?: boolean;
  outputPath?: string;
}

interface RestoreOptions {
  skipConfig?: boolean;
  skipProjects?: boolean;
  force?: boolean;
}

export class BackupService {
  private jjibanDir: string;
  private backupsDir: string;

  constructor() {
    this.jjibanDir = path.join(process.cwd(), '.jjiban');
    this.backupsDir = path.join(this.jjibanDir, 'backups');
  }

  async create(options: BackupOptions = {}): Promise<BackupMeta> {
    await fs.ensureDir(this.backupsDir);

    const timestamp = format(new Date(), 'yyyyMMdd-HHmmss');
    const backupId = `backup-${timestamp}`;
    const backupPath = options.outputPath ||
      path.join(this.backupsDir, `${backupId}.tar.gz`);

    // 임시 디렉토리에 파일 복사
    const tempDir = path.join(this.backupsDir, `.temp-${timestamp}`);
    await fs.ensureDir(tempDir);

    try {
      // 1. 데이터베이스 복사
      const dbPath = path.join(this.jjibanDir, 'jjiban.db');
      if (await fs.pathExists(dbPath)) {
        await fs.copy(dbPath, path.join(tempDir, 'jjiban.db'));
      }

      // 2. 설정 파일 복사
      const configPath = path.join(this.jjibanDir, 'config.json');
      if (await fs.pathExists(configPath)) {
        await fs.copy(configPath, path.join(tempDir, 'config.json'));
      }

      // 3. 프로젝트 폴더 복사
      const projectsDir = path.join(process.cwd(), 'projects');
      const projectsList: string[] = [];
      if (!options.excludeProjects && await fs.pathExists(projectsDir)) {
        await fs.copy(projectsDir, path.join(tempDir, 'projects'));
        const projects = await fs.readdir(projectsDir);
        projectsList.push(...projects);
      }

      // 4. 메타데이터 생성
      const meta: BackupMeta = {
        id: backupId,
        createdAt: new Date().toISOString(),
        version: this.getVersion(),
        size: 0,
        checksum: '',
        description: options.description,
        contents: {
          database: await fs.pathExists(dbPath),
          config: await fs.pathExists(configPath),
          projects: projectsList,
        },
      };

      // 임시 메타데이터 저장
      await fs.writeJSON(
        path.join(tempDir, '.backup-meta.json'),
        meta,
        { spaces: 2 }
      );

      // 5. tar.gz 압축
      await this.compress(tempDir, backupPath);

      // 6. 체크섬 계산
      meta.checksum = await this.calculateChecksum(backupPath);
      meta.size = (await fs.stat(backupPath)).size;

      // 메타데이터 파일 저장
      const metaPath = backupPath.replace('.tar.gz', '.meta.json');
      await fs.writeJSON(metaPath, meta, { spaces: 2 });

      return meta;

    } finally {
      // 임시 디렉토리 정리
      await fs.remove(tempDir);
    }
  }

  async restore(backupPath: string, options: RestoreOptions = {}): Promise<void> {
    // 1. 백업 파일 존재 확인
    if (!await fs.pathExists(backupPath)) {
      throw new Error(`Backup file not found: ${backupPath}`);
    }

    // 2. 체크섬 검증
    const metaPath = backupPath.replace('.tar.gz', '.meta.json');
    if (await fs.pathExists(metaPath)) {
      const meta: BackupMeta = await fs.readJSON(metaPath);
      const checksum = await this.calculateChecksum(backupPath);
      if (checksum !== meta.checksum) {
        throw new Error('Backup file corrupted (checksum mismatch)');
      }
    }

    // 3. 현재 데이터 백업 (안전망)
    if (!options.force) {
      await this.create({ description: 'pre-restore-safety-backup' });
    }

    // 4. 압축 해제
    const tempDir = path.join(this.backupsDir, '.restore-temp');
    await fs.ensureDir(tempDir);

    try {
      await this.extract(backupPath, tempDir);

      // 5. 파일 복원
      // 데이터베이스
      const dbSource = path.join(tempDir, 'jjiban.db');
      if (await fs.pathExists(dbSource)) {
        await fs.copy(dbSource, path.join(this.jjibanDir, 'jjiban.db'), {
          overwrite: true,
        });
      }

      // 설정 파일
      if (!options.skipConfig) {
        const configSource = path.join(tempDir, 'config.json');
        if (await fs.pathExists(configSource)) {
          await fs.copy(configSource, path.join(this.jjibanDir, 'config.json'), {
            overwrite: true,
          });
        }
      }

      // 프로젝트 폴더
      if (!options.skipProjects) {
        const projectsSource = path.join(tempDir, 'projects');
        if (await fs.pathExists(projectsSource)) {
          await fs.copy(projectsSource, path.join(process.cwd(), 'projects'), {
            overwrite: true,
          });
        }
      }

    } finally {
      await fs.remove(tempDir);
    }
  }

  async list(): Promise<BackupMeta[]> {
    if (!await fs.pathExists(this.backupsDir)) {
      return [];
    }

    const files = await fs.readdir(this.backupsDir);
    const metaFiles = files.filter(f => f.endsWith('.meta.json'));

    const backups: BackupMeta[] = [];
    for (const metaFile of metaFiles) {
      try {
        const meta = await fs.readJSON(path.join(this.backupsDir, metaFile));
        backups.push(meta);
      } catch {}
    }

    // 날짜 내림차순 정렬
    return backups.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async clean(keepCount: number = 5): Promise<number> {
    const backups = await this.list();

    if (backups.length <= keepCount) {
      return 0;
    }

    const toDelete = backups.slice(keepCount);
    let deleted = 0;

    for (const backup of toDelete) {
      const backupPath = path.join(this.backupsDir, `${backup.id}.tar.gz`);
      const metaPath = path.join(this.backupsDir, `${backup.id}.meta.json`);

      await fs.remove(backupPath);
      await fs.remove(metaPath);
      deleted++;
    }

    return deleted;
  }

  private async compress(sourceDir: string, destPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(destPath);
      const archive = archiver('tar', { gzip: true });

      output.on('close', resolve);
      archive.on('error', reject);

      archive.pipe(output);
      archive.directory(sourceDir, false);
      archive.finalize();
    });
  }

  private async extract(archivePath: string, destDir: string): Promise<void> {
    await tar.extract({
      file: archivePath,
      cwd: destDir,
    });
  }

  private async calculateChecksum(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = createHash('sha256');
      const stream = fs.createReadStream(filePath);

      stream.on('data', data => hash.update(data));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  }

  private getVersion(): string {
    try {
      const pkg = require('../../package.json');
      return pkg.version;
    } catch {
      return 'unknown';
    }
  }
}
```

---

## 3. CLI 명령어 설계

### 3.1 backup 명령어

```typescript
// commands/backup/index.ts
import { Command } from 'commander';
import { registerCreate } from './create';
import { registerRestore } from './restore';
import { registerList } from './list';
import { registerClean } from './clean';

export function registerBackup(program: Command) {
  const backup = program
    .command('backup')
    .description('Backup and restore data');

  registerCreate(backup);
  registerRestore(backup);
  registerList(backup);
  registerClean(backup);

  // 기본 동작: backup create
  backup.action(async () => {
    const { create } = await import('./create');
    await create({});
  });
}
```

### 3.2 backup create

```typescript
// commands/backup/create.ts
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { BackupService } from '../../services/backup';
import { formatBytes } from '../../utils/format';

interface CreateOptions {
  description?: string;
  excludeProjects?: boolean;
  output?: string;
}

export function registerCreate(parent: Command) {
  parent
    .command('create')
    .description('Create a new backup')
    .option('-d, --description <desc>', 'Backup description')
    .option('--exclude-projects', 'Exclude projects folder')
    .option('-o, --output <path>', 'Custom output path')
    .action(create);
}

export async function create(options: CreateOptions) {
  const spinner = ora('Creating backup...').start();

  try {
    const service = new BackupService();
    const meta = await service.create({
      description: options.description,
      excludeProjects: options.excludeProjects,
      outputPath: options.output,
    });

    spinner.succeed(chalk.green('Backup created successfully!'));
    console.log('');
    console.log(chalk.white('  Backup ID:    ') + chalk.cyan(meta.id));
    console.log(chalk.white('  Size:         ') + chalk.gray(formatBytes(meta.size)));
    console.log(chalk.white('  Checksum:     ') + chalk.gray(meta.checksum.substring(0, 16) + '...'));
    console.log(chalk.white('  Contents:'));
    console.log(chalk.gray(`    - Database: ${meta.contents.database ? '✓' : '✗'}`));
    console.log(chalk.gray(`    - Config:   ${meta.contents.config ? '✓' : '✗'}`));
    console.log(chalk.gray(`    - Projects: ${meta.contents.projects.length} folder(s)`));
    console.log('');

  } catch (error) {
    spinner.fail(chalk.red('Backup failed'));
    console.error(error);
    process.exit(1);
  }
}
```

### 3.3 backup restore

```typescript
// commands/backup/restore.ts
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import path from 'path';
import { BackupService } from '../../services/backup';
import { formatBytes, formatDate } from '../../utils/format';

interface RestoreOptions {
  skipConfig?: boolean;
  skipProjects?: boolean;
  force?: boolean;
}

export function registerRestore(parent: Command) {
  parent
    .command('restore [backup]')
    .description('Restore from a backup')
    .option('--skip-config', 'Skip restoring config file')
    .option('--skip-projects', 'Skip restoring projects folder')
    .option('-f, --force', 'Skip confirmation and safety backup')
    .action(restore);
}

async function restore(backupFile: string | undefined, options: RestoreOptions) {
  const service = new BackupService();

  // 백업 파일 선택
  let backupPath: string;

  if (backupFile) {
    // 직접 지정된 경우
    backupPath = path.isAbsolute(backupFile)
      ? backupFile
      : path.join(process.cwd(), '.jjiban/backups', backupFile);
  } else {
    // 대화형 선택
    const backups = await service.list();

    if (backups.length === 0) {
      console.log(chalk.yellow('No backups found.'));
      return;
    }

    const { selected } = await inquirer.prompt([{
      type: 'list',
      name: 'selected',
      message: 'Select a backup to restore:',
      choices: backups.map(b => ({
        name: `${b.id} (${formatDate(b.createdAt)}) - ${formatBytes(b.size)}${b.description ? ` - ${b.description}` : ''}`,
        value: b.id,
      })),
    }]);

    backupPath = path.join(process.cwd(), '.jjiban/backups', `${selected}.tar.gz`);
  }

  // 확인
  if (!options.force) {
    const { confirm } = await inquirer.prompt([{
      type: 'confirm',
      name: 'confirm',
      message: chalk.yellow('This will overwrite current data. Continue?'),
      default: false,
    }]);

    if (!confirm) {
      console.log(chalk.gray('Restore cancelled.'));
      return;
    }
  }

  // 복원
  const spinner = ora('Restoring backup...').start();

  try {
    await service.restore(backupPath, options);
    spinner.succeed(chalk.green('Backup restored successfully!'));

  } catch (error) {
    spinner.fail(chalk.red('Restore failed'));
    console.error(error);
    process.exit(1);
  }
}
```

### 3.4 backup list

```typescript
// commands/backup/list.ts
import { Command } from 'commander';
import chalk from 'chalk';
import { BackupService } from '../../services/backup';
import { formatBytes, formatDate } from '../../utils/format';

export function registerList(parent: Command) {
  parent
    .command('list')
    .alias('ls')
    .description('List all backups')
    .action(list);
}

async function list() {
  const service = new BackupService();
  const backups = await service.list();

  if (backups.length === 0) {
    console.log(chalk.yellow('No backups found.'));
    console.log(chalk.gray('Run `jjiban backup` to create one.'));
    return;
  }

  console.log(chalk.white.bold('\nAvailable backups:\n'));

  for (const backup of backups) {
    console.log(chalk.cyan(`  ${backup.id}`));
    console.log(chalk.gray(`    Created: ${formatDate(backup.createdAt)}`));
    console.log(chalk.gray(`    Size:    ${formatBytes(backup.size)}`));
    if (backup.description) {
      console.log(chalk.gray(`    Note:    ${backup.description}`));
    }
    console.log('');
  }

  console.log(chalk.gray(`Total: ${backups.length} backup(s)`));
  console.log(chalk.gray('Run `jjiban backup restore` to restore from a backup.'));
}
```

---

## 4. 유틸리티

### 4.1 포맷 유틸리티

```typescript
// utils/format.ts
import { format, formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const formatted = format(date, 'yyyy-MM-dd HH:mm:ss');
  const relative = formatDistanceToNow(date, { addSuffix: true, locale: ko });
  return `${formatted} (${relative})`;
}
```

---

## 5. 스케줄 백업 가이드

### 5.1 Cron 설정 예시

```bash
# 매일 자정에 백업 (Linux/macOS)
0 0 * * * cd /path/to/project && /usr/local/bin/jjiban backup -d "daily-auto"

# 매주 일요일 새벽 3시에 백업
0 3 * * 0 cd /path/to/project && /usr/local/bin/jjiban backup -d "weekly-auto"

# 오래된 백업 정리 (10개 유지)
0 4 * * 0 cd /path/to/project && /usr/local/bin/jjiban backup clean --keep 10
```

### 5.2 Windows Task Scheduler

```powershell
# 매일 백업 작업 생성
$action = New-ScheduledTaskAction -Execute "jjiban" -Argument "backup -d daily-auto" -WorkingDirectory "C:\path\to\project"
$trigger = New-ScheduledTaskTrigger -Daily -At "12:00AM"
Register-ScheduledTask -Action $action -Trigger $trigger -TaskName "JjibanDailyBackup"
```

---

## 6. 테스트 전략

### 6.1 단위 테스트
- 압축/해제 함수 테스트
- 체크섬 계산 테스트
- 메타데이터 파싱 테스트

### 6.2 통합 테스트
- 백업 생성 → 복원 전체 흐름
- 손상된 백업 복원 시도 (에러 처리)
- 대용량 프로젝트 백업

### 6.3 E2E 테스트
- CLI 명령어 전체 흐름
- 대화형 복원 선택

---

## 7. 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2025-12-06 | 초안 작성 |
