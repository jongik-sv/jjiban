<script setup lang="ts">
/**
 * TerminalHeaderIcon 컴포넌트 - 헤더 터미널 아이콘
 *
 * @stub TSK-01-02 터미널 UI 시스템 미구현으로 인한 임시 스텁
 * @todo stores/terminal.ts, composables/useTerminal.ts 구현 후 전체 기능 활성화
 */
import { useToast } from 'primevue/usetoast'

const toast = useToast()

function handleClick(): void {
  toast.add({
    severity: 'info',
    summary: '알림',
    detail: '터미널 기능은 준비 중입니다',
    life: 3000
  })
}
</script>

<template>
  <div class="terminal-header-icon">
    <Button
      class="p-button-text p-button-rounded"
      aria-label="터미널 열기 (준비 중)"
      @click="handleClick"
    >
      <i class="pi pi-desktop text-lg" />
    </Button>
  </div>
</template>

<style scoped>
.terminal-header-icon {
  position: relative;
}
</style>
