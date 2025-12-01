// Main components
export { DocumentPanel } from './ui/DocumentPanel';
export { MarkdownViewer } from './ui/MarkdownViewer';
export { FileNavigator } from './ui/FileNavigator';

// Sub-components
export { CodeBlock } from './ui/components/CodeBlock';
export { MermaidDiagram } from './ui/components/MermaidDiagram';
export { FileTree } from './ui/components/FileTree';

// Hooks
export { useDocumentContent } from './hooks/useDocumentContent';
export { useFileTree } from './hooks/useFileTree';

// API
export { documentApi } from './api/documentApi';

// Types
export type {
  FileNode,
  DocumentContent,
  TocItem,
  MarkdownViewerProps,
  FileNavigatorProps,
  DocumentPanelProps,
} from './types/document.types';
