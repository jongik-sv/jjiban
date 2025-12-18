#!/usr/bin/env node

/**
 * jjiban CLI 진입점
 * Task: TSK-07-01
 *
 * Usage:
 *   jjiban workflow <taskId> [options]
 *
 * Examples:
 *   jjiban workflow TSK-07-01
 *   jjiban workflow TSK-07-01 --until build
 *   jjiban workflow TSK-07-01 --dry-run
 *   jjiban workflow TSK-07-01 --resume
 */

import { Command } from 'commander';
import { workflowCommand } from '../cli/commands/workflow.js';

// 버전 정보 (package.json에서 가져오기)
const VERSION = '0.1.0';

const program = new Command();

program
  .name('jjiban')
  .description('AI 기반 프로젝트 관리 CLI')
  .version(VERSION);

// workflow 명령어
program
  .command('workflow <taskId>')
  .description('워크플로우 실행')
  .option('-u, --until <step>', '목표 단계 (basic-design, detail-design, build, done 등)', 'done')
  .option('-d, --dry-run', '실행 계획만 출력 (실제 실행 안함)', false)
  .option('-r, --resume', '중단된 워크플로우 재개', false)
  .option('-v, --verbose', '상세 로그 출력', false)
  .option('-p, --project <id>', '프로젝트 ID (생략 시 자동 탐지)')
  .action(workflowCommand);

// 기본 도움말
program
  .addHelpText('after', `

Examples:
  $ jjiban workflow TSK-07-01              # 전체 워크플로우 실행
  $ jjiban workflow TSK-07-01 --until build  # 구현까지만 실행
  $ jjiban workflow TSK-07-01 --dry-run    # 실행 계획 확인
  $ jjiban workflow TSK-07-01 --resume     # 중단된 워크플로우 재개

Scripts (별도 실행):
  $ npx tsx .jjiban/script/next-task.ts              # 실행 가능한 Task 조회
  $ npx tsx .jjiban/script/next-task.ts --table      # 표 형식 출력
  $ npx tsx .jjiban/script/transition.ts TSK-01-01 start  # 상태 전환

Available --until targets:
  basic-design   기본설계까지 (start)
  detail-design  상세설계까지 (start → draft)
  review         설계리뷰까지
  apply          리뷰반영까지
  build          구현까지 (start → ... → build → test)
  audit          코드리뷰까지
  patch          코드리뷰반영까지
  verify         통합테스트까지
  done           완료까지 (기본값)
`);

program.parse();
