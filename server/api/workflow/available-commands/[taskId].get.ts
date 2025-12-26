/**
 * GET /api/workflow/available-commands/:taskId
 * Task: TSK-02-02
 * 상세설계: 020-detail-design.md 섹션 5
 *
 * Task 상태/카테고리에 따른 사용 가능 명령어 목록 반환
 *
 * @param taskId - Task ID (URL 파라미터)
 * @param project - 프로젝트 ID (쿼리 파라미터, 선택)
 * @returns AvailableCommandsResponse
 */

import { getFilteredCommands, extractStatusCodeWithBrackets, type FilteredCommand } from '../../../utils/workflowFilter'
import { getTaskDetail } from '../../../utils/wbs/taskService'
import type { TaskCategory } from '~/types/index'

// ============================================================
// Types
// ============================================================

interface AvailableCommandsResponse {
  success: boolean
  commands: FilteredCommand[]
  task?: {
    status: string
    category: TaskCategory
  }
  error?: string
}

// ============================================================
// Handler
// ============================================================

export default defineEventHandler(async (event): Promise<AvailableCommandsResponse> => {
  try {
    // 1. taskId 추출
    const taskId = getRouterParam(event, 'taskId')
    const query = getQuery(event)
    const projectId = query.project as string | undefined

    if (!taskId) {
      return {
        success: false,
        commands: [],
        error: 'taskId is required'
      }
    }

    // 2. Task 정보 조회
    let task
    try {
      task = await getTaskDetail(taskId, projectId)
    } catch (e) {
      return {
        success: false,
        commands: [],
        error: `Task not found: ${taskId}`
      }
    }

    // 3. 상태 코드 추출 (대괄호 포함 형태)
    const statusCode = extractStatusCodeWithBrackets(task.status)
    const category = task.category

    // 4. 필터링된 명령어 목록 생성
    const commands = getFilteredCommands(statusCode, category)

    // 5. 응답 반환
    return {
      success: true,
      commands,
      task: {
        status: statusCode,
        category
      }
    }

  } catch (error) {
    console.error('[available-commands API] Error:', error)
    return {
      success: false,
      commands: [],
      error: error instanceof Error ? error.message : 'Internal server error'
    }
  }
})
