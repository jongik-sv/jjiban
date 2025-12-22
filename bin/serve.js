#!/usr/bin/env node

/**
 * jjiban 웹 UI 서버 시작 유틸리티
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Nitro 서버 시작
 * @param {object} options - 서버 옵션
 * @param {number} options.port - 포트 번호
 */
export async function startServer(options = {}) {
  const port = options.port || 3000;
  const outputDir = join(__dirname, '..', '.output');
  const serverEntry = join(outputDir, 'server', 'index.mjs');

  // 빌드 확인
  if (!existsSync(serverEntry)) {
    console.error('❌ 빌드된 서버를 찾을 수 없습니다.');
    console.error('   먼저 npm run build를 실행해주세요.');
    process.exit(1);
  }

  // 환경변수 설정
  process.env.NITRO_PORT = String(port);
  process.env.NITRO_HOST = '0.0.0.0';

  console.log(`🚀 jjiban 서버 시작 중... (포트: ${port})`);
  console.log(`📁 작업 디렉토리: ${process.cwd()}`);

  try {
    // Nitro 서버 동적 import
    await import(serverEntry);
  } catch (error) {
    console.error('❌ 서버 시작 실패:', error.message);
    process.exit(1);
  }
}
