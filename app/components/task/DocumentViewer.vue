<template>
  <div
    class="document-viewer"
    data-testid="document-viewer"
    :style="{ maxHeight: `${maxHeight}px` }"
  >
    <!-- 로딩 상태 -->
    <div v-if="loading" data-testid="document-skeleton">
      <Skeleton height="2rem" class="mb-3" />
      <Skeleton height="1rem" class="mb-2" />
      <Skeleton height="1rem" class="mb-2" />
      <Skeleton height="300px" class="mt-4" />
    </div>

    <!-- 에러 상태 -->
    <div
      v-else-if="error"
      class="error-container"
      data-testid="document-error"
      role="alert"
    >
      <div class="error-icon">
        <i class="pi pi-exclamation-triangle"></i>
      </div>
      <div class="error-content">
        <h3 class="error-title">문서를 불러올 수 없습니다</h3>
        <p class="error-message">{{ error.message }}</p>
        <p class="error-code">오류 코드: {{ error.code }}</p>
      </div>
      <Button
        v-if="error.isRecoverable"
        label="재시도"
        icon="pi pi-refresh"
        @click="reload"
        data-testid="retry-btn"
        class="mt-3"
        severity="secondary"
        size="small"
      />
    </div>

    <!-- 렌더링된 문서 -->
    <div
      v-else-if="content"
      class="markdown-body"
      data-testid="markdown-body"
      v-html="renderedHtml"
      :aria-busy="loading"
      aria-label="문서 내용"
    />

    <!-- 빈 상태 -->
    <div v-else class="empty-state">
      <p>표시할 문서가 없습니다</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDocumentLoader } from '~/composables/useDocumentLoader';
import { useMarkdownRenderer } from '~/composables/useMarkdownRenderer';

interface Props {
  taskId: string;
  filename: string;
  maxHeight?: number;
}

interface Emits {
  (e: 'loaded', content: string): void;
  (e: 'error', error: Error): void;
}

const props = withDefaults(defineProps<Props>(), {
  maxHeight: 600
});

const emit = defineEmits<Emits>();

// Document Loader
const { content, loading, error, reload } = useDocumentLoader(
  toRef(props, 'taskId'),
  toRef(props, 'filename')
);

// Markdown Renderer
const { useReactive } = useMarkdownRenderer({
  gfm: true,
  highlight: true,
  sanitize: true
});

const renderedHtml = useReactive(computed(() => content.value || ''));

// 이벤트 발행
watch(content, (newContent) => {
  if (newContent) {
    emit('loaded', newContent);
  }
});

watch(error, (newError) => {
  if (newError) {
    emit('error', new Error(newError.message));
  }
});
</script>

<style scoped>
.document-viewer {
  overflow-y: auto;
  overflow-x: hidden;
  padding: 1rem;
  background: var(--surface-ground);
  border-radius: 4px;
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
}

.error-icon {
  font-size: 3rem;
  color: var(--red-400);
  margin-bottom: 1rem;
}

.error-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 0.5rem;
}

.error-message {
  color: var(--text-color-secondary);
  margin-bottom: 0.25rem;
}

.error-code {
  font-size: 0.875rem;
  color: var(--text-color-secondary);
  font-family: monospace;
}

.empty-state {
  padding: 2rem;
  text-align: center;
  color: var(--text-color-secondary);
}

/* 스크롤바 스타일 */
.document-viewer::-webkit-scrollbar {
  width: 8px;
}

.document-viewer::-webkit-scrollbar-track {
  background: var(--surface-border);
  border-radius: 4px;
}

.document-viewer::-webkit-scrollbar-thumb {
  background: var(--surface-400);
  border-radius: 4px;
}

.document-viewer::-webkit-scrollbar-thumb:hover {
  background: var(--surface-500);
}
</style>
