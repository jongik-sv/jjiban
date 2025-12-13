/**
 * 선택 스토어
 * 현재 선택된 노드 및 Task 상세 정보 관리
 * Task: TSK-01-01-03
 */

import type { TaskDetail, WbsNodeType } from '~/types/store'

export const useSelectionStore = defineStore('selection', () => {
  // ============================================================
  // State
  // ============================================================
  const selectedNodeId = ref<string | null>(null)
  const selectedTask = ref<TaskDetail | null>(null)
  const loadingTask = ref(false)
  const error = ref<string | null>(null)

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

    // Task인 경우 상세 정보 로드
    if (nodeId.toUpperCase().startsWith('TSK-')) {
      await loadTaskDetail(nodeId)
    } else {
      selectedTask.value = null
    }
  }

  /**
   * Task 상세 정보 로드
   */
  async function loadTaskDetail(taskId: string) {
    loadingTask.value = true
    error.value = null
    try {
      const data = await $fetch<TaskDetail>(`/api/tasks/${taskId}`)
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
   * 선택 해제
   */
  function clearSelection() {
    selectedNodeId.value = null
    selectedTask.value = null
    error.value = null
  }

  return {
    // State
    selectedNodeId,
    selectedTask,
    loadingTask,
    error,
    // Getters
    hasSelection,
    selectedNodeType,
    isTaskSelected,
    // Actions
    selectNode,
    loadTaskDetail,
    refreshTaskDetail,
    clearSelection
  }
})

// HMR 지원
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSelectionStore, import.meta.hot))
}
