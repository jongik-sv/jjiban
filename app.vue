<script setup lang="ts">
/**
 * App Root Component
 * JJIBAN 메인 레이아웃
 * Light/Dark 테마 지원
 */
import { useTheme } from '~/composables/useTheme'

const { isDarkMode, toggleDarkMode, initTheme } = useTheme()

// 클라이언트 사이드에서 테마 초기화
onMounted(() => {
  initTheme()
})
</script>

<template>
  <div class="app-container min-h-screen flex flex-col">
    <!-- Header -->
    <header class="app-header">
      <div class="w-full px-6 py-4 flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center gap-2 app-logo font-bold text-xl">
          <span class="text-2xl">📋</span>
          <span>JJIBAN</span>
        </NuxtLink>
        <nav class="flex items-center gap-4">
          <NuxtLink
            to="/projects"
            class="app-nav-link px-3 py-2 rounded-lg transition-colors"
          >
            프로젝트
          </NuxtLink>

          <!-- Theme Toggle Button -->
          <Button
            :icon="isDarkMode ? 'pi pi-sun' : 'pi pi-moon'"
            rounded
            text
            :severity="isDarkMode ? 'secondary' : 'secondary'"
            aria-label="테마 전환"
            title="테마 전환"
            @click="toggleDarkMode"
          />
        </nav>
      </div>
    </header>

    <!-- Main Content -->
    <main class="w-full flex-1 page-container">
      <NuxtPage />
    </main>

    <!-- Footer -->
    <footer class="app-footer py-4">
      <div class="w-full px-6 text-center text-sm">
        JJIBAN - AI 기반 로컬 프로젝트 관리 도구
      </div>
    </footer>
  </div>
</template>

<style scoped>
.app-container {
  background-color: var(--surface-ground);
  color: var(--text-primary);
  transition: background-color 0.2s ease, color 0.2s ease;
}

.app-header {
  background-color: var(--surface-card);
  border-bottom: 1px solid var(--surface-border);
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.app-logo {
  color: var(--primary-500);
}

.app-logo:hover {
  color: var(--primary-600);
}

.app-nav-link {
  color: var(--text-secondary);
  font-weight: 500;
}

.app-nav-link:hover {
  color: var(--text-primary);
  background-color: var(--surface-hover);
}

.app-nav-link.router-link-active {
  color: var(--primary-500);
  background-color: var(--primary-50, rgba(124, 92, 252, 0.1));
}

:global(.dark-mode) .app-nav-link.router-link-active {
  background-color: rgba(139, 92, 246, 0.15);
}

.app-footer {
  background-color: var(--surface-card);
  border-top: 1px solid var(--surface-border);
  color: var(--text-secondary);
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.page-container {
  padding: var(--spacing-lg, 1.5rem);
}
</style>
