/**
 * 상태 전이 서비스
 * Task: TSK-03-03, TSK-03-06
 * 상세설계: 020-detail-design.md 섹션 2.1
 *
 * 워크플로우 기반 상태 전이 검증 및 실행
 *
 * TSK-03-06: 롤백 로직 추가
 * - calculateRollbackDeletions(): 롤백 시 삭제할 completed 키 계산
 * - formatCompletedTimestamp(): 타임스탬프 포맷 유틸리티
 */

import { join } from 'path';
import type {
  TransitionResult,
  TaskCategory,
  WbsNode,
} from '../../../types';
import type { WorkflowTransition, WorkflowsConfig } from '../../../types/settings';
import { findTaskById } from '../wbs/taskService';
import { getWbsTree, saveWbsTree } from '../wbs/wbsService';
import { getWorkflows } from '../settings';
import {
  ensureDir,
  writeMarkdownFile,
  getTaskFolderPath,
  fileExists,
} from '../file';
import {
  createNotFoundError,
  createBadRequestError,
  createConflictError,
} from '../errors/standardError';
import { extractStatusCode, formatStatusCode } from './statusUtils';

/**
 * 완료 시각을 "YYYY-MM-DD HH:mm" 형식으로 포맷
 * TSK-03-06: P2-002 매직 넘버 제거
 *
 * WHY: PRD 7.5에 따라 각 상태 전이 시점을 기록하여 Task 진행 이력 추적
 * FORMAT: "YYYY-MM-DD HH:mm" (타임존 정보 없음, 서버 로컬 시간 기준)
 *
 * @param date - 포맷할 날짜 (기본: 현재 시각)
 * @returns 포맷된 타임스탬프
 */
