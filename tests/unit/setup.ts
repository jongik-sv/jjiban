/**
 * Vitest setup file for component testing
 * Auto-imports Vue composables for test environment
 */

import { vi } from 'vitest'
import { computed, ref, reactive } from 'vue'
import { defineStore } from 'pinia'

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
  toggleExpand: vi.fn()
}))

globalThis.useSelectionStore = vi.fn(() => ({
  selectedNodeId: null,
  selectNode: vi.fn()
}))
