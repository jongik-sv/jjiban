/**
 * 상태 전이 서비스
 * Task: TSK-03-03
 * 상세설계: 020-detail-design.md 섹션 2.1
 *
 * 워크플로우 기반 상태 전이 검증 및 실행
 */

import { join } from 'path';
import type {
  TransitionResult,
  TaskCategory,
} from '../../../types';
import type { WorkflowTransition } from '../../../types/settings';
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
 * 워크플로우에서 전이 규칙 찾기
 * @param category - Task 카테고리
 * @param currentStatus - 현재 상태 코드
 * @param command - 전이 명령어
 * @returns WorkflowTransition 또는 null
 */
async function findTransition(
  category: TaskCategory,
  currentStatus: string,
  command: string
): Promise<WorkflowTransition | null> {
  const workflows = await getWorkflows();

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
 * 상태 전이 실행
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

  // 트리에서 Task 노드 찾아서 상태 업데이트
  function updateTaskStatus(nodes: any[]): boolean {
    for (const node of nodes) {
      if (node.id === taskId && node.type === 'task') {
        // 상태 업데이트 (newStatus는 이미 '[dd]' 형태)
        node.status = newStatus;
        return true;
      }
      if (node.children && node.children.length > 0) {
        if (updateTaskStatus(node.children)) {
          return true;
        }
      }
    }
    return false;
  }

  const updated = updateTaskStatus(tree);
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
