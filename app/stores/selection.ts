/**
 * 선택 스토어
 * 현재 선택된 노드 및 Task 상세 정보 관리
 * Task: TSK-01-01-03, TSK-09-01
 */

import type { TaskDetail, WbsNodeType, WbsNode, ProjectFile, ProjectFilesResponse } from '~/types'
import { useWbsStore } from './wbs'
import { useProjectStore } from './project'
import { buildApiUrl } from '~/utils/urlPath'

export const useSelectionStore = defineStore('selection', () => {
  // ============================================================
  // State
  // ============================================================
  const selectedNodeId = ref<string | null>(null)
  const selectedTask = ref<TaskDetail | null>(null)
  const loadingTask = ref(false)
  const error = ref<string | null>(null)

  // TSK-09-01: 프로젝트 파일 목록
  const selectedProjectFiles = ref<ProjectFile[]>([])
  const loadingFiles = ref(false)

  // ============================================================
  // Getters
  // ============================================================

  /**
   * 선택된 노드가 있는지 확인
   */
  const hasSelection = computed(() => selectedNodeId.value !== null)

  /**
   * 선택된 노드의 타입 추출
   */
  const selectedNodeType = computed((): WbsNodeType | null => {
    if (!selectedNodeId.value) return null

    const id = selectedNodeId.value.toUpperCase()
    if (id.startsWith('WP-')) return 'wp'
    if (id.startsWith('ACT-')) return 'act'
    if (id.startsWith('TSK-')) return 'task'
    return 'project'
  })

  /**
   * 선택된 것이 Task인지 확인
   */
  const isTaskSelected = computed(() => selectedNodeType.value === 'task')

  /**
   * WP 또는 ACT 선택 여부
   */
  const isWpOrActSelected = computed(() => {
    const type = selectedNodeType.value
    return type === 'wp' || type === 'act'
  })

  /**
   * 선택된 WbsNode 반환 (WP/ACT 전용)
   * Task가 선택되었으면 null 반환
   *
   * H-01 지적사항 반영:
   * - wbsStore.flatNodes 초기화 검증 추가
   * - 노드 조회 실패 시 경고 로그 출력
   */
  const selectedNode = computed((): WbsNode | null => {
    if (!selectedNodeId.value) return null
    if (isTaskSelected.value) return null

    const wbsStore = useWbsStore()

    // wbsStore.flatNodes가 초기화되었는지 확인
    if (!wbsStore.flatNodes || wbsStore.flatNodes.size === 0) {
      console.warn('[selectionStore] WBS data not loaded yet')
      return null
    }

    const node = wbsStore.getNode(selectedNodeId.value)
    if (!node) {
      console.warn(`[selectionStore] Node not found: ${selectedNodeId.value}`)
    }

    return node || null
  })

  // ============================================================
  // Actions
  // ============================================================

  /**
   * 노드 선택
   */
  async function selectNode(nodeId: string) {
    // 같은 노드 재선택 시 무시
    if (selectedNodeId.value === nodeId) return

    selectedNodeId.value = nodeId
    error.value = null

    const wbsStore = useWbsStore()
    const node = wbsStore.getNode(nodeId)

    if (!node) return

    // 프로젝트 노드 선택 시 파일 목록 로드 (TSK-09-01)
    if (node.type === 'project') {
      await fetchProjectFiles(nodeId)
      selectedTask.value = null
    }
    // Task인 경우 상세 정보 로드
    else if (nodeId.toUpperCase().startsWith('TSK-')) {
      await loadTaskDetail(nodeId)
      selectedProjectFiles.value = []
    } else {
      selectedTask.value = null
      selectedProjectFiles.value = []
    }
  }

  /**
   * Task 상세 정보 로드
   */
  async function loadTaskDetail(taskId: string) {
    loadingTask.value = true
    error.value = null
    try {
      const projectStore = useProjectStore()
      const projectId = projectStore.projectId
      // 한글, 공백, 괄호 등 특수문자 안전하게 인코딩
      const url = buildApiUrl('/api/tasks', [taskId], projectId ? { project: projectId } : undefined)
      const data = await $fetch<TaskDetail>(url)
      selectedTask.value = data
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load task detail'
      selectedTask.value = null
    } finally {
      loadingTask.value = false
    }
  }

  /**
   * Task 상세 정보 새로고침
   */
  async function refreshTaskDetail() {
    if (selectedNodeId.value && isTaskSelected.value) {
      await loadTaskDetail(selectedNodeId.value)
    }
  }

  /**
   * 프로젝트 파일 목록 조회 (TSK-09-01)
   */
  async function fetchProjectFiles(projectId: string): Promise<void> {
    loadingFiles.value = true

    try {
      const response = await $fetch<ProjectFilesResponse>(
        `/api/projects/${projectId}/files`
      )
      selectedProjectFiles.value = response.files
    } catch (e) {
      console.error('Failed to fetch project files:', e)
      selectedProjectFiles.value = []
    } finally {
      loadingFiles.value = false
    }
  }

  /**
   * 선택 해제
   */
  function clearSelection() {
    selectedNodeId.value = null
    selectedTask.value = null
    selectedProjectFiles.value = []
    error.value = null
  }

  return {
    // State
    selectedNodeId,
    selectedTask,
    selectedProjectFiles,
    loadingTask,
    loadingFiles,
    error,
    // Getters
    hasSelection,
    selectedNodeType,
    isTaskSelected,
    isWpOrActSelected,
    selectedNode,
    // Actions
    selectNode,
    loadTaskDetail,
    refreshTaskDetail,
    fetchProjectFiles,
    clearSelection
  }
})

// HMR 지원
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSelectionStore, import.meta.hot))
}
