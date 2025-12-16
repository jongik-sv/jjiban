<template>
  <Panel
    header="관련 문서"
    class="task-documents-panel mt-4"
    data-testid="task-documents-panel"
    :toggleable="true"
  >
    <!-- 문서 목록 -->
    <div class="space-y-3" role="list">
      <Card
        v-for="(doc, index) in documents"
        :key="doc.path"
        :class="getDocumentCardClasses(doc)"
        :data-testid="doc.exists ? `document-exists-${getDocumentBaseName(doc.name)}` : `document-expected-${getDocumentBaseName(doc.name)}`"
        role="listitem"
      >
        <template #content>
          <div class="flex items-start gap-3">
            <!-- 아이콘 -->
            <i
              :class="getDocumentIcon(doc)"
              :style="{ color: getDocumentColor(doc) }"
              class="text-2xl"
              aria-hidden="true"
            />

            <!-- 문서 정보 -->
            <div class="flex-1">
              <div class="font-semibold text-text">{{ doc.name }}</div>
              <div class="text-sm text-text-secondary mt-1">
                타입: {{ getDocumentTypeLabel(doc.type) }}
              </div>

              <!-- 존재하는 문서: 크기, 수정일 -->
              <div v-if="doc.exists" class="text-xs text-text-muted mt-1">
                <span v-if="doc.size">{{ formatFileSize(doc.size) }}</span>
                <span v-if="doc.size && doc.updatedAt"> | </span>
                <span v-if="doc.updatedAt">수정일: {{ formatDate(doc.updatedAt) }}</span>
              </div>

              <!-- 예정 문서: 생성 조건 -->
              <div v-else class="text-xs text-text-muted mt-1">
                <span v-if="doc.expectedAfter">생성 조건: {{ doc.expectedAfter }}</span>
                <span v-else-if="doc.command">명령어: {{ doc.command }}</span>
              </div>
            </div>

            <!-- 열기 버튼 (존재하는 문서만) -->
            <Button
              v-if="doc.exists"
              icon="pi pi-external-link"
              text
              rounded
              :aria-label="`문서 열기: ${doc.name}`"
              :data-testid="`open-document-btn-${index}`"
              @click="handleOpenDocument(doc)"
            />
          </div>
        </template>
      </Card>

      <!-- 빈 상태 -->
      <Message v-if="documents.length === 0" severity="info">
        관련 문서가 없습니다
      </Message>
    </div>
  </Panel>
</template>

<script setup lang="ts">
/**
 * TaskDocuments - 문서 목록 카드 컴포넌트
 * Task: TSK-05-02
 * 상세설계: 020-detail-design.md 섹션 9.4
 *
 * 책임:
 * - 문서 목록 표시 (Card)
 * - 존재/예정 상태 시각적 구분
 * - 문서 타입별 아이콘/색상 적용
 * - open-document 이벤트 발행
 */

import type { DocumentInfo } from '~/types'
import { DOCUMENT_TYPE_CONFIG } from '~/utils/documentConfig'

// ============================================================
// Props & Emits
// ============================================================
interface Props {
  documents: DocumentInfo[]
}

interface Emits {
  (e: 'open-document', document: DocumentInfo): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// ============================================================
// Methods
// ============================================================

/**
 * 문서 카드 클래스 계산 (TSK-08-05: CSS 클래스 중앙화)
 * FR-008
 */
function getDocumentCardClasses(doc: DocumentInfo): string[] {
  const classes = ['transition-all', 'duration-200']

  if (doc.exists) {
    classes.push('doc-card-exists', 'cursor-pointer')
  } else {
    classes.push('doc-card-expected')
  }

  return classes
}

/**
 * 문서 타입별 아이콘 가져오기
 */
function getDocumentIcon(doc: DocumentInfo): string {
  return DOCUMENT_TYPE_CONFIG[doc.type]?.icon || 'pi pi-file'
}

/**
 * 문서 타입별 색상 가져오기
 * TSK-08-06: HEX 하드코딩 제거, CSS 변수 사용
 */
function getDocumentColor(doc: DocumentInfo): string {
  return DOCUMENT_TYPE_CONFIG[doc.type]?.color || 'var(--color-text-muted)'
}

/**
 * 문서 타입 레이블 가져오기
 */
function getDocumentTypeLabel(type: string): string {
  return DOCUMENT_TYPE_CONFIG[type]?.label || '문서'
}

/**
 * 파일 크기 포맷팅
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * 날짜 포맷팅
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * 파일명에서 확장자 제거
 */
function getDocumentBaseName(filename: string): string {
  return filename.replace(/\.[^/.]+$/, '')
}

/**
 * 문서 열기 핸들러
 * FR-009, BR-DOC-01
 */
function handleOpenDocument(doc: DocumentInfo) {
  if (doc.exists) {
    emit('open-document', doc)
  }
}
</script>
