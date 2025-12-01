import { useState } from 'react';
import { ChevronDown, ChevronRight, File, Folder, FileText } from 'lucide-react';
import type { FileNode } from '../../types/document.types';

interface FileTreeProps {
  node: FileNode;
  level?: number;
  selectedFile?: string | null;
  onFileClick: (path: string) => void;
}

export function FileTree({
  node,
  level = 0,
  selectedFile,
  onFileClick,
}: FileTreeProps) {
  const [expanded, setExpanded] = useState(level < 2); // Auto-expand first 2 levels

  const isSelected = selectedFile === node.path;

  // File node
  if (node.type === 'file') {
    const isMarkdown = node.name.endsWith('.md');

    return (
      <div
        className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${
          isSelected
            ? 'bg-blue-500/20 text-blue-200 border border-blue-500/50'
            : 'hover:bg-gray-800 text-gray-300'
        }`}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={() => onFileClick(node.path)}
      >
        {isMarkdown ? (
          <FileText size={16} className={`flex-shrink-0 ${isSelected ? 'text-blue-200' : ''}`} />
        ) : (
          <File size={16} className={`flex-shrink-0 ${isSelected ? 'text-blue-200' : ''}`} />
        )}
        <span className="text-sm truncate">{node.name}</span>
      </div>
    );
  }

  // Folder node
  return (
    <div>
      <div
        className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-gray-800 text-gray-300 transition-colors"
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? (
          <ChevronDown size={16} className="flex-shrink-0" />
        ) : (
          <ChevronRight size={16} className="flex-shrink-0" />
        )}
        <Folder size={16} className="flex-shrink-0" />
        <span className="text-sm font-medium truncate">{node.name}</span>
        {node.children && (
          <span className="text-xs text-gray-500 ml-auto">
            ({node.children.length})
          </span>
        )}
      </div>

      {expanded && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTree
              key={child.path}
              node={child}
              level={level + 1}
              selectedFile={selectedFile}
              onFileClick={onFileClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
