<script setup lang="ts">
import { useClaudeCodeStore } from '~/stores/claudeCode'

interface Props {
  sessionId?: string
}

const props = defineProps<Props>()
const store = useClaudeCodeStore()
const outputRef = ref<HTMLPreElement | null>(null)

// 현재 세션 (props 또는 activeSession)
const currentSession = computed(() => {
  if (props.sessionId) {
    return store.sessions[props.sessionId]
  }
  return store.activeSession
})

// 상태 라벨
const statusLabel = computed(() => {
  const status = currentSession.value?.status
  switch (status) {
    case 'running': return '실행 중...'
    case 'completed': return '완료'
    case 'error': return '오류'
    case 'cancelled': return '취소됨'
    default: return '대기'
  }
})

// 상태 아이콘
const statusIcon = computed(() => {
  const status = currentSession.value?.status
  switch (status) {
    case 'running': return 'pi pi-spin pi-spinner'
    case 'completed': return 'pi pi-check-circle'
    case 'error': return 'pi pi-times-circle'
    case 'cancelled': return 'pi pi-ban'
    default: return 'pi pi-clock'
  }
})

// 상태 색상 클래스
const statusClass = computed(() => {
  const status = currentSession.value?.status
  switch (status) {
    case 'running': return 'text-blue-500'
    case 'completed': return 'text-green-500'
    case 'error': return 'text-red-500'
    case 'cancelled': return 'text-yellow-500'
    default: return 'text-gray-500'
  }
})

// 실행 중 여부
const isRunning = computed(() => currentSession.value?.status === 'running')

// 출력 변경 시 자동 스크롤
watch(() => currentSession.value?.output, () => {
  nextTick(() => {
    if (outputRef.value) {
      outputRef.value.scrollTop = outputRef.value.scrollHeight
    }
  })
})

// 취소 핸들러
async function handleCancel() {
  const sessionId = props.sessionId ?? store.activeSessionId
  if (sessionId) {
    await store.cancel(sessionId)
  }
}

// 출력 초기화
function handleClear() {
  const sessionId = props.sessionId ?? store.activeSessionId
  if (sessionId) {
    store.clearOutput(sessionId)
  }
}

// 출력 복사
async function handleCopy() {
  const output = currentSession.value?.output
  if (output) {
    await navigator.clipboard.writeText(output)
  }
}
</script>

<template>
  <div class="output-view">
    <!-- 헤더 -->
    <div class="output-header">
      <div class="output-status">
        <i :class="[statusIcon, statusClass]" />
        <span class="output-status-label">{{ statusLabel }}</span>
        <span v-if="currentSession?.command" class="output-command">
          {{ currentSession.command.slice(0, 50) }}{{ currentSession.command.length > 50 ? '...' : '' }}
        </span>
      </div>
      <div class="output-actions">
        <Button
          v-if="isRunning"
          icon="pi pi-stop"
          severity="danger"
          size="small"
          text
          rounded
          title="중단"
          @click="handleCancel"
        />
        <Button
          icon="pi pi-copy"
          severity="secondary"
          size="small"
          text
          rounded
          title="복사"
          :disabled="!currentSession?.output"
          @click="handleCopy"
        />
        <Button
          icon="pi pi-trash"
          severity="secondary"
          size="small"
          text
          rounded
          title="지우기"
          :disabled="!currentSession?.output"
          @click="handleClear"
        />
      </div>
    </div>

    <!-- 출력 영역 -->
    <pre
      ref="outputRef"
      class="output-content"
      :class="{ 'output-empty': !currentSession?.output }"
    >{{ currentSession?.output || '실행 결과가 여기에 표시됩니다.' }}</pre>

    <!-- 종료 코드 -->
    <div v-if="currentSession?.exitCode !== null" class="output-footer">
      <span :class="currentSession.exitCode === 0 ? 'text-green-500' : 'text-red-500'">
        Exit code: {{ currentSession.exitCode }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.output-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 200px;
  background-color: var(--p-surface-900);
  border-radius: 0.5rem;
  overflow: hidden;
}

.output-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: var(--p-surface-800);
  border-bottom: 1px solid var(--p-surface-700);
}

.output-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.output-status-label {
  font-weight: 500;
}

.output-command {
  color: var(--p-text-muted-color);
  font-family: monospace;
  font-size: 0.75rem;
}

.output-actions {
  display: flex;
  gap: 0.25rem;
}

.output-content {
  flex: 1;
  margin: 0;
  padding: 1rem;
  overflow: auto;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
  color: var(--p-text-color);
  background-color: var(--p-surface-900);
}

.output-empty {
  color: var(--p-text-muted-color);
  font-style: italic;
}

.output-footer {
  padding: 0.5rem 1rem;
  background-color: var(--p-surface-800);
  border-top: 1px solid var(--p-surface-700);
  font-size: 0.75rem;
  font-family: monospace;
}
</style>
