<script setup lang="ts">
/**
 * AppLayout 컴포넌트
 * - 전체 애플리케이션의 기본 레이아웃 구조 정의
 * - Header + Content 영역 분리
 * - 좌우 패널 60:40 분할
 *
 * @see TSK-01-02-01
 * @see 020-detail-design.md
 */

interface Props {
  /** 좌측 패널 비율 (%) */
  leftWidth?: number
  /** 좌측 최소 너비 (px) */
  minLeftWidth?: number
  /** 우측 최소 너비 (px) */
  minRightWidth?: number
}

const props = withDefaults(defineProps<Props>(), {
  leftWidth: 60,
  minLeftWidth: 400,
  minRightWidth: 300
})

// Props 유효성 검증
const validatedLeftWidth = computed(() => {
  const value = props.leftWidth
  if (value < 30) return 30
  if (value > 80) return 80
  return value
})

// Computed right width
const rightWidth = computed(() => 100 - validatedLeftWidth.value)

// Emit 정의 (향후 리사이즈 기능용)
const emit = defineEmits<{
  resize: [payload: { leftWidth: number }]
}>()
</script>

<template>
  <div
    data-testid="app-layout"
    class="min-w-[1200px] h-screen flex flex-col bg-bg"
  >
    <!-- Header 영역 (56px 고정) -->
    <header
      data-testid="app-header-container"
      class="h-[56px] w-full flex-shrink-0 bg-bg-header border-b border-border"
      role="banner"
    >
      <slot name="header">
        <!-- 기본 헤더 (슬롯 미제공 시) -->
        <div class="h-full flex items-center px-4">
          <span class="text-text font-semibold">jjiban</span>
        </div>
      </slot>
    </header>

    <!-- Content 영역 (나머지 높이) -->
    <main
      data-testid="app-content"
      class="flex-1 flex overflow-hidden"
      role="main"
    >
      <!-- 좌측 패널 (WBS Tree 영역) -->
      <aside
        data-testid="left-panel"
        class="bg-bg-sidebar overflow-auto border-r border-border"
        :style="{
          width: `${validatedLeftWidth}%`,
          minWidth: `${props.minLeftWidth}px`
        }"
        role="complementary"
      >
        <slot name="left">
          <!-- 기본 좌측 패널 (슬롯 미제공 시) -->
          <div class="p-4 text-text-secondary">
            Left Panel (WBS Tree)
          </div>
        </slot>
      </aside>

      <!-- 우측 패널 (Detail 영역) -->
      <section
        data-testid="right-panel"
        class="bg-bg overflow-auto"
        :style="{
          width: `${rightWidth}%`,
          minWidth: `${props.minRightWidth}px`
        }"
        role="region"
        aria-label="Task Detail"
      >
        <slot name="right">
          <!-- 기본 우측 패널 (슬롯 미제공 시) -->
          <div class="p-4 text-text-secondary">
            Right Panel (Task Detail)
          </div>
        </slot>
      </section>
    </main>
  </div>
</template>
