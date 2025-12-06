# Module 기본설계: Update & Migration

## 문서 정보

| 항목 | 내용 |
|------|------|
| Module ID | MODULE-jjiban-05-04 |
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
│   ├── update.ts              # update 명령어
│   └── migrate.ts             # migrate 명령어 (확장)
├── services/
│   ├── version-checker.ts     # 버전 체크 서비스
│   ├── migration.ts           # 마이그레이션 서비스
│   └── rollback.ts            # 롤백 서비스
└── utils/
    └── backup.ts              # 백업 유틸리티
```

### 1.2 버전 체크 흐름

```
┌──────────────────────────────────────────────────────┐
│                  Version Check Flow                   │
├──────────────────────────────────────────────────────┤
│                                                      │
│  1. jjiban update                                    │
│         │                                            │
│         ▼                                            │
│  2. npm registry API 호출                            │
│     GET https://registry.npmjs.org/jjiban            │
│         │                                            │
│         ▼                                            │
│  3. 현재 버전 vs 최신 버전 비교                       │
│     (semver.compare)                                 │
│         │                                            │
│         ├─► 동일: "You're up to date! (v1.2.3)"     │
│         │                                            │
│         └─► 업데이트 필요:                           │
│             "New version available: 1.2.3 → 1.3.0"  │
│             "Run: npm update -g jjiban"             │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### 1.3 마이그레이션 흐름

```
┌──────────────────────────────────────────────────────┐
│                  Migration Flow                       │
├──────────────────────────────────────────────────────┤
│                                                      │
│  1. jjiban migrate                                   │
│         │                                            │
│         ▼                                            │
│  2. 백업 생성 (.jjiban/backups/pre-migrate-xxx)      │
│         │                                            │
│         ▼                                            │
│  3. Prisma migrate deploy 실행                       │
│         │                                            │
│         ├─► 성공: "Migration complete!"              │
│         │                                            │
│         └─► 실패:                                    │
│             "Migration failed. Rolling back..."      │
│             → 백업에서 복원                          │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## 2. 버전 체크 시스템 설계

### 2.1 버전 체커 서비스

```typescript
// services/version-checker.ts
import https from 'https';
import semver from 'semver';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

interface NpmPackageInfo {
  'dist-tags': {
    latest: string;
  };
  versions: Record<string, any>;
}

interface VersionCheckResult {
  currentVersion: string;
  latestVersion: string;
  updateAvailable: boolean;
  updateType?: 'major' | 'minor' | 'patch';
  changelog?: string;
}

export class VersionChecker {
  private packageName = 'jjiban';
  private cacheFile: string;
  private cacheDuration = 24 * 60 * 60 * 1000; // 24시간

  constructor() {
    this.cacheFile = path.join(process.cwd(), '.jjiban', '.version-cache.json');
  }

  async check(): Promise<VersionCheckResult> {
    const currentVersion = this.getCurrentVersion();

    // 캐시 확인
    const cached = await this.getCachedVersion();
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return this.compareVersions(currentVersion, cached.version);
    }

    // npm registry에서 최신 버전 조회
    const latestVersion = await this.fetchLatestVersion();

    // 캐시 저장
    await this.cacheVersion(latestVersion);

    return this.compareVersions(currentVersion, latestVersion);
  }

  private getCurrentVersion(): string {
    const packageJson = require('../../package.json');
    return packageJson.version;
  }

  private async fetchLatestVersion(): Promise<string> {
    return new Promise((resolve, reject) => {
      https.get(
        `https://registry.npmjs.org/${this.packageName}`,
        { headers: { 'Accept': 'application/json' } },
        (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            try {
              const info: NpmPackageInfo = JSON.parse(data);
              resolve(info['dist-tags'].latest);
            } catch (e) {
              reject(e);
            }
          });
        }
      ).on('error', reject);
    });
  }

  private compareVersions(current: string, latest: string): VersionCheckResult {
    const updateAvailable = semver.lt(current, latest);
    let updateType: 'major' | 'minor' | 'patch' | undefined;

    if (updateAvailable) {
      if (semver.major(latest) > semver.major(current)) {
        updateType = 'major';
      } else if (semver.minor(latest) > semver.minor(current)) {
        updateType = 'minor';
      } else {
        updateType = 'patch';
      }
    }

    return {
      currentVersion: current,
      latestVersion: latest,
      updateAvailable,
      updateType,
    };
  }

  private async getCachedVersion(): Promise<{ version: string; timestamp: number } | null> {
    try {
      if (await fs.pathExists(this.cacheFile)) {
        return fs.readJSON(this.cacheFile);
      }
    } catch {}
    return null;
  }

  private async cacheVersion(version: string): Promise<void> {
    await fs.writeJSON(this.cacheFile, {
      version,
      timestamp: Date.now(),
    });
  }
}
```

### 2.2 update 명령어

```typescript
// commands/update.ts
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { VersionChecker } from '../services/version-checker';

