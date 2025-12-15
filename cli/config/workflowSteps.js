/**
 * 워크플로우 단계 설정
 * Task: TSK-07-01
 */

/**
 * 카테고리별 워크플로우 단계 정의
 */
export const WORKFLOW_STEPS = {
  development: [
    { step: 'start', command: '/wf:start', status: '[ ]', nextStatus: '[bd]' },
    { step: 'draft', command: '/wf:draft', status: '[bd]', nextStatus: '[dd]' },
    { step: 'review', command: '/wf:review', status: '[dd]', nextStatus: '[dd]' },
    { step: 'apply', command: '/wf:apply', status: '[dd]', nextStatus: '[dd]' },
    { step: 'build', command: '/wf:build', status: '[dd]', nextStatus: '[im]' },
    { step: 'test', command: '/wf:test', status: '[im]', nextStatus: '[im]' },
    { step: 'audit', command: '/wf:audit', status: '[im]', nextStatus: '[im]' },
    { step: 'patch', command: '/wf:patch', status: '[im]', nextStatus: '[im]' },
    { step: 'verify', command: '/wf:verify', status: '[im]', nextStatus: '[ts]' },
    { step: 'done', command: '/wf:done', status: '[ts]', nextStatus: '[xx]' }
  ],
  defect: [
    { step: 'start', command: '/wf:start', status: '[ ]', nextStatus: '[an]' },
    { step: 'fix', command: '/wf:fix', status: '[an]', nextStatus: '[fx]' },
    { step: 'test', command: '/wf:test', status: '[fx]', nextStatus: '[fx]' },
    { step: 'audit', command: '/wf:audit', status: '[fx]', nextStatus: '[fx]' },
    { step: 'patch', command: '/wf:patch', status: '[fx]', nextStatus: '[fx]' },
    { step: 'verify', command: '/wf:verify', status: '[fx]', nextStatus: '[ts]' },
    { step: 'done', command: '/wf:done', status: '[ts]', nextStatus: '[xx]' }
  ],
  infrastructure: [
    { step: 'start', command: '/wf:start', status: '[ ]', nextStatus: '[ds]' },
    { step: 'build', command: '/wf:build', status: '[ds]', nextStatus: '[im]' },
    { step: 'audit', command: '/wf:audit', status: '[im]', nextStatus: '[im]' },
    { step: 'patch', command: '/wf:patch', status: '[im]', nextStatus: '[im]' },
    { step: 'done', command: '/wf:done', status: '[im]', nextStatus: '[xx]' }
  ]
};

/**
 * Target 단계 매핑 (--until 옵션용)
 */
export const TARGET_MAPPING = {
  'basic-design': { targetSteps: ['start'], targetStatus: '[bd]' },
  'detail-design': { targetSteps: ['start', 'draft'], targetStatus: '[dd]' },
  'review': { targetSteps: ['start', 'draft', 'review'], targetStatus: '[dd]' },
  'apply': { targetSteps: ['start', 'draft', 'review', 'apply'], targetStatus: '[dd]' },
  'build': { targetSteps: ['start', 'draft', 'review', 'apply', 'build', 'test'], targetStatus: '[im]' },
  'audit': { targetSteps: ['start', 'draft', 'review', 'apply', 'build', 'test', 'audit'], targetStatus: '[im]' },
  'patch': { targetSteps: ['start', 'draft', 'review', 'apply', 'build', 'test', 'audit', 'patch'], targetStatus: '[im]' },
  'verify': { targetSteps: ['start', 'draft', 'review', 'apply', 'build', 'test', 'audit', 'patch', 'verify'], targetStatus: '[ts]' },
  'done': { targetSteps: null, targetStatus: '[xx]' } // null = 전체 실행
};

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
