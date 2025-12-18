/**
 * GET /api/settings/workflows
 * Workflows configuration API
 * Returns .jjiban/settings/workflows.json
 */

import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { WorkflowsConfig } from '~/types/workflow-config'

export default defineEventHandler(async (event): Promise<WorkflowsConfig> => {
  try {
    const projectRoot = process.cwd()
    const workflowsPath = join(projectRoot, '.jjiban', 'settings', 'workflows.json')

    const content = await readFile(workflowsPath, 'utf-8')
    const config: WorkflowsConfig = JSON.parse(content)

    return config
  } catch (error) {
    console.error('[API] Failed to load workflows.json:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to load workflow configuration',
    })
  }
})
