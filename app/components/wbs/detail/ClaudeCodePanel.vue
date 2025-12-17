<script setup lang="ts">
/**
 * ClaudeCodePanel - Claude Code CLI 실행 패널
 * 터미널 에뮬레이터 대신 단순 텍스트 출력으로 CLI 실행 결과 표시
 */
import { useClaudeCodeStore } from '~/stores/claudeCode'

interface Props {
  taskId: string
  projectId?: string | null
}

const props = defineProps<Props>()
const store = useClaudeCodeStore()
const toast = useToast()

// 상태
const commandInput = ref('')
const isExpanded = ref(false)

// 현재 실행 중인지
const isRunning = computed(() => store.isRunning)

// 실행 핸들러
async function handleExecute() {
  if (!commandInput.value.trim()) {
    toast.add({
      severity: 'warn',
      summary: '명령어 필요',
      detail: '실행할 명령어를 입력해주세요.',
      life: 2000
    })
    return
  }

  try {
    isExpanded.value = true
    await store.execute(commandInput.value, process.cwd())
    commandInput.value = ''
  } catch (e) {
    toast.add({
      severity: 'error',
      summary: '실행 실패',
      detail: e instanceof Error ? e.message : '명령어 실행에 실패했습니다.',
      life: 3000
    })
  }
}

// 취소 핸들러
async function handleCancel() {
  if (store.activeSessionId) {
    await store.cancel(store.activeSessionId)
  }
}

// 패널 토글
function toggleExpanded() {
  isExpanded.value = !isExpanded.value
}
</script>

<template>
  <Panel
    :collapsed="!isExpanded"
    class="claude-code-panel"
    data-testid="claude-code-panel"
  >
    <template #header>
      <div class="panel-header">
        <i class="pi pi-code" />
        <span>Claude Code 실행</span>
        <Tag
          v-if="isRunning"
          severity="info"
          value="실행 중"
          class="ml-2"
        />
      </div>
    </template>

    <template #icons>
      <Button
        icon="pi pi-chevron-down"
        text
        rounded
        size="small"
        :class="{ 'rotate-180': isExpanded }"
        @click="toggleExpanded"
      />
    </template>

    <div class="panel-content">
      <!-- 명령어 입력 -->
      <div class="command-input-row">
        <InputText
          v-model="commandInput"
          placeholder="Claude Code 명령어를 입력하세요... (예: 이 코드를 분석해줘)"
          class="command-input"
          :disabled="isRunning"
          @keyup.enter="handleExecute"
        />
        <Button
          v-if="!isRunning"
          icon="pi pi-play"
          label="실행"
          severity="primary"
          :disabled="!commandInput.trim()"
          @click="handleExecute"
        />
        <Button
          v-else
          icon="pi pi-stop"
          label="중단"
          severity="danger"
          @click="handleCancel"
        />
      </div>

      <!-- 출력 뷰 -->
      <div v-if="store.activeSession" class="output-wrapper">
        <ClaudeCodeOutputView />
      </div>
    </div>
  </Panel>
</template>

<style scoped>
.claude-code-panel {
  margin-top: 1rem;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}

.panel-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.command-input-row {
  display: flex;
  gap: 0.5rem;
}

.command-input {
  flex: 1;
}

.output-wrapper {
  height: 300px;
  min-height: 200px;
  max-height: 500px;
  resize: vertical;
  overflow: hidden;
}

.rotate-180 {
  transform: rotate(180deg);
}
</style>
