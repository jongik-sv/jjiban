<script setup lang="ts">
/**
 * AppHeader 컴포넌트
 * - jjiban 로고, 네비게이션 메뉴, 프로젝트명 표시
 * - 1차에서는 WBS 메뉴만 활성화
 * - 비활성 메뉴 클릭 시 "준비 중" Toast 표시
 *
 * @see TSK-01-02-02
 * @see 020-detail-design.md
 */

import { useToast } from 'primevue/usetoast'

// ============================================================
// Types
// ============================================================
interface MenuItem {
  id: string
  label: string
  icon: string
  route: string
  enabled: boolean
}

// ============================================================
// Props
// ============================================================
interface Props {
  /** 현재 프로젝트명 */
  projectName?: string
}

const props = withDefaults(defineProps<Props>(), {
  projectName: ''
})

// ============================================================
// Emits
// ============================================================
const emit = defineEmits<{
  navigate: [payload: { route: string }]
}>()

// ============================================================
// Composables
// ============================================================
const router = useRouter()
const route = useRoute()
const toast = useToast()
const projectStore = useProjectStore()

// ============================================================
// Data
// ============================================================
const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: '대시보드',
    icon: 'pi pi-home',
    route: '/dashboard',
    enabled: false
  },
  {
    id: 'kanban',
    label: '칸반',
    icon: 'pi pi-th-large',
    route: '/kanban',
    enabled: false
  },
  {
    id: 'wbs',
    label: 'WBS',
    icon: 'pi pi-sitemap',
    route: '/wbs',
    enabled: true
  },
  {
    id: 'gantt',
    label: 'Gantt',
    icon: 'pi pi-chart-line',
    route: '/gantt',
    enabled: false
  }
]

// ============================================================
// Computed
// ============================================================
/** 표시할 프로젝트명 */
const displayProjectName = computed(() => {
  return props.projectName || projectStore.projectName || ''
})

/** 프로젝트 선택 여부 */
const hasProject = computed(() => {
  return !!displayProjectName.value
})

/**
 * 현재 페이지 확인
 */
const isCurrentRoute = (itemRoute: string): boolean => {
  return route.path === itemRoute
}

// ============================================================
// Methods
// ============================================================
/**
 * 메뉴 클릭 핸들러
 * BR-001: WBS 메뉴만 활성화
 * BR-002: 비활성 메뉴 클릭 시 "준비 중" 안내
 */
function handleMenuClick(item: MenuItem) {
  if (item.enabled) {
    router.push(item.route)
    emit('navigate', { route: item.route })
  } else {
    toast.add({
      severity: 'warn',
      summary: '알림',
      detail: '준비 중입니다',
      life: 3000
    })
  }
}

/**
 * 메뉴 아이템의 스타일 클래스
 * BR-003: 현재 페이지 메뉴 Primary 색상 강조
 */
function getMenuClasses(item: MenuItem): string[] {
  const classes: string[] = [
    'px-4',
    'py-2',
    'rounded',
    'text-sm',
    'font-medium',
    'transition-colors',
    'duration-200'
  ]

  if (!item.enabled) {
    // 비활성 메뉴
    classes.push(
      'text-text-muted',
      'opacity-50',
      'cursor-not-allowed'
    )
  } else if (isCurrentRoute(item.route)) {
    // 활성 메뉴 + 현재 페이지
    classes.push(
      'text-primary',
      'bg-primary/20'
    )
  } else {
    // 활성 메뉴 + 다른 페이지
    classes.push(
      'text-text-secondary',
      'hover:text-text',
      'hover:bg-surface-50',
      'cursor-pointer'
    )
  }

  return classes
}
</script>

<template>
  <header
    data-testid="app-header"
    class="h-full w-full flex items-center justify-between px-4 bg-bg-header"
    role="banner"
  >
    <!-- 좌측: 로고 -->
    <div class="flex items-center">
      <NuxtLink
        to="/wbs"
        data-testid="app-logo"
        class="text-xl font-bold text-primary hover:opacity-80 transition-opacity"
        aria-label="홈으로 이동"
      >
        jjiban
      </NuxtLink>
    </div>

    <!-- 중앙: 네비게이션 메뉴 -->
    <nav
      data-testid="nav-menu"
      class="flex items-center gap-2"
      role="navigation"
      aria-label="메인 네비게이션"
    >
      <button
        v-for="item in menuItems"
        :key="item.id"
        type="button"
        :data-testid="`nav-menu-${item.id}`"
        :data-enabled="item.enabled"
        :class="getMenuClasses(item)"
        :aria-current="isCurrentRoute(item.route) && item.enabled ? 'page' : undefined"
        :aria-disabled="!item.enabled ? 'true' : undefined"
        :aria-label="!item.enabled ? `${item.label} (준비 중)` : item.label"
        @click="handleMenuClick(item)"
      >
        {{ item.label }}
      </button>
    </nav>

    <!-- 우측: 프로젝트명 -->
    <div class="flex items-center">
      <span
        data-testid="project-name"
        :class="[
          'text-sm max-w-[200px] truncate',
          hasProject ? 'text-text-secondary' : 'text-text-muted italic'
        ]"
      >
        {{ hasProject ? displayProjectName : '프로젝트를 선택하세요' }}
      </span>
    </div>
  </header>
</template>
