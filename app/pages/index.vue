<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-8">
    <!-- 로고 및 타이틀 -->
    <div class="text-center mb-12">
      <h1 class="text-5xl font-bold text-text mb-4">
        <span class="text-primary">JJI</span>BAN
      </h1>
      <p class="text-text-secondary text-lg">AI 기반 프로젝트 관리 도구</p>
    </div>

    <!-- PrimeVue 컴포넌트 테스트 카드 -->
    <div class="card card-hover max-w-2xl w-full">
      <h2 class="text-xl font-semibold text-text mb-4">UI 설정 완료</h2>

      <!-- 테마 색상 테스트 -->
      <div class="mb-6">
        <h3 class="text-sm font-medium text-text-secondary mb-3">Dark Blue 테마 색상</h3>
        <div class="flex gap-2 flex-wrap">
          <div class="w-12 h-12 rounded-lg bg-bg-header" title="#16213e Header"></div>
          <div class="w-12 h-12 rounded-lg bg-bg-sidebar" title="#0f0f23 Sidebar"></div>
          <div class="w-12 h-12 rounded-lg bg-bg-card" title="#1e1e38 Card"></div>
          <div class="w-12 h-12 rounded-lg bg-primary" title="#3b82f6 Primary"></div>
          <div class="w-12 h-12 rounded-lg bg-success" title="#22c55e Success"></div>
          <div class="w-12 h-12 rounded-lg bg-warning" title="#f59e0b Warning"></div>
          <div class="w-12 h-12 rounded-lg bg-danger" title="#ef4444 Danger"></div>
        </div>
      </div>

      <!-- 계층 색상 테스트 -->
      <div class="mb-6">
        <h3 class="text-sm font-medium text-text-secondary mb-3">계층 아이콘 색상</h3>
        <div class="flex gap-3">
          <span class="level-badge level-badge-project">P</span>
          <span class="level-badge level-badge-wp">WP</span>
          <span class="level-badge level-badge-act">A</span>
          <span class="level-badge level-badge-task">T</span>
        </div>
      </div>

      <!-- 상태 배지 테스트 -->
      <div class="mb-6">
        <h3 class="text-sm font-medium text-text-secondary mb-3">상태 배지</h3>
        <div class="flex gap-2 flex-wrap">
          <span class="status-badge status-todo">[ ] Todo</span>
          <span class="status-badge status-design">[bd] Design</span>
          <span class="status-badge status-implement">[im] Implement</span>
          <span class="status-badge status-verify">[vf] Verify</span>
          <span class="status-badge status-done">[xx] Done</span>
        </div>
      </div>

      <!-- 카테고리 태그 테스트 -->
      <div class="mb-6">
        <h3 class="text-sm font-medium text-text-secondary mb-3">카테고리 태그</h3>
        <div class="flex gap-2">
          <span class="category-tag category-dev">development</span>
          <span class="category-tag category-defect">defect</span>
          <span class="category-tag category-infra">infrastructure</span>
        </div>
      </div>

      <!-- PrimeVue 버튼 테스트 -->
      <div class="mb-6">
        <h3 class="text-sm font-medium text-text-secondary mb-3">PrimeVue 컴포넌트</h3>
        <div class="flex gap-2 flex-wrap">
          <Button label="Primary" />
          <Button label="Secondary" severity="secondary" />
          <Button label="Success" severity="success" />
          <Button label="Warning" severity="warn" />
          <Button label="Danger" severity="danger" />
          <Button icon="pi pi-check" aria-label="Check" />
        </div>
      </div>

      <!-- PrimeVue 입력 필드 테스트 -->
      <div>
        <h3 class="text-sm font-medium text-text-secondary mb-3">입력 필드</h3>
        <div class="flex gap-4 items-center">
          <InputText placeholder="텍스트 입력" class="w-48" />
          <Checkbox v-model="checked" :binary="true" />
          <InputSwitch v-model="switched" />
        </div>
      </div>
    </div>

    <!-- 설정 정보 -->
    <div class="mt-8 text-center text-text-secondary text-sm">
      <p>PrimeVue 4.x + TailwindCSS + Dark Blue 테마</p>
      <p class="mt-1">TSK-01-01-02 완료</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const checked = ref(false)
const switched = ref(true)
</script>
