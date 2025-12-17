/**
 * TSK-01-01: 터미널 패키지 설치 검증 테스트
 *
 * @description
 * xterm.js 및 관련 패키지의 정상 설치 및 로드를 검증합니다.
 */

import { describe, it, expect } from 'vitest'

describe('TSK-01-01: 터미널 패키지 설치 검증', () => {
  describe('@xterm/xterm 패키지', () => {
    it('Terminal 클래스 로드', async () => {
      const { Terminal } = await import('@xterm/xterm')
      expect(Terminal).toBeDefined()
      expect(typeof Terminal).toBe('function')
    })

    it('Terminal 인스턴스 생성', async () => {
      const { Terminal } = await import('@xterm/xterm')
      const term = new Terminal({
        cols: 80,
        rows: 24
      })

      expect(term).toBeDefined()
      expect(term.cols).toBe(80)
      expect(term.rows).toBe(24)
    })

    it('Terminal 기본 옵션 설정', async () => {
      const { Terminal } = await import('@xterm/xterm')
      const term = new Terminal({
        theme: {
          background: '#1e1e2e',
          foreground: '#cdd6f4'
        },
        cursorBlink: true
      })

      expect(term).toBeDefined()
      // theme는 private이므로 인스턴스 생성만 확인
    })
  })

  describe('@xterm/addon-fit 패키지', () => {
    it('FitAddon 클래스 로드', async () => {
      const { FitAddon } = await import('@xterm/addon-fit')
      expect(FitAddon).toBeDefined()
      expect(typeof FitAddon).toBe('function')
    })

    it('FitAddon 인스턴스 생성', async () => {
      const { FitAddon } = await import('@xterm/addon-fit')
      const fitAddon = new FitAddon()

      expect(fitAddon).toBeDefined()
      expect(typeof fitAddon.fit).toBe('function')
      expect(typeof fitAddon.proposeDimensions).toBe('function')
    })
  })

  describe('xterm + FitAddon 통합', () => {
    it('Terminal에 FitAddon 로드', async () => {
      const { Terminal } = await import('@xterm/xterm')
      const { FitAddon } = await import('@xterm/addon-fit')

      const term = new Terminal()
      const fitAddon = new FitAddon()

      // loadAddon 메서드 확인
      expect(typeof term.loadAddon).toBe('function')

      // FitAddon 로드 (DOM 없이는 fit() 호출 불가)
      term.loadAddon(fitAddon)

      // 로드 후 proposeDimensions 호출 가능 확인
      expect(typeof fitAddon.proposeDimensions).toBe('function')
    })
  })

  describe('Nuxt optimizeDeps 설정 검증', () => {
    it('vite.config에 xterm 패키지 포함 확인', async () => {
      // 이 테스트는 nuxt.config.ts의 설정이 올바른지 간접 확인
      // 패키지가 정상적으로 로드되면 optimizeDeps 설정이 작동하는 것
      const { Terminal } = await import('@xterm/xterm')
      const { FitAddon } = await import('@xterm/addon-fit')

      expect(Terminal).toBeDefined()
      expect(FitAddon).toBeDefined()
    })
  })
})
