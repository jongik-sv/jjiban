/**
 * 의존관계 그래프 데이터 변환 컴포저블
 * Task: TSK-06-01
 */

import { DataSet } from 'vis-data'
import type { WbsNode } from '~/types'
import type { GraphNode, GraphEdge, GraphData, GraphFilter } from '~/types/graph'
import { GRAPH_COLORS } from '~/types/graph'

export function useDependencyGraph() {
  const wbsStore = useWbsStore()
  const selectionStore = useSelectionStore()

  /**
   * 현재 선택된 프로젝트의 Task만 필터링하여 반환
   * selectionStore.selectedProjectId를 기준으로 필터링
   */
  function getProjectTasks(): Map<string, { node: WbsNode; taskId: string }> {
    const result = new Map<string, { node: WbsNode; taskId: string }>()
    const currentProjectId = selectionStore.selectedProjectId

    if (!currentProjectId) return result

    wbsStore.flatNodes.forEach((node, id) => {
      if (node.type === 'task') {
        // 복합 ID에서 프로젝트 ID와 taskId 추출 (예: "jjiban:TSK-01-01")
        const colonIndex = id.indexOf(':')
        if (colonIndex > 0) {
          const projectId = id.substring(0, colonIndex)
          const taskId = id.substring(colonIndex + 1)

          // 현재 프로젝트의 Task만 포함
          if (projectId === currentProjectId) {
            result.set(taskId, { node, taskId })
          }
        }
      }
    })

    return result
  }

  /**
   * flatNodes Map에서 Task 노드만 추출하여 그래프 데이터로 변환
   */
  function buildGraphData(filter?: GraphFilter): GraphData {
    const nodes: GraphNode[] = []
    const edges: GraphEdge[] = []
    const taskNodes = new Map<string, WbsNode>()

    // 1. 현재 프로젝트의 Task만 필터링
    const projectTasks = getProjectTasks()

    projectTasks.forEach(({ node, taskId }) => {
      // 필터 적용
      if (filter) {
        const category = node.category || 'development'
        const status = extractStatusCode(node.status)

        if (filter.categories.length > 0 && !filter.categories.includes(category)) {
          return
        }
        if (filter.statuses.length > 0 && !filter.statuses.includes(status)) {
          return
        }
      }

      taskNodes.set(taskId, node)
    })

    // 2. 레벨 계산 (위상정렬)
    const levelMap = calculateLevels(taskNodes)

    // 3. GraphNode 배열 생성
    taskNodes.forEach((node, taskId) => {
      const status = extractStatusCode(node.status)

      nodes.push({
        id: taskId,
        label: `${taskId}\n${truncateTitle(node.title, 15)}`,
        title: buildTooltip(node, taskId),
        group: node.category || 'development',
        level: levelMap.get(taskId) || 0,
        color: getNodeColor(status),
        font: {
          color: status === '[xx]' ? '#9ca3af' : '#e5e7eb'
        }
      })

      // 4. GraphEdge 생성
      if (node.depends) {
        const deps = typeof node.depends === 'string'
          ? node.depends.split(',').map(d => d.trim())
          : node.depends

        deps.forEach(depId => {
          if (depId && taskNodes.has(depId)) {
            edges.push({
              id: `${depId}→${taskId}`,
              from: depId,
              to: taskId,
              arrows: 'to',
              color: {
                color: '#6c9bcf',
                highlight: '#3b82f6',
                hover: '#93c5fd'
              }
            })
          }
        })
      }
    })

    return {
      nodes: new DataSet(nodes),
      edges: new DataSet(edges)
    }
  }

  /**
   * 위상정렬 기반 레벨 계산 (왼쪽→오른쪽 레이아웃용)
   */
  function calculateLevels(taskNodes: Map<string, WbsNode>): Map<string, number> {
    const levels = new Map<string, number>()
    const inDegree = new Map<string, number>()
    const adjacency = new Map<string, string[]>()

    // 초기화
    taskNodes.forEach((_, id) => {
      inDegree.set(id, 0)
      adjacency.set(id, [])
    })

    // 의존관계 그래프 구축
    taskNodes.forEach((node, taskId) => {
      if (node.depends) {
        const deps = typeof node.depends === 'string'
          ? node.depends.split(',').map(d => d.trim())
          : node.depends

        deps.forEach(depId => {
          if (depId && taskNodes.has(depId)) {
            adjacency.get(depId)!.push(taskId)
            inDegree.set(taskId, (inDegree.get(taskId) || 0) + 1)
          }
        })
      }
    })

    // BFS로 레벨 할당
    const queue: string[] = []
    taskNodes.forEach((_, id) => {
      if (inDegree.get(id) === 0) {
        queue.push(id)
        levels.set(id, 0)
      }
    })

    while (queue.length > 0) {
      const current = queue.shift()!
      const currentLevel = levels.get(current) || 0

      adjacency.get(current)?.forEach(neighbor => {
        const newDegree = (inDegree.get(neighbor) || 1) - 1
        inDegree.set(neighbor, newDegree)

        const newLevel = Math.max(levels.get(neighbor) || 0, currentLevel + 1)
        levels.set(neighbor, newLevel)

        if (newDegree === 0) {
          queue.push(neighbor)
        }
      })
    }

    // 순환 의존성 처리: 방문하지 않은 노드에 최대 레벨 + 1 할당
    const maxLevel = Math.max(...Array.from(levels.values()), 0)
    taskNodes.forEach((_, id) => {
      if (!levels.has(id)) {
        levels.set(id, maxLevel + 1)
        console.warn(`[useDependencyGraph] 순환 의존성 감지: ${id}`)
      }
    })

    return levels
  }

  /**
   * 상태별 노드 색상 반환
   */
  function getNodeColor(status: string): { background?: string; border?: string } | undefined {
    if (status === '[xx]') {
      return {
        background: '#4b5563',  // gray-600
        border: '#374151'       // gray-700
      }
    }
    return undefined  // 그룹 색상 사용
  }

  /**
   * 제목 자르기
   */
  function truncateTitle(title: string, maxLen: number): string {
    if (title.length <= maxLen) return title
    return title.substring(0, maxLen - 2) + '..'
  }

  /**
   * HTML 툴팁 생성
   */
  function buildTooltip(node: WbsNode, taskId: string): string {
    const status = extractStatusCode(node.status)
    const statusName = getStatusName(status)
    const category = node.category || 'development'
    const categoryName = getCategoryName(category)

    return `
      <div style="padding: 8px; font-size: 12px; max-width: 250px;">
        <strong style="font-size: 14px;">${taskId}</strong><br>
        <span style="color: #9ca3af;">${node.title}</span>
        <hr style="margin: 8px 0; border-color: #374151;">
        <div>상태: <span style="color: ${getStatusColor(status)}">${statusName}</span></div>
        <div>카테고리: ${categoryName}</div>
        ${node.assignee ? `<div>담당자: ${node.assignee}</div>` : ''}
        ${node.depends ? `<div>의존: ${node.depends}</div>` : ''}
      </div>
    `
  }

  /**
   * 상태 코드 추출 (예: "basic-design [bd]" → "[bd]")
   */
  function extractStatusCode(status?: string): string {
    if (!status) return '[ ]'
    const match = status.match(/\[[\w\s]*\]/)
    return match ? match[0] : '[ ]'
  }

  /**
   * 상태 이름 반환
   */
  function getStatusName(status: string): string {
    const statusNames: Record<string, string> = {
      '[ ]': 'Todo',
      '[bd]': '기본설계',
      '[dd]': '상세설계',
      '[im]': '구현',
      '[vf]': '검증',
      '[xx]': '완료',
      '[an]': '분석',
      '[fx]': '수정',
      '[ds]': '설계'
    }
    return statusNames[status] || status
  }

  /**
   * 상태별 색상
   */
  function getStatusColor(status: string): string {
    const statusColors: Record<string, string> = {
      '[ ]': '#9ca3af',
      '[bd]': '#fbbf24',
      '[dd]': '#f97316',
      '[im]': '#3b82f6',
      '[vf]': '#8b5cf6',
      '[xx]': '#22c55e',
      '[an]': '#ef4444',
      '[fx]': '#ec4899',
      '[ds]': '#06b6d4'
    }
    return statusColors[status] || '#9ca3af'
  }

  /**
   * 카테고리 이름 반환
   */
  function getCategoryName(category: string): string {
    const categoryNames: Record<string, string> = {
      development: '개발',
      defect: '결함',
      infrastructure: '인프라'
    }
    return categoryNames[category] || category
  }

  /**
   * 그래프 통계 반환 (현재 프로젝트만)
   */
  function getGraphStats() {
    let taskCount = 0
    let edgeCount = 0

    const projectTasks = getProjectTasks()
    const taskIds = new Set(projectTasks.keys())

    projectTasks.forEach(({ node }) => {
      taskCount++
      if (node.depends) {
        const deps = typeof node.depends === 'string'
          ? node.depends.split(',')
          : node.depends
        // 현재 프로젝트 내의 의존관계만 카운트
        edgeCount += deps.filter(d => d.trim() && taskIds.has(d.trim())).length
      }
    })

    return { taskCount, edgeCount }
  }

  return {
    buildGraphData,
    calculateLevels,
    getNodeColor,
    truncateTitle,
    buildTooltip,
    extractStatusCode,
    getStatusName,
    getCategoryName,
    getGraphStats,
    GRAPH_COLORS
  }
}
