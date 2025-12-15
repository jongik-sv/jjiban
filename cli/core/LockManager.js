/**
 * 락 관리자
 * Task: TSK-07-01
 * 보안: 동시 실행 방지
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { LockError } from '../errors/JjibanError.js';

/**
 * 워크플로우 동시 실행 방지를 위한 락 관리
 */
export class LockManager {
  /**
   * @param {string} lockDir - 락 파일 저장 디렉토리
   */
  constructor(lockDir) {
    this.lockDir = lockDir;
    this.acquiredLocks = new Set();
  }

  /**
   * 락 파일 경로 생성
   * @param {string} taskId - Task ID
   * @returns {string} 락 파일 경로
   */
  getLockPath(taskId) {
    return join(this.lockDir, `${taskId}.lock`);
  }

  /**
   * 락 획득
   * @param {string} taskId - Task ID
   * @throws {LockError} 이미 잠긴 경우
   * @returns {Promise<void>}
   */
  async acquire(taskId) {
    const lockPath = this.getLockPath(taskId);

    // 기존 락 확인
    if (await this.isLocked(taskId)) {
      // 락 파일 내용 확인
      const lockInfo = await this.getLockInfo(taskId);

      // 프로세스가 살아있는지 확인 (가능한 경우)
      if (lockInfo && this.isProcessAlive(lockInfo.pid)) {
        throw new LockError(taskId);
      }

      // 죽은 프로세스의 락이면 제거
      await this.release(taskId);
    }

    // 디렉토리 생성
    await fs.mkdir(dirname(lockPath), { recursive: true });

    // 락 파일 생성
    const lockInfo = {
      taskId,
      pid: process.pid,
      startedAt: new Date().toISOString(),
      hostname: process.env.HOSTNAME || 'unknown'
    };

    try {
      // O_EXCL 플래그로 원자적 생성
      await fs.writeFile(lockPath, JSON.stringify(lockInfo, null, 2), {
        flag: 'wx',
        mode: 0o600
      });

      this.acquiredLocks.add(taskId);
    } catch (error) {
      if (error.code === 'EEXIST') {
        throw new LockError(taskId);
      }
      throw error;
    }
  }

  /**
   * 락 해제
   * @param {string} taskId - Task ID
   * @returns {Promise<void>}
   */
  async release(taskId) {
    const lockPath = this.getLockPath(taskId);

    try {
      await fs.unlink(lockPath);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        // 에러 무시 (graceful)
        console.warn(`[LockManager] Failed to release lock: ${taskId}`);
      }
    }

    this.acquiredLocks.delete(taskId);
  }

  /**
   * 락 여부 확인
   * @param {string} taskId - Task ID
   * @returns {Promise<boolean>}
   */
  async isLocked(taskId) {
    const lockPath = this.getLockPath(taskId);
    try {
      await fs.access(lockPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 락 정보 조회
   * @param {string} taskId - Task ID
   * @returns {Promise<Object|null>}
   */
  async getLockInfo(taskId) {
    const lockPath = this.getLockPath(taskId);
    try {
      const content = await fs.readFile(lockPath, 'utf-8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  /**
   * 프로세스 생존 확인
   * @param {number} pid - 프로세스 ID
   * @returns {boolean}
   */
  isProcessAlive(pid) {
    if (!pid) return false;

    try {
      // signal 0은 프로세스 존재 확인용
      process.kill(pid, 0);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 이 인스턴스가 획득한 모든 락 해제
   * @returns {Promise<void>}
   */
  async releaseAll() {
    for (const taskId of this.acquiredLocks) {
      await this.release(taskId);
    }
  }
}