export function registerUpdate(program: Command) {
  program
    .command('update')
    .description('Check for updates')
    .option('--force', 'Force check (ignore cache)')
    .action(async (options) => {
      await checkUpdate(options);
    });
}

async function checkUpdate(options: { force?: boolean }) {
  const spinner = ora('Checking for updates...').start();

  try {
    const checker = new VersionChecker();
    const result = await checker.check();

    if (result.updateAvailable) {
      spinner.succeed(chalk.green('Update available!'));
      console.log('');
      console.log(chalk.white(`  Current version: ${chalk.gray(result.currentVersion)}`));
      console.log(chalk.white(`  Latest version:  ${chalk.green(result.latestVersion)}`));
      console.log('');

      if (result.updateType === 'major') {
        console.log(chalk.yellow('  ⚠️  This is a major update. Please check the changelog.'));
        console.log('');
      }

      console.log(chalk.cyan('  To update, run:'));
      console.log(chalk.white('    npm update -g jjiban'));
      console.log('');

    } else {
      spinner.succeed(chalk.green(`You're up to date! (v${result.currentVersion})`));
    }

  } catch (error) {
    spinner.fail(chalk.red('Failed to check for updates'));
    console.error(chalk.gray('  Please check your internet connection.'));
  }
}
```

---

## 3. 마이그레이션 시스템 설계

### 3.1 마이그레이션 서비스

```typescript
// services/migration.ts
import { execSync, exec } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { createBackup, restoreBackup } from '../utils/backup';

interface MigrationResult {
  success: boolean;
  migrationsApplied: number;
  error?: string;
  backupPath?: string;
}

export class MigrationService {
  private jjibanDir: string;
  private dbPath: string;

  constructor() {
    this.jjibanDir = path.join(process.cwd(), '.jjiban');
    this.dbPath = path.join(this.jjibanDir, 'jjiban.db');
  }

  async migrate(options: { rollback?: boolean; dryRun?: boolean } = {}): Promise<MigrationResult> {
    // 롤백 모드
    if (options.rollback) {
      return this.rollback();
    }

    // 1. 백업 생성
    const backupPath = await createBackup(this.dbPath, 'pre-migrate');

    try {
      // 2. Dry run
      if (options.dryRun) {
        return this.dryRun();
      }

      // 3. 마이그레이션 실행
      const result = execSync('npx prisma migrate deploy', {
        cwd: process.cwd(),
        encoding: 'utf-8',
        stdio: 'pipe',
      });

      // 마이그레이션 수 파싱
      const migrationsApplied = this.parseMigrationCount(result);

      return {
        success: true,
        migrationsApplied,
        backupPath,
      };

    } catch (error) {
      // 4. 실패 시 롤백
      console.error(chalk.red('Migration failed. Rolling back...'));
      await restoreBackup(backupPath, this.dbPath);

      return {
        success: false,
        migrationsApplied: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        backupPath,
      };
    }
  }

  private async dryRun(): Promise<MigrationResult> {
    const result = execSync('npx prisma migrate status', {
      cwd: process.cwd(),
      encoding: 'utf-8',
      stdio: 'pipe',
    });

    // 상태 파싱
    const pendingMigrations = this.parsePendingMigrations(result);

    return {
      success: true,
      migrationsApplied: pendingMigrations,
    };
  }

  private async rollback(): Promise<MigrationResult> {
    const backupsDir = path.join(this.jjibanDir, 'backups');

    // 최신 백업 찾기
    const backups = await fs.readdir(backupsDir);
    const migrationBackups = backups
      .filter(b => b.startsWith('pre-migrate-'))
      .sort()
      .reverse();

    if (migrationBackups.length === 0) {
      return {
        success: false,
        migrationsApplied: 0,
        error: 'No migration backups found',
      };
    }

    const latestBackup = path.join(backupsDir, migrationBackups[0]);
    await restoreBackup(latestBackup, this.dbPath);

    return {
      success: true,
      migrationsApplied: 0,
      backupPath: latestBackup,
    };
  }

  private parseMigrationCount(output: string): number {
    const match = output.match(/(\d+) migration/);
    return match ? parseInt(match[1]) : 0;
  }

  private parsePendingMigrations(output: string): number {
    const match = output.match(/(\d+) pending/);
    return match ? parseInt(match[1]) : 0;
  }
}
```

### 3.2 migrate 명령어 확장

```typescript
// commands/migrate.ts
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { MigrationService } from '../services/migration';

export function registerMigrate(program: Command) {
  program
    .command('migrate')
    .description('Run database migrations')
    .option('--rollback', 'Rollback last migration')
    .option('--dry-run', 'Preview pending migrations')
    .option('--force', 'Skip confirmation prompt')
    .action(async (options) => {
      await migrate(options);
    });
}

