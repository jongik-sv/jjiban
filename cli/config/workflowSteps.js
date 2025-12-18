/**
 * 워크플로우 단계 설정
 * Task: TSK-07-01
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 워크플로우 설정 파일 로드
 */
function loadWorkflowConfig() {
  const configPath = path.join(__dirname, '../../.jjiban/settings/workflows.json');
  if (!fs.existsSync(configPath)) {
    throw new Error(`Workflow config not found: ${configPath}`);
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}

/**
 * command에서 wf: prefix를 제거하여 순수 step 이름 추출
 * @param {string} command - 명령어 (예: 'wf:start' 또는 'start')
 * @returns {string} 순수 step 이름 (예: 'start')
 */
function extractStepName(command) {
  return command.startsWith('wf:') ? command.slice(3) : command;
}

/**
 * step 이름으로 CLI command 생성
 * @param {string} stepName - step 이름 (예: 'start')
 * @returns {string} CLI command (예: '/wf:start')
 */
function buildCommand(stepName) {
  return `/wf:${stepName}`;
}

/**
 * 설정 파일에서 워크플로우 단계 구성
 */
function buildWorkflowSteps(config) {
  const steps = {};

  for (const [category, workflow] of Object.entries(config.workflows)) {
    const categorySteps = [];
    const transitions = workflow.transitions;
    const actions = workflow.actions || {};

    // transitions에서 주요 단계 생성 (모든 전환 포함)
    for (const transition of transitions) {
      const stepName = extractStepName(transition.command);
      categorySteps.push({
        step: stepName,
        command: buildCommand(stepName),
        status: transition.from,
        nextStatus: transition.to
      });
    }

    // 상태별 액션을 각 상태의 첫 번째 전환 뒤에 삽입
    const finalSteps = [];
    const processedStatesForActions = new Set();

    for (const step of categorySteps) {
      finalSteps.push(step);

      // 해당 상태의 액션들 추가 (각 상태당 한 번만)
      if (actions[step.status] && !processedStatesForActions.has(step.status)) {
        for (const action of actions[step.status]) {
          const actionName = extractStepName(action);
          finalSteps.push({
            step: actionName,
            command: buildCommand(actionName),
            status: step.status,
            nextStatus: step.status // 액션은 상태를 변경하지 않음
          });
        }
        processedStatesForActions.add(step.status);
      }
    }

    steps[category] = finalSteps;
  }

  return steps;
}

/**
 * Target 단계 매핑 구성 (--until 옵션용)
 */
function buildTargetMapping(config) {
  const mapping = {};

  // 각 카테고리의 development 워크플로우 기준으로 target 매핑 생성
  const devWorkflow = config.workflows.development;
  if (!devWorkflow) return mapping;

  const transitions = devWorkflow.transitions;

  // 각 전환의 목적지 상태를 target으로 등록
  for (let i = 0; i < transitions.length; i++) {
    const transition = transitions[i];
    const targetState = config.states[transition.to];

    if (!targetState) continue;

    // 해당 target까지의 모든 명령어 수집
    const targetSteps = transitions.slice(0, i + 1).map(t => t.command);

    mapping[targetState.id] = {
      targetSteps: targetSteps,
      targetStatus: transition.to
    };
  }

  // 'done'은 전체 실행
  mapping['done'] = { targetSteps: null, targetStatus: '[xx]' };

  return mapping;
}

// 설정 로드
const workflowConfig = loadWorkflowConfig();

/**
 * 카테고리별 워크플로우 단계 정의 (설정 파일 기반)
 */
export const WORKFLOW_STEPS = buildWorkflowSteps(workflowConfig);

/**
 * Target 단계 매핑 (--until 옵션용, 설정 파일 기반)
 */
export const TARGET_MAPPING = buildTargetMapping(workflowConfig);

/**
 * 상태 코드에서 다음 시작 단계 찾기
 * @param {string} category - 카테고리
 * @param {string} status - 현재 상태 코드 (예: '[bd]')
 * @returns {number} 다음 시작 단계 인덱스 (-1: 완료 상태)
 */
export function getStartStepIndex(category, status) {
  const steps = WORKFLOW_STEPS[category];
  if (!steps) return -1;

  // 완료 상태면 -1
  if (status === '[xx]') return -1;

  // Todo 상태면 0부터
  if (status === '[ ]') return 0;

  // 현재 상태에 해당하는 단계 찾기
  for (let i = 0; i < steps.length; i++) {
    if (steps[i].status === status) {
      return i;
    }
  }

  // 다음 상태에 해당하는 단계 찾기
  for (let i = 0; i < steps.length; i++) {
    if (steps[i].nextStatus === status) {
      return i + 1;
    }
  }

  return 0;
}

/**
 * 목표 단계까지 실행할 단계 목록 생성
 * @param {string} category - 카테고리
 * @param {string} currentStatus - 현재 상태 코드
 * @param {string} [target='done'] - 목표 단계
 * @returns {Array<{step: string, command: string}>} 실행할 단계 목록
 */
export function getStepsToTarget(category, currentStatus, target = 'done') {
  const steps = WORKFLOW_STEPS[category];
  if (!steps) return [];

  const startIdx = getStartStepIndex(category, currentStatus);
  if (startIdx === -1) return []; // 이미 완료

  const targetInfo = TARGET_MAPPING[target];
  if (!targetInfo) return [];

  // target이 'done'이면 전체 실행
  if (targetInfo.targetSteps === null) {
    return steps.slice(startIdx).map(s => ({ step: s.step, command: s.command }));
  }

  // 목표까지 실행할 단계 필터링
  const targetStepNames = new Set(targetInfo.targetSteps);
  const result = [];

  for (let i = startIdx; i < steps.length; i++) {
    const s = steps[i];
    if (targetStepNames.has(s.step)) {
      result.push({ step: s.step, command: s.command });
    }
    // 목표 상태에 도달하면 중단
    if (s.nextStatus === targetInfo.targetStatus || s.step === target) {
      break;
    }
  }

  return result;
}

/**
 * 단계 이름으로 명령어 가져오기
 * @param {string} category - 카테고리
 * @param {string} stepName - 단계 이름
 * @returns {string|null} 명령어
 */
export function getCommandForStep(category, stepName) {
  const steps = WORKFLOW_STEPS[category];
  if (!steps) return null;

  const step = steps.find(s => s.step === stepName);
  return step ? step.command : null;
}
