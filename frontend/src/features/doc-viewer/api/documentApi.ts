import axios from 'axios';
import type { FileNode, DocumentContent } from '../types/document.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const documentApi = {
  /**
   * Get all documents for an issue
   */
  getIssueDocuments: async (issueId: string): Promise<FileNode> => {
    const { data } = await axios.get<FileNode>(
      `${API_URL}/api/documents/issues/${issueId}/documents`
    );
    return data;
  },

  /**
   * Get document content by path
   */
  getDocumentContent: async (path: string): Promise<DocumentContent> => {
    const { data } = await axios.get<DocumentContent>(
      `${API_URL}/api/documents/content`,
      { params: { path } }
    );
    return data;
  },

  /**
   * Create or update a document
   */
  createDocument: async (payload: {
    path: string;
    content: string;
  }): Promise<DocumentContent> => {
    const { data } = await axios.post<DocumentContent>(
      `${API_URL}/api/documents`,
      payload
    );
    return data;
  },

  /**
   * Create a document with auto-generated name
   */
  createIssueDocument: async (
    issueId: string,
    payload: { type: string; llm: string; content: string }
  ): Promise<DocumentContent> => {
    const { data } = await axios.post<DocumentContent>(
      `${API_URL}/api/documents/issue/${issueId}`,
      payload
    );
    return data;
  },
};