async function migrate(options: {
  rollback?: boolean;
  dryRun?: boolean;
  force?: boolean;
}) {
  const service = new MigrationService();

  // Dry run 모드
  if (options.dryRun) {
    const spinner = ora('Checking pending migrations...').start();
    const result = await service.migrate({ dryRun: true });

    if (result.migrationsApplied === 0) {
      spinner.succeed(chalk.green('Database is up to date.'));
    } else {
      spinner.succeed(chalk.cyan(`${result.migrationsApplied} pending migration(s)`));
      console.log(chalk.gray('  Run `jjiban migrate` to apply.'));
    }
    return;
  }

  // 롤백 모드
  if (options.rollback) {
    if (!options.force) {
      const { confirm } = await inquirer.prompt([{
        type: 'confirm',
        name: 'confirm',
        message: 'Are you sure you want to rollback? This will restore from the last backup.',
        default: false,
      }]);

      if (!confirm) {
        console.log(chalk.gray('Rollback cancelled.'));
        return;
      }
    }

    const spinner = ora('Rolling back...').start();
    const result = await service.migrate({ rollback: true });

    if (result.success) {
      spinner.succeed(chalk.green('Rollback complete!'));
      console.log(chalk.gray(`  Restored from: ${result.backupPath}`));
    } else {
      spinner.fail(chalk.red('Rollback failed'));
      console.error(chalk.gray(`  ${result.error}`));
    }
    return;
  }

  // 일반 마이그레이션
  const spinner = ora('Running migrations...').start();
  const result = await service.migrate();

  if (result.success) {
    if (result.migrationsApplied === 0) {
      spinner.succeed(chalk.green('Database is up to date.'));
    } else {
      spinner.succeed(chalk.green(`Applied ${result.migrationsApplied} migration(s)`));
      console.log(chalk.gray(`  Backup saved: ${result.backupPath}`));
    }
  } else {
    spinner.fail(chalk.red('Migration failed'));
    console.error(chalk.gray(`  ${result.error}`));
    console.log(chalk.cyan('  Database has been restored from backup.'));
  }
}
```

---

## 4. 백업 유틸리티

```typescript
// utils/backup.ts
import fs from 'fs-extra';
import path from 'path';
import { format } from 'date-fns';

export async function createBackup(
  sourcePath: string,
  prefix: string
): Promise<string> {
  const jjibanDir = path.dirname(sourcePath);
  const backupsDir = path.join(jjibanDir, 'backups');

  await fs.ensureDir(backupsDir);

  const timestamp = format(new Date(), 'yyyyMMdd-HHmmss');
  const backupName = `${prefix}-${timestamp}.db`;
  const backupPath = path.join(backupsDir, backupName);

  await fs.copy(sourcePath, backupPath);

  // 오래된 백업 정리 (최대 5개 유지)
  await cleanOldBackups(backupsDir, prefix, 5);

  return backupPath;
}

export async function restoreBackup(
  backupPath: string,
  targetPath: string
): Promise<void> {
  await fs.copy(backupPath, targetPath, { overwrite: true });
}

async function cleanOldBackups(
  backupsDir: string,
  prefix: string,
  maxBackups: number
): Promise<void> {
  const files = await fs.readdir(backupsDir);
  const backups = files
    .filter(f => f.startsWith(prefix))
    .sort()
    .reverse();

  if (backups.length > maxBackups) {
    const toDelete = backups.slice(maxBackups);
    for (const file of toDelete) {
      await fs.remove(path.join(backupsDir, file));
    }
  }
}
```

---

## 5. 자동 업데이트 알림

### 5.1 서버 시작 시 체크

```typescript
// utils/startup-check.ts
import chalk from 'chalk';
import { VersionChecker } from '../services/version-checker';

export async function checkForUpdatesOnStartup(): Promise<void> {
  try {
    const checker = new VersionChecker();
    const result = await checker.check();

    if (result.updateAvailable) {
      console.log('');
      console.log(chalk.yellow('━'.repeat(50)));
      console.log(chalk.yellow('  📦 New version available!'));
      console.log(chalk.white(`     ${result.currentVersion} → ${chalk.green(result.latestVersion)}`));
      console.log(chalk.gray('     Run: npm update -g jjiban'));
      console.log(chalk.yellow('━'.repeat(50)));
      console.log('');
    }
  } catch {
    // 실패해도 무시 (비침입적)
  }
}
```

---

## 6. 테스트 전략

### 6.1 단위 테스트
- 버전 비교 로직 테스트
- 백업/복원 함수 테스트
- 마이그레이션 파서 테스트

### 6.2 통합 테스트
- npm registry API 모킹
- 마이그레이션 전체 흐름
- 롤백 흐름

### 6.3 E2E 테스트
- 실제 마이그레이션 시나리오
- 네트워크 오류 시 graceful 처리

---

## 7. 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2025-12-06 | 초안 작성 |