export function formatCompletedTimestamp(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

/**
 * 롤백 시 삭제할 completed 키 목록 계산
 * TSK-03-06: P1-001 함수 분리, P2-001 롤백 로직 독립 함수
 *
 * @param currentStatus - 현재 상태 코드 (예: "[im]")
 * @param newStatus - 새 상태 코드 (예: "[dd]")
 * @param category - Task 카테고리
 * @param workflowsConfig - 워크플로우 설정 (선택, 없으면 조회)
 * @returns 삭제할 상태 코드 배열
 */
export async function calculateRollbackDeletions(
  currentStatus: string,
  newStatus: string,
  category: TaskCategory,
  workflowsConfig?: WorkflowsConfig
): Promise<string[]> {
  const config = workflowsConfig || await getWorkflows();
  const categoryWorkflow = config.workflows.find((wf) => wf.id === category);

  if (!categoryWorkflow) {
    return [];
  }

  const currentIndex = categoryWorkflow.states.indexOf(currentStatus);
  const newIndex = categoryWorkflow.states.indexOf(newStatus);

  // 롤백 아님 (전진 또는 동일, 또는 상태를 찾지 못함)
  if (newIndex >= currentIndex || newIndex < 0 || currentIndex < 0) {
    return [];
  }

  // 롤백 이후 단계의 상태 코드 추출 (newIndex + 1부터 끝까지)
  const stateCodesToDelete: string[] = [];
  for (let i = newIndex + 1; i < categoryWorkflow.states.length; i++) {
    const stateCode = extractStatusCode(categoryWorkflow.states[i]);
    if (stateCode && stateCode.trim()) {
      stateCodesToDelete.push(stateCode);
    }
  }

  return stateCodesToDelete;
}

/**
 * 워크플로우에서 전이 규칙 찾기
 * TSK-03-06: P1-002 워크플로우 중복 조회 제거 - 선택적 파라미터 추가
 *
 * @param category - Task 카테고리
 * @param currentStatus - 현재 상태 코드
 * @param command - 전이 명령어
 * @param workflowsConfig - 워크플로우 설정 (선택, 없으면 조회)
 * @returns WorkflowTransition 또는 null
 */
async function findTransition(
  category: TaskCategory,
  currentStatus: string,
  command: string,
  workflowsConfig?: WorkflowsConfig
): Promise<WorkflowTransition | null> {
  const workflows = workflowsConfig || await getWorkflows();

  // 카테고리에 해당하는 워크플로우 찾기
  const categoryWorkflow = workflows.workflows.find(
    (wf) => wf.id === category
  );

  if (!categoryWorkflow) {
    return null;
  }

  // 전이 규칙 찾기
  const transition = categoryWorkflow.transitions.find(
    (t) => t.from === currentStatus && t.command === command
  );

  return transition || null;
}

/**
 * 문서 생성 (템플릿 기반 또는 기본 콘텐츠)
 * @param projectId - 프로젝트 ID
 * @param taskId - Task ID
 * @param documentName - 문서 파일명
 * @returns 성공 여부
 */
async function createDocument(
  projectId: string,
  taskId: string,
  documentName: string
): Promise<boolean> {
  const taskFolderPath = getTaskFolderPath(projectId, taskId);
  await ensureDir(taskFolderPath);

  const documentPath = join(taskFolderPath, documentName);

  // 이미 존재하면 건너뛰기
  if (await fileExists(documentPath)) {
    return true;
  }

  // 기본 템플릿 내용
  const defaultContent = `# ${documentName.replace('.md', '')}

**Task ID:** ${taskId}
**Created:** ${new Date().toISOString().split('T')[0]}

---

## 내용

이 문서는 자동으로 생성되었습니다.
`;

  return await writeMarkdownFile(documentPath, defaultContent);
}

/** 검증 결과 타입 (내부용) */
interface ValidationResult {
  valid: boolean;
  message?: string;
  taskResult?: Awaited<ReturnType<typeof findTaskById>>;
  transition?: WorkflowTransition;
  currentStatus?: string;
  statusCode?: string;
}

/**
 * 상태 전이 가능 여부 검증 (내부용 - Task 결과 포함)
 * @param taskId - Task ID
 * @param command - 전이 명령어
 * @returns 검증 결과 + Task 정보
 */
async function validateTransitionInternal(
  taskId: string,
  command: string
): Promise<ValidationResult> {
  // Task 검색
  const taskResult = await findTaskById(taskId);
  if (!taskResult) {
    throw createNotFoundError(`Task를 찾을 수 없습니다: ${taskId}`);
  }

  const { task } = taskResult;
  const statusCode = extractStatusCode(task.status);
  const currentStatus = formatStatusCode(statusCode);
  const category = task.category as TaskCategory;

  // 전이 규칙 조회
  const transition = await findTransition(category, currentStatus, command);

  if (!transition) {
    return {
      valid: false,
      message: `현재 상태 ${currentStatus}에서 명령어 '${command}'를 사용할 수 없습니다`,
    };
  }

  return {
    valid: true,
    taskResult,
    transition,
    currentStatus,
    statusCode,
  };
}

/**
 * 상태 전이 가능 여부 검증
 * @param taskId - Task ID
 * @param command - 전이 명령어
 * @returns 검증 결과 (가능/불가능, 메시지)
 */
export async function validateTransition(
  taskId: string,
  command: string
): Promise<{ valid: boolean; message?: string }> {
  const result = await validateTransitionInternal(taskId, command);
  return { valid: result.valid, message: result.message };
}

/**
 * 트리에서 Task 노드를 찾아서 상태와 completed 업데이트
 * TSK-03-06: P1-001 함수 분리 - executeTransition()에서 분리
 * TSK-03-06: P2-003 타입 안정성 개선 - any → WbsNode
 *
 * @param nodes - WBS 노드 배열
 * @param taskId - 업데이트할 Task ID
 * @param newStatus - 새 상태 코드
 * @param completedTimestamp - 완료 시각
 * @param stateCodesToDelete - 롤백 시 삭제할 상태 코드 배열
 * @returns 업데이트 성공 여부
 */
function updateTaskInTree(
  nodes: WbsNode[],
  taskId: string,
  newStatus: string,
  completedTimestamp: string,
  stateCodesToDelete: string[]
): boolean {
  for (const node of nodes) {
    if (node.id === taskId && node.type === 'task') {
      // 상태 업데이트 (newStatus는 이미 '[dd]' 형태)
      node.status = newStatus;

      // TSK-03-06: 롤백 시 이후 단계 completed 삭제
      // 키가 없으면 무시 (에러 발생 없음) - JavaScript의 delete 연산자 특성
      if (stateCodesToDelete.length > 0 && node.completed) {
        for (const code of stateCodesToDelete) {
          delete node.completed[code];
        }
      }

      // TSK-03-06: completed 필드에 완료 시각 기록
      const newStatusCode = extractStatusCode(newStatus);
      if (newStatusCode) {
        // completed 객체가 없으면 생성
        if (!node.completed) {
          node.completed = {};
        }
        // 새 상태의 완료 시각 기록
        node.completed[newStatusCode] = completedTimestamp;
      }

      return true;
    }
    if (node.children && node.children.length > 0) {
      if (updateTaskInTree(node.children, taskId, newStatus, completedTimestamp, stateCodesToDelete)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * 상태 전이 실행
 * TSK-03-06: P1-001 함수 분리 (복잡도 감소)
 * TSK-03-06: P1-002 워크플로우 1회만 조회
 *
 * @param taskId - Task ID
 * @param command - 전이 명령어
 * @param comment - 변경 사유 (선택)
 * @returns TransitionResult
 */
export async function executeTransition(
  taskId: string,
  command: string,
  comment?: string
): Promise<TransitionResult> {
  const timestamp = new Date().toISOString();

  // 유효성 검증 (Task 조회 결과 재사용)
  const validation = await validateTransitionInternal(taskId, command);
  if (!validation.valid) {
    throw createConflictError(
      'INVALID_TRANSITION',
      validation.message || '유효하지 않은 상태 전이입니다'
    );
  }

  // 검증 결과에서 필요한 정보 추출
  const { taskResult, transition, statusCode } = validation;
  if (!taskResult || !transition || statusCode === undefined) {
    throw createConflictError('INVALID_TRANSITION', '검증 결과가 불완전합니다');
  }

  const { projectId } = taskResult;
  const newStatus = transition.to;

  // WBS 트리 조회
  const { metadata, tree } = await getWbsTree(projectId);

  // TSK-03-06: 타임스탬프 포맷 (분리된 유틸리티 함수 사용)
  const completedTimestamp = formatCompletedTimestamp();

  // TSK-03-06: 롤백 여부 판단 및 삭제 대상 계산 (분리된 함수 사용)
  // P1-002: 워크플로우는 여기서 1회만 조회
  const workflowsConfig = await getWorkflows();
  const currentStatusFormatted = formatStatusCode(statusCode);
  const stateCodesToDelete = await calculateRollbackDeletions(
    currentStatusFormatted,
    newStatus,
    taskResult.task.category as TaskCategory,
    workflowsConfig
  );

  // TSK-03-06: 트리 업데이트 (분리된 함수 사용)
  const updated = updateTaskInTree(tree, taskId, newStatus, completedTimestamp, stateCodesToDelete);
  if (!updated) {
    throw createNotFoundError(`트리에서 Task를 찾을 수 없습니다: ${taskId}`);
  }

  // WBS 저장
  try {
    await saveWbsTree(projectId, metadata, tree);
  } catch (error) {
    throw createBadRequestError(
      'FILE_WRITE_ERROR',
      `데이터 저장에 실패했습니다: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }

  // 문서 생성 (필요한 경우)
  let documentCreated: string | undefined;
  if (transition.document) {
    const created = await createDocument(projectId, taskId, transition.document);
    if (created) {
      documentCreated = transition.document;
    }
  }

  return {
    success: true,
    taskId,
    previousStatus: statusCode,
    newStatus: extractStatusCode(transition.to),
    command,
    documentCreated,
    timestamp,
  };
}

/**
 * 가능한 명령어 목록 조회
 * @param taskId - Task ID
 * @returns 가능한 명령어 배열
 */
export async function getAvailableCommands(
  taskId: string
): Promise<string[]> {
  // Task 검색
  const taskResult = await findTaskById(taskId);
  if (!taskResult) {
    throw createNotFoundError(`Task를 찾을 수 없습니다: ${taskId}`);
  }

  const { task } = taskResult;
  const statusCode = extractStatusCode(task.status);
  const currentStatus = formatStatusCode(statusCode);
  const category = task.category as TaskCategory;

  // 워크플로우에서 가능한 전이 조회
  const workflows = await getWorkflows();
  const categoryWorkflow = workflows.workflows.find(
    (wf) => wf.id === category
  );

  if (!categoryWorkflow) {
    return [];
  }

  // 현재 상태에서 가능한 명령어 추출
  const commands = categoryWorkflow.transitions
    .filter((t) => t.from === currentStatus)
    .map((t) => t.command);

  return commands;
}
