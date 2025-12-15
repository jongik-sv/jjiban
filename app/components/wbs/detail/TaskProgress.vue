<template>
  <Panel header="진행 상태" data-testid="task-progress-panel" class="task-progress">
    <div class="space-y-4">
      <!-- 현재 상태 Badge -->
      <div class="field">
        <label class="font-semibold text-sm text-gray-600">현재 상태</label>
        <div class="mt-1">
          <Badge
            :value="statusLabel"
            :severity="statusSeverity"
            data-testid="task-status-badge"
            class="text-sm"
          />
        </div>
      </div>

      <!-- 워크플로우 단계 인디케이터 -->
      <div class="field">
        <label class="font-semibold text-sm text-gray-600">워크플로우 진행</label>
        <div class="mt-2" data-testid="workflow-steps-container">
          <div class="flex items-center justify-between">
            <div
              v-for="(step, index) in workflowSteps"
              :key="step.code"
              class="flex items-center"
              :data-testid="`workflow-step-${index}`"
            >
              <!-- 단계 원형 -->
              <div
                class="workflow-step-circle"
                :class="{
                  'workflow-step-current': index === currentStepIndex,
                  'workflow-step-completed': index < currentStepIndex,
                  'workflow-step-pending': index > currentStepIndex,
                }"
                :data-testid="index === currentStepIndex ? 'workflow-step-current' : undefined"
              >
                <i
                  v-if="index < currentStepIndex"
                  class="pi pi-check text-white"
                />
                <i
                  v-else-if="index === currentStepIndex"
                  class="pi pi-circle-fill text-white"
                />
                <i
                  v-else
                  class="pi pi-circle text-gray-400"
                />
              </div>

              <!-- 연결선 (마지막 단계 제외) -->
              <div
                v-if="index < workflowSteps.length - 1"
                class="workflow-connector"
                :class="{
                  'workflow-connector-completed': index < currentStepIndex,
                  'workflow-connector-pending': index >= currentStepIndex,
                }"
              />
            </div>
          </div>

          <!-- 단계 라벨 -->
          <div class="flex items-center justify-between mt-2">
            <div
              v-for="(step, index) in workflowSteps"
              :key="`label-${step.code}`"
              class="text-xs text-center"
              :class="{
                'font-semibold text-blue-600': index === currentStepIndex,
                'text-gray-600': index !== currentStepIndex,
              }"
            >
              {{ step.label }}
            </div>
          </div>
        </div>
      </div>

      <!-- 진행률 -->
      <div class="field">
        <label class="font-semibold text-sm text-gray-600">진행률</label>
        <div class="mt-1">
          <ProgressBar :value="progressPercentage" :show-value="true" />
        </div>
      </div>
    </div>
  </Panel>
</template>

<script setup lang="ts">
/**
 * TaskProgress - Task 진행 상태 및 워크플로우 시각화
 * Task: TSK-05-01
 * 상세설계: 020-detail-design.md 섹션 9.3
 *
 * 책임:
 * - 현재 상태 Badge 렌더링
 * - 카테고리별 워크플로우 단계 계산
 * - 워크플로우 단계 인디케이터 렌더링
 * - 현재 단계 강조 표시
 */

import type { TaskDetail, TaskCategory, TaskStatus } from '~/types'

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
 * 상태 라벨
 */
const statusLabel = computed(() => {
  const labels: Record<string, string> = {
    '[ ]': '시작 전',
    '[bd]': '기본설계',
    '[dd]': '상세설계',
    '[an]': '분석',
    '[ds]': '설계',
    '[im]': '구현',
    '[fx]': '수정',
    '[vf]': '검증',
    '[xx]': '완료',
  }
  return labels[props.task.status] || props.task.status
})

/**
 * 상태 심각도 (PrimeVue Badge severity)
 */
const statusSeverity = computed(() => {
  const severities: Record<string, 'info' | 'success' | 'warning' | 'danger'> = {
    '[ ]': 'info',
    '[bd]': 'warning',
    '[dd]': 'warning',
    '[an]': 'warning',
    '[ds]': 'warning',
    '[im]': 'info',
    '[fx]': 'danger',
    '[vf]': 'warning',
    '[xx]': 'success',
  }
  return severities[props.task.status] || 'info'
})

/**
 * 워크플로우 단계 계산 (카테고리별)
 * 정적 정의 (MIN-003: 성능 및 단순성 우선)
 */
const workflowSteps = computed(() => {
  interface WorkflowStep {
    code: string
    label: string
  }

  const workflows: Record<TaskCategory, WorkflowStep[]> = {
    development: [
      { code: '[ ]', label: '시작 전' },
      { code: '[bd]', label: '기본설계' },
      { code: '[dd]', label: '상세설계' },
      { code: '[im]', label: '구현' },
      { code: '[vf]', label: '검증' },
      { code: '[xx]', label: '완료' },
    ],
    defect: [
      { code: '[ ]', label: '시작 전' },
      { code: '[an]', label: '분석' },
      { code: '[fx]', label: '수정' },
      { code: '[vf]', label: '검증' },
      { code: '[xx]', label: '완료' },
    ],
    infrastructure: [
      { code: '[ ]', label: '시작 전' },
      { code: '[ds]', label: '설계' },
      { code: '[im]', label: '구현' },
      { code: '[xx]', label: '완료' },
    ],
  }

  return workflows[props.task.category] || workflows.development
})

/**
 * 현재 단계 인덱스
 */
const currentStepIndex = computed(() => {
  const index = workflowSteps.value.findIndex(step => step.code === props.task.status)
  return index !== -1 ? index : 0
})

/**
 * 진행률 퍼센트
 */
const progressPercentage = computed(() => {
  const total = workflowSteps.value.length - 1 // 시작 전 제외
  if (total === 0) return 0
  return Math.round((currentStepIndex.value / total) * 100)
})
</script>

<style scoped>
.task-progress .field {
  margin-bottom: 1rem;
}

.task-progress .field:last-child {
  margin-bottom: 0;
}

/* 워크플로우 단계 원형 */
.workflow-step-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease-in-out;
}

.workflow-step-current {
  background-color: #3b82f6; /* blue-500 */
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
}

.workflow-step-completed {
  background-color: #22c55e; /* green-500 */
}

.workflow-step-pending {
  background-color: #e5e7eb; /* gray-200 */
  border: 2px solid #d1d5db; /* gray-300 */
}

/* 워크플로우 연결선 */
.workflow-connector {
  width: 60px;
  height: 2px;
  transition: background-color 0.5s ease-in-out;
}

.workflow-connector-completed {
  background-color: #22c55e; /* green-500 */
}

.workflow-connector-pending {
  background-color: #d1d5db; /* gray-300 */
}
</style>
