<script setup lang="ts">
/**
 * TerminalHeaderIcon - 헤더 터미널 아이콘
 * Task: TSK-04-01
 * 상세설계: 020-detail-design.md 섹션 2.2
 *
 * 책임:
 * - 터미널 아이콘 렌더링
 * - 세션 개수 배지 표시
 * - TerminalDialog 트리거
 */
import { useClaudeCodeStore } from '~/stores/claudeCode'

// ============================================================
// Stores
// ============================================================
const claudeCodeStore = useClaudeCodeStore()

// ============================================================
// State
// ============================================================
const dialogVisible = ref(false)

// ============================================================
// Computed
// ============================================================

/** 세션 개수 */
const sessionCount = computed(() => Object.keys(claudeCodeStore.sessions).length)

/** 실행 중인 세션 있음 */
const hasRunningSession = computed(() => claudeCodeStore.isRunning)

// ============================================================
// Methods
// ============================================================

/** 다이얼로그 열기 */
function handleClick(): void {
  dialogVisible.value = true
}
</script>

<template>
  <div class="terminal-header-icon">
    <Button
      class="p-button-text p-button-rounded terminal-icon-btn"
      :class="{ 'terminal-icon-running': hasRunningSession }"
      aria-label="터미널 열기"
      @click="handleClick"
    >
      <i class="pi pi-desktop text-lg" />
      <Badge
        v-if="sessionCount > 0"
        :value="sessionCount"
        :severity="hasRunningSession ? 'info' : 'secondary'"
        class="terminal-badge"
      />
    </Button>

    <!-- 전역 터미널 다이얼로그 -->
    <TerminalDialog v-model:visible="dialogVisible" />
  </div>
</template>

<style scoped>
.terminal-header-icon {
  position: relative;
}

.terminal-icon-btn {
  position: relative;
}

.terminal-icon-running {
  @apply text-sky-500;
}

.terminal-icon-running i {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.terminal-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  font-size: 0.65rem;
  min-width: 1rem;
  height: 1rem;
  line-height: 1rem;
}
</style>
