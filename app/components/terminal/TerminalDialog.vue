<script setup lang="ts">
/**
 * TerminalDialog - 전역 Claude Code 터미널 다이얼로그
 * Task: TSK-04-01
 * 상세설계: 020-detail-design.md 섹션 2.3
 *
 * 책임:
 * - Claude Code 세션 목록 표시
 * - 선택된 세션의 출력 표시
 * - 명령어 입력 및 실행
 * - 세션 취소/삭제
 */
import { useClaudeCodeStore } from '~/stores/claudeCode'

// ============================================================
// Props & Emits
// ============================================================
interface Props {
  visible: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

// ============================================================
// Stores
// ============================================================
const claudeCodeStore = useClaudeCodeStore()

// ============================================================
// State
// ============================================================
const commandInput = ref('')
const outputRef = ref<HTMLElement | null>(null)

// ============================================================
// Computed
// ============================================================

/** 다이얼로그 표시 여부 */
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

/** 세션 목록 */
const sessions = computed(() => Object.values(claudeCodeStore.sessions))

/** 활성 세션 */
const activeSession = computed(() => claudeCodeStore.activeSession)

/** 실행 중 여부 */
const isRunning = computed(() => claudeCodeStore.isRunning)

/** 세션 개수 */
const sessionCount = computed(() => sessions.value.length)

// ============================================================
// Methods
// ============================================================

/** 세션 선택 */
function selectSession(sessionId: string) {
  claudeCodeStore.setActiveSession(sessionId)
}

/** 명령어 실행 */
async function executeCommand() {
  if (!commandInput.value.trim()) return

  try {
    await claudeCodeStore.execute(commandInput.value)
    commandInput.value = ''
  } catch (error) {
    console.error('[TerminalDialog] Execute error:', error)
  }
}

/** 실행 취소 */
async function cancelExecution() {
  if (!claudeCodeStore.activeSessionId) return

  try {
    await claudeCodeStore.cancel(claudeCodeStore.activeSessionId)
  } catch (error) {
    console.error('[TerminalDialog] Cancel error:', error)
  }
}

/** 세션 삭제 */
async function deleteSession(sessionId: string) {
  try {
    await claudeCodeStore.deleteSession(sessionId)
  } catch (error) {
    console.error('[TerminalDialog] Delete error:', error)
  }
}

/** 출력 클리어 */
function clearOutput() {
  if (!claudeCodeStore.activeSessionId) return
  claudeCodeStore.clearOutput(claudeCodeStore.activeSessionId)
}

/** 상태 라벨 */
function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    idle: '대기',
    running: '실행 중',
    completed: '완료',
    error: '오류',
    cancelled: '취소됨'
  }
  return labels[status] || status
}

/** 상태 심각도 */
function getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
  const severities: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast'> = {
    idle: 'secondary',
    running: 'info',
    completed: 'success',
    error: 'danger',
    cancelled: 'warn'
  }
  return severities[status] || 'secondary'
}

/** 출력 자동 스크롤 */
watch(() => activeSession.value?.output, () => {
  nextTick(() => {
    if (outputRef.value) {
      outputRef.value.scrollTop = outputRef.value.scrollHeight
    }
  })
})
</script>

<template>
  <Dialog
    v-model:visible="dialogVisible"
    modal
    maximizable
    header="Claude Code 터미널"
    :style="{ width: '80vw', height: '70vh' }"
    content-class="h-full"
    class="terminal-dialog"
  >
    <div class="terminal-content">
      <!-- 세션 목록 (왼쪽) -->
      <div class="terminal-sidebar">
        <div class="sidebar-header">
          <span class="sidebar-title">세션</span>
          <Badge v-if="sessionCount > 0" :value="sessionCount" severity="info" />
        </div>

        <div class="session-list">
          <div
            v-for="session in sessions"
            :key="session.sessionId"
            class="session-item"
            :class="{ 'session-item-active': session.sessionId === claudeCodeStore.activeSessionId }"
            @click="selectSession(session.sessionId)"
          >
            <div class="session-info">
              <span class="session-id">{{ session.sessionId.slice(0, 8) }}</span>
              <Tag :severity="getStatusSeverity(session.status)" :value="getStatusLabel(session.status)" />
            </div>
            <div class="session-command">{{ session.command.slice(0, 30) }}{{ session.command.length > 30 ? '...' : '' }}</div>
            <Button
              icon="pi pi-times"
              severity="danger"
              text
              rounded
              size="small"
              class="session-delete"
              @click.stop="deleteSession(session.sessionId)"
            />
          </div>

          <div v-if="sessions.length === 0" class="session-empty">
            세션이 없습니다
          </div>
        </div>
      </div>

      <!-- 출력 뷰 (오른쪽) -->
      <div class="terminal-main">
        <!-- 출력 영역 -->
        <div ref="outputRef" class="terminal-output">
          <pre v-if="activeSession">{{ activeSession.output || '(출력 대기 중...)' }}</pre>
          <div v-else class="terminal-placeholder">
            세션을 선택하거나 명령어를 입력하세요
          </div>
        </div>

        <!-- 입력 영역 -->
        <div class="terminal-input">
          <InputText
            v-model="commandInput"
            placeholder="Claude Code 명령어 입력..."
            class="terminal-input-field"
            :disabled="isRunning"
            @keydown.enter="executeCommand"
          />
          <div class="terminal-buttons">
            <Button
              v-if="!isRunning"
              label="실행"
              icon="pi pi-play"
              severity="success"
              :disabled="!commandInput.trim()"
              @click="executeCommand"
            />
            <Button
              v-if="isRunning"
              label="중지"
              icon="pi pi-stop"
              severity="danger"
              @click="cancelExecution"
            />
            <Button
              label="클리어"
              icon="pi pi-trash"
              severity="secondary"
              :disabled="!activeSession"
              @click="clearOutput"
            />
          </div>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<style scoped>
.terminal-content {
  display: flex;
  height: 100%;
  gap: 1rem;
}

.terminal-sidebar {
  width: 220px;
  flex-shrink: 0;
  @apply border-r border-border;
}

.sidebar-header {
  @apply flex items-center justify-between p-3 border-b border-border;
}

.sidebar-title {
  @apply font-semibold text-text;
}

.session-list {
  @apply p-2 space-y-2 overflow-y-auto;
  max-height: calc(100% - 50px);
}

.session-item {
  @apply p-2 rounded-lg cursor-pointer border border-transparent transition-colors relative;
  @apply hover:bg-surface-50;
}

.session-item-active {
  @apply bg-surface-50 border-primary;
}

.session-info {
  @apply flex items-center justify-between mb-1;
}

.session-id {
  @apply font-mono text-sm text-text-secondary;
}

.session-command {
  @apply text-xs text-text-muted truncate;
}

.session-delete {
  @apply absolute top-1 right-1 opacity-0 transition-opacity;
}

.session-item:hover .session-delete {
  @apply opacity-100;
}

.session-empty {
  @apply text-center text-text-muted py-4;
}

.terminal-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.terminal-output {
  flex: 1;
  overflow-y: auto;
  @apply bg-surface-50 rounded-lg p-4 font-mono text-sm;
  min-height: 300px;
}

.terminal-output pre {
  @apply whitespace-pre-wrap break-words m-0 text-text;
}

.terminal-placeholder {
  @apply text-text-muted text-center py-8;
}

.terminal-input {
  @apply flex gap-2 mt-3;
}

.terminal-input-field {
  flex: 1;
}

.terminal-buttons {
  @apply flex gap-2;
}
</style>
