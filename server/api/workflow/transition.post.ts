/**
 * 워크플로우 상태 전환 API
 *
 * POST /api/workflow/transition
 * Body: { taskId: string, command: string, projectId?: string }
 */

import { spawn } from 'node:child_process'
import { join } from 'node:path'

interface TransitionRequest {
  taskId: string
  command: string
  projectId?: string
}

interface TransitionResult {
  success: boolean
  taskId?: string
  previousStatus?: string
  newStatus?: string
  command?: string
  reason?: string
  message?: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<TransitionRequest>(event)

  if (!body.taskId || !body.command) {
    throw createError({
      statusCode: 400,
      message: 'taskId와 command는 필수입니다'
    })
  }

  const { taskId, command, projectId } = body

  try {
    const result = await executeTransition(taskId, command, projectId)
    return result
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    throw createError({
      statusCode: 500,
      message
    })
  }
})

/**
 * transition 스크립트 실행
 */
function executeTransition(
  taskId: string,
  command: string,
  projectId?: string
): Promise<TransitionResult> {
  return new Promise((resolve, reject) => {
    const scriptPath = join(process.cwd(), '.jjiban/script/transition.ts')
    const args = [scriptPath, taskId, command]

    if (projectId) {
      args.push('-p', projectId)
    }

    // --force 플래그 추가 (manual approval 스킵)
    args.push('--force')

    const proc = spawn('npx', ['tsx', ...args], {
      cwd: process.cwd(),
      shell: true
    })

    let stdout = ''
    let stderr = ''

    proc.stdout.on('data', (data) => {
      stdout += data.toString()
    })

    proc.stderr.on('data', (data) => {
      stderr += data.toString()
    })

    proc.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(stdout)
          resolve(result)
        } catch {
          resolve({
            success: true,
            taskId,
            command,
            message: stdout
          })
        }
      } else {
        try {
          const result = JSON.parse(stdout)
          resolve(result)
        } catch {
          reject(new Error(stderr || stdout || `Process exited with code ${code}`))
        }
      }
    })

    proc.on('error', (error) => {
      reject(error)
    })
  })
}
