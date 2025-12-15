/**
 * Claude CLI 실행기
 * Task: TSK-07-01
 * 책임: spawn으로 claude -p 호출, 출력 캡처
 * 보안: spawn 인자 배열 사용 (문자열 연결 금지)
 */

import { spawn } from 'child_process';
import { ClaudeExecutionError, TimeoutError } from '../errors/JjibanError.js';

/**
 * Claude CLI 실행기
 */
export class ClaudeExecutor {
  /**
   * @param {Object} [options]
   * @param {number} [options.timeout=1800000] - 타임아웃 (ms), 기본 30분
   * @param {boolean} [options.verbose=false] - 상세 출력
   */
  constructor(options = {}) {
    this.timeout = options.timeout || 30 * 60 * 1000; // 30분
    this.verbose = options.verbose || false;
  }

  /**
   * Claude CLI 명령어 실행
   * @param {string} command - 실행할 명령어 (예: /wf:start TSK-07-01)
   * @returns {Promise<Object>} 실행 결과
   */
  async run(command) {
    const startedAt = new Date().toISOString();

    return new Promise((resolve, reject) => {
      // 보안: spawn 인자 배열 사용 (SEC-001)
      const args = ['-p', command];

      const proc = spawn('claude', args, {
        shell: false, // shell injection 방지
        env: {
          ...process.env,
          // 필요한 환경변수만 전달
          PATH: process.env.PATH,
          HOME: process.env.HOME,
          USERPROFILE: process.env.USERPROFILE,
          TERM: process.env.TERM || 'xterm-256color'
        },
        stdio: ['inherit', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      // 타임아웃 설정
      const timeoutId = setTimeout(() => {
        proc.kill('SIGTERM');
        reject(new TimeoutError(command, this.timeout));
      }, this.timeout);

      // stdout 캡처
      proc.stdout.on('data', (data) => {
        const chunk = data.toString();
        stdout += chunk;

        if (this.verbose) {
          process.stdout.write(chunk);
        }
      });

      // stderr 캡처
      proc.stderr.on('data', (data) => {
        const chunk = data.toString();
        stderr += chunk;

        if (this.verbose) {
          process.stderr.write(chunk);
        }
      });

      // 프로세스 완료
      proc.on('close', (code) => {
        clearTimeout(timeoutId);

        const finishedAt = new Date().toISOString();
        const duration = Math.round(
          (new Date(finishedAt) - new Date(startedAt)) / 1000
        );

        const result = {
          success: code === 0,
          exitCode: code,
          startedAt,
          finishedAt,
          duration,
          stdout: this.truncateOutput(stdout),
          stderr: this.truncateOutput(stderr)
        };

        if (code !== 0) {
          reject(new ClaudeExecutionError(
            `Claude 실행 실패 (exit code: ${code})`,
            code,
            stderr || stdout
          ));
        } else {
          resolve(result);
        }
      });

      // 에러 핸들링
      proc.on('error', (error) => {
        clearTimeout(timeoutId);

        if (error.code === 'ENOENT') {
          reject(new ClaudeExecutionError(
            'Claude CLI가 설치되어 있지 않습니다. ' +
            'https://docs.anthropic.com/claude-code 를 참조하세요.',
            null,
            null
          ));
        } else {
          reject(new ClaudeExecutionError(
            `Claude 실행 중 오류: ${error.message}`,
            null,
            error.stack
          ));
        }
      });
    });
  }

  /**
   * 출력 크기 제한 (메모리 보호)
   * @param {string} output - 출력 문자열
   * @param {number} [maxLength=10000] - 최대 길이
   * @returns {string} 잘린 출력
   */
  truncateOutput(output, maxLength = 10000) {
    if (!output) return '';
    if (output.length <= maxLength) return output;

    return output.substring(0, maxLength) + '\n... (출력 생략)';
  }

  /**
   * Claude CLI 설치 여부 확인
   * @returns {Promise<boolean>}
   */
  async isInstalled() {
    return new Promise((resolve) => {
      const proc = spawn('claude', ['--version'], {
        shell: false,
        stdio: ['ignore', 'pipe', 'pipe']
      });

      proc.on('close', (code) => {
        resolve(code === 0);
      });

      proc.on('error', () => {
        resolve(false);
      });
    });
  }
}
