<template>
  <Panel
    header="이력"
    class="task-history-panel mt-4"
    data-testid="task-history-panel"
    :toggleable="true"
  >
    <!-- 타임라인 -->
    <Timeline
      :value="sortedHistory"
      align="left"
      class="history-timeline"
      data-testid="history-timeline"
    >
      <template #marker="slotProps">
        <div
          :class="['flex items-center justify-center w-8 h-8 rounded-full', getEntryMarkerClass(slotProps.item)]"
        >
          <i :class="getEntryIcon(slotProps.item)" class="text-white text-sm" />
        </div>
      </template>

      <template #content="slotProps">
        <div
          class="ml-4"
          :data-testid="`history-entry-${slotProps.index}`"
          :aria-label="`이력: ${getEntryTitle(slotProps.item)} ${formatTimestamp(slotProps.item.timestamp)}`"
        >
          <!-- 타임스탬프 -->
          <div
            class="text-xs text-text-muted mb-1"
            :data-testid="`history-timestamp-${slotProps.index}`"
          >
            {{ formatTimestamp(slotProps.item.timestamp) }}
          </div>

          <!-- 액션 제목 -->
          <div class="font-semibold text-text mb-1">
            {{ getEntryTitle(slotProps.item) }}
          </div>

          <!-- 상태 전이 정보 -->
          <div
            v-if="slotProps.item.action === 'transition'"
            class="text-sm text-text"
            :data-testid="`history-transition-${slotProps.index}`"
          >
            <span class="history-status-badge history-status-from">
              {{ slotProps.item.previousStatus || slotProps.item.from }}
            </span>
            <i class="pi pi-arrow-right mx-2 text-xs" />
            <span class="history-status-badge history-status-to">
              {{ slotProps.item.newStatus || slotProps.item.to }}
            </span>
          </div>

          <!-- 명령어 -->
          <div v-if="slotProps.item.command" class="text-sm text-text-secondary mt-1">
            <i class="pi pi-code mr-1" />
            명령어: <span class="font-mono">{{ slotProps.item.command }}</span>
          </div>

          <!-- 문서 생성 -->
          <div v-if="slotProps.item.documentCreated" class="text-sm text-success mt-1">
            <i class="pi pi-file-plus mr-1" />
            문서 생성: {{ slotProps.item.documentCreated }}
          </div>

          <!-- 코멘트 -->
          <div v-if="slotProps.item.comment" class="text-sm text-text-secondary mt-1 italic">
            {{ slotProps.item.comment }}
          </div>

          <!-- 사용자 -->
          <div v-if="slotProps.item.userId || slotProps.item.user" class="text-xs text-text-muted mt-1">
            사용자: {{ slotProps.item.userId || slotProps.item.user }}
          </div>
        </div>
      </template>
    </Timeline>

    <!-- 빈 상태 -->
    <Message v-if="history.length === 0" severity="info">
      아직 이력이 없습니다
    </Message>
  </Panel>
</template>

<script setup lang="ts">
/**
 * TaskHistory - 이력 타임라인 컴포넌트
 * Task: TSK-05-02
 * 상세설계: 020-detail-design.md 섹션 9.5
 *
 * 책임:
 * - 이력 엔트리 타임스탬프 역순 정렬
 * - PrimeVue Timeline 렌더링
 * - 상태 전이 정보 표시
 * - 문서 생성 정보 표시
 * - 읽기 전용
 */

import type { HistoryEntry } from '~/types'

// ============================================================
// Props
// ============================================================
interface Props {
  history: HistoryEntry[]
}

const props = defineProps<Props>()

// ============================================================
// Computed
// ============================================================

/**
 * 이력 정렬 (타임스탬프 역순)
 * FR-011, BR-HIST-01
 */
const sortedHistory = computed(() => {
  return [...props.history].sort((a, b) => {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  })
})

// ============================================================
// Methods
// ============================================================

/**
 * 이력 엔트리 마커 CSS 클래스 계산 (TSK-08-05: CSS 클래스 중앙화)
 */
function getEntryMarkerClass(entry: HistoryEntry): string {
  switch (entry.action) {
    case 'transition':
      return 'history-badge-transition'
    case 'action':
      return 'history-badge-action'
    case 'update':
      return 'history-badge-update'
    default:
      return 'history-badge-default'
  }
}

/**
 * 이력 엔트리 아이콘 가져오기 (TSK-08-05: CSS 클래스 중앙화)
 * FR-012
 */
function getEntryIcon(entry: HistoryEntry): string {
  switch (entry.action) {
    case 'transition':
      return 'pi pi-arrow-right'
    case 'action':
      return 'pi pi-bolt'
    case 'update':
      return 'pi pi-pencil'
    default:
      return 'pi pi-circle'
  }
}

/**
 * 이력 엔트리 제목 가져오기
 * FR-012
 */
function getEntryTitle(entry: HistoryEntry): string {
  switch (entry.action) {
    case 'transition':
      return '상태 전이'
    case 'update':
      return '정보 수정'
    case 'action':
      return '액션 실행'
    default:
      return entry.action || '기타'
  }
}

/**
 * 타임스탬프 포맷팅
 */
function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.history-timeline :deep(.p-timeline-event-content) {
  padding-bottom: 1.5rem;
}

.history-timeline :deep(.p-timeline-event-opposite) {
  display: none;
}
</style>
