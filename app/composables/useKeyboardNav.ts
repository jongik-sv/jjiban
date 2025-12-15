/**
 * 키보드 네비게이션 Composable
 * 트리 탐색, 포커스 관리, 키보드 이벤트 핸들링
 * Task: TSK-04-03
 * Priority: P3
 */

import { ref, computed, nextTick, type Ref } from 'vue'
import { useTreeInteraction } from './useTreeInteraction'
import { useWbsStore } from '~/stores/wbs'
import { useSelectionStore } from '~/stores/selection'
import type { WbsNode } from '~/types/index'

/**
 * 키보드 네비게이션 Composable
 * 트리 탐색, 포커스 관리, 키보드 이벤트 핸들링
 */
export interface UseKeyboardNavOptions {
  /**
   * 트리 루트 노드 (평면화 기준)
   */
  treeRoot: Ref<WbsNode[]>

  /**
   * 노드 선택 시 호출되는 콜백
   */
  onNodeSelect?: (nodeId: string) => void

  /**
   * 포커스 이동 시 호출되는 콜백 (스크롤 조정용)
   */
  onFocusChange?: (nodeId: string, element: HTMLElement) => void
}

export interface UseKeyboardNavReturn {
  /**
   * 키보드 이벤트 핸들러 (컴포넌트에 @keydown 바인딩)
   */
  handleKeyDown: (event: KeyboardEvent) => void

  /**
   * 현재 포커스된 노드 ID
   */
  focusedNodeId: Ref<string | null>

  /**
   * 특정 노드로 포커스 이동 (프로그램 방식)
   */
  focusNode: (nodeId: string) => void
}

