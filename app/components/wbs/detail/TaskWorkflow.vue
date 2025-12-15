<template>
  <Panel
    header="워크플로우 흐름"
    class="task-workflow-panel mt-4"
    data-testid="task-workflow-panel"
    :toggleable="true"
  >
    <div
      class="workflow-nodes flex items-center justify-start gap-2 overflow-x-auto pb-2"
      role="list"
      aria-label="워크플로우 단계"
      data-testid="workflow-nodes"
    >
      <template v-for="(step, index) in workflowSteps" :key="step.code">
        <!-- 워크플로우 노드 -->
        <div
          :class="getNodeClasses(index)"
          :style="getNodeStyle(index)"
          role="listitem"
          :aria-current="index === currentStepIndex ? 'step' : undefined"
          :data-testid="index === currentStepIndex ? 'workflow-node-current' : `workflow-node-${index}`"
        >
          <div class="font-semibold">{{ step.name }}</div>
          <div class="text-xs opacity-80">{{ step.code }}</div>
          <div class="text-xs opacity-70">{{ step.description }}</div>
        </div>

        <!-- 화살표 (마지막 노드 제외) -->
        <i
          v-if="index < workflowSteps.length - 1"
          class="pi pi-arrow-right text-gray-400"
          aria-hidden="true"
        />
      </template>
    </div>
  </Panel>
</template>

<script setup lang="ts">
/**
 * TaskWorkflow - 워크플로우 흐름도 컴포넌트
 * Task: TSK-05-02
 * 상세설계: 020-detail-design.md 섹션 9.2
 *
 * 책임:
 * - 카테고리별 워크플로우 단계 표시
 * - 현재 상태 강조 (파란 배경, 볼드, scale)
 * - 완료/현재/미완료 시각적 구분
 * - 읽기 전용 (상호작용 없음)
 */

import type { TaskDetail, WorkflowStep } from '~/types'
import { WORKFLOW_STEPS } from '~/types'
import { WORKFLOW_THEME } from '~/utils/themeConfig'

// ============================================================
// Props
// ============================================================
interface Props {
  task: TaskDetail
}

const props = defineProps<Props>()

// ============================================================
// Computed
// ============================================================

/**
 * 카테고리별 워크플로우 단계 계산
 * FR-001, BR-WF-01
 */
const workflowSteps = computed<WorkflowStep[]>(() => {
  return WORKFLOW_STEPS[props.task.category] || WORKFLOW_STEPS.development
})

/**
 * 현재 상태의 인덱스 계산
 * FR-002
 */
const currentStepIndex = computed(() => {
  return workflowSteps.value.findIndex(step => step.code === props.task.status)
})

// ============================================================
// Methods
// ============================================================

/**
 * 노드 클래스 계산
 */
function getNodeClasses(index: number): string[] {
  const baseClasses = [
    'flex',
    'flex-col',
    'items-center',
    'justify-center',
    'px-4',
    'py-3',
    'rounded-lg',
    'transition-all',
    'duration-200',
    'min-w-[120px]',
    'text-center'
  ]

  // 현재 상태는 볼드
  if (index === currentStepIndex.value) {
    baseClasses.push('font-bold')
  }

  return baseClasses
}

/**
 * 노드 스타일 계산 (상태별)
 * FR-003, M-02 (테마 상수 사용)
 */
function getNodeStyle(index: number): Record<string, string> {
  if (index < currentStepIndex.value) {
    // 완료 상태
    return { ...WORKFLOW_THEME.completed }
  } else if (index === currentStepIndex.value) {
    // 현재 상태
    return { ...WORKFLOW_THEME.current }
  } else {
    // 미완료 상태
    return { ...WORKFLOW_THEME.pending }
  }
}
</script>

<style scoped>
.workflow-nodes {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}

.workflow-nodes::-webkit-scrollbar {
  height: 6px;
}

.workflow-nodes::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.workflow-nodes::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.workflow-nodes::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
