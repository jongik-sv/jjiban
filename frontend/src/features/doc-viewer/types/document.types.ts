export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  modified?: Date;
  size?: number;
}

export interface DocumentContent {
  path: string;
  content: string;
  metadata?: {
    modified?: Date;
    size?: number;
    encoding?: string;
  };
}

export interface TocItem {
  level: number;
  text: string;
  id: string;
}

export interface CodeBlockProps {
  children: React.ReactNode;
  className?: string;
  inline?: boolean;
}

export interface MarkdownViewerProps {
  content: string;
  className?: string;
}

export interface FileNavigatorProps {
  issueId: string;
  selectedFile?: string | null;
  onFileSelect: (path: string) => void;
}

export interface DocumentPanelProps {
  issueId: string;
}
