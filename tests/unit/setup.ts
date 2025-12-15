/**
 * Vitest setup file for component testing
 * Auto-imports Vue composables for test environment
 */

import { vi } from 'vitest'
import { computed, ref, reactive } from 'vue'
import { defineStore } from 'pinia'
import { config } from '@vue/test-utils'

// Make Vue composition API globally available (like Nuxt auto-imports)
globalThis.computed = computed
globalThis.ref = ref
globalThis.reactive = reactive
globalThis.defineStore = defineStore

// Mock Pinia HMR
globalThis.acceptHMRUpdate = vi.fn((store: any, hotModule: any) => {
  // Mock HMR update - no-op in test environment
  return () => {}
})

// Mock Nuxt composables
globalThis.useWbsStore = vi.fn(() => ({
  isExpanded: vi.fn(() => true),
  toggleExpand: vi.fn(),
  fetchWbs: vi.fn(),
  clearWbs: vi.fn(),
  tree: [],
  loading: false
}))

globalThis.useSelectionStore = vi.fn(() => ({
  selectedNodeId: null,
  selectNode: vi.fn(),
  clearSelection: vi.fn()
}))

globalThis.useProjectStore = vi.fn(() => ({
  loadProject: vi.fn(),
  currentProject: null,
  clearProject: vi.fn(),
  projectName: ''
}))

// Mock PrimeVue useToast
const mockToastAdd = vi.fn()
globalThis.useToast = vi.fn(() => ({
  add: mockToastAdd
}))

// Configure Vue Test Utils to provide PrimeVue config
config.global.mocks = {
  $primevue: {
    config: {
      ripple: false,
      inputStyle: 'outlined',
      locale: {
        accept: 'Yes',
        reject: 'No'
      }
    }
  }
}
