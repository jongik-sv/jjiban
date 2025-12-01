import { FileNavigator } from './FileNavigator';
import { MarkdownViewer } from './MarkdownViewer';
import { useFileTree } from '../hooks/useFileTree';
import { useDocumentContent } from '../hooks/useDocumentContent';
import type { DocumentPanelProps } from '../types/document.types';

export function DocumentPanel({ issueId }: DocumentPanelProps) {
  const { selectedFile, setSelectedFile } = useFileTree(issueId);
  const { data: content, isLoading, error } = useDocumentContent(selectedFile);

  return (
    <div className="grid grid-cols-[300px_1fr] gap-4 h-full">
      {/* Left: File Navigator */}
      <div className="border-r border-gray-700 overflow-hidden">
        <FileNavigator
          issueId={issueId}
          selectedFile={selectedFile}
          onFileSelect={setSelectedFile}
        />
      </div>

      {/* Right: Document Viewer */}
      <div className="overflow-y-auto px-6 py-4">
        {isLoading && (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
            <p className="text-red-400">Failed to load document</p>
            <p className="text-sm text-gray-400 mt-1">
              {error instanceof Error ? error.message : 'Unknown error'}
            </p>
          </div>
        )}

        {content && !isLoading && !error && (
          <MarkdownViewer content={content.content} />
        )}

        {!selectedFile && !isLoading && !error && (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <svg
              className="w-16 h-16 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-lg">Select a document to view</p>
            <p className="text-sm mt-1">
              Choose a file from the navigator on the left
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
