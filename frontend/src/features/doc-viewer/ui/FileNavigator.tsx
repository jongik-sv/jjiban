import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { FileTree } from './components/FileTree';
import { documentApi } from '../api/documentApi';
import type { FileNavigatorProps, FileNode } from '../types/document.types';

export function FileNavigator({
  issueId,
  selectedFile,
  onFileSelect,
}: FileNavigatorProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch file tree from API
  const { data: fileTree, isLoading } = useQuery({
    queryKey: ['fileTree', issueId],
    queryFn: () => documentApi.getIssueDocuments(issueId),
  });

  // Filter files based on search query
  const filterFiles = (node: FileNode, query: string): FileNode | null => {
    if (!query) return node;

    const lowerQuery = query.toLowerCase();

    if (node.type === 'file') {
      return node.name.toLowerCase().includes(lowerQuery) ? node : null;
    }

    // Folder - recursively filter children
    const filteredChildren = node.children
      ?.map((child) => filterFiles(child, query))
      .filter((child): child is FileNode => child !== null);

    if (!filteredChildren || filteredChildren.length === 0) {
      return null;
    }

    return {
      ...node,
      children: filteredChildren,
    };
  };

  const filteredTree = useMemo(
    () => fileTree ? filterFiles(fileTree, searchQuery) : null,
    [fileTree, searchQuery]
  );

  return (
    <div className="flex flex-col h-full">
      {/* Search input */}
      <div className="p-3 border-b border-gray-700">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
          />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* File tree */}
      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredTree ? (
          filteredTree.children && filteredTree.children.length > 0 ? (
            filteredTree.children.map((node) => (
              <FileTree
                key={node.path}
                node={node}
                selectedFile={selectedFile}
                onFileClick={onFileSelect}
              />
            ))
          ) : (
            <div className="text-center text-gray-500 text-sm py-8">
              No files found
            </div>
          )
        ) : (
          <div className="text-center text-gray-500 text-sm py-8">
            No files match your search
          </div>
        )}
      </div>
    </div>
  );
}
