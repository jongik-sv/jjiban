import { useQuery } from '@tanstack/react-query';
import { documentApi } from '../api/documentApi';

/**
 * Hook to fetch and cache document content
 */
export function useDocumentContent(path: string | null) {
  return useQuery({
    queryKey: ['document-content', path],
    queryFn: () => documentApi.getDocumentContent(path!),
    enabled: !!path,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
}
