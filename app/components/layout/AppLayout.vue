<script setup lang="ts">
/**
 * AppLayout 컴포넌트
 * - PrimeVue Splitter 기반 레이아웃
 * - 드래그 리사이즈 기능 지원
 * - Header + 좌우 분할 Content
 *
 * @see TSK-08-03
 * @see 020-detail-design.md
 *
 * [M-01] minSize 동적 계산:
 * 현재 containerWidth=1200 고정값 사용.
 * 향후 반응형 확장 시 useWindowSize() composable 활용 가능.
 * min-width: 1200px 제약으로 현재는 문제없음.
 */

import Splitter from 'primevue/splitter'
import SplitterPanel from 'primevue/splitterpanel'

// ==================== 인터페이스 정의 ====================

interface Props {
  /** 좌측 패널 초기 비율 (%) */
  leftWidth?: number
  /** 좌측 패널 최소 너비 (px) */
  minLeftWidth?: number
  /** 우측 패널 최소 너비 (px) */
  minRightWidth?: number
}

interface SplitterResizeEvent {
  originalEvent: Event
  sizes: number[]
}

interface ResizePayload {
  leftWidth: number
}

interface SplitterPassThroughOptions {
  root?: { class?: string }
  gutter?: { class?: string }
  gutterHandle?: { class?: string }
}

// ==================== Props & Emit ====================

const props = withDefaults(defineProps<Props>(), {
  leftWidth: 60,
  minLeftWidth: 400,
  minRightWidth: 300
})

const emit = defineEmits<{
  resize: [payload: ResizePayload]
}>()

// ==================== Computed ====================

/**
 * leftWidth Props 유효성 검증 (30% ~ 80%)
 */
const validatedLeftWidth = computed(() => {
  const value = props.leftWidth
  if (value < 30) return 30
  if (value > 80) return 80
  return value
})

/**
 * 우측 패널 너비 계산
 */
const rightWidth = computed(() => 100 - validatedLeftWidth.value)

/**
 * 좌측 패널 최소 크기 (%) - px → % 변환
 * [M-01] containerWidth=1200 (min-width 기준) 고정값 사용
 */
const minLeftSizePercent = computed(() => {
  const containerWidth = 1200
  return (props.minLeftWidth / containerWidth) * 100
})

/**
 * 우측 패널 최소 크기 (%) - px → % 변환
 * [M-01] containerWidth=1200 (min-width 기준) 고정값 사용
 */
const minRightSizePercent = computed(() => {
  const containerWidth = 1200
  return (props.minRightWidth / containerWidth) * 100
})

/**
 * PrimeVue Splitter Pass Through API
 * CSS 클래스 중앙화 (main.css)
 * [M-03] CSS 변수: main.css :root에 정의
 */
const splitterPassThrough = computed((): SplitterPassThroughOptions => ({
  root: {
    class: 'app-layout-splitter'
  },
  gutter: {
    class: 'app-layout-gutter'
  },
  gutterHandle: {
    class: 'app-layout-gutter-handle'
  }
}))

// ==================== Methods ====================

/**
 * Splitter resize 이벤트 핸들러
 * @param event SplitterResizeEvent
 */
const handleResize = (event: SplitterResizeEvent): void => {
  const leftSize = event.sizes[0] ?? 60
  const rightSize = event.sizes[1] ?? 40

  if (import.meta.dev) {
    console.log('[AppLayout] Resize:', {
      leftSize: `${leftSize.toFixed(2)}%`,
      rightSize: `${rightSize.toFixed(2)}%`
    })
  }

  emit('resize', { leftWidth: leftSize })
}

// ==================== Development Mode Validation ====================

if (import.meta.dev) {
  const totalMinPercent = minLeftSizePercent.value + minRightSizePercent.value
  if (totalMinPercent > 100) {
    console.warn(
      `[AppLayout] minSize 합계가 100%를 초과합니다 (${totalMinPercent.toFixed(2)}%). ` +
      `minLeftWidth 또는 minRightWidth를 조정하세요.`
    )
  }
}
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

    <!-- Content 영역 (Splitter 기반) -->
    <main
      data-testid="app-content"
      class="flex-1 overflow-hidden"
      role="main"
    >
      <Splitter
        layout="horizontal"
        :pt="splitterPassThrough"
        @resize="handleResize"
      >
        <!-- 좌측 패널 (WBS Tree 영역) -->
        <SplitterPanel
          :size="validatedLeftWidth"
          :min-size="minLeftSizePercent"
        >
          <aside
            data-testid="left-panel"
            class="h-full bg-bg-sidebar overflow-auto border-r border-border"
            role="complementary"
            aria-label="WBS Tree Panel"
          >
            <slot name="left">
              <!-- 기본 좌측 패널 (슬롯 미제공 시) -->
              <div class="p-4 text-text-secondary">
                Left Panel (WBS Tree)
              </div>
            </slot>
          </aside>
        </SplitterPanel>

        <!-- 우측 패널 (Detail 영역) -->
        <SplitterPanel
          :size="rightWidth"
          :min-size="minRightSizePercent"
        >
          <section
            data-testid="right-panel"
            class="h-full bg-bg overflow-auto"
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
        </SplitterPanel>
      </Splitter>
    </main>
  </div>
</template>