export function useKeyboardNav(
  options: UseKeyboardNavOptions
): UseKeyboardNavReturn {
  const wbsStore = useWbsStore()
  const selectionStore = useSelectionStore()
  const { isExpanded, toggleNode } = useTreeInteraction()

  const focusedNodeId = ref<string | null>(null)

  /**
   * 트리를 평면화하여 탐색 가능한 노드 배열 생성
   * 펼쳐진 노드의 자식만 포함
   */
  const flattenedNodes = computed<WbsNode[]>(() => {
    const result: WbsNode[] = []

    function flatten(nodes: WbsNode[]): void {
      for (const node of nodes) {
        result.push(node)

        // 펼쳐진 노드의 자식만 재귀 탐색
        if (isExpanded(node.id) && node.children && node.children.length > 0) {
          flatten(node.children)
        }
      }
    }

    flatten(options.treeRoot.value || [])
    return result
  })

  /**
   * 현재 포커스된 노드의 인덱스 찾기
   */
  function getCurrentIndex(): number {
    if (!focusedNodeId.value) return 0

    const index = flattenedNodes.value.findIndex(
      node => node.id === focusedNodeId.value
    )

    return index >= 0 ? index : 0
  }

  /**
   * 부모 노드 찾기
   */
  function findParentNode(nodeId: string): WbsNode | null {
    // 재귀 탐색
    function search(nodes: WbsNode[], target: string): WbsNode | null {
      for (const node of nodes) {
        if (node.children && node.children.length > 0) {
          // 직접 자식인지 확인
          if (node.children.some(child => child.id === target)) {
            return node
          }

          // 재귀 탐색
          const parent = search(node.children, target)
          if (parent) return parent
        }
      }
      return null
    }

    return search(options.treeRoot.value || [], nodeId)
  }

  /**
   * 특정 노드로 포커스 이동
   */
  function focusNode(nodeId: string): void {
    focusedNodeId.value = nodeId

    // DOM 포커스 및 스크롤 조정
    nextTick(() => {
      const element = document.querySelector(`[data-node-id="${nodeId}"]`) as HTMLElement
      if (element) {
        element.focus()

        // 스크롤 조정 (부드럽게)
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'nearest'
        })

        // 콜백 호출
        if (options.onFocusChange) {
          options.onFocusChange(nodeId, element)
        }
      }
    })
  }

  /**
   * ArrowDown: 다음 노드로 이동
   */
  function handleArrowDown(): void {
    if (flattenedNodes.value.length === 0) return

    const currentIndex = getCurrentIndex()
    const nextIndex = Math.min(currentIndex + 1, flattenedNodes.value.length - 1)
    const nextNode = flattenedNodes.value[nextIndex]

    if (nextNode) {
      focusNode(nextNode.id)
    }
  }

  /**
   * ArrowUp: 이전 노드로 이동
   */
  function handleArrowUp(): void {
    if (flattenedNodes.value.length === 0) return

    const currentIndex = getCurrentIndex()
    const prevIndex = Math.max(currentIndex - 1, 0)
    const prevNode = flattenedNodes.value[prevIndex]

    if (prevNode) {
      focusNode(prevNode.id)
    }
  }

  /**
   * ArrowRight: 펼치기 또는 자식으로 이동
   */
  function handleArrowRight(): void {
    if (!focusedNodeId.value) return

    const node = wbsStore.getNode(focusedNodeId.value)

    if (!node || !node.children || node.children.length === 0) {
      return  // 자식이 없으면 무시
    }

    if (!isExpanded(node.id)) {
      // 접혀있으면 펼치기
      toggleNode(node.id)
    } else {
      // 이미 펼쳐져 있으면 첫 번째 자식으로 이동
      const firstChild = node.children[0]
      if (firstChild) {
        focusNode(firstChild.id)
      }
    }
  }

  /**
   * ArrowLeft: 접기 또는 부모로 이동
   */
  function handleArrowLeft(): void {
    if (!focusedNodeId.value) return

    const node = wbsStore.getNode(focusedNodeId.value)

    if (!node) return

    if (isExpanded(node.id) && node.children && node.children.length > 0) {
      // 펼쳐져 있으면 접기
      toggleNode(node.id)
    } else {
      // 이미 접혀있으면 부모로 이동
      const parent = findParentNode(node.id)
      if (parent) {
        focusNode(parent.id)
      }
    }
  }

  /**
   * Enter: 노드 선택
   */
  function handleEnter(): void {
    if (!focusedNodeId.value) return

    if (options.onNodeSelect) {
      options.onNodeSelect(focusedNodeId.value)
    }
  }

  /**
   * Space: 토글
   */
  function handleSpace(): void {
    if (!focusedNodeId.value) return

    const node = wbsStore.getNode(focusedNodeId.value)

    if (node && node.children && node.children.length > 0) {
      toggleNode(node.id)
    }
  }

  /**
   * Home: 첫 번째 노드로 이동
   */
  function handleHome(): void {
    if (flattenedNodes.value.length === 0) return
    const firstNode = flattenedNodes.value[0]
    if (firstNode) {
      focusNode(firstNode.id)
    }
  }

  /**
   * End: 마지막 노드로 이동
   */
  function handleEnd(): void {
    if (flattenedNodes.value.length === 0) return
    const lastNode = flattenedNodes.value[flattenedNodes.value.length - 1]
    if (lastNode) {
      focusNode(lastNode.id)
    }
  }

  /**
   * Escape: 선택 해제
   */
  function handleEscape(): void {
    selectionStore.clearSelection()
  }

  /**
   * 키보드 이벤트 핸들러
   */
  function handleKeyDown(event: KeyboardEvent): void {
    // 키 매핑
    const keyHandlers: Record<string, () => void> = {
      'ArrowDown': handleArrowDown,
      'ArrowUp': handleArrowUp,
      'ArrowRight': handleArrowRight,
      'ArrowLeft': handleArrowLeft,
      'Enter': handleEnter,
      ' ': handleSpace,  // Space 키
      'Home': handleHome,
      'End': handleEnd,
      'Escape': handleEscape
    }

    const handler = keyHandlers[event.key]
    if (handler) {
      event.preventDefault()  // 기본 동작 방지 (스크롤 등)
      event.stopPropagation()  // 이벤트 버블링 방지
      handler()
    }
  }

  return {
    handleKeyDown,
    focusedNodeId,
    focusNode
  }
}
