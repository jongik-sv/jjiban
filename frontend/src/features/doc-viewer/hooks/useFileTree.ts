import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { documentApi } from '../api/documentApi';

/**
 * Hook to manage file tree state and selection
 */
export function useFileTree(issueId: string) {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );

  const {
    data: fileTree,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['issue-documents', issueId],
    queryFn: () => documentApi.getIssueDocuments(issueId),
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  });

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  return {
    fileTree,
    isLoading,
    error,
    selectedFile,
    setSelectedFile,
    expandedFolders,
    toggleFolder,
  };
}
