/**
 * Composable for optimistic update pattern with rollback
 *
 * Provides a reusable pattern for:
 * - Immediate UI updates (optimistic)
 * - API calls
 * - Rollback on failure
 * - Error handling
 */

import type { Ref } from 'vue'

export function useOptimisticUpdate() {
  const toast = useToast()

  /**
   * Update a field with optimistic update pattern
   *
   * @param taskId - Task ID
   * @param field - Field name to update
   * @param newValue - New value
   * @param storeRef - Reference to the store state
   * @param refreshFn - Optional refresh function to call on success
   */
  const updateField = async <T extends Record<string, any>>(
    taskId: string,
    field: keyof T,
    newValue: any,
    storeRef: Ref<T | null>,
    refreshFn?: () => Promise<void>
  ): Promise<boolean> => {
    if (!storeRef.value) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No data to update',
        life: 3000
      })
      return false
    }

    // Backup previous value
    const prevValue = storeRef.value[field]

    // Optimistic update
    storeRef.value[field] = newValue

    try {
      // API call
      await $fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        body: { [field]: newValue }
      })

      // Success: refresh to sync latest data
      if (refreshFn) {
        await refreshFn()
      }

      return true
    } catch (error: any) {
      // Rollback on failure
      if (storeRef.value) {
        storeRef.value[field] = prevValue
      }

      // Show error toast
      const errorMessage = error.data?.message || error.message || 'Failed to update'
      toast.add({
        severity: 'error',
        summary: 'Update Failed',
        detail: errorMessage,
        life: 5000
      })

      return false
    }
  }

  /**
   * Update multiple fields at once
   *
   * @param taskId - Task ID
   * @param updates - Object with field updates
   * @param storeRef - Reference to the store state
   * @param refreshFn - Optional refresh function to call on success
   */
  const updateFields = async <T extends Record<string, any>>(
    taskId: string,
    updates: Partial<T>,
    storeRef: Ref<T | null>,
    refreshFn?: () => Promise<void>
  ): Promise<boolean> => {
    if (!storeRef.value) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No data to update',
        life: 3000
      })
      return false
    }

    // Backup previous values
    const prevValues: Partial<T> = {}
    for (const key in updates) {
      prevValues[key] = storeRef.value[key]
    }

    // Optimistic update
    Object.assign(storeRef.value, updates)

    try {
      // API call
      await $fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        body: updates
      })

      // Success: refresh to sync latest data
      if (refreshFn) {
        await refreshFn()
      }

      return true
    } catch (error: any) {
      // Rollback on failure
      if (storeRef.value) {
        Object.assign(storeRef.value, prevValues)
      }

      // Show error toast
      const errorMessage = error.data?.message || error.message || 'Failed to update'
      toast.add({
        severity: 'error',
        summary: 'Update Failed',
        detail: errorMessage,
        life: 5000
      })

      return false
    }
  }

  return {
    updateField,
    updateFields
  }
}
