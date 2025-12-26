#!/usr/bin/env node

/**
 * jjiban CLI 진입점
 *
 * Usage:
 *   jjiban                    # 웹 UI 서버 시작 (기본)
 *   jjiban --port 8080        # 포트 지정
 *   jjiban workflow <taskId>  # 워크플로우 실행
 */

import { Command } from 'commander';
import { workflowCommand } from '../cli/commands/workflow.js';
import { register as execCommand } from '../cli/commands/exec.js';
import { startServer } from './serve.js';

const VERSION = '0.1.0';

const program = new Command();

program
  .name('jjiban')
  .description('AI 기반 프로젝트 관리 도구')
  .version(VERSION)
  .option('-p, --port <port>', '서버 포트 번호', '3000')
  .action(async (options) => {
    // 기본 동작: 웹 UI 서버 시작
    await startServer({ port: parseInt(options.port, 10) });
  });

// workflow 명령어
program
  .command('workflow <taskId>')
  .description('워크플로우 실행')
  .option('-u, --until <step>', '목표 단계 (basic-design, detail-design, build, done 등)', 'done')
  .option('-d, --dry-run', '실행 계획만 출력 (실제 실행 안함)', false)
  .option('-r, --resume', '중단된 워크플로우 재개', false)
  .option('-v, --verbose', '상세 로그 출력', false)
  .option('--project <id>', '프로젝트 ID (생략 시 자동 탐지)')
  .action(workflowCommand);

// exec 명령어 (TSK-03-03: 워크플로우 명령어 훅)
execCommand(program);

// 도움말
program
  .addHelpText('after', `

Examples:
  $ jjiban                         # 웹 UI 서버 시작 (localhost:3000)
  $ jjiban --port 8080             # 포트 8080에서 시작
  $ jjiban workflow TSK-07-01      # 워크플로우 실행
  $ jjiban workflow TSK-07-01 --until build  # 구현까지만 실행
  $ jjiban workflow TSK-07-01 --dry-run      # 실행 계획 확인
  $ jjiban exec start TSK-01-01 build        # 실행 상태 등록
  $ jjiban exec stop TSK-01-01               # 실행 상태 해제
`);

program.parse();
