/**
 * TaskDocuments Component Unit Tests
 * Task: TSK-05-02
 * Test Spec: 026-test-specification.md
 *
 * Coverage:
 * - UT-006: getDocumentCardStyle function
 * - UT-007: handleOpenDocument (exists=false check)
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TaskDocuments from '~/components/wbs/detail/TaskDocuments.vue'
import Panel from 'primevue/panel'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Message from 'primevue/message'
import type { DocumentInfo } from '~/types'

describe('TaskDocuments', () => {
  // Helper to create mock documents
  const createExistingDoc = (): DocumentInfo => ({
    name: '010-basic-design.md',
    path: '.jjiban/projects/test/tasks/TSK-05-02/010-basic-design.md',
    exists: true,
    type: 'design',
    stage: 'current',
    size: 15500,
    createdAt: '2025-12-15T10:00:00Z',
    updatedAt: '2025-12-15T12:00:00Z'
  })

  const createExpectedDoc = (): DocumentInfo => ({
    name: '020-detail-design.md',
    path: '.jjiban/projects/test/tasks/TSK-05-02/020-detail-design.md',
    exists: false,
    type: 'design',
    stage: 'expected',
    expectedAfter: '/wf:draft 실행 후 생성',
    command: '/wf:draft'
  })

  describe('getDocumentCardClasses method', () => {
    // UT-006: exists=true should have doc-card-exists class
    it('should return doc-card-exists class for existing documents', () => {
      const doc = createExistingDoc()
      const wrapper = mount(TaskDocuments, {
        props: { documents: [doc] },
        global: {
          components: { Panel, Card, Button, Message }
        }
      })

      const vm = wrapper.vm as any
      const classes = vm.getDocumentCardClasses(doc)

      expect(classes).toContain('doc-card-exists')
      expect(classes).toContain('cursor-pointer')
      expect(classes).toContain('transition-all')
    })

    // UT-006: exists=false should have doc-card-expected class
    it('should return doc-card-expected class for expected documents', () => {
      const doc = createExpectedDoc()
      const wrapper = mount(TaskDocuments, {
        props: { documents: [doc] },
        global: {
          components: { Panel, Card, Button, Message }
        }
      })

      const vm = wrapper.vm as any
      const classes = vm.getDocumentCardClasses(doc)

      expect(classes).toContain('doc-card-expected')
      expect(classes).not.toContain('cursor-pointer')
      expect(classes).toContain('transition-all')
    })
  })

  describe('handleOpenDocument method', () => {
    // UT-007: should emit event for existing documents
    it('should emit open-document event when exists=true', () => {
      const doc = createExistingDoc()
      const wrapper = mount(TaskDocuments, {
        props: { documents: [doc] },
        global: {
          components: { Panel, Card, Button, Message }
        }
      })

      const vm = wrapper.vm as any
      vm.handleOpenDocument(doc)

      expect(wrapper.emitted('open-document')).toBeTruthy()
      expect(wrapper.emitted('open-document')?.[0]).toEqual([doc])
    })

    // UT-007: should NOT emit event for expected documents (exists=false)
    it('should NOT emit open-document event when exists=false', () => {
      const doc = createExpectedDoc()
      const wrapper = mount(TaskDocuments, {
        props: { documents: [doc] },
        global: {
          components: { Panel, Card, Button, Message }
        }
      })

      const vm = wrapper.vm as any
      vm.handleOpenDocument(doc)

      // Should not emit event
      expect(wrapper.emitted('open-document')).toBeFalsy()
    })
  })

  describe('Document Card Classes - CSS Class Based Styling', () => {
    // TSK-08-05: CSS 클래스 중앙화 - hover 스타일은 CSS에서 처리
    it('should use doc-card-exists class for existing documents (CSS handles hover)', () => {
      const doc = createExistingDoc()
      const wrapper = mount(TaskDocuments, {
        props: { documents: [doc] },
        global: {
          components: { Panel, Card, Button, Message }
        }
      })

      const vm = wrapper.vm as any
      const classes = vm.getDocumentCardClasses(doc)

      expect(classes).toContain('cursor-pointer')
      expect(classes).toContain('doc-card-exists')
    })

    // TSK-08-05: CSS 클래스 중앙화 - cursor 스타일은 CSS에서 처리
    it('should use doc-card-expected class for expected documents (CSS handles cursor)', () => {
      const doc = createExpectedDoc()
      const wrapper = mount(TaskDocuments, {
        props: { documents: [doc] },
        global: {
          components: { Panel, Card, Button, Message }
        }
      })

      const vm = wrapper.vm as any
      const classes = vm.getDocumentCardClasses(doc)

      expect(classes).toContain('doc-card-expected')
      expect(classes).not.toContain('cursor-pointer')
    })
  })

  describe('Document Type Icons and Colors', () => {
    it('should return correct icon for design documents', () => {
      const doc = createExistingDoc()
      const wrapper = mount(TaskDocuments, {
        props: { documents: [doc] },
        global: {
          components: { Panel, Card, Button, Message }
        }
      })

      const vm = wrapper.vm as any
      const icon = vm.getDocumentIcon(doc)
      const color = vm.getDocumentColor(doc)

      expect(icon).toBe('pi pi-file-edit')
      expect(color).toBe('#3b82f6')
    })

    // TSK-08-06: CSS 변수 사용으로 변경
    it('should return fallback icon for unknown type', () => {
      const doc = { ...createExistingDoc(), type: 'unknown' as any }
      const wrapper = mount(TaskDocuments, {
        props: { documents: [doc] },
        global: {
          components: { Panel, Card, Button, Message }
        }
      })

      const vm = wrapper.vm as any
      const icon = vm.getDocumentIcon(doc)
      const color = vm.getDocumentColor(doc)

      expect(icon).toBe('pi pi-file')
      expect(color).toBe('var(--color-text-muted)')
    })
  })

  describe('File Size Formatting', () => {
    it('should format bytes correctly', () => {
      const wrapper = mount(TaskDocuments, {
        props: { documents: [] },
        global: {
          components: { Panel, Card, Button, Message }
        }
      })

      const vm = wrapper.vm as any

      expect(vm.formatFileSize(500)).toBe('500 B')
      expect(vm.formatFileSize(1024)).toBe('1.0 KB')
      expect(vm.formatFileSize(1536)).toBe('1.5 KB')
      expect(vm.formatFileSize(1024 * 1024)).toBe('1.0 MB')
      expect(vm.formatFileSize(1.5 * 1024 * 1024)).toBe('1.5 MB')
    })
  })

  describe('Date Formatting', () => {
    it('should format date string to Korean locale', () => {
      const wrapper = mount(TaskDocuments, {
        props: { documents: [] },
        global: {
          components: { Panel, Card, Button, Message }
        }
      })

      const vm = wrapper.vm as any
      const formatted = vm.formatDate('2025-12-15T13:12:00Z')

      expect(formatted).toContain('2025')
      expect(formatted).toContain('12')
      expect(formatted).toContain('15')
    })
  })

  describe('Document Base Name Extraction', () => {
    it('should remove file extension from filename', () => {
      const wrapper = mount(TaskDocuments, {
        props: { documents: [] },
        global: {
          components: { Panel, Card, Button, Message }
        }
      })

      const vm = wrapper.vm as any

      expect(vm.getDocumentBaseName('010-basic-design.md')).toBe('010-basic-design')
      expect(vm.getDocumentBaseName('test.pdf')).toBe('test')
      expect(vm.getDocumentBaseName('file.name.with.dots.txt')).toBe('file.name.with.dots')
    })
  })

  describe('Rendering', () => {
    it('should render document cards with correct data-testid', () => {
      const existingDoc = createExistingDoc()
      const expectedDoc = createExpectedDoc()
      const wrapper = mount(TaskDocuments, {
        props: { documents: [existingDoc, expectedDoc] },
        global: {
          components: { Panel, Card, Button, Message }
        }
      })

      expect(wrapper.find('[data-testid="document-exists-010-basic-design"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="document-expected-020-detail-design"]').exists()).toBe(true)
    })

    it('should display open button only for existing documents', () => {
      const existingDoc = createExistingDoc()
      const expectedDoc = createExpectedDoc()
      const wrapper = mount(TaskDocuments, {
        props: { documents: [existingDoc, expectedDoc] },
        global: {
          components: { Panel, Card, Button, Message }
        }
      })

      expect(wrapper.find('[data-testid="open-document-btn-0"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="open-document-btn-1"]').exists()).toBe(false)
    })

    it('should display file size and updated date for existing documents', () => {
      const doc = createExistingDoc()
      const wrapper = mount(TaskDocuments, {
        props: { documents: [doc] },
        global: {
          components: { Panel, Card, Button, Message }
        }
      })

      const cardText = wrapper.find('[data-testid="document-exists-010-basic-design"]').text()
      expect(cardText).toContain('KB') // File size
      expect(cardText).toContain('수정일') // Updated date label
    })

    it('should display expected condition for expected documents', () => {
      const doc = createExpectedDoc()
      const wrapper = mount(TaskDocuments, {
        props: { documents: [doc] },
        global: {
          components: { Panel, Card, Button, Message }
        }
      })

      const cardText = wrapper.find('[data-testid="document-expected-020-detail-design"]').text()
      expect(cardText).toContain('생성 조건')
      expect(cardText).toContain('/wf:draft 실행 후 생성')
    })
  })

  describe('Empty State', () => {
    it('should display message when no documents exist', () => {
      const wrapper = mount(TaskDocuments, {
        props: { documents: [] },
        global: {
          components: { Panel, Card, Button, Message }
        }
      })

      const message = wrapper.findComponent(Message)
      expect(message.exists()).toBe(true)
      expect(message.text()).toContain('관련 문서가 없습니다')
    })
  })

  describe('Document Type Labels', () => {
    it('should return correct label for each document type', () => {
      const wrapper = mount(TaskDocuments, {
        props: { documents: [] },
        global: {
          components: { Panel, Card, Button, Message }
        }
      })

      const vm = wrapper.vm as any

      expect(vm.getDocumentTypeLabel('design')).toBe('설계 문서')
      expect(vm.getDocumentTypeLabel('implementation')).toBe('구현 문서')
      expect(vm.getDocumentTypeLabel('test')).toBe('테스트 문서')
      expect(vm.getDocumentTypeLabel('manual')).toBe('매뉴얼')
      expect(vm.getDocumentTypeLabel('analysis')).toBe('분석 문서')
      expect(vm.getDocumentTypeLabel('review')).toBe('리뷰 문서')
      expect(vm.getDocumentTypeLabel('unknown')).toBe('문서')
    })
  })
})
