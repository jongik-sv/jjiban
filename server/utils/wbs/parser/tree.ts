/**
 * WBS Parser - 트리 빌드 및 진행률 계산 함수
 * Task: TSK-02-02-01
 * 상세설계: 020-detail-design.md 섹션 3.4, 3.5
 */

import type { WbsNode } from '../../../../types';
import type { FlatNode } from './types';

/**
 * 플랫 노드 배열을 부모-자식 관계의 트리로 변환
 *
 * @param flatNodes - 플랫 노드 배열
 * @returns 루트 노드 배열 (WbsNode[])
 *
 * FR-003: 계층 구조 빌드 (트리)
 * BR-003: 3단계 구조: WP → TSK
 * BR-004: 4단계 구조: WP → ACT → TSK
 */
export function buildTree(flatNodes: FlatNode[]): WbsNode[] {
  const nodeMap = new Map<string, WbsNode>();
  const rootNodes: WbsNode[] = [];

  // 1단계: 모든 노드를 WbsNode로 변환하고 맵에 저장
  for (const node of flatNodes) {
    const wbsNode: WbsNode = {
      id: node.id,
      type: node.type,
      title: node.title,
      category: node.attributes.category,
      status: node.attributes.status,
      priority: node.attributes.priority,
      assignee: node.attributes.assignee,
      schedule: node.attributes.schedule,
      tags: node.attributes.tags,
      depends: node.attributes.depends,
      requirements: node.attributes.requirements,
      ref: node.attributes.ref,
      progress: 0,
      taskCount: 0,
      children: [],
      expanded: false,
    };

    nodeMap.set(node.id, wbsNode);
  }

  // 2단계: 부모-자식 관계 설정
  for (const node of flatNodes) {
    const parentId = determineParentId(node);

    if (parentId === null) {
      // 루트 노드 (WP)
      rootNodes.push(nodeMap.get(node.id)!);
    } else {
      const parent = nodeMap.get(parentId);

      if (parent) {
        parent.children.push(nodeMap.get(node.id)!);
      } else {
        // 부모를 찾을 수 없음 (고아 노드)
        console.warn(`Orphan node: ${node.id}, missing parent: ${parentId}`);
        rootNodes.push(nodeMap.get(node.id)!);
      }
    }
  }

  return rootNodes;
}

/**
 * 노드의 부모 ID 결정
 *
 * @param node - FlatNode
 * @returns 부모 ID 또는 null (루트 노드인 경우)
 *
 * BR-003: 3단계 구조 (TSK-01-02 → WP-01)
 * BR-004: 4단계 구조 (TSK-01-02-03 → ACT-01-02)
 */
export function determineParentId(node: FlatNode): string | null {
  const idParts = node.id.split('-');

  if (node.type === 'wp') {
    return null; // WP는 루트
  }

  if (node.type === 'act') {
    // ACT-01-02 → WP-01
    return `WP-${idParts[1]}`;
  }

  if (node.type === 'task') {
    if (idParts.length === 3) {
      // TSK-01-02 → WP-01 (3단계)
      return `WP-${idParts[1]}`;
    } else if (idParts.length === 4) {
      // TSK-01-02-03 → ACT-01-02 (4단계)
      return `ACT-${idParts[1]}-${idParts[2]}`;
    }
  }

  return null;
}

/**
 * 하위 Task 상태 기반으로 진행률 자동 계산 (재귀)
 *
 * @param nodes - WbsNode[] (in-place 수정)
 *
 * FR-004: 진행률 자동 계산
 */
export function calculateProgress(nodes: WbsNode[]): void {
  for (const node of nodes) {
    if (node.children.length > 0) {
      // 재귀적으로 자식 노드 먼저 계산
      calculateProgress(node.children);

      // 하위 Task 수집
      const allTasks = collectAllTasks(node);

      // 진행률 계산
      const totalTasks = allTasks.length;
      const completedTasks = allTasks.filter(t => t.status === '[xx]').length;

      if (totalTasks > 0) {
        node.progress = Math.round((completedTasks / totalTasks) * 100);
        node.taskCount = totalTasks;
      } else {
        // WP/ACT 노드 아래 Task가 없는 경우
        node.progress = 0;
        node.taskCount = 0;
      }
    } else {
      // 리프 노드 (Task)
      if (node.type === 'task') {
        node.taskCount = 1;
        node.progress = node.status === '[xx]' ? 100 : 0;
      } else {
        node.taskCount = 0;
        node.progress = 0;
      }
    }
  }
}

/**
 * 노드 아래의 모든 Task 수집 (DFS)
 *
 * @param node - WbsNode
 * @returns type === 'task'인 노드 배열
 */
function collectAllTasks(node: WbsNode): WbsNode[] {
  const tasks: WbsNode[] = [];

  if (node.type === 'task') {
    tasks.push(node);
  }

  for (const child of node.children) {
    tasks.push(...collectAllTasks(child));
  }

  return tasks;
}
