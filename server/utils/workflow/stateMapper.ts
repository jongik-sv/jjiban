/**
 * 상태 코드 ↔ 상태명 매핑 유틸리티
 * Task: TSK-03-04
 * 상세설계: 020-detail-design.md 섹션 4
 *
 * status code ([bd]) ↔ state name (basic-design) 양방향 매핑
 */

import type { TaskCategory } from '../../../types';
import { getWorkflows } from '../settings';

/**
 * 상태 코드를 상태명으로 변환
 * @param category - Task 카테고리
 * @param statusCode - 상태 코드 (예: "bd", "[ ]")
 * @returns 상태명 (예: "basic-design", "todo")
 */
export async function statusCodeToName(
  category: TaskCategory,
  statusCode: string
): Promise<string | null> {
  const workflows = await getWorkflows();
  const workflow = workflows.workflows.find((wf) => wf.id === category);

  if (!workflow) {
    return null;
  }

  // statusCode가 "[ ]" 형태면 중괄호 제거
  const cleanCode = statusCode.replace(/[\[\]]/g, '').trim();

  // todo 상태는 빈 문자열 또는 공백
  if (!cleanCode || cleanCode === '[ ]') {
    return 'todo';
  }

  // transitions에서 to 필드가 일치하는 상태명 찾기
  const transition = workflow.transitions.find((t) => t.to === cleanCode);
  if (transition) {
    return transition.to;
  }

  // states 배열에서 직접 찾기
  const stateName = workflow.states.find((s) => s === cleanCode);
  return stateName || null;
}

/**
 * 상태명을 상태 코드로 변환
 * @param category - Task 카테고리
 * @param stateName - 상태명 (예: "basic-design")
 * @returns 상태 코드 (예: "[bd]")
 */
export async function nameToStatusCode(
  category: TaskCategory,
  stateName: string
): Promise<string> {
  const workflows = await getWorkflows();
  const workflow = workflows.workflows.find((wf) => wf.id === category);

  if (!workflow) {
    return '[ ]';
  }

  // todo는 "[ ]"
  if (stateName === 'todo') {
    return '[ ]';
  }

  // transitions에서 to 필드가 stateName인 전이 찾기
  const transition = workflow.transitions.find((t) => t.to === stateName);
  if (transition) {
    return `[${transition.to}]`;
  }

  return '[ ]';
}

/**
 * 워크플로우의 모든 상태 코드 매핑 조회
 * @param category - Task 카테고리
 * @returns Record<상태코드, 상태명>
 */
export async function getAllStateMappings(
  category: TaskCategory
): Promise<Record<string, string>> {
  const workflows = await getWorkflows();
  const workflow = workflows.workflows.find((wf) => wf.id === category);

  if (!workflow) {
    return {};
  }

  const mappings: Record<string, string> = {
    '[ ]': 'todo',
  };

  // transitions에서 모든 상태 추출
  for (const transition of workflow.transitions) {
    mappings[`[${transition.to}]`] = transition.to;
  }

  return mappings;
}
