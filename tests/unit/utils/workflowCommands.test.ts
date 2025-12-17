/**
 * workflowCommands 단위 테스트
 * Task: TSK-02-01
 * Test Spec: 026-test-specification.md TC-002, TC-003
 */

import { describe, it, expect } from 'vitest'
import {
  WORKFLOW_COMMANDS,
  isCommandAvailable,
  getFilteredCommands,
  extractStatusCode,
  type WorkflowCommand,
} from '~/utils/workflowCommands'

describe('workflowCommands', () => {
  describe('WORKFLOW_COMMANDS', () => {
    it('should have 13 commands defined', () => {
      expect(WORKFLOW_COMMANDS).toHaveLength(13)
    })

    it('should have all required fields for each command', () => {
      WORKFLOW_COMMANDS.forEach((command) => {
        expect(command).toHaveProperty('name')
        expect(command).toHaveProperty('label')
        expect(command).toHaveProperty('icon')
        expect(command).toHaveProperty('severity')
        expect(command).toHaveProperty('availableStatuses')
        expect(command).toHaveProperty('categories')
        expect(command.availableStatuses.length).toBeGreaterThan(0)
        expect(command.categories.length).toBeGreaterThan(0)
      })
    })
  })

  describe('isCommandAvailable', () => {
    // TC-002: development 상태별 버튼 활성화
    describe('development category', () => {
      it('should enable only "start" for status [ ]', () => {
        const availableCommands = WORKFLOW_COMMANDS.filter(cmd =>
          isCommandAvailable(cmd, '[ ]', 'development')
        ).map(cmd => cmd.name)

        expect(availableCommands).toContain('start')
        expect(availableCommands).not.toContain('ui')
        expect(availableCommands).not.toContain('draft')
        expect(availableCommands).not.toContain('build')
      })

      it('should enable "ui" and "draft" for status [bd]', () => {
        const availableCommands = WORKFLOW_COMMANDS.filter(cmd =>
          isCommandAvailable(cmd, '[bd]', 'development')
        ).map(cmd => cmd.name)

        expect(availableCommands).toContain('ui')
        expect(availableCommands).toContain('draft')
        expect(availableCommands).not.toContain('start')
        expect(availableCommands).not.toContain('build')
      })

      it('should enable "review", "apply", "build" for status [dd]', () => {
        const availableCommands = WORKFLOW_COMMANDS.filter(cmd =>
          isCommandAvailable(cmd, '[dd]', 'development')
        ).map(cmd => cmd.name)

        expect(availableCommands).toContain('review')
        expect(availableCommands).toContain('apply')
        expect(availableCommands).toContain('build')
        expect(availableCommands).not.toContain('start')
        expect(availableCommands).not.toContain('draft')
      })

      it('should enable "test", "audit", "patch", "verify" for status [im]', () => {
        const availableCommands = WORKFLOW_COMMANDS.filter(cmd =>
          isCommandAvailable(cmd, '[im]', 'development')
        ).map(cmd => cmd.name)

        expect(availableCommands).toContain('test')
        expect(availableCommands).toContain('audit')
        expect(availableCommands).toContain('patch')
        expect(availableCommands).toContain('verify')
        expect(availableCommands).toContain('done')
        expect(availableCommands).not.toContain('start')
      })

      it('should enable "done" for status [vf]', () => {
        const availableCommands = WORKFLOW_COMMANDS.filter(cmd =>
          isCommandAvailable(cmd, '[vf]', 'development')
        ).map(cmd => cmd.name)

        expect(availableCommands).toContain('done')
        expect(availableCommands).not.toContain('start')
        expect(availableCommands).not.toContain('verify')
      })
    })

    // TC-003: defect/infrastructure 상태별 버튼 활성화
    describe('defect category', () => {
      it('should enable only "start" for status [ ]', () => {
        const availableCommands = WORKFLOW_COMMANDS.filter(cmd =>
          isCommandAvailable(cmd, '[ ]', 'defect')
        ).map(cmd => cmd.name)

        expect(availableCommands).toContain('start')
        expect(availableCommands).not.toContain('fix')
      })

      it('should enable "fix" for status [an]', () => {
        const availableCommands = WORKFLOW_COMMANDS.filter(cmd =>
          isCommandAvailable(cmd, '[an]', 'defect')
        ).map(cmd => cmd.name)

        expect(availableCommands).toContain('fix')
        expect(availableCommands).not.toContain('start')
      })

      it('should enable "audit", "patch", "verify" for status [fx]', () => {
        const availableCommands = WORKFLOW_COMMANDS.filter(cmd =>
          isCommandAvailable(cmd, '[fx]', 'defect')
        ).map(cmd => cmd.name)

        expect(availableCommands).toContain('audit')
        expect(availableCommands).toContain('patch')
        expect(availableCommands).toContain('verify')
      })
    })

    describe('infrastructure category', () => {
      it('should enable "start" and "skip" for status [ ]', () => {
        const availableCommands = WORKFLOW_COMMANDS.filter(cmd =>
          isCommandAvailable(cmd, '[ ]', 'infrastructure')
        ).map(cmd => cmd.name)

        expect(availableCommands).toContain('start')
        expect(availableCommands).toContain('skip')
      })

      it('should enable "build" for status [ds]', () => {
        const availableCommands = WORKFLOW_COMMANDS.filter(cmd =>
          isCommandAvailable(cmd, '[ds]', 'infrastructure')
        ).map(cmd => cmd.name)

        expect(availableCommands).toContain('build')
      })

      it('should enable "audit", "patch", "done" for status [im]', () => {
        const availableCommands = WORKFLOW_COMMANDS.filter(cmd =>
          isCommandAvailable(cmd, '[im]', 'infrastructure')
        ).map(cmd => cmd.name)

        expect(availableCommands).toContain('audit')
        expect(availableCommands).toContain('patch')
        expect(availableCommands).toContain('done')
        expect(availableCommands).not.toContain('verify') // infra에는 verify가 없음
      })
    })
  })

  describe('getFilteredCommands', () => {
    it('should return all 13 commands with available flags', () => {
      const filtered = getFilteredCommands('[ ]', 'development')

      expect(filtered).toHaveLength(13)
      filtered.forEach(cmd => {
        expect(cmd).toHaveProperty('available')
      })
    })

    it('should mark "start" as available for development [ ]', () => {
      const filtered = getFilteredCommands('[ ]', 'development')
      const startCmd = filtered.find(cmd => cmd.name === 'start')

      expect(startCmd?.available).toBe(true)
    })

    it('should mark "build" as unavailable for development [ ]', () => {
      const filtered = getFilteredCommands('[ ]', 'development')
      const buildCmd = filtered.find(cmd => cmd.name === 'build')

      expect(buildCmd?.available).toBe(false)
    })
  })

  describe('extractStatusCode', () => {
    it('should extract status code from full status string', () => {
      expect(extractStatusCode('implement [im]')).toBe('[im]')
      expect(extractStatusCode('basic-design [bd]')).toBe('[bd]')
      expect(extractStatusCode('todo [ ]')).toBe('[ ]')
      expect(extractStatusCode('done [xx]')).toBe('[xx]')
    })

    it('should return "[ ]" for invalid status string', () => {
      expect(extractStatusCode('invalid')).toBe('[ ]')
      expect(extractStatusCode('')).toBe('[ ]')
    })

    it('should handle status codes with special characters', () => {
      expect(extractStatusCode('detail-design [dd]')).toBe('[dd]')
      expect(extractStatusCode('verify [vf]')).toBe('[vf]')
    })
  })
})
